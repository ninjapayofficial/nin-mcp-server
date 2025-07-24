import { McpMessage, McpReference } from '../../types/mcp';

export interface OptionContract {
  symbol: string;
  underlyingSymbol: string;
  type: 'call' | 'put';
  strike: number;
  expiration: string; // ISO date string
  bid: number;
  ask: number;
  lastPrice: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface OptionsChain {
  underlyingSymbol: string;
  underlyingPrice: number;
  expirations: string[]; // ISO date strings
  strikes: number[];
  calls: OptionContract[];
  puts: OptionContract[];
}

export interface OptionsAnalysisResult {
  symbol: string;
  currentPrice: number;
  volatility: {
    historical: number;
    implied: number;
    skew: 'normal' | 'reverse' | 'flat';
    term: 'contango' | 'backwardation' | 'flat';
  };
  sentiment: {
    putCallRatio: number;
    interpretation: string;
  };
  strategies: Array<{
    name: string;
    description: string;
    contracts: Array<{
      action: 'buy' | 'sell';
      type: 'call' | 'put';
      strike: number;
      expiration: string;
    }>;
    maxProfit: number | 'unlimited';
    maxLoss: number | 'unlimited';
    breakeven: number[];
    riskRewardRatio: number;
  }>;
  unusualActivity: Array<{
    contract: OptionContract;
    volume: number;
    openInterestRatio: number;
    description: string;
  }>;
}

export async function analyzeOptions(symbol: string): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  // Fetch options chain and perform analysis
  const analysis = await performOptionsAnalysis(symbol);
  
  // Format the results
  return {
    messages: [
      {
        role: 'assistant',
        content: `I've analyzed the options market for ${symbol}:\n\n` +
          `**Current Price**: ₹${analysis.currentPrice}\n\n` +
          `**Implied Volatility**: ${(analysis.volatility.implied * 100).toFixed(2)}% ` +
          `(${analysis.volatility.implied > analysis.volatility.historical ? 'higher' : 'lower'} than historical)\n\n` +
          `**Market Sentiment**: ${analysis.sentiment.interpretation}\n\n` +
          `**Recommended Strategies**: ${analysis.strategies.slice(0, 2).map(s => s.name).join(', ')}`
      }
    ],
    references: [
      {
        type: 'text',
        title: `Options Analysis for ${symbol}`,
        content: formatOptionsAnalysis(analysis),
        metadata: analysis
      }
    ]
  };
}

// Helper function to perform options analysis
async function performOptionsAnalysis(symbol: string): Promise<OptionsAnalysisResult> {
  // In a real implementation, you would fetch real options data and perform calculations
  // For now, we'll return mock data based on the symbol
  
  // Mock data for different symbols
  const mockData: Record<string, OptionsAnalysisResult> = {
    'RELIANCE': {
      symbol: 'RELIANCE',
      currentPrice: 2650,
      volatility: {
        historical: 0.22,
        implied: 0.25,
        skew: 'normal',
        term: 'contango'
      },
      sentiment: {
        putCallRatio: 0.85,
        interpretation: "Slightly bullish sentiment with moderate call buying activity"
      },
      strategies: [
        {
          name: "Bull Call Spread",
          description: "Buy a call option and sell a higher strike call option with the same expiration",
          contracts: [
            {
              action: 'buy',
              type: 'call',
              strike: 2700,
              expiration: '2023-12-15'
            },
            {
              action: 'sell',
              type: 'call',
              strike: 2800,
              expiration: '2023-12-15'
            }
          ],
          maxProfit: 5000,
          maxLoss: 3000,
          breakeven: [2730],
          riskRewardRatio: 0.6
        },
        {
          name: "Cash-Secured Put",
          description: "Sell a put option with cash set aside to buy shares if assigned",
          contracts: [
            {
              action: 'sell',
              type: 'put',
              strike: 2600,
              expiration: '2023-12-15'
            }
          ],
          maxProfit: 4500,
          maxLoss: 255500,
          breakeven: [2555],
          riskRewardRatio: 56.78
        },
        {
          name: "Iron Condor",
          description: "Sell a put spread and a call spread to profit from low volatility",
          contracts: [
            {
              action: 'buy',
              type: 'put',
              strike: 2500,
              expiration: '2023-12-15'
            },
            {
              action: 'sell',
              type: 'put',
              strike: 2550,
              expiration: '2023-12-15'
            },
            {
              action: 'sell',
              type: 'call',
              strike: 2750,
              expiration: '2023-12-15'
            },
            {
              action: 'buy',
              type: 'call',
              strike: 2800,
              expiration: '2023-12-15'
            }
          ],
          maxProfit: 2500,
          maxLoss: 2500,
          breakeven: [2525, 2775],
          riskRewardRatio: 1.0
        }
      ],
      unusualActivity: [
        {
          contract: {
            symbol: 'RELIANCE23DEC2700CE',
            underlyingSymbol: 'RELIANCE',
            type: 'call',
            strike: 2700,
            expiration: '2023-12-15',
            bid: 45.5,
            ask: 46.5,
            lastPrice: 46.0,
            volume: 3500,
            openInterest: 1200,
            impliedVolatility: 0.28,
            delta: 0.45,
            gamma: 0.002,
            theta: -0.35,
            vega: 0.15,
            rho: 0.05
          },
          volume: 3500,
          openInterestRatio: 2.92,
          description: "Unusual call buying activity at 2700 strike, suggesting bullish sentiment"
        }
      ]
    },
    'INFY': {
      symbol: 'INFY',
      currentPrice: 1600,
      volatility: {
        historical: 0.25,
        implied: 0.28,
        skew: 'normal',
        term: 'flat'
      },
      sentiment: {
        putCallRatio: 0.95,
        interpretation: "Neutral sentiment with balanced put and call activity"
      },
      strategies: [
        {
          name: "Covered Call",
          description: "Own the stock and sell a call option against it",
          contracts: [
            {
              action: 'sell',
              type: 'call',
              strike: 1650,
              expiration: '2023-12-15'
            }
          ],
          maxProfit: 7500,
          maxLoss: 152500,
          breakeven: [1525],
          riskRewardRatio: 20.33
        },
        {
          name: "Protective Put",
          description: "Own the stock and buy a put option to protect downside",
          contracts: [
            {
              action: 'buy',
              type: 'put',
              strike: 1550,
              expiration: '2023-12-15'
            }
          ],
          maxProfit: 'unlimited',
          maxLoss: 8000,
          breakeven: [1630],
          riskRewardRatio: 0
        }
      ],
      unusualActivity: []
    }
  };
  
  // Return data for the requested symbol, or a default if not found
  return mockData[symbol] || {
    symbol: symbol,
    currentPrice: 1000,
    volatility: {
      historical: 0.20,
      implied: 0.20,
      skew: 'flat',
      term: 'flat'
    },
    sentiment: {
      putCallRatio: 1.0,
      interpretation: "Neutral market sentiment"
    },
    strategies: [
      {
        name: "Covered Call",
        description: "Own the stock and sell a call option against it",
        contracts: [
          {
            action: 'sell',
            type: 'call',
            strike: 1050,
            expiration: '2023-12-15'
          }
        ],
        maxProfit: 5000,
        maxLoss: 95000,
        breakeven: [950],
        riskRewardRatio: 19.0
      }
    ],
    unusualActivity: []
  };
}

// Helper function to format options analysis as a detailed report
function formatOptionsAnalysis(analysis: OptionsAnalysisResult): string {
  let report = `# Options Analysis Report: ${analysis.symbol}\n\n`;
  
  // Basic information
  report += '## Market Overview\n\n';
  report += `**Current Price**: ₹${analysis.currentPrice}\n\n`;
  
  // Volatility section
  report += '## Volatility Analysis\n\n';
  report += `- **Historical Volatility**: ${(analysis.volatility.historical * 100).toFixed(2)}%\n`;
  report += `- **Implied Volatility**: ${(analysis.volatility.implied * 100).toFixed(2)}%\n`;
  report += `- **Volatility Skew**: ${capitalizeFirstLetter(analysis.volatility.skew)}\n`;
  report += `- **Term Structure**: ${capitalizeFirstLetter(analysis.volatility.term)}\n\n`;
  
  const volComparison = analysis.volatility.implied > analysis.volatility.historical ? 
    "Implied volatility is higher than historical volatility, suggesting the market expects more price movement than recent history would indicate." :
    "Implied volatility is lower than or equal to historical volatility, suggesting the market expects similar or less price movement compared to recent history.";
  
  report += `${volComparison}\n\n`;
  
  // Market sentiment section
  report += '## Market Sentiment\n\n';
  report += `**Put/Call Ratio**: ${analysis.sentiment.putCallRatio.toFixed(2)}\n\n`;
  report += `${analysis.sentiment.interpretation}\n\n`;
  
  // Options strategies section
  report += '## Recommended Options Strategies\n\n';
  
  analysis.strategies.forEach((strategy, index) => {
    report += `### ${index + 1}. ${strategy.name}\n\n`;
    report += `${strategy.description}\n\n`;
    
    report += '**Contracts:**\n\n';
    strategy.contracts.forEach(contract => {
      report += `- ${capitalizeFirstLetter(contract.action)} ${contract.type.toUpperCase()} @ ₹${contract.strike} (Exp: ${formatDate(contract.expiration)})\n`;
    });
    
    report += '\n**Risk/Reward Profile:**\n\n';
    report += `- **Max Profit**: ${typeof strategy.maxProfit === 'number' ? `₹${strategy.maxProfit}` : 'Unlimited'}\n`;
    report += `- **Max Loss**: ${typeof strategy.maxLoss === 'number' ? `₹${strategy.maxLoss}` : 'Unlimited'}\n`;
    report += `- **Breakeven Point${strategy.breakeven.length > 1 ? 's' : ''}**: ${strategy.breakeven.map(point => `₹${point}`).join(', ')}\n`;
    report += `- **Risk/Reward Ratio**: ${strategy.riskRewardRatio === 0 ? 'N/A (unlimited profit potential)' : strategy.riskRewardRatio.toFixed(2)}\n\n`;
  });
  
  // Unusual activity section
  if (analysis.unusualActivity.length > 0) {
    report += '## Unusual Options Activity\n\n';
    
    analysis.unusualActivity.forEach(activity => {
      const contract = activity.contract;
      report += `### ${contract.type.toUpperCase()} @ ₹${contract.strike} (Exp: ${formatDate(contract.expiration)})\n\n`;
      report += `- **Volume**: ${activity.volume.toLocaleString()}\n`;
      report += `- **Open Interest**: ${contract.openInterest.toLocaleString()}\n`;
      report += `- **Volume/OI Ratio**: ${activity.openInterestRatio.toFixed(2)}\n`;
      report += `- **Implied Volatility**: ${(contract.impliedVolatility * 100).toFixed(2)}%\n\n`;
      report += `**Analysis**: ${activity.description}\n\n`;
    });
  }
  
  return report;
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}