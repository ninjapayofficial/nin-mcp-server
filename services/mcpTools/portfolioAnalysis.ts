import { McpMessage, McpReference } from '../../types/mcp';

export interface PortfolioAnalysisResult {
  diversification: {
    byIndustry: Record<string, number>;
    recommendation: string;
  };
  risk: {
    volatility: number;
    beta: number;
    sharpeRatio: number;
    recommendation: string;
  };
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
    recommendation: string;
  };
}

export async function analyzePortfolio(holdings: any[]): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  // Perform portfolio analysis
  const analysis = await performAnalysis(holdings);
  
  // Format the results
  return {
    messages: [
      {
        role: 'assistant',
        content:
          `I've analyzed your portfolio and here are the key insights:\n\n` +
          `**Diversification**: Your portfolio is ${getDiversificationDescription(analysis.diversification.byIndustry)}\n\n` +
          `**Risk Profile**: Your portfolio has a beta of ${analysis.risk.beta.toFixed(2)} and a Sharpe ratio of ${analysis.risk.sharpeRatio.toFixed(2)}\n\n` +
          `**Performance**: Your portfolio has returned ${(analysis.performance.monthly * 100).toFixed(2)}% over the past month`
      }
    ],
    references: [
      {
        type: 'text',
        title: 'Portfolio Analysis',
        content: formatAnalysisTable(analysis),
        metadata: analysis
      }
    ]
  };
}

// Helper function to perform the analysis
async function performAnalysis(holdings: any[]): Promise<PortfolioAnalysisResult> {
  // In a real implementation, you would perform actual analysis.
  // For now, we'll return mock data.
  
  // Calculate industry diversification
  const industries = holdings.reduce((acc, holding) => {
    const industry = holding.industry;
    const price = Number(holding.currentPrice);
    const shares = Number(holding.shares);
    acc[industry] = (acc[industry] || 0) + (price * shares);
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate total portfolio value by explicitly asserting the values are numbers
  const totalValue = (Object.values(industries) as number[]).reduce(
    (sum, value) => sum + value,
    0
  );
  
  // Convert each industry's value to a percentage of total portfolio value
  Object.keys(industries).forEach(industry => {
    industries[industry] = (industries[industry] / totalValue) * 100;
  });
  
  return {
    diversification: {
      byIndustry: industries,
      recommendation: getDiversificationRecommendation(industries)
    },
    risk: {
      volatility: 15.2, // Mock value
      beta: 1.2,        // Mock value
      sharpeRatio: 0.8, // Mock value
      recommendation: "Consider adding some defensive stocks to reduce portfolio volatility."
    },
    performance: {
      daily: 0.5 / 100,   // Mock value
      weekly: 1.2 / 100,  // Mock value
      monthly: 3.5 / 100, // Mock value
      yearly: 12.8 / 100, // Mock value
      recommendation: "Your portfolio is performing well, but consider rebalancing to capture growth in the technology sector."
    }
  };
}

// Helper function to get diversification description
function getDiversificationDescription(industries: Record<string, number>): string {
  const industryCount = Object.keys(industries).length;
  
  if (industryCount <= 2) {
    return "highly concentrated in a few industries";
  } else if (industryCount <= 4) {
    return "moderately diversified across a few industries";
  } else {
    return "well diversified across multiple industries";
  }
}

// Helper function to get diversification recommendation
function getDiversificationRecommendation(industries: Record<string, number>): string {
  const industryCount = Object.keys(industries).length;
  const maxIndustryPercentage = Math.max(...Object.values(industries));
  const maxIndustry = Object.keys(industries).find(key => industries[key] === maxIndustryPercentage);
  
  if (industryCount <= 2) {
    return `Your portfolio is highly concentrated. Consider diversifying beyond ${maxIndustry} to reduce sector-specific risk.`;
  } else if (maxIndustryPercentage > 40) {
    return `You have ${maxIndustryPercentage.toFixed(1)}% of your portfolio in ${maxIndustry}. Consider reducing this exposure to minimize sector risk.`;
  } else {
    return "Your portfolio has good diversification across industries.";
  }
}

// Helper function to format analysis as a table
function formatAnalysisTable(analysis: PortfolioAnalysisResult): string {
  let table = '## Industry Diversification\n\n';
  table += '| Industry | Allocation |\n';
  table += '|----------|------------|\n';
  
  Object.entries(analysis.diversification.byIndustry).forEach(([industry, percentage]) => {
    table += `| ${industry} | ${percentage.toFixed(2)}% |\n`;
  });
  
  table += '\n## Risk Metrics\n\n';
  table += '| Metric | Value |\n';
  table += '|--------|-------|\n';
  table += `| Volatility | ${analysis.risk.volatility.toFixed(2)}% |\n`;
  table += `| Beta | ${analysis.risk.beta.toFixed(2)} |\n`;
  table += `| Sharpe Ratio | ${analysis.risk.sharpeRatio.toFixed(2)} |\n`;
  
  table += '\n## Performance\n\n';
  table += '| Timeframe | Return |\n';
  table += '|-----------|--------|\n';
  table += `| Daily | ${(analysis.performance.daily * 100).toFixed(2)}% |\n`;
  table += `| Weekly | ${(analysis.performance.weekly * 100).toFixed(2)}% |\n`;
  table += `| Monthly | ${(analysis.performance.monthly * 100).toFixed(2)}% |\n`;
  table += `| Yearly | ${(analysis.performance.yearly * 100).toFixed(2)}% |\n`;
  
  table += '\n## Recommendations\n\n';
  table += `- **Diversification**: ${analysis.diversification.recommendation}\n`;
  table += `- **Risk Management**: ${analysis.risk.recommendation}\n`;
  table += `- **Performance Improvement**: ${analysis.performance.recommendation}\n`;
  
  return table;
}
