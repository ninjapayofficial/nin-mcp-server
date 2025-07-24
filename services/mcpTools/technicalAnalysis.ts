import { McpMessage, McpReference } from '../../types/mcp';

export interface TechnicalAnalysisResult {
  symbol: string;
  price: {
    current: number;
    change: number;
    percentChange: number;
  };
  trends: {
    primary: 'bullish' | 'bearish' | 'neutral';
    secondary: 'bullish' | 'bearish' | 'neutral';
    support: number[];
    resistance: number[];
  };
  indicators: {
    rsi: {
      value: number;
      signal: 'overbought' | 'oversold' | 'neutral';
    };
    macd: {
      value: number;
      signal: number;
      histogram: number;
      trend: 'bullish' | 'bearish' | 'neutral';
    };
    bollingerBands: {
      upper: number;
      middle: number;
      lower: number;
      width: number;
      signal: 'squeeze' | 'expansion' | 'neutral';
    };
    movingAverages: {
      ma20: number;
      ma50: number;
      ma100: number;
      ma200: number;
      signal: 'bullish' | 'bearish' | 'neutral';
    };
  };
  patterns: {
    candlestick: string[];
    chart: string[];
  };
  volume: {
    current: number;
    average: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  recommendation: {
    action: 'strong buy' | 'buy' | 'hold' | 'sell' | 'strong sell';
    timeframe: 'short' | 'medium' | 'long';
    reasoning: string;
  };
}

export async function analyzeTechnicals(symbol: string): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  // Perform technical analysis
  const analysis = await performTechnicalAnalysis(symbol);
  
  // Format the results
  return {
    messages: [
      {
        role: 'assistant',
        content: `Here's the technical analysis for ${symbol}:\n\n` +
          `**Current Price**: ₹${analysis.price.current} (${analysis.price.change >= 0 ? '+' : ''}${analysis.price.change} / ${analysis.price.percentChange >= 0 ? '+' : ''}${analysis.price.percentChange}%)\n\n` +
          `**Trend**: ${capitalizeFirstLetter(analysis.trends.primary)} (primary), ${capitalizeFirstLetter(analysis.trends.secondary)} (secondary)\n\n` +
          `**Key Indicators**: RSI at ${analysis.indicators.rsi.value} (${analysis.indicators.rsi.signal}), MACD is ${analysis.indicators.macd.trend}\n\n` +
          `**Recommendation**: ${capitalizeFirstLetter(analysis.recommendation.action)} for ${analysis.recommendation.timeframe}-term`
      }
    ],
    references: [
      {
        type: 'text',
        title: `Technical Analysis for ${symbol}`,
        content: formatTechnicalAnalysis(analysis),
        metadata: analysis
      }
    ]
  };
}

// Helper function to perform technical analysis
async function performTechnicalAnalysis(symbol: string): Promise<TechnicalAnalysisResult> {
  // In a real implementation, you would fetch real market data and perform calculations
  // For now, we'll return mock data based on the symbol
  
  // Mock data for different symbols
  const mockData: Record<string, TechnicalAnalysisResult> = {
    'RELIANCE': {
      symbol: 'RELIANCE',
      price: {
        current: 2650,
        change: 25.5,
        percentChange: 0.97
      },
      trends: {
        primary: 'bullish',
        secondary: 'bullish',
        support: [2580, 2520, 2450],
        resistance: [2680, 2750, 2820]
      },
      indicators: {
        rsi: {
          value: 62,
          signal: 'neutral'
        },
        macd: {
          value: 15.2,
          signal: 10.5,
          histogram: 4.7,
          trend: 'bullish'
        },
        bollingerBands: {
          upper: 2720,
          middle: 2600,
          lower: 2480,
          width: 9.2,
          signal: 'neutral'
        },
        movingAverages: {
          ma20: 2620,
          ma50: 2550,
          ma100: 2480,
          ma200: 2400,
          signal: 'bullish'
        }
      },
      patterns: {
        candlestick: ['Bullish Engulfing', 'Three White Soldiers'],
        chart: ['Ascending Triangle', 'Cup and Handle']
      },
      volume: {
        current: 5000000,
        average: 4200000,
        trend: 'increasing'
      },
      recommendation: {
        action: 'buy',
        timeframe: 'medium',
        reasoning: 'Strong uptrend with increasing volume and positive technical indicators. Price is above all major moving averages with bullish MACD crossover.'
      }
    },
    'INFY': {
      symbol: 'INFY',
      price: {
        current: 1600,
        change: 22.5,
        percentChange: 1.43
      },
      trends: {
        primary: 'bullish',
        secondary: 'neutral',
        support: [1550, 1520, 1480],
        resistance: [1620, 1650, 1680]
      },
      indicators: {
        rsi: {
          value: 65,
          signal: 'neutral'
        },
        macd: {
          value: 12.5,
          signal: 8.2,
          histogram: 4.3,
          trend: 'bullish'
        },
        bollingerBands: {
          upper: 1640,
          middle: 1580,
          lower: 1520,
          width: 7.6,
          signal: 'neutral'
        },
        movingAverages: {
          ma20: 1580,
          ma50: 1550,
          ma100: 1520,
          ma200: 1450,
          signal: 'bullish'
        }
      },
      patterns: {
        candlestick: ['Morning Star', 'Hammer'],
        chart: ['Double Bottom', 'Breakout']
      },
      volume: {
        current: 3000000,
        average: 2800000,
        trend: 'increasing'
      },
      recommendation: {
        action: 'buy',
        timeframe: 'medium',
        reasoning: 'Stock is in an uptrend with positive momentum. All moving averages are aligned bullishly and volume is increasing on up days.'
      }
    },
    'HDFCBANK': {
      symbol: 'HDFCBANK',
      price: {
        current: 1550,
        change: -8.5,
        percentChange: -0.55
      },
      trends: {
        primary: 'neutral',
        secondary: 'bearish',
        support: [1520, 1500, 1480],
        resistance: [1580, 1600, 1620]
      },
      indicators: {
        rsi: {
          value: 45,
          signal: 'neutral'
        },
        macd: {
          value: -2.5,
          signal: -1.8,
          histogram: -0.7,
          trend: 'neutral'
        },
        bollingerBands: {
          upper: 1600,
          middle: 1560,
          lower: 1520,
          width: 5.1,
          signal: 'squeeze'
        },
        movingAverages: {
          ma20: 1560,
          ma50: 1520,
          ma100: 1500,
          ma200: 1480,
          signal: 'neutral'
        }
      },
      patterns: {
        candlestick: ['Doji', 'Spinning Top'],
        chart: ['Rectangle', 'Consolidation']
      },
      volume: {
        current: 4000000,
        average: 4200000,
        trend: 'stable'
      },
      recommendation: {
        action: 'hold',
        timeframe: 'medium',
        reasoning: 'Stock is consolidating in a range with neutral indicators. Wait for a clear breakout direction before taking new positions.'
      }
    },
    'SUNPHARMA': {
      symbol: 'SUNPHARMA',
      price: {
        current: 1050,
        change: -12.5,
        percentChange: -1.18
      },
      trends: {
        primary: 'bearish',
        secondary: 'bearish',
        support: [1020, 1000, 980],
        resistance: [1080, 1100, 1120]
      },
      indicators: {
        rsi: {
          value: 38,
          signal: 'neutral'
        },
        macd: {
          value: -8.5,
          signal: -5.2,
          histogram: -3.3,
          trend: 'bearish'
        },
        bollingerBands: {
          upper: 1100,
          middle: 1070,
          lower: 1040,
          width: 5.6,
          signal: 'neutral'
        },
        movingAverages: {
          ma20: 1070,
          ma50: 1080,
          ma100: 1060,
          ma200: 1020,
          signal: 'bearish'
        }
      },
      patterns: {
        candlestick: ['Bearish Engulfing', 'Evening Star'],
        chart: ['Head and Shoulders', 'Descending Triangle']
      },
      volume: {
        current: 1500000,
        average: 1300000,
        trend: 'increasing'
      },
      recommendation: {
        action: 'sell',
        timeframe: 'short',
        reasoning: 'Stock is in a downtrend with bearish indicators. Price is below key moving averages with increasing volume on down days.'
      }
    }
  };
  
  // Return data for the requested symbol, or a default if not found
  return mockData[symbol] || {
    symbol: symbol,
    price: {
      current: 1000,
      change: 0,
      percentChange: 0
    },
    trends: {
      primary: 'neutral',
      secondary: 'neutral',
      support: [950, 900],
      resistance: [1050, 1100]
    },
    indicators: {
      rsi: {
        value: 50,
        signal: 'neutral'
      },
      macd: {
        value: 0,
        signal: 0,
        histogram: 0,
        trend: 'neutral'
      },
      bollingerBands: {
        upper: 1050,
        middle: 1000,
        lower: 950,
        width: 10,
        signal: 'neutral'
      },
      movingAverages: {
        ma20: 1000,
        ma50: 1000,
        ma100: 1000,
        ma200: 1000,
        signal: 'neutral'
      }
    },
    patterns: {
      candlestick: [],
      chart: []
    },
    volume: {
      current: 1000000,
      average: 1000000,
      trend: 'stable'
    },
    recommendation: {
      action: 'hold',
      timeframe: 'medium',
      reasoning: 'Insufficient data for a strong recommendation.'
    }
  };
}

// Helper function to format technical analysis as a detailed report
function formatTechnicalAnalysis(analysis: TechnicalAnalysisResult): string {
  let report = `# Technical Analysis Report: ${analysis.symbol}\n\n`;
  
  // Price section
  report += '## Price Information\n\n';
  const priceChangeSymbol = analysis.price.change >= 0 ? '▲' : '▼';
  report += `Current Price: ₹${analysis.price.current} (${priceChangeSymbol} ${Math.abs(analysis.price.change).toFixed(2)} / ${priceChangeSymbol} ${Math.abs(analysis.price.percentChange).toFixed(2)}%)\n\n`;
  
  // Trend section
  report += '## Trend Analysis\n\n';
  report += `- Primary Trend: ${capitalizeFirstLetter(analysis.trends.primary)}\n`;
  report += `- Secondary Trend: ${capitalizeFirstLetter(analysis.trends.secondary)}\n\n`;
  
  report += '### Support & Resistance Levels\n\n';
  report += `- Support Levels: ${analysis.trends.support.map(level => `₹${level}`).join(', ')}\n`;
  report += `- Resistance Levels: ${analysis.trends.resistance.map(level => `₹${level}`).join(', ')}\n\n`;
  
  // Technical Indicators section
  report += '## Technical Indicators\n\n';
  
  report += '### RSI (Relative Strength Index)\n\n';
  report += `Value: ${analysis.indicators.rsi.value} (${analysis.indicators.rsi.signal})\n`;
  report += getRsiDescription(analysis.indicators.rsi.value) + '\n\n';
  
  report += '### MACD (Moving Average Convergence Divergence)\n\n';
  report += `- MACD Line: ${analysis.indicators.macd.value.toFixed(2)}\n`;
  report += `- Signal Line: ${analysis.indicators.macd.signal.toFixed(2)}\n`;
  report += `- Histogram: ${analysis.indicators.macd.histogram.toFixed(2)}\n`;
  report += `- Trend: ${capitalizeFirstLetter(analysis.indicators.macd.trend)}\n\n`;
  
  report += '### Bollinger Bands\n\n';
  report += `- Upper Band: ₹${analysis.indicators.bollingerBands.upper}\n`;
  report += `- Middle Band: ₹${analysis.indicators.bollingerBands.middle}\n`;
  report += `- Lower Band: ₹${analysis.indicators.bollingerBands.lower}\n`;
  report += `- Band Width: ${analysis.indicators.bollingerBands.width.toFixed(2)}%\n`;
  report += `- Signal: ${capitalizeFirstLetter(analysis.indicators.bollingerBands.signal)}\n\n`;
  
  report += '### Moving Averages\n\n';
  report += `- 20-day MA: ₹${analysis.indicators.movingAverages.ma20} (${analysis.price.current > analysis.indicators.movingAverages.ma20 ? 'Price Above' : 'Price Below'})\n`;
  report += `- 50-day MA: ₹${analysis.indicators.movingAverages.ma50} (${analysis.price.current > analysis.indicators.movingAverages.ma50 ? 'Price Above' : 'Price Below'})\n`;
  report += `- 100-day MA: ₹${analysis.indicators.movingAverages.ma100} (${analysis.price.current > analysis.indicators.movingAverages.ma100 ? 'Price Above' : 'Price Below'})\n`;
  report += `- 200-day MA: ₹${analysis.indicators.movingAverages.ma200} (${analysis.price.current > analysis.indicators.movingAverages.ma200 ? 'Price Above' : 'Price Below'})\n`;

  return report;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper function to get RSI description
function getRsiDescription(rsi: number): string {
    if (rsi >= 70) {
        return 'Overbought';
    } else if (rsi <= 30) {
        return 'Oversold';
    } else {
        return 'Neutral';
    }
}