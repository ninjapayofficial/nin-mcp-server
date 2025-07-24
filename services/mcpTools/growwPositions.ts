import { McpMessage, McpReference } from '../../types/mcp';

const GROWW_API_KEY = process.env.GROWW_API_KEY || '';
const GROWW_BASE_URL = 'https://api.groww.in';

// Groww Position interface based on the API documentation
export interface GrowwPosition {
  trading_symbol: string;
  credit_quantity: number;
  credit_price: number;
  debit_quantity: number;
  debit_price: number;
  carry_forward_credit_quantity: number;
  carry_forward_credit_price: number;
  carry_forward_debit_quantity: number;
  carry_forward_debit_price: number;
  exchange: string;
  symbol_isin: string;
  quantity: number;
  product: string;
  net_carry_forward_quantity: number;
  net_price: number;
  net_carry_forward_price: number;
}

export interface GrowwPositionsResponse {
  status: string;
  payload: {
    positions: GrowwPosition[];
  };
}

export async function getGrowwPositions(segment?: string): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  try {
    const positionsData = await fetchGrowwPositions(segment);
    
    if (positionsData.status !== 'SUCCESS') {
      throw new Error('Failed to fetch Groww positions');
    }

    const positions = positionsData.payload.positions;
    const totalPositions = positions.length;
    
    return {
      messages: [
        {
          role: 'assistant',
          content: `Here are your current Groww positions${segment ? ` for ${segment}` : ''}:\n\n` +
                   `Total Positions: ${totalPositions}\n\n` +
                   formatGrowwPositionsSummary(positions)
        }
      ],
      references: [
        {
          type: 'text',
          title: 'Groww Positions Data',
          content: `Groww positions information${segment ? ` for ${segment}` : ''}`,
          metadata: positionsData
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching Groww positions:', error);
    return {
      messages: [
        {
          role: 'assistant',
          content: `Error fetching Groww positions: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      references: []
    };
  }
}

// Helper function to fetch positions from Groww API
async function fetchGrowwPositions(segment?: string): Promise<GrowwPositionsResponse> {
  if (!GROWW_API_KEY) {
    throw new Error('Groww API key not configured');
  }

  let url = `${GROWW_BASE_URL}/v1/positions/user`;
  if (segment) {
    url += `?segment=${segment}`;
  }

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

// Helper function to format positions summary
function formatGrowwPositionsSummary(positions: GrowwPosition[]): string {
  if (!positions || positions.length === 0) {
    return 'No positions found in your Groww account.';
  }

  let summary = '**Current Positions:**\n\n';
  summary += '| Symbol | Qty | Net Price | Credit Qty | Debit Qty | Product | Exchange |\n';
  summary += '|--------|-----|-----------|------------|-----------|---------|----------|\n';

  positions.forEach(position => {
    summary += `| ${position.trading_symbol} | ${position.quantity} | ₹${position.net_price.toFixed(2)} | ${position.credit_quantity} | ${position.debit_quantity} | ${position.product} | ${position.exchange} |\n`;
  });

  return summary;
} 