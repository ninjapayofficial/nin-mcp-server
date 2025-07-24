import { McpMessage, McpReference } from '../../types/mcp';

const GROWW_API_KEY = process.env.GROWW_API_KEY || '';
const GROWW_BASE_URL = 'https://api.groww.in';

// Ensure API key is provided
if (!GROWW_API_KEY) {
  console.error('Error: Groww API Key not found in environment variables.');
}

// Groww Holdings interface based on the API documentation
export interface GrowwHolding {
  isin: string;
  trading_symbol: string;
  quantity: number;
  average_price: number;
  pledge_quantity: number;
  demat_locked_quantity: number;
  groww_locked_quantity: number;
  repledge_quantity: number;
  t1_quantity: number;
  demat_free_quantity: number;
  corporate_action_additional_quantity: number;
  active_demat_transfer_quantity: number;
}

export interface GrowwHoldingsResponse {
  status: string;
  payload: {
    holdings: GrowwHolding[];
  };
}

export async function getGrowwHoldings(): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  try {
    const holdingsData = await fetchGrowwHoldings();
    
    if (holdingsData.status !== 'SUCCESS') {
      throw new Error('Failed to fetch Groww holdings');
    }

    const holdings = holdingsData.payload.holdings;
    const totalHoldings = holdings.length;
    const totalValue = holdings.reduce((sum, holding) => 
      sum + (holding.quantity * holding.average_price), 0
    );

    return {
      messages: [
        {
          role: 'assistant',
          content: `Here are your current Groww holdings:\n\n` +
                   `Total Holdings: ${totalHoldings} stocks\n` +
                   `Total Investment Value: ₹${totalValue.toLocaleString()}\n\n` +
                   formatGrowwHoldingsSummary(holdings)
        }
      ],
      references: [
        {
          type: 'text',
          title: 'Groww Holdings Data',
          content: 'Complete Groww holdings information',
          metadata: holdingsData
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching Groww holdings:', error);
    return {
      messages: [
        {
          role: 'assistant',
          content: `Error fetching Groww holdings: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      references: []
    };
  }
}

// Helper function to fetch holdings from Groww API
async function fetchGrowwHoldings(): Promise<GrowwHoldingsResponse> {
  if (!GROWW_API_KEY) {
    throw new Error('Groww API key not configured');
  }

  const response = await fetch(`${GROWW_BASE_URL}/v1/holdings/user`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${GROWW_API_KEY}`,
      'X-API-VERSION': '1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Groww API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Helper function to format holdings summary
function formatGrowwHoldingsSummary(holdings: GrowwHolding[]): string {
  if (!holdings || holdings.length === 0) {
    return 'No holdings found in your Groww account.';
  }

  let summary = '**Current Holdings:**\n\n';
  summary += '| Symbol | Quantity | Avg Price | Current Value | Free Qty |\n';
  summary += '|--------|----------|-----------|---------------|----------|\n';

  // Show top 20 holdings
  const holdingsToShow = holdings.slice(0, 20);
  
  holdingsToShow.forEach(holding => {
    const currentValue = holding.quantity * holding.average_price;
    summary += `| ${holding.trading_symbol} | ${holding.quantity} | ₹${holding.average_price.toFixed(2)} | ₹${currentValue.toLocaleString()} | ${holding.demat_free_quantity} |\n`;
  });

  if (holdings.length > 20) {
    summary += `\n... and ${holdings.length - 20} more holdings.`;
  }

  return summary;
} 