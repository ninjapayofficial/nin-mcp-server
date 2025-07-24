import { McpMessage, McpReference } from '../../types/mcp';

export interface Holding {
  img: string;
  name: string;
  symbol: string;
  industry: string;
  change: number;
  currentPrice: number;
  quantity: number;
  onOrders: number;
  avgPrice: number;
  pnl: number;
}

export interface UserHoldingsResult {
  holdings: Holding[];
  totalValue: number;
  totalPnL: number;
  pnlPercentage: number;
}

export async function getUserHoldings(): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  // Fetch user holdings
  const holdingsData = await fetchUserHoldings();
  
  // Format the results
  return {
    messages: [
      {
        role: 'assistant',
        content: `Here are your current holdings:\n\n` +
          `Total Portfolio Value: ₹${holdingsData.totalValue.toLocaleString()}\n` +
          `Total P&L: ${holdingsData.totalPnL >= 0 ? '+' : ''}₹${holdingsData.totalPnL.toLocaleString()} (${holdingsData.pnlPercentage >= 0 ? '+' : ''}${holdingsData.pnlPercentage.toFixed(2)}%)\n\n` +
          `Top Holdings:\n` +
          holdingsData.holdings.slice(0, 3).map(holding => 
            `- ${holding.name} (${holding.symbol}): ${holding.quantity.toFixed(2)} shares at ₹${holding.currentPrice.toFixed(2)}`
          ).join('\n') + 
          '\n\nAll Holdings:\n' +
          formatHoldingsTable(holdingsData)  // Include the formatted table directly in the message
      }
    ],
    references: [
      {
        type: 'text',
        title: 'User Holdings',
        content: 'Holdings data available in metadata',
        metadata: holdingsData  // Keep the raw data for UI components
      }
    ]
  };
}

// Helper function to fetch user holdings
async function fetchUserHoldings(): Promise<UserHoldingsResult> {
  // Mock data for user holdings
  const holdings: Holding[] = [
    {
      img: 'https://image-url.png',
      name: 'Tata Consultancy Service',
      symbol: 'TCS',
      industry: 'IT',
      change: 2.05,
      currentPrice: 26664.00,
      quantity: 0.26231428,
      onOrders: 0.05231428,
      avgPrice: 24500.64,
      pnl: 2000
    },
    {
      img: 'https://image-url2.png',
      name: 'HDFC Bank',
      symbol: 'HDFCBANK',
      industry: 'Banking',
      change: -2.73,
      currentPrice: 1598.29,
      quantity: 2474.42361232,
      onOrders: 0.256567,
      avgPrice: 1566.64,
      pnl: 200
    },
    {
      img: 'https://image-url3.png',
      name: 'Reliance Industries',
      symbol: 'RELIANCE',
      industry: 'Oil & Gas',
      change: 1.45,
      currentPrice: 2890.75,
      quantity: 5.78923,
      onOrders: 0,
      avgPrice: 2750.50,
      pnl: 810.25
    },
    {
      img: 'https://image-url4.png',
      name: 'Infosys',
      symbol: 'INFY',
      industry: 'IT',
      change: 0.85,
      currentPrice: 1450.60,
      quantity: 10.5,
      onOrders: 1.2,
      avgPrice: 1380.25,
      pnl: 738.68
    },
    {
      img: 'https://image-url5.png',
      name: 'Bharti Airtel',
      symbol: 'BHARTIARTL',
      industry: 'Telecom',
      change: -0.32,
      currentPrice: 1120.40,
      quantity: 15.75,
      onOrders: 0,
      avgPrice: 1150.80,
      pnl: -478.80
    }
  ];

  // Calculate total value and P&L
  let totalValue = 0;
  let totalPnL = 0;
  let totalInvestment = 0;

  holdings.forEach(holding => {
    const holdingValue = holding.currentPrice * holding.quantity;
    const investmentValue = holding.avgPrice * holding.quantity;
    
    totalValue += holdingValue;
    totalPnL += holding.pnl;
    totalInvestment += investmentValue;
  });

  const pnlPercentage = (totalPnL / totalInvestment) * 100;

  return {
    holdings,
    totalValue,
    totalPnL,
    pnlPercentage
  };
}

// Helper function to format holdings as a table
function formatHoldingsTable(data: UserHoldingsResult): string {
  let table = '| Symbol | Name | Industry | Quantity | Price | Change | Avg Price | P&L |\n';
  table += '|--------|------|----------|----------|-------|--------|-----------|-----|\n';
  
  data.holdings.forEach(holding => {
    const changeSymbol = holding.change >= 0 ? '▲' : '▼';
    const pnlSymbol = holding.pnl >= 0 ? '▲' : '▼';
    
    table += `| ${holding.symbol} | ${holding.name} | ${holding.industry} | ${holding.quantity.toFixed(2)} | ₹${holding.currentPrice.toFixed(2)} | ${changeSymbol} ${Math.abs(holding.change).toFixed(2)}% | ₹${holding.avgPrice.toFixed(2)} | ${pnlSymbol} ₹${Math.abs(holding.pnl).toFixed(2)} |\n`;
  });
  
  table += `\n**Total Portfolio Value**: ₹${data.totalValue.toLocaleString()}\n`;
  table += `**Total P&L**: ${data.totalPnL >= 0 ? '+' : ''}₹${data.totalPnL.toLocaleString()} (${data.pnlPercentage >= 0 ? '+' : ''}${data.pnlPercentage.toFixed(2)}%)`;
  
  return table;
}