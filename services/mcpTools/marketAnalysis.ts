// services/mcpTools/marketAnalysis.ts:
import { McpMessage, McpReference } from '../../types/mcp';

export interface MarketAnalysisResult {
  overview: {
    marketTrend: 'bullish' | 'bearish' | 'neutral';
    keyIndices: Record<string, { value: number; change: number; percentChange: number }>;
    summary: string;
  };
  sectors: {
    topPerforming: Array<{ name: string; change: number }>;
    worstPerforming: Array<{ name: string; change: number }>;
    analysis: string;
  };
  technicalIndicators: {
    macd: 'bullish' | 'bearish' | 'neutral';
    rsi: number;
    movingAverages: Record<string, { value: number; signal: 'buy' | 'sell' | 'hold' }>;
    analysis: string;
  };
  newsImpact: {
    recentNews: Array<{ headline: string; impact: 'positive' | 'negative' | 'neutral'; source: string }>;
    analysis: string;
  };
}

export async function analyzeMarket(query: string): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  // Perform market analysis
  const analysis = await performMarketAnalysis();
  
  // Format the results
  return {
    messages: [
      {
        role: 'assistant',
        content: `Here's the current market analysis:\n\n` +
          `**Market Overview**: The market is currently showing ${analysis.overview.marketTrend} trends. ${analysis.overview.summary}\n\n` +
          `**Sector Performance**: ${analysis.sectors.analysis}\n\n` +
          `**Technical Outlook**: ${analysis.technicalIndicators.analysis}`
      }
    ],
    references: [
      {
        type: 'text',
        title: 'Market Analysis',
        content: formatMarketAnalysisTable(analysis),
        metadata: analysis
      }
    ]
  };
}

// Helper function to perform market analysis
async function performMarketAnalysis(): Promise<MarketAnalysisResult> {
  // In a real implementation, you would fetch real market data
  // For now, we'll return mock data
  
  return {
    overview: {
      marketTrend: 'bullish',
      keyIndices: {
        'NIFTY 50': { value: 22450.25, change: 125.75, percentChange: 0.56 },
        'SENSEX': { value: 73850.45, change: 412.30, percentChange: 0.56 },
        'NIFTY BANK': { value: 48250.80, change: 320.45, percentChange: 0.67 }
      },
      summary: 'Markets are showing strength with broad-based buying across sectors. Global cues remain positive with US markets hitting new highs.'
    },
    sectors: {
      topPerforming: [
        { name: 'IT', change: 1.8 },
        { name: 'Banking', change: 1.2 },
        { name: 'Auto', change: 0.9 }
      ],
      worstPerforming: [
        { name: 'Pharma', change: -0.5 },
        { name: 'FMCG', change: -0.3 },
        { name: 'Metal', change: -0.1 }
      ],
      analysis: 'IT sector is leading the gains on the back of strong Q1 results and positive management commentary. Banking stocks are also performing well due to improving credit growth and asset quality.'
    },
    technicalIndicators: {
      macd: 'bullish',
      rsi: 62.5,
      movingAverages: {
        '50-day': { value: 21800, signal: 'buy' },
        '100-day': { value: 21200, signal: 'buy' },
        '200-day': { value: 20500, signal: 'buy' }
      },
      analysis: 'Technical indicators are showing bullish momentum with RSI at 62.5, indicating room for further upside. All major moving averages are suggesting a buy signal.'
    },
    newsImpact: {
      recentNews: [
        { headline: 'RBI Maintains Repo Rate at 6.5%', impact: 'neutral', source: 'Economic Times' },
        { headline: 'IT Companies Report Strong Q1 Earnings', impact: 'positive', source: 'Business Standard' },
        { headline: 'Global Markets Hit New Highs', impact: 'positive', source: 'Financial Express' }
      ],
      analysis: 'Recent news flow has been positive for the markets, especially for the IT sector. The RBI policy was on expected lines, maintaining a neutral stance.'
    }
  };
}

// Helper function to format market analysis as a table
function formatMarketAnalysisTable(analysis: MarketAnalysisResult): string {
  let table = '## Market Overview\n\n';
  table += '| Index | Value | Change | % Change |\n';
  table += '|-------|-------|--------|----------|\n';
  
  Object.entries(analysis.overview.keyIndices).forEach(([index, data]) => {
    const changeSymbol = data.change >= 0 ? '▲' : '▼';
    table += `| ${index} | ${data.value.toLocaleString()} | ${changeSymbol} ${Math.abs(data.change).toFixed(2)} | ${changeSymbol} ${Math.abs(data.percentChange).toFixed(2)}% |\n`;
  });
  
  table += '\n## Sector Performance\n\n';
  table += '### Top Performing Sectors\n\n';
  table += '| Sector | Change |\n';
  table += '|--------|--------|\n';
  
  analysis.sectors.topPerforming.forEach(sector => {
    table += `| ${sector.name} | ▲ ${sector.change.toFixed(2)}% |\n`;
  });
  
  table += '\n### Worst Performing Sectors\n\n';
  table += '| Sector | Change |\n';
  table += '|--------|--------|\n';
  
  analysis.sectors.worstPerforming.forEach(sector => {
    table += `| ${sector.name} | ▼ ${Math.abs(sector.change).toFixed(2)}% |\n`;
  });
  
  table += '\n## Technical Indicators\n\n';
  table += '| Indicator | Value | Signal |\n';
  table += '|-----------|-------|--------|\n';
  table += `| RSI | ${analysis.technicalIndicators.rsi.toFixed(2)} | ${getRsiSignal(analysis.technicalIndicators.rsi)} |\n`;
  table += `| MACD | - | ${analysis.technicalIndicators.macd.toUpperCase()} |\n`;
  
  Object.entries(analysis.technicalIndicators.movingAverages).forEach(([period, data]) => {
    table += `| ${period} MA | ${data.value.toLocaleString()} | ${data.signal.toUpperCase()} |\n`;
  });
  
  table += '\n## Recent News Impact\n\n';
  table += '| Headline | Impact | Source |\n';
  table += '|----------|--------|--------|\n';
  
  analysis.newsImpact.recentNews.forEach(news => {
    const impactSymbol = news.impact === 'positive' ? '🟢' : news.impact === 'negative' ? '🔴' : '⚪';
    table += `| ${news.headline} | ${impactSymbol} ${capitalizeFirstLetter(news.impact)} | ${news.source} |\n`;
  });
  
  return table;
}

// Helper function to get RSI signal
function getRsiSignal(rsi: number): string {
  if (rsi > 70) return 'OVERBOUGHT';
  if (rsi < 30) return 'OVERSOLD';
  return 'NEUTRAL';
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}