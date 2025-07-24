import { McpMessage, McpReference } from '../../types/mcp';

const GROWW_API_KEY = process.env.GROWW_API_KEY || '';
const GROWW_BASE_URL = 'https://api.groww.in';

// Groww LTP Response interface
export interface GrowwLTPResponse {
  status: string;
  payload: Record<string, number>;
}

// Groww OHLC Response interface - OHLC comes as string in the API response
export interface GrowwOHLCResponse {
  status: string;
  payload: Record<string, string>; // OHLC data comes as string like "{open: 149.50,high: 150.50,low: 148.50,close: 149.50}"
}

// Groww Quote interfaces
export interface GrowwQuoteDepth {
  buy: Array<{ price: number; quantity: number }>;
  sell: Array<{ price: number; quantity: number }>;
}

export interface GrowwQuoteData {
  average_price: number;
  bid_quantity: number;
  bid_price: number;
  day_change: number;
  day_change_perc: number;
  upper_circuit_limit: number;
  lower_circuit_limit: number;
  ohlc: string;
  depth: GrowwQuoteDepth;
  high_trade_range: number;
  implied_volatility?: number;
  last_trade_quantity: number;
  last_trade_time: number;
  low_trade_range: number;
  last_price: number;
  market_cap?: number;
  offer_price: number;
  offer_quantity: number;
  oi_day_change?: number;
  oi_day_change_percentage?: number;
  open_interest?: number;
  previous_open_interest?: number;
  total_buy_quantity: number;
  total_sell_quantity: number;
  volume: number;
  week_52_high: number;
  week_52_low: number;
}

export interface GrowwQuoteResponse {
  status: string;
  payload: GrowwQuoteData;
}

// Get LTP for multiple symbols
export async function getGrowwSymbolsLTP(symbols: string[], segment: string = 'CASH'): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  try {
    const ltpData = await fetchGrowwLTP(symbols, segment);
    
    if (ltpData.status !== 'SUCCESS') {
      throw new Error('Failed to fetch Groww LTP data');
    }

    return {
      messages: [
        {
          role: 'assistant',
          content: `Last Traded Prices for ${symbols.length} symbols:\n\n` +
                   formatLTPSummary(ltpData.payload)
        }
      ],
      references: [
        {
          type: 'text',
          title: 'Groww LTP Data',
          content: 'Last traded prices for requested symbols',
          metadata: ltpData
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching Groww LTP:', error);
    return {
      messages: [
        {
          role: 'assistant',
          content: `Error fetching LTP data: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      references: []
    };
  }
}

// Get OHLC for multiple symbols
export async function getGrowwSymbolsOHLC(symbols: string[], segment: string = 'CASH'): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  try {
    const ohlcData = await fetchGrowwOHLC(symbols, segment);
    
    if (ohlcData.status !== 'SUCCESS') {
      throw new Error('Failed to fetch Groww OHLC data');
    }

    return {
      messages: [
        {
          role: 'assistant',
          content: `OHLC Data for ${symbols.length} symbols:\n\n` +
                   formatOHLCSummary(ohlcData.payload)
        }
      ],
      references: [
        {
          type: 'text',
          title: 'Groww OHLC Data',
          content: 'OHLC data for requested symbols',
          metadata: ohlcData
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching Groww OHLC:', error);
    return {
      messages: [
        {
          role: 'assistant',
          content: `Error fetching OHLC data: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      references: []
    };
  }
}

// Get detailed quote for a single symbol
export async function getGrowwSymbolQuote(symbol: string, exchange: string = 'NSE', segment: string = 'CASH'): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  try {
    const quoteData = await fetchGrowwQuote(symbol, exchange, segment);
    
    if (quoteData.status !== 'SUCCESS') {
      throw new Error('Failed to fetch Groww quote data');
    }

    return {
      messages: [
        {
          role: 'assistant',
          content: `Detailed Quote for ${symbol}:\n\n` +
                   formatQuoteSummary(symbol, quoteData.payload)
        }
      ],
      references: [
        {
          type: 'text',
          title: `Groww Quote - ${symbol}`,
          content: `Detailed quote information for ${symbol}`,
          metadata: quoteData
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching Groww quote:', error);
    return {
      messages: [
        {
          role: 'assistant',
          content: `Error fetching quote for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      references: []
    };
  }
}

// Helper function to fetch LTP from Groww API
async function fetchGrowwLTP(symbols: string[], segment: string): Promise<GrowwLTPResponse> {
  if (!GROWW_API_KEY) {
    throw new Error('Groww API key not configured');
  }

  // Convert symbols to exchange_symbol format (e.g., NSE_RELIANCE)
  const exchangeSymbols = symbols.map(symbol => `NSE_${symbol}`).join(',');
  
  const url = `${GROWW_BASE_URL}/v1/live-data/ltp?segment=${segment}&exchange_symbols=${exchangeSymbols}`;

  const response = await fetch(url, {
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

// Helper function to fetch OHLC from Groww API
async function fetchGrowwOHLC(symbols: string[], segment: string): Promise<GrowwOHLCResponse> {
  if (!GROWW_API_KEY) {
    throw new Error('Groww API key not configured');
  }

  // Convert symbols to exchange_symbol format (e.g., NSE_RELIANCE)
  const exchangeSymbols = symbols.map(symbol => `NSE_${symbol}`).join(',');
  
  const url = `${GROWW_BASE_URL}/v1/live-data/ohlc?segment=${segment}&exchange_symbols=${exchangeSymbols}`;

  const response = await fetch(url, {
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

// Helper function to fetch quote from Groww API
async function fetchGrowwQuote(symbol: string, exchange: string, segment: string): Promise<GrowwQuoteResponse> {
  if (!GROWW_API_KEY) {
    throw new Error('Groww API key not configured');
  }

  const url = `${GROWW_BASE_URL}/v1/live-data/quote?exchange=${exchange}&segment=${segment}&trading_symbol=${symbol}`;

  const response = await fetch(url, {
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

// Helper function to parse OHLC string format
function parseOHLCString(ohlcString: string): { open: number; high: number; low: number; close: number } | null {
  try {
    // Parse string like "{open: 149.50,high: 150.50,low: 148.50,close: 149.50}"
    const cleanString = ohlcString.replace(/[{}]/g, '');
    const pairs = cleanString.split(',');
    const result: any = {};
    
    pairs.forEach(pair => {
      const [key, value] = pair.split(':').map(s => s.trim());
      result[key] = parseFloat(value);
    });
    
    return {
      open: result.open || 0,
      high: result.high || 0,
      low: result.low || 0,
      close: result.close || 0
    };
  } catch (error) {
    console.error('Error parsing OHLC string:', error);
    return null;
  }
}

// Helper function to format LTP summary
function formatLTPSummary(ltpData: Record<string, number>): string {
  let summary = '**Last Traded Prices:**\n\n';
  summary += '| Symbol | LTP |\n';
  summary += '|--------|-----|\n';

  Object.entries(ltpData).forEach(([symbol, price]) => {
    // Remove exchange prefix for cleaner display
    const cleanSymbol = symbol.replace(/^[A-Z]+_/, '');
    summary += `| ${cleanSymbol} | ₹${price.toFixed(2)} |\n`;
  });

  return summary;
}

// Helper function to format OHLC summary
function formatOHLCSummary(ohlcData: Record<string, string>): string {
  let summary = '**OHLC Data:**\n\n';
  summary += '| Symbol | Open | High | Low | Close |\n';
  summary += '|--------|------|------|-----|-------|\n';

  Object.entries(ohlcData).forEach(([symbol, ohlcString]) => {
    // Remove exchange prefix for cleaner display
    const cleanSymbol = symbol.replace(/^[A-Z]+_/, '');
    const ohlc = parseOHLCString(ohlcString);
    
    if (ohlc) {
      summary += `| ${cleanSymbol} | ₹${ohlc.open.toFixed(2)} | ₹${ohlc.high.toFixed(2)} | ₹${ohlc.low.toFixed(2)} | ₹${ohlc.close.toFixed(2)} |\n`;
    } else {
      summary += `| ${cleanSymbol} | - | - | - | - |\n`;
    }
  });

  return summary;
}

// Helper function to format quote summary
function formatQuoteSummary(symbol: string, quote: GrowwQuoteData): string {
  let summary = `**${symbol} - Detailed Quote:**\n\n`;
  
  summary += `**Price Information:**\n`;
  summary += `- Last Price: ₹${quote.last_price.toFixed(2)}\n`;
  summary += `- Day Change: ₹${quote.day_change.toFixed(2)} (${quote.day_change_perc.toFixed(2)}%)\n`;
  summary += `- Bid: ₹${quote.bid_price.toFixed(2)} (${quote.bid_quantity})\n`;
  summary += `- Ask: ₹${quote.offer_price.toFixed(2)} (${quote.offer_quantity})\n\n`;

  summary += `**Trading Information:**\n`;
  summary += `- Volume: ${quote.volume.toLocaleString()}\n`;
  summary += `- High: ₹${quote.high_trade_range.toFixed(2)}\n`;
  summary += `- Low: ₹${quote.low_trade_range.toFixed(2)}\n`;
  summary += `- 52W High: ₹${quote.week_52_high.toFixed(2)}\n`;
  summary += `- 52W Low: ₹${quote.week_52_low.toFixed(2)}\n\n`;

  summary += `**Circuit Limits:**\n`;
  summary += `- Upper: ₹${quote.upper_circuit_limit.toFixed(2)}\n`;
  summary += `- Lower: ₹${quote.lower_circuit_limit.toFixed(2)}\n\n`;

  if (quote.market_cap) {
    summary += `**Market Cap:** ₹${quote.market_cap.toLocaleString()}\n\n`;
  }

  // Add top 3 bid/ask levels if available
  if (quote.depth && quote.depth.buy && quote.depth.buy.length > 0) {
    summary += `**Top 3 Bid Levels:**\n`;
    quote.depth.buy.slice(0, 3).forEach((level, index) => {
      summary += `${index + 1}. ₹${level.price.toFixed(2)} (${level.quantity})\n`;
    });
    summary += '\n';
  }

  if (quote.depth && quote.depth.sell && quote.depth.sell.length > 0) {
    summary += `**Top 3 Ask Levels:**\n`;
    quote.depth.sell.slice(0, 3).forEach((level, index) => {
      summary += `${index + 1}. ₹${level.price.toFixed(2)} (${level.quantity})\n`;
    });
  }

  return summary;
} 