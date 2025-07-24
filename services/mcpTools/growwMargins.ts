import { McpMessage, McpReference } from '../../types/mcp';

const GROWW_API_KEY = process.env.GROWW_API_KEY || '';
const GROWW_BASE_URL = 'https://api.groww.in';

// Groww User Margin interface based on API documentation
export interface GrowwFnoMarginDetails {
  net_fno_margin_used: number;
  span_margin_used: number;
  exposure_margin_used: number;
  future_balance_available: number;
  option_buy_balance_available: number;
  option_sell_balance_available: number;
}

export interface GrowwEquityMarginDetails {
  net_equity_margin_used: number;
  cnc_margin_used: number;
  mis_margin_used: number;
  cnc_balance_available: number;
  mis_balance_available: number;
}

export interface GrowwUserMarginData {
  clear_cash: number;
  net_margin_used: number;
  brokerage_and_charges: number;
  collateral_used: number;
  collateral_available: number;
  adhoc_margin: number;
  fno_margin_details: GrowwFnoMarginDetails;
  equity_margin_details: GrowwEquityMarginDetails;
}

export interface GrowwUserMarginResponse {
  status: string;
  payload: GrowwUserMarginData;
}

// Groww Order Margin Request interface
export interface GrowwOrderMarginRequest {
  trading_symbol: string;
  quantity: number;
  price: number;
  exchange: string;
  segment: string;
  product: string;
  order_type: string;
  transaction_type: string;
}

// Groww Order Margin Response interface
export interface GrowwOrderMarginData {
  exposure_required: number;
  span_required: number;
  option_buy_premium: number;
  brokerage_and_charges: number;
  total_requirement: number;
  cash_cnc_margin_required: number;
  cash_mis_margin_required: number;
  physical_delivery_margin_requirement: number;
}

export interface GrowwOrderMarginResponse {
  status: string;
  payload: GrowwOrderMarginData;
}

// Get user's available margin
export async function getGrowwUserMargin(): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  try {
    const marginData = await fetchGrowwUserMargin();
    
    if (marginData.status !== 'SUCCESS') {
      throw new Error('Failed to fetch Groww user margin');
    }

    return {
      messages: [
        {
          role: 'assistant',
          content: `Your current Groww margin details:\n\n` +
                   formatUserMarginSummary(marginData.payload)
        }
      ],
      references: [
        {
          type: 'text',
          title: 'Groww User Margin',
          content: 'Complete user margin information',
          metadata: marginData
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching Groww user margin:', error);
    return {
      messages: [
        {
          role: 'assistant',
          content: `Error fetching user margin: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      references: []
    };
  }
}

// Calculate required margin for order(s)
export async function getGrowwOrderMargin(orderRequests: GrowwOrderMarginRequest[], segment: string = 'CASH'): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  try {
    const marginData = await fetchGrowwOrderMargin(orderRequests, segment);
    
    if (marginData.status !== 'SUCCESS') {
      throw new Error('Failed to fetch Groww order margin');
    }

    const isMultipleOrders = orderRequests.length > 1;

    return {
      messages: [
        {
          role: 'assistant',
          content: `Margin requirement for ${isMultipleOrders ? `${orderRequests.length} orders` : 'order'}:\n\n` +
                   formatOrderMarginSummary(marginData.payload, orderRequests)
        }
      ],
      references: [
        {
          type: 'text',
          title: 'Groww Order Margin',
          content: 'Margin requirement calculation',
          metadata: marginData
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching Groww order margin:', error);
    return {
      messages: [
        {
          role: 'assistant',
          content: `Error calculating order margin: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      references: []
    };
  }
}

// Helper function to fetch user margin from Groww API
async function fetchGrowwUserMargin(): Promise<GrowwUserMarginResponse> {
  if (!GROWW_API_KEY) {
    throw new Error('Groww API key not configured');
  }

  const response = await fetch(`${GROWW_BASE_URL}/v1/margins/detail/user`, {
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

// Helper function to fetch order margin from Groww API
async function fetchGrowwOrderMargin(orderRequests: GrowwOrderMarginRequest[], segment: string): Promise<GrowwOrderMarginResponse> {
  if (!GROWW_API_KEY) {
    throw new Error('Groww API key not configured');
  }

  const url = `${GROWW_BASE_URL}/v1/margins/detail/orders?segment=${segment}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${GROWW_API_KEY}`,
      'X-API-VERSION': '1.0'
    },
    body: JSON.stringify(orderRequests)
  });

  if (!response.ok) {
    throw new Error(`Groww API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Helper function to format user margin summary
function formatUserMarginSummary(margin: GrowwUserMarginData): string {
  let summary = '**Account Margin Overview:**\n\n';
  
  summary += `**Cash & Collateral:**\n`;
  summary += `- Clear Cash: ₹${margin.clear_cash.toLocaleString()}\n`;
  summary += `- Net Margin Used: ₹${margin.net_margin_used.toLocaleString()}\n`;
  summary += `- Collateral Available: ₹${margin.collateral_available.toLocaleString()}\n`;
  summary += `- Collateral Used: ₹${margin.collateral_used.toLocaleString()}\n`;
  if (margin.adhoc_margin > 0) {
    summary += `- Adhoc Margin: ₹${margin.adhoc_margin.toLocaleString()}\n`;
  }
  summary += '\n';

  summary += `**Equity Trading:**\n`;
  summary += `- Net Equity Margin Used: ₹${margin.equity_margin_details.net_equity_margin_used.toLocaleString()}\n`;
  summary += `- CNC Balance Available: ₹${margin.equity_margin_details.cnc_balance_available.toLocaleString()}\n`;
  summary += `- CNC Margin Used: ₹${margin.equity_margin_details.cnc_margin_used.toLocaleString()}\n`;
  summary += `- MIS Balance Available: ₹${margin.equity_margin_details.mis_balance_available.toLocaleString()}\n`;
  summary += `- MIS Margin Used: ₹${margin.equity_margin_details.mis_margin_used.toLocaleString()}\n`;
  summary += '\n';

  summary += `**F&O Trading:**\n`;
  summary += `- Net F&O Margin Used: ₹${margin.fno_margin_details.net_fno_margin_used.toLocaleString()}\n`;
  summary += `- Future Balance Available: ₹${margin.fno_margin_details.future_balance_available.toLocaleString()}\n`;
  summary += `- Option Buy Balance: ₹${margin.fno_margin_details.option_buy_balance_available.toLocaleString()}\n`;
  summary += `- Option Sell Balance: ₹${margin.fno_margin_details.option_sell_balance_available.toLocaleString()}\n`;
  summary += `- SPAN Margin Used: ₹${margin.fno_margin_details.span_margin_used.toLocaleString()}\n`;
  summary += `- Exposure Margin Used: ₹${margin.fno_margin_details.exposure_margin_used.toLocaleString()}\n`;
  summary += '\n';

  summary += `**Charges:**\n`;
  summary += `- Brokerage & Charges: ₹${margin.brokerage_and_charges.toLocaleString()}\n`;

  return summary;
}

// Helper function to format order margin summary
function formatOrderMarginSummary(margin: GrowwOrderMarginData, orderRequests: GrowwOrderMarginRequest[]): string {
  let summary = '';

  // Display order details if single order
  if (orderRequests.length === 1) {
    const order = orderRequests[0];
    summary += `**Order Details:**\n`;
    summary += `- Symbol: ${order.trading_symbol}\n`;
    summary += `- Type: ${order.transaction_type} ${order.order_type}\n`;
    summary += `- Quantity: ${order.quantity}\n`;
    summary += `- Price: ₹${order.price.toFixed(2)}\n`;
    summary += `- Product: ${order.product}\n`;
    summary += `- Exchange: ${order.exchange} (${order.segment})\n\n`;
  } else {
    summary += `**Basket of ${orderRequests.length} Orders:**\n`;
    orderRequests.forEach((order, index) => {
      const totalValue = order.quantity * order.price;
      summary += `${index + 1}. ${order.trading_symbol} - ${order.transaction_type} ${order.quantity} @ ₹${order.price.toFixed(2)} (₹${totalValue.toLocaleString()})\n`;
    });
    summary += '\n';
  }

  summary += `**Margin Requirements:**\n`;
  summary += `- Total Requirement: ₹${margin.total_requirement.toLocaleString()}\n`;
  
  if (margin.cash_cnc_margin_required > 0) {
    summary += `- CNC Margin Required: ₹${margin.cash_cnc_margin_required.toLocaleString()}\n`;
  }
  if (margin.cash_mis_margin_required > 0) {
    summary += `- MIS Margin Required: ₹${margin.cash_mis_margin_required.toLocaleString()}\n`;
  }
  if (margin.exposure_required > 0) {
    summary += `- Exposure Required: ₹${margin.exposure_required.toLocaleString()}\n`;
  }
  if (margin.span_required > 0) {
    summary += `- SPAN Required: ₹${margin.span_required.toLocaleString()}\n`;
  }
  if (margin.option_buy_premium > 0) {
    summary += `- Option Buy Premium: ₹${margin.option_buy_premium.toLocaleString()}\n`;
  }
  if (margin.physical_delivery_margin_requirement > 0) {
    summary += `- Physical Delivery Margin: ₹${margin.physical_delivery_margin_requirement.toLocaleString()}\n`;
  }
  
  summary += `- Brokerage & Charges: ₹${margin.brokerage_and_charges.toLocaleString()}\n`;

  return summary;
} 