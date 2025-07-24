// server/mcp-server-sdk.ts:
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { mcpTools } from '../services/mcpTools';

const server = new McpServer(
  {
    name: "NIN Trade MCP Server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
      prompts: {}
    }
  }
);

// Register the analyzeFundamentals tool
server.tool(
  "analyzeFundamentals",
  "Analyze fundamental metrics for a stock",
  {
    symbol: z.string().describe("Stock symbol to analyze (e.g., AAPL, MSFT, GOOG)")
  },
  async ({ symbol }) => {
    const result = await mcpTools.analyzeFundamentals(symbol);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register the analyzeMarket tool
server.tool(
  "analyzeMarket",
  "Analyze overall market conditions",
  {
    query: z.string().describe("Market query or filter")
  },
  async ({ query }) => {
    const result = await mcpTools.analyzeMarket(query);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register the getMarketNews tool
server.tool(
  "getMarketNews",
  "Get latest market news",
  {
    query: z.string().describe("News query or filter")
  },
  async ({ query }) => {
    const result = await mcpTools.getMarketNews(query);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register the analyzeOptions tool
server.tool(
  "analyzeOptions",
  "Analyze options data for a stock",
  {
    symbol: z.string().describe("Stock symbol to analyze options for")
  },
  async ({ symbol }) => {
    const result = await mcpTools.analyzeOptions(symbol);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register the analyzePortfolio tool
server.tool(
  "analyzePortfolio",
  "Analyze a portfolio of stocks",
  {
    holdings: z.array(z.object({})).describe("Array of holdings to analyze")
  },
  async ({ holdings }) => {
    const result = await mcpTools.analyzePortfolio(holdings);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register the screenStocks tool
server.tool(
  "screenStocks",
  "Screen stocks based on criteria",
  {
    sector: z.string().describe("Sector to filter by"),
    minPrice: z.number().describe("Minimum stock price"),
    maxPrice: z.number().describe("Maximum stock price")
  },
  async ({ sector, minPrice, maxPrice }) => {
    const criteria = { sector, minPrice, maxPrice };
    const result = await mcpTools.screenStocks(criteria);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register the analyzeTechnicals tool
server.tool(
  "analyzeTechnicals",
  "Analyze technical indicators for a stock",
  {
    symbol: z.string().describe("Stock symbol to analyze technicals for")
  },
  async ({ symbol }) => {
    const result = await mcpTools.analyzeTechnicals(symbol);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register the getUserHoldings tool
server.tool(
  "getUserHoldings",
  "Get user's portfolio holdings",
  {},
  async () => {
    const result = await mcpTools.getUserHoldings();
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register the getUserBinanceHoldings tool
server.tool(
  "getUserBinanceHoldings",
  "Get user's Binance portfolio holdings",
  {},
  async () => {
    const result = await mcpTools.getUserBinanceHoldings();
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register Groww Holdings tool
server.tool(
  "getGrowwHoldings",
  "Get user's Groww portfolio holdings",
  {},
  async () => {
    const result = await mcpTools.getGrowwHoldings();
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register Groww Positions tool
server.tool(
  "getGrowwPositions",
  "Get user's Groww positions",
  {
    segment: z.string().optional().describe("Segment filter (CASH, FNO)")
  },
  async ({ segment }) => {
    const result = await mcpTools.getGrowwPositions(segment);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register Groww Symbols LTP tool
server.tool(
  "getGrowwSymbolsLTP",
  "Get last traded prices for multiple symbols from Groww",
  {
    symbols: z.array(z.string()).describe("Array of trading symbols (e.g., ['RELIANCE', 'TCS', 'INFY'])"),
    segment: z.string().optional().default("CASH").describe("Market segment (CASH, FNO)")
  },
  async ({ symbols, segment }) => {
    const result = await mcpTools.getGrowwSymbolsLTP(symbols, segment);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register Groww Symbols OHLC tool
server.tool(
  "getGrowwSymbolsOHLC",
  "Get OHLC data for multiple symbols from Groww",
  {
    symbols: z.array(z.string()).describe("Array of trading symbols (e.g., ['RELIANCE', 'TCS', 'INFY'])"),
    segment: z.string().optional().default("CASH").describe("Market segment (CASH, FNO)")
  },
  async ({ symbols, segment }) => {
    const result = await mcpTools.getGrowwSymbolsOHLC(symbols, segment);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register Groww Symbol Quote tool
server.tool(
  "getGrowwSymbolQuote",
  "Get detailed quote for a single symbol from Groww",
  {
    symbol: z.string().describe("Trading symbol (e.g., RELIANCE)"),
    exchange: z.string().optional().default("NSE").describe("Exchange (NSE, BSE)"),
    segment: z.string().optional().default("CASH").describe("Market segment (CASH, FNO)")
  },
  async ({ symbol, exchange, segment }) => {
    const result = await mcpTools.getGrowwSymbolQuote(symbol, exchange, segment);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register Groww Place Order tool
server.tool(
  "placeGrowwOrder",
  "Place a new order on Groww",
  {
    trading_symbol: z.string().describe("Trading symbol (e.g., RELIANCE)"),
    quantity: z.number().describe("Number of shares to trade"),
    price: z.number().optional().describe("Price per share (for LIMIT orders)"),
    trigger_price: z.number().optional().describe("Trigger price (for SL orders)"),
    validity: z.string().describe("Order validity (DAY)"),
    exchange: z.string().describe("Exchange (NSE, BSE)"),
    segment: z.string().describe("Segment (CASH, FNO)"),
    product: z.string().describe("Product type (CNC, MIS, NRML)"),
    order_type: z.string().describe("Order type (MARKET, LIMIT, SL, SL_M)"),
    transaction_type: z.string().describe("Transaction type (BUY, SELL)"),
    order_reference_id: z.string().optional().describe("User reference ID")
  },
  async (params) => {
    const result = await mcpTools.placeGrowwOrder(params as any);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register Groww Modify Order tool
server.tool(
  "modifyGrowwOrder",
  "Modify an existing Groww order",
  {
    groww_order_id: z.string().describe("Groww order ID to modify"),
    quantity: z.number().optional().describe("New quantity"),
    price: z.number().optional().describe("New price"),
    trigger_price: z.number().optional().describe("New trigger price"),
    order_type: z.string().describe("Order type (MARKET, LIMIT, SL, SL_M)"),
    segment: z.string().describe("Segment (CASH, FNO)")
  },
  async (params) => {
    const result = await mcpTools.modifyGrowwOrder(params as any);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register Groww Cancel Order tool
server.tool(
  "cancelGrowwOrder",
  "Cancel an existing Groww order",
  {
    order_id: z.string().describe("Groww order ID to cancel"),
    segment: z.string().default("CASH").describe("Segment (CASH, FNO)")
  },
  async ({ order_id, segment }) => {
    const result = await mcpTools.cancelGrowwOrder(order_id, segment);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register Groww Order Status tool
server.tool(
  "getGrowwOrderStatus",
  "Get status and details of a Groww order",
  {
    order_id: z.string().describe("Groww order ID to check"),
    segment: z.string().default("CASH").describe("Segment (CASH, FNO)")
  },
  async ({ order_id, segment }) => {
    const result = await mcpTools.getGrowwOrderStatus(order_id, segment);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register Groww User Margin tool
server.tool(
  "getGrowwUserMargin",
  "Get user's available margin on Groww",
  {},
  async () => {
    const result = await mcpTools.getGrowwUserMargin();
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Register Groww Order Margin tool
server.tool(
  "getGrowwOrderMargin",
  "Calculate required margin for Groww order(s)",
  {
    orders: z.array(z.object({
      trading_symbol: z.string().describe("Trading symbol"),
      quantity: z.number().describe("Quantity"),
      price: z.number().describe("Price"),
      exchange: z.string().describe("Exchange"),
      segment: z.string().describe("Segment"),
      product: z.string().describe("Product type"),
      order_type: z.string().describe("Order type"),
      transaction_type: z.string().describe("Transaction type")
    })).describe("Array of order objects to calculate margin for"),
    segment: z.string().optional().default("CASH").describe("Market segment")
  },
  async ({ orders, segment }) => {
    const result = await mcpTools.getGrowwOrderMargin(orders as any, segment);
    return {
      content: [
        {
          type: "text",
          text: result.messages[0].content
        }
      ],
      references: result.references
    };
  }
);

// Add a simple prompt
server.prompt(
  "market-analysis",
  "Generate a market analysis report",
  {
    sector: z.string().optional().describe("Optional sector to focus on"),
    timeframe: z.string().optional().describe("Timeframe for analysis (e.g., 'daily', 'weekly', 'monthly')")
  },
  async (args, extra) => {
    const sector = args.sector || "overall market";
    const timeframe = args.timeframe || "daily";
    
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate a comprehensive ${timeframe} analysis of the ${sector}, including key trends, notable movers, and potential opportunities. Include relevant technical and fundamental factors.`
          }
        }
      ]
    };
  }
);

// Add handler for resources - using the correct signature
server.resource(
  "market-data",
  "https://api.nin.in/api/market-data", // URI for the resource
  async (uri, extra) => {
    // Return some sample market data
    const marketData = {
      indices: {
        "S&P 500": 5123.45,
        "NASDAQ": 16789.01,
        "DOW": 38765.43
      },
      sectors: {
        "Technology": "+1.2%",
        "Healthcare": "-0.3%",
        "Financials": "+0.5%"
      },
      topMovers: [
        { symbol: "AAPL", change: "+2.1%" },
        { symbol: "MSFT", change: "+1.8%" },
        { symbol: "AMZN", change: "-0.7%" }
      ]
    };
    
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: "application/json",
          text: JSON.stringify(marketData, null, 2)
        }
      ]
    };
  }
);

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

// Remove or modify this console.log statement as it's causing JSON parsing issues
// console.log("NIN Trade MCP Server started");

// Write to stderr instead of stdout if you want to keep the logging, as stderr won't interfere with the JSON-RPC communication happening on stdout.
console.error("NIN Trade MCP Server started");

