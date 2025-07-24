# NINX MCP Server

A Model Context Protocol (MCP) server that provides financial trading tools and market analysis capabilities. This server enables AI assistants to access real-time market data, execute trades, analyze portfolios, and perform comprehensive financial analysis.

## 🚀 Features

### Trading & Portfolio Management
- **Binance Integration**: Access account holdings, balances, and trading data
- **Groww Integration**: Complete trading platform with holdings, positions, orders, and margin data
- **Portfolio Analysis**: Comprehensive portfolio performance and risk assessment
- **Real-time Market Data**: Live prices, OHLC data, and market quotes

### Market Analysis Tools
- **Fundamental Analysis**: Company financials, ratios, and valuation metrics
- **Technical Analysis**: RSI, MACD, Bollinger Bands, moving averages, and chart patterns
- **Options Analysis**: Greeks, implied volatility, and options strategies
- **Market Overview**: Sector performance, market trends, and news sentiment
- **Stock Screening**: Filter stocks based on various criteria
- **Risk Assessment**: Portfolio risk metrics and stress testing

## 📋 Prerequisites

- **Node.js** >= 22.x
- **TypeScript** (included in dependencies)
- **API Keys** for trading platforms:
  - Binance API Key & Secret (optional)
  - Groww API Key (optional)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nin-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp config_env.example .env
```

Edit `.env` and add your API credentials:
```env
# Binance API (optional)
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Groww API (optional)
GROWW_API_KEY=your_groww_api_key
```

## 🚀 Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Build
```bash
npm run build
```

### Type Checking
```bash
npm run type-check
```

## 🔧 Available MCP Tools

### Market Analysis
- `analyzeFundamentals(symbol)` - Fundamental analysis for a stock
- `analyzeMarket(query)` - Overall market conditions analysis
- `analyzeTechnicals(symbol)` - Technical indicators and chart analysis
- `analyzeOptions(symbol)` - Options chain and Greeks analysis
- `getMarketNews(query)` - Latest market news and sentiment

### Portfolio & Holdings
- `getUserHoldings()` - Get user's portfolio holdings
- `getUserBinanceHoldings()` - Binance account holdings
- `analyzePortfolio(holdings)` - Portfolio performance analysis

### Groww Platform Integration
- `getGrowwHoldings()` - Groww portfolio holdings
- `getGrowwPositions(segment?)` - Positions data
- `getGrowwSymbolsLTP(symbols, segment?)` - Last traded prices
- `getGrowwSymbolsOHLC(symbols, segment?)` - OHLC market data
- `getGrowwSymbolQuote(symbol, exchange?, segment?)` - Detailed quotes

### Trading Operations (Groww)
- `placeGrowwOrder(orderParams)` - Place new orders
- `modifyGrowwOrder(orderParams)` - Modify existing orders
- `cancelGrowwOrder(orderId, segment?)` - Cancel orders
- `getGrowwOrderStatus(orderId, segment?)` - Order status

### Margin & Risk
- `getGrowwUserMargin()` - Available margin
- `getGrowwOrderMargin(orders, segment?)` - Calculate required margin

### Stock Screening
- `screenStocks(criteria)` - Filter stocks by criteria

## 🏗️ Project Structure

```
nin-mcp-server/
├── server/
│   ├── mcp-server-sdk.ts      # Main MCP server implementation
│   ├── mcp-server.ts          # Express server (legacy, not used)
│   └── manifest.ts            # Server manifest
├── services/
│   ├── mcpService.ts          # MCP service layer
│   └── mcpTools/              # Individual MCP tools
│       ├── fundamentalAnalysis.ts
│       ├── technicalAnalysis.ts
│       ├── portfolioAnalysis.ts
│       ├── marketAnalysis.ts
│       ├── optionsAnalysis.ts
│       ├── stockScreener.ts
│       ├── marketNews.ts
│       ├── riskAssessment.ts
│       ├── userHoldings.ts
│       ├── userBinanceHoldings.ts
│       ├── growwHoldings.ts
│       ├── growwPositions.ts
│       ├── growwLiveData.ts
│       ├── growwOrders.ts
│       ├── growwMargins.ts
│       └── index.ts
├── types/
│   └── mcp.ts                 # MCP type definitions
├── config_env.example        # Environment variables template
└── package.json
```

## 🧪 Development

### Code Formatting
```bash
# Check formatting
npm run format:check

# Auto-fix formatting
npm run format:write
```

### Type Checking
```bash
npm run typecheck
```

## 🔒 Security

- Store API keys in environment variables, never in code
- Use `dotenv` for local development environment management
- API keys are loaded securely from environment variables

## 📊 Integration with AI Assistants

This MCP server can be integrated with various AI assistants that support the Model Context Protocol:

### Claude Desktop Configuration

1. Copy the following configuration from your `config_env.example` file
2. Add your actual API keys 
3. Update the file paths to match your installation
4. Paste into Claude Desktop's MCP configuration

```json
{
  "mcpServers": {
    "nin-terminal": {
      "command": "ts-node",
      "args": [
        "/Users/YOUR_USERNAME/path/to/nin-mcp-server/server/mcp-server-sdk.ts"
      ],
      "cwd": "/Users/YOUR_USERNAME/path/to/nin-mcp-server",
      "env": {
        "NINX_API_KEY": "your_actual_ninx_api_key",
        "NINX_SECRET_KEY": "your_actual_ninx_secret_key",
        "BINANCE_API_KEY": "your_actual_binance_api_key",
        "BINANCE_SECRET_KEY": "your_actual_binance_secret_key",
        "GROWW_API_KEY": "your_actual_groww_api_key"
      }
    }
  }
}
```

### Other MCP-Compatible Clients

For other MCP clients, use the stdio transport protocol with similar configuration, adjusting the format as needed for your specific client.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include logs and environment information
