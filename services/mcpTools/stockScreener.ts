import { McpMessage, McpReference } from '../../types/mcp';

export interface ScreeningCriteria {
  marketCap?: 'large' | 'mid' | 'small' | 'micro';
  sector?: string;
  peRatio?: { min?: number; max?: number };
  dividend?: { min?: number };
  priceChange?: { period: '1d' | '1w' | '1m' | '3m' | '6m' | '1y'; min?: number; max?: number };
  volume?: { min?: number };
  technicals?: {
    rsi?: { min?: number; max?: number };
    macd?: 'bullish' | 'bearish';
    movingAverages?: 'above50' | 'below50' | 'above200' | 'below200' | 'crossover50' | 'crossover200';
  };
}

export interface ScreenedStock {
  symbol: string;
  name: string;
  sector: string;
  marketCap: number;
  price: number;
  peRatio: number;
  dividend: number;
  priceChange: Record<string, number>;
  volume: number;
  technicals: {
    rsi: number;
    macd: 'bullish' | 'bearish' | 'neutral';
    movingAverages: {
      ma50: number;
      ma200: number;
    };
  };
}

export async function screenStocks(criteria: ScreeningCriteria): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  // Perform stock screening
  const stocks = await performScreening(criteria);
  
  // Format the results
  return {
    messages: [
      {
        role: 'assistant',
        content: `I've found ${stocks.length} stocks that match your screening criteria.`
      }
    ],
    references: [
      {
        type: 'text',
        title: 'Stock Screening Results',
        content: formatScreeningResults(stocks, criteria),
        metadata: { stocks, criteria }
      }
    ]
  };
}

// Helper function to perform stock screening
async function performScreening(criteria: ScreeningCriteria): Promise<ScreenedStock[]> {
  // In a real implementation, you would fetch real stock data and apply the criteria
  // For now, we'll return mock data
  
  // Mock stock data
  const allStocks: ScreenedStock[] = [
    {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd',
      sector: 'Oil & Gas',
      marketCap: 1750000000000,
      price: 2650,
      peRatio: 22.5,
      dividend: 0.5,
      priceChange: { '1d': 0.8, '1w': 2.5, '1m': 5.2, '3m': 8.7, '6m': 12.3, '1y': 18.5 },
      volume: 5000000,
      technicals: {
        rsi: 62,
        macd: 'bullish',
        movingAverages: {
          ma50: 2550,
          ma200: 2400
        }
      }
    },
    {
      symbol: 'TCS',
      name: 'Tata Consultancy Services Ltd',
      sector: 'IT',
      marketCap: 1250000000000,
      price: 3400,
      peRatio: 28.2,
      dividend: 1.2,
      priceChange: { '1d': 1.2, '1w': 3.5, '1m': 4.8, '3m': 7.2, '6m': 9.5, '1y': 15.2 },
      volume: 2500000,
      technicals: {
        rsi: 58,
        macd: 'bullish',
        movingAverages: {
          ma50: 3300,
          ma200: 3100
        }
      }
    },
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Ltd',
      sector: 'Banking',
      marketCap: 1100000000000,
      price: 1550,
      peRatio: 18.5,
      dividend: 1.5,
      priceChange: { '1d': -0.5, '1w': 1.2, '1m': 3.5, '3m': 5.8, '6m': 8.2, '1y': 12.5 },
      volume: 4000000,
      technicals: {
        rsi: 45,
        macd: 'neutral',
        movingAverages: {
          ma50: 1520,
          ma200: 1480
        }
      }
    },
    {
      symbol: 'INFY',
      name: 'Infosys Ltd',
      sector: 'IT',
      marketCap: 750000000000,
      price: 1600,
      peRatio: 24.8,
      dividend: 2.0,
      priceChange: { '1d': 1.5, '1w': 4.2, '1m': 6.5, '3m': 9.8, '6m': 14.2, '1y': 20.5 },
      volume: 3000000,
      technicals: {
        rsi: 65,
        macd: 'bullish',
        movingAverages: {
          ma50: 1550,
          ma200: 1450
        }
      }
    },
    {
      symbol: 'SUNPHARMA',
      name: 'Sun Pharmaceutical Industries Ltd',
      sector: 'Pharma',
      marketCap: 500000000000,
      price: 1050,
      peRatio: 32.5,
      dividend: 0.8,
      priceChange: { '1d': -1.2, '1w': -2.5, '1m': -0.5, '3m': 2.5, '6m': 5.8, '1y': 8.5 },
      volume: 1500000,
      technicals: {
        rsi: 38,
        macd: 'bearish',
        movingAverages: {
          ma50: 1080,
          ma200: 1020
        }
      }
    }
  ];
  
  // Apply criteria to filter stocks
  return allStocks.filter(stock => {
    // Market Cap filter
    if (criteria.marketCap) {
      const marketCapValue = stock.marketCap;
      if (criteria.marketCap === 'large' && marketCapValue < 500000000000) return false;
      if (criteria.marketCap === 'mid' && (marketCapValue < 100000000000 || marketCapValue > 500000000000)) return false;
      if (criteria.marketCap === 'small' && (marketCapValue < 20000000000 || marketCapValue > 100000000000)) return false;
      if (criteria.marketCap === 'micro' && marketCapValue > 20000000000) return false;
    }
    
    // Sector filter
    if (criteria.sector && stock.sector !== criteria.sector) return false;
    
    // PE Ratio filter
    if (criteria.peRatio) {
      if (criteria.peRatio.min !== undefined && stock.peRatio < criteria.peRatio.min) return false;
      if (criteria.peRatio.max !== undefined && stock.peRatio > criteria.peRatio.max) return false;
    }
    
    // Dividend filter
    if (criteria.dividend && criteria.dividend.min !== undefined && stock.dividend < criteria.dividend.min) return false;
    
    // Price Change filter
    if (criteria.priceChange) {
      const period = criteria.priceChange.period;
      const change = stock.priceChange[period];
      if (criteria.priceChange.min !== undefined && change < criteria.priceChange.min) return false;
      if (criteria.priceChange.max !== undefined && change > criteria.priceChange.max) return false;
    }
    
    // Volume filter
    if (criteria.volume && criteria.volume.min !== undefined && stock.volume < criteria.volume.min) return false;
    
    // Technical indicators filter
    if (criteria.technicals) {
      // RSI filter
      if (criteria.technicals.rsi) {
        if (criteria.technicals.rsi.min !== undefined && stock.technicals.rsi < criteria.technicals.rsi.min) return false;
        if (criteria.technicals.rsi.max !== undefined && stock.technicals.rsi > criteria.technicals.rsi.max) return false;
      }
      
      // MACD filter
      if (criteria.technicals.macd && stock.technicals.macd !== criteria.technicals.macd) return false;
      
      // Moving Averages filter
      if (criteria.technicals.movingAverages) {
        const { ma50, ma200 } = stock.technicals.movingAverages;
        const currentPrice = stock.price;
        
        if (criteria.technicals.movingAverages === 'above50' && currentPrice < ma50) return false;
        if (criteria.technicals.movingAverages === 'below50' && currentPrice > ma50) return false;
        if (criteria.technicals.movingAverages === 'above200' && currentPrice < ma200) return false;
        if (criteria.technicals.movingAverages === 'below200' && currentPrice > ma200) return false;
        if (criteria.technicals.movingAverages === 'crossover50' && !(currentPrice > ma50 && ma50 > ma200)) return false;
        if (criteria.technicals.movingAverages === 'crossover200' && !(currentPrice > ma200 && ma50 < ma200)) return false;
      }
    }
    
    // If all criteria pass, include the stock
    return true;
  });
}

// Helper function to format screening results as a table
function formatScreeningResults(stocks: ScreenedStock[], criteria: ScreeningCriteria): string {
  if (stocks.length === 0) {
    return 'No stocks match the specified criteria.';
  }
  
  let table = '## Screening Results\n\n';
  table += '| Symbol | Name | Sector | Price | P/E | Div % | 1M Change | RSI | MACD |\n';
  table += '|--------|------|--------|-------|-----|-------|-----------|-----|------|\n';
  
  stocks.forEach(stock => {
    const priceChangeSymbol = stock.priceChange['1m'] >= 0 ? '▲' : '▼';
    table += `| ${stock.symbol} | ${stock.name} | ${stock.sector} | ₹${stock.price} | ${stock.peRatio.toFixed(1)} | ${stock.dividend.toFixed(1)}% | ${priceChangeSymbol} ${Math.abs(stock.priceChange['1m']).toFixed(1)}% | ${stock.technicals.rsi} | ${stock.technicals.macd} |\n`;
  });
  
  table += '\n## Applied Criteria\n\n';
  
  // Format the criteria that were applied
  const criteriaList: string[] = [];
  
  if (criteria.marketCap) {
    criteriaList.push(`- Market Cap: ${criteria.marketCap}`);
  }
  
  if (criteria.sector) {
    criteriaList.push(`- Sector: ${criteria.sector}`);
  }
  
  if (criteria.peRatio) {
    const peDesc = [];
    if (criteria.peRatio.min !== undefined) peDesc.push(`min ${criteria.peRatio.min}`);
    if (criteria.peRatio.max !== undefined) peDesc.push(`max ${criteria.peRatio.max}`);
    criteriaList.push(`- P/E Ratio: ${peDesc.join(', ')}`);
  }
  
  if (criteria.dividend && criteria.dividend.min !== undefined) {
    criteriaList.push(`- Dividend: min ${criteria.dividend.min}%`);
  }
  
  if (criteria.priceChange) {
    const changeDesc = [];
    if (criteria.priceChange.min !== undefined) changeDesc.push(`min ${criteria.priceChange.min}%`);
    if (criteria.priceChange.max !== undefined) changeDesc.push(`max ${criteria.priceChange.max}%`);
    criteriaList.push(`- ${criteria.priceChange.period.toUpperCase()} Price Change: ${changeDesc.join(', ')}`);
  }
  
  if (criteria.volume && criteria.volume.min !== undefined) {
    criteriaList.push(`- Volume: min ${criteria.volume.min.toLocaleString()}`);
  }
  
  if (criteria.technicals) {
    if (criteria.technicals.rsi) {
      const rsiDesc = [];
      if (criteria.technicals.rsi.min !== undefined) rsiDesc.push(`min ${criteria.technicals.rsi.min}`);
      if (criteria.technicals.rsi.max !== undefined) rsiDesc.push(`max ${criteria.technicals.rsi.max}`);
      criteriaList.push(`- RSI: ${rsiDesc.join(', ')}`);
    }
    
    if (criteria.technicals.macd) {
      criteriaList.push(`- MACD: ${criteria.technicals.macd}`);
    }
    
    if (criteria.technicals.movingAverages) {
      criteriaList.push(`- Moving Averages: ${criteria.technicals.movingAverages}`);
    }
  }
  
  if (criteriaList.length > 0) {
    table += criteriaList.join('\n');
  } else {
    table += 'No specific criteria applied.';
  }
  
  return table;
}