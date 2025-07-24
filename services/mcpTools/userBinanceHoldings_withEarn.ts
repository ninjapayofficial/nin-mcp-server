import { McpMessage, McpReference } from '../../types/mcp';
import { Spot } from '@binance/connector-typescript';


const BINANCE_API_KEY = process.env.BINANCE_API_KEY || '';
const BINANCE_SECRET_KEY = process.env.BINANCE_SECRET_KEY || '';

// Ensure API keys are provided
if (!BINANCE_API_KEY || !BINANCE_SECRET_KEY) {
  console.error('Error: Binance API Key or Secret Key not found in environment variables.');
  // Optionally, throw an error or handle this case appropriately
  // For now, we'll allow the functions to proceed but they will likely fail
}

const binanceClient = new Spot(BINANCE_API_KEY, BINANCE_SECRET_KEY);

// Define interfaces specific to Binance holdings if needed
// Example: Reuse or adapt the Holding interface
export interface BinanceHolding {
  asset: string;
  free: string;
  locked: string;
  priceInUsdt: string; // Added field for USDT price
  usdValue: string;    // Added field for USD value
}

export interface UserBinanceHoldingsResult {
  spot: BinanceHolding[];
  futures?: any; // Define specific types for futures, margin, etc.
  margin?: any;
  totalValueUsd: number; // Example: Total value in USD
  // Add other summary fields as needed
}

export async function getUserBinanceHoldings(): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  // TODO: Implement logic to fetch user holdings from Binance API
  // 1. Authenticate with Binance API (ensure secure handling of API keys)
  // 2. Fetch holdings from different wallets (Spot, Futures, Margin, etc.)
  // 3. Process and aggregate the data
  const binanceHoldingsData = await fetchUserBinanceHoldings();

  // TODO: Format the results for the MCP client
  // Adapt the formatting logic from userHoldings.ts or create new formatting
  return {
    messages: [
      {
        role: 'assistant',
        content: `Here are your current Binance holdings:\n\n` + // Placeholder content
                 `Total Portfolio Value: $${binanceHoldingsData.totalValueUsd.toLocaleString()}\n\n` + // Example
                 formatBinanceHoldingsSummary(binanceHoldingsData) // Placeholder for formatted summary
      }
    ],
    references: [
      {
        type: 'text',
        title: 'User Binance Holdings',
        content: 'Binance holdings data available in metadata',
        metadata: binanceHoldingsData // Keep the raw data for UI components
      }
    ]
  };
}

// Helper function to fetch user holdings from Binance
async function fetchUserBinanceHoldings(): Promise<UserBinanceHoldingsResult> {
  if (!BINANCE_API_KEY || !BINANCE_SECRET_KEY) {
    console.error('Binance API keys not configured. Returning empty data.');
    return { spot: [], totalValueUsd: 0 };
  }

  try {
    // console.log('Fetching Binance holdings...');
    // Fetch Spot assets
    const userAssetsPromise = binanceClient.userAsset();
    // Fetch Simple Earn Flexible and Locked positions
    // Using specific endpoints: /sapi/v1/simple-earn/flexible/position and /sapi/v1/simple-earn/locked/position
    const flexibleEarnPromise = binanceClient.getFlexibleProductPosition();
    const lockedEarnPromise = binanceClient.getLockedProductPosition();

    // Use Promise.allSettled to handle potential errors in individual fetches
    const [userAssetsResult, flexibleEarnResult, lockedEarnResult] = await Promise.allSettled([
      userAssetsPromise,
      flexibleEarnPromise,
      lockedEarnPromise
    ]);

    // Process successful results
    const userAssets = userAssetsResult.status === 'fulfilled' ? userAssetsResult.value : null;
    const flexibleEarnAssets = flexibleEarnResult.status === 'fulfilled' ? flexibleEarnResult.value : null;
    const lockedEarnAssets = lockedEarnResult.status === 'fulfilled' ? lockedEarnResult.value : null;

    // Log errors if any fetches failed
    if (userAssetsResult.status === 'rejected') {
      console.error('Failed to fetch Spot assets:', userAssetsResult.reason);
    }
    if (flexibleEarnResult.status === 'rejected') {
      console.warn('Failed to fetch Flexible Earn assets:', flexibleEarnResult.reason?.message || flexibleEarnResult.reason);
    }
    if (lockedEarnResult.status === 'rejected') {
      console.warn('Failed to fetch Locked Earn assets:', lockedEarnResult.reason?.message || lockedEarnResult.reason);
    }

    if (!userAssets || !Array.isArray(userAssets)) {
      console.warn('No assets found in user assets response');
      return { spot: [], totalValueUsd: 0 };
    }

    // Get current prices for all symbols using ticker24hr
    const tickerResponse = await binanceClient.ticker24hr(); // Use ticker24hr as requested
    const prices: Record<string, number> = {};

    if (tickerResponse && Array.isArray(tickerResponse)) {
      tickerResponse.forEach((ticker: any) => {
        if (ticker.symbol && ticker.lastPrice) { // Use lastPrice from ticker24hr
          prices[ticker.symbol] = parseFloat(ticker.lastPrice);
        }
      });
    }

    let totalValueUsd = 0;
    const combinedAssets: Record<string, { free: number; locked: number }> = {};

    // Process Spot assets
    if (userAssets && Array.isArray(userAssets)) {
        userAssets.forEach(asset => {
            const assetName = asset.asset;
            if (!combinedAssets[assetName]) {
                combinedAssets[assetName] = { free: 0, locked: 0 };
            }
            combinedAssets[assetName].free += parseFloat(asset.free || '0');
            combinedAssets[assetName].locked += parseFloat(asset.locked || '0');
        });
    }

    // Process and merge Flexible Earn assets
    if (flexibleEarnAssets && flexibleEarnAssets.rows && Array.isArray(flexibleEarnAssets.rows)) {
        console.log(`Processing ${flexibleEarnAssets.rows.length} Flexible Earn assets...`);
        flexibleEarnAssets.rows.forEach((earnAsset: any) => {
            const assetName = earnAsset.asset;
            const totalAmount = parseFloat(earnAsset.totalAmount || '0');
            if (totalAmount > 0) {
                if (!combinedAssets[assetName]) {
                    combinedAssets[assetName] = { free: 0, locked: 0 };
                }
                // Add Flexible Earn amount to the 'free' balance
                combinedAssets[assetName].free += totalAmount;
                // console.log(`Added ${totalAmount} ${assetName} from Flexible Earn to free balance.`);
            }
        });
    }

    // Process and merge Locked Earn assets
    if (lockedEarnAssets && lockedEarnAssets.rows && Array.isArray(lockedEarnAssets.rows)) {
        console.log(`Processing ${lockedEarnAssets.rows.length} Locked Earn assets...`);
        lockedEarnAssets.rows.forEach((earnAsset: any) => {
            const assetName = earnAsset.asset;
            // Locked Earn usually uses 'amount' field for the principal
            const amount = parseFloat(earnAsset.amount || '0');
            if (amount > 0) {
                if (!combinedAssets[assetName]) {
                    combinedAssets[assetName] = { free: 0, locked: 0 };
                }
                // Add Locked Earn amount to the 'locked' balance as it's not immediately available
                combinedAssets[assetName].locked += amount;
                // console.log(`Added ${amount} ${assetName} from Locked Earn to locked balance.`);
            }
        });
    }

    // Now, map the combined assets to BinanceHolding format
    const spotHoldings: BinanceHolding[] = Object.entries(combinedAssets)
      .map(([assetName, balances]) => {
        const total = balances.free + balances.locked;
        if (total <= 0) return null; // Skip assets with zero total balance

        // Determine price and USD value (using existing logic)
        const usdtPair = `${assetName}USDT`;
        const btcPair = `${assetName}BTC`;

        let usdValue = 0;
        let priceInUsdt = 0;

        if (assetName === 'USDT' || assetName === 'BUSD' || assetName === 'USDC' || assetName === 'TUSD') { // Treat stablecoins as $1
          priceInUsdt = 1;
          usdValue = total * priceInUsdt;
        } else if (prices[usdtPair]) {
          priceInUsdt = prices[usdtPair];
          usdValue = total * priceInUsdt;
        } else if (prices[btcPair] && prices['BTCUSDT']) {
          priceInUsdt = prices[btcPair] * prices['BTCUSDT'];
          usdValue = total * priceInUsdt;
        } else {
          // console.warn(`Could not find USDT price for ${assetName}`);
        }

        totalValueUsd += usdValue;

        return {
          asset: assetName,
          // Represent combined amounts
          free: balances.free.toString(),
          locked: balances.locked.toString(),
          priceInUsdt: priceInUsdt.toFixed(8),
          usdValue: usdValue.toFixed(2)
        };
      })
      .filter((holding): holding is BinanceHolding => holding !== null); // Filter out nulls

    // Sort holdings by USD value in descending order
    spotHoldings.sort((a, b) => parseFloat(b.usdValue) - parseFloat(a.usdValue));

    console.log(`Total Portfolio Value Calculated: $${totalValueUsd.toLocaleString()}`);

    return {
      spot: spotHoldings,
      totalValueUsd: totalValueUsd,
      // TODO: Fetch and add data for Futures, Margin, etc. if needed
    };
  } catch (error) {
    console.error('Error fetching Binance holdings:', error);
    // Return empty or default data in case of an error
    return { spot: [], totalValueUsd: 0 };
  }
}

// Helper function to format Binance holdings summary
function formatBinanceHoldingsSummary(data: UserBinanceHoldingsResult): string {
  if (!data || !data.spot || data.spot.length === 0) {
    return 'No Binance holdings found or unable to fetch data.';
  }

  let summary = '**Spot Holdings:**\n';
  // Display top 10 or all if less than 10
  const holdingsToShow = data.spot.slice(0, 100);

  if (holdingsToShow.length === 0) {
    summary += 'No spot assets with balance > 0.\n';
  } else {
    summary += '| Asset | Free | Locked |\n';
    summary += '|-------|------|--------|\n';
    holdingsToShow.forEach(h => {
      // Format numbers to a reasonable precision, e.g., 6 decimal places for crypto
      const freeFormatted = parseFloat(h.free).toFixed(6);
      const lockedFormatted = parseFloat(h.locked).toFixed(6);
      summary += `| ${h.asset} | ${freeFormatted} | ${lockedFormatted} |\n`;
    });
    if (data.spot.length > 10) {
        summary += `\n... and ${data.spot.length - 10} more assets.`
    }
  }

  // TODO: Add formatting for other types (Futures, Margin) when implemented
  // if (data.futures) { ... }
  // if (data.margin) { ... }

  return summary;
}