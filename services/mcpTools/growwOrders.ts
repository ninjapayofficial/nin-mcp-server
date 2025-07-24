import { McpMessage, McpReference } from '../../types/mcp';

const GROWW_API_KEY = process.env.GROWW_API_KEY || '';
const GROWW_BASE_URL = 'https://api.groww.in';

// Groww Order interfaces based on API documentation
export interface GrowwOrderRequest {
  trading_symbol: string;
  quantity: number;
  price?: number;
  trigger_price?: number;
  validity: string;
  exchange: string;
  segment: string;
  product: string;
  order_type: string;
  transaction_type: string;
  order_reference_id?: string;
}

export interface GrowwOrderResponse {
  status: string;
  payload?: {
    groww_order_id: string;
    order_status: string;
    order_reference_id?: string;
    remark?: string;
  };
}

export interface GrowwOrderModifyRequest {
  quantity?: number;
  price?: number;
  trigger_price?: number;
  order_type: string;
  segment: string;
  groww_order_id: string;
}

export interface GrowwOrderDetail {
  groww_order_id: string;
  trading_symbol: string;
  order_status: string;
  remark?: string;
  quantity: number;
  price: number;
  trigger_price?: number;
  filled_quantity?: number;
  remaining_quantity?: number;
  average_fill_price?: number;
  deliverable_quantity?: number;
  amo_status?: string;
  validity: string;
  exchange: string;
  order_type: string;
  transaction_type: string;
  segment: string;
  product: string;
  created_at?: string;
  exchange_time?: string;
  trade_date?: string;
  order_reference_id?: string;
}

export interface GrowwOrderDetailResponse {
  status: string;
  payload?: GrowwOrderDetail;
}

// Place a new order
export async function placeGrowwOrder(orderRequest: GrowwOrderRequest): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  try {
    const orderResponse = await createGrowwOrder(orderRequest);
    
    if (orderResponse.status !== 'SUCCESS' || !orderResponse.payload) {
      throw new Error(`Failed to place order: ${orderResponse.payload?.remark || 'Unknown error'}`);
    }

    const orderData = orderResponse.payload;

    return {
      messages: [
        {
          role: 'assistant',
          content: `Order placed successfully!\n\n` +
                   `Order ID: ${orderData.groww_order_id}\n` +
                   `Status: ${orderData.order_status}\n` +
                   `Symbol: ${orderRequest.trading_symbol}\n` +
                   `Quantity: ${orderRequest.quantity}\n` +
                   `Type: ${orderRequest.transaction_type} ${orderRequest.order_type}\n` +
                   `${orderData.remark ? `Remark: ${orderData.remark}` : ''}`
        }
      ],
      references: [
        {
          type: 'text',
          title: 'Order Placement Response',
          content: 'Order placement details',
          metadata: orderResponse
        }
      ]
    };
  } catch (error) {
    console.error('Error placing Groww order:', error);
    return {
      messages: [
        {
          role: 'assistant',
          content: `Error placing order: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      references: []
    };
  }
}

// Modify an existing order
export async function modifyGrowwOrder(modifyRequest: GrowwOrderModifyRequest): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  try {
    const modifyResponse = await updateGrowwOrder(modifyRequest);
    
    if (modifyResponse.status !== 'SUCCESS' || !modifyResponse.payload) {
      throw new Error(`Failed to modify order: ${modifyResponse.payload?.remark || 'Unknown error'}`);
    }

    const orderData = modifyResponse.payload;

    return {
      messages: [
        {
          role: 'assistant',
          content: `Order modified successfully!\n\n` +
                   `Order ID: ${orderData.groww_order_id}\n` +
                   `Status: ${orderData.order_status}\n` +
                   `${orderData.remark ? `Remark: ${orderData.remark}` : ''}`
        }
      ],
      references: [
        {
          type: 'text',
          title: 'Order Modification Response',
          content: 'Order modification details',
          metadata: modifyResponse
        }
      ]
    };
  } catch (error) {
    console.error('Error modifying Groww order:', error);
    return {
      messages: [
        {
          role: 'assistant',
          content: `Error modifying order: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      references: []
    };
  }
}

// Cancel an order
export async function cancelGrowwOrder(orderId: string, segment: string): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  try {
    const cancelResponse = await deleteGrowwOrder(orderId, segment);
    
    if (cancelResponse.status !== 'SUCCESS' || !cancelResponse.payload) {
      throw new Error(`Failed to cancel order: ${cancelResponse.payload?.remark || 'Unknown error'}`);
    }

    const orderData = cancelResponse.payload;

    return {
      messages: [
        {
          role: 'assistant',
          content: `Order cancelled successfully!\n\n` +
                   `Order ID: ${orderData.groww_order_id}\n` +
                   `Status: ${orderData.order_status}\n` +
                   `${orderData.remark ? `Remark: ${orderData.remark}` : ''}`
        }
      ],
      references: [
        {
          type: 'text',
          title: 'Order Cancellation Response',
          content: 'Order cancellation details',
          metadata: cancelResponse
        }
      ]
    };
  } catch (error) {
    console.error('Error cancelling Groww order:', error);
    return {
      messages: [
        {
          role: 'assistant',
          content: `Error cancelling order: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      references: []
    };
  }
}

// Get order details/status
export async function getGrowwOrderStatus(orderId: string, segment: string): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  try {
    const orderDetail = await fetchGrowwOrderDetail(orderId, segment);
    
    if (orderDetail.status !== 'SUCCESS' || !orderDetail.payload) {
      throw new Error('Failed to fetch order details');
    }

    const order = orderDetail.payload;

    return {
      messages: [
        {
          role: 'assistant',
          content: formatOrderDetailSummary(order)
        }
      ],
      references: [
        {
          type: 'text',
          title: `Order Details - ${orderId}`,
          content: 'Complete order information',
          metadata: orderDetail
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching Groww order status:', error);
    return {
      messages: [
        {
          role: 'assistant',
          content: `Error fetching order status: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      references: []
    };
  }
}

// Helper function to create order via Groww API
async function createGrowwOrder(orderRequest: GrowwOrderRequest): Promise<GrowwOrderResponse> {
  if (!GROWW_API_KEY) {
    throw new Error('Groww API key not configured');
  }

  const response = await fetch(`${GROWW_BASE_URL}/v1/order/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${GROWW_API_KEY}`,
      'X-API-VERSION': '1.0'
    },
    body: JSON.stringify(orderRequest)
  });

  if (!response.ok) {
    throw new Error(`Groww API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Helper function to modify order via Groww API
async function updateGrowwOrder(modifyRequest: GrowwOrderModifyRequest): Promise<GrowwOrderResponse> {
  if (!GROWW_API_KEY) {
    throw new Error('Groww API key not configured');
  }

  const response = await fetch(`${GROWW_BASE_URL}/v1/order/modify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${GROWW_API_KEY}`,
      'X-API-VERSION': '1.0'
    },
    body: JSON.stringify(modifyRequest)
  });

  if (!response.ok) {
    throw new Error(`Groww API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Helper function to cancel order via Groww API
async function deleteGrowwOrder(orderId: string, segment: string): Promise<GrowwOrderResponse> {
  if (!GROWW_API_KEY) {
    throw new Error('Groww API key not configured');
  }

  const response = await fetch(`${GROWW_BASE_URL}/v1/order/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${GROWW_API_KEY}`,
      'X-API-VERSION': '1.0'
    },
    body: JSON.stringify({
      segment,
      groww_order_id: orderId
    })
  });

  if (!response.ok) {
    throw new Error(`Groww API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Helper function to fetch order details via Groww API
async function fetchGrowwOrderDetail(orderId: string, segment: string): Promise<GrowwOrderDetailResponse> {
  if (!GROWW_API_KEY) {
    throw new Error('Groww API key not configured');
  }

  const url = `${GROWW_BASE_URL}/v1/order/detail/${orderId}?segment=${segment}`;

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

// Helper function to format order detail summary
function formatOrderDetailSummary(order: GrowwOrderDetail): string {
  let summary = `**Order Details - ${order.groww_order_id}**\n\n`;
  
  summary += `**Basic Information:**\n`;
  summary += `- Symbol: ${order.trading_symbol}\n`;
  summary += `- Type: ${order.transaction_type} ${order.order_type}\n`;
  summary += `- Status: ${order.order_status}\n`;
  summary += `- Exchange: ${order.exchange} (${order.segment})\n`;
  summary += `- Product: ${order.product}\n\n`;

  summary += `**Quantity & Price:**\n`;
  summary += `- Quantity: ${order.quantity}\n`;
  if (order.filled_quantity !== undefined) {
    summary += `- Filled: ${order.filled_quantity}\n`;
  }
  if (order.remaining_quantity !== undefined) {
    summary += `- Pending: ${order.remaining_quantity}\n`;
  }
  summary += `- Price: ₹${order.price.toFixed(2)}\n`;
  if (order.trigger_price) {
    summary += `- Trigger Price: ₹${order.trigger_price.toFixed(2)}\n`;
  }
  if (order.average_fill_price) {
    summary += `- Average Fill Price: ₹${order.average_fill_price.toFixed(2)}\n`;
  }
  summary += `- Validity: ${order.validity}\n\n`;

  if (order.created_at) {
    summary += `**Timing:**\n`;
    summary += `- Created: ${order.created_at}\n`;
    if (order.exchange_time) {
      summary += `- Exchange Time: ${order.exchange_time}\n`;
    }
    if (order.trade_date) {
      summary += `- Trade Date: ${order.trade_date}\n`;
    }
    summary += '\n';
  }

  if (order.amo_status) {
    summary += `**AMO Status:** ${order.amo_status}\n`;
  }

  if (order.remark) {
    summary += `**Remark:** ${order.remark}\n`;
  }

  return summary;
} 