import { McpMessage, McpReference } from '../../types/mcp';

export interface RiskAssessmentResult {
  overallRisk: {
    score: number; // 0-100, higher means more risk
    level: 'low' | 'moderate' | 'high' | 'very high';
    summary: string;
  };
  marketRisk: {
    beta: number;
    volatility: number;
    drawdown: {
      max: number;
      current: number;
    };
    assessment: string;
  };
  concentrationRisk: {
    topHoldings: Array<{
      symbol: string;
      percentage: number;
    }>;
    sectorConcentration: Record<string, number>;
    assessment: string;
  };
  liquidityRisk: {
    score: number; // 0-100
    illiquidHoldings: Array<{
      symbol: string;
      liquidity: 'low' | 'medium' | 'high';
    }>;
    assessment: string;
  };
  stressTest: {
    scenarios: Array<{
      name: string;
      impact: number; // percentage impact on portfolio
    }>;
    assessment: string;
  };
  recommendations: string[];
}

export async function assessRisk(holdings: any[]): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  // Perform risk assessment
  const assessment = await performRiskAssessment(holdings);
  
  // Format the results
  return {
    messages: [
      {
        role: 'assistant',
        content: `I've assessed the risk profile of your portfolio:\n\n` +
          `**Overall Risk**: ${assessment.overallRisk.level.toUpperCase()} (${assessment.overallRisk.score}/100)\n\n` +
          `**Key Concerns**: ${assessment.overallRisk.summary}\n\n` +
          `**Stress Test**: In a market correction scenario, your portfolio could decline by approximately ${Math.abs(assessment.stressTest.scenarios[0].impact).toFixed(1)}%`
      }
    ],
    references: [
      {
        type: 'text',
        title: 'Portfolio Risk Assessment',
        content: formatRiskAssessment(assessment),
        metadata: assessment
      }
    ]
  };
}

// Helper function to perform risk assessment
async function performRiskAssessment(holdings: any[]): Promise<RiskAssessmentResult> {
  // Calculate total portfolio value
  const totalValue = holdings.reduce((sum, holding) => sum + (holding.currentPrice * holding.shares), 0);
  
  // Calculate sector concentration
  const sectorConcentration = holdings.reduce((acc, holding) => {
    const sector = holding.industry;
    const holdingValue = holding.currentPrice * holding.shares;
    acc[sector] = (acc[sector] || 0) + (holdingValue / totalValue * 100);
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate top holdings
  const holdingsWithPercentage = holdings.map(holding => ({
    symbol: holding.symbol,
    percentage: (holding.currentPrice * holding.shares) / totalValue * 100
  })).sort((a, b) => b.percentage - a.percentage);
  
  const topHoldings = holdingsWithPercentage.slice(0, 5);
  
  // Calculate portfolio beta (weighted average of individual stock betas)
  // In a real implementation, you would use actual beta values for each stock
  const portfolioBeta = 1.2; // Mock value
  
  // Determine overall risk score based on various factors
  const concentrationScore = calculateConcentrationScore(sectorConcentration, topHoldings);
  const marketRiskScore = calculateMarketRiskScore(portfolioBeta);
  const liquidityScore = 25; // Mock value
  
  const overallRiskScore = (concentrationScore * 0.4) + (marketRiskScore * 0.4) + (liquidityScore * 0.2);
  
  return {
    overallRisk: {
      score: Math.round(overallRiskScore),
      level: getRiskLevel(overallRiskScore),
      summary: generateRiskSummary(sectorConcentration, topHoldings, portfolioBeta)
    },
    marketRisk: {
      beta: portfolioBeta,
      volatility: 15.2, // Mock value
      drawdown: {
        max: -25.5, // Mock value
        current: -5.2 // Mock value
      },
      assessment: `Your portfolio has a beta of ${portfolioBeta.toFixed(2)}, indicating ${portfolioBeta > 1 ? 'higher' : 'lower'} volatility than the market. In a market downturn, your portfolio could experience significant fluctuations.`
    },
    concentrationRisk: {
      topHoldings,
      sectorConcentration,
      assessment: generateConcentrationAssessment(sectorConcentration, topHoldings)
    },
    liquidityRisk: {
      score: liquidityScore,
      illiquidHoldings: [
        // Mock data - in a real implementation, you would analyze actual liquidity
        { symbol: 'SUNPHARMA', liquidity: 'medium' }
      ],
      assessment: "Most of your holdings have good liquidity, which means you can exit positions without significant price impact."
    },
    stressTest: {
      scenarios: [
        { name: "Market Correction (-10%)", impact: -12.5 },
        { name: "Severe Bear Market (-30%)", impact: -35.8 },
        { name: "Sector Rotation (Tech -20%)", impact: -8.5 },
        { name: "Interest Rate Hike (+1%)", impact: -5.2 }
      ],
      assessment: "Your portfolio would be most vulnerable to a severe bear market scenario, with an estimated drawdown exceeding the market average."
    },
    recommendations: generateRiskRecommendations(sectorConcentration, topHoldings, portfolioBeta)
  };
}

// Helper function to calculate concentration score
function calculateConcentrationScore(sectorConcentration: Record<string, number>, topHoldings: Array<{ symbol: string; percentage: number }>): number {
  // Higher score means higher risk
  let score = 0;
  
  // Check sector concentration
  const maxSectorConcentration = Math.max(...Object.values(sectorConcentration));
  if (maxSectorConcentration > 50) score += 40;
  else if (maxSectorConcentration > 40) score += 30;
  else if (maxSectorConcentration > 30) score += 20;
  else if (maxSectorConcentration > 20) score += 10;
  
  // Check individual stock concentration
  if (topHoldings.length > 0) {
    const topHoldingPercentage = topHoldings[0].percentage;
    if (topHoldingPercentage > 20) score += 40;
    else if (topHoldingPercentage > 15) score += 30;
    else if (topHoldingPercentage > 10) score += 20;
    else if (topHoldingPercentage > 5) score += 10;
  }
  
  // Check number of sectors
  const sectorCount = Object.keys(sectorConcentration).length;
  if (sectorCount <= 2) score += 20;
  else if (sectorCount <= 4) score += 10;
  
  return Math.min(score, 100);
}

// Helper function to calculate market risk score
function calculateMarketRiskScore(beta: number): number {
  // Higher score means higher risk
  if (beta > 1.5) return 80;
  if (beta > 1.2) return 60;
  if (beta > 1.0) return 40;
  if (beta > 0.8) return 30;
  return 20;
}

// Helper function to determine risk level
function getRiskLevel(score: number): 'low' | 'moderate' | 'high' | 'very high' {
  if (score >= 75) return 'very high';
  if (score >= 50) return 'high';
  if (score >= 25) return 'moderate';
  return 'low';
}

// Helper function to generate risk summary
function generateRiskSummary(sectorConcentration: Record<string, number>, topHoldings: Array<{ symbol: string; percentage: number }>, beta: number): string {
  const concerns: string[] = [];
  
  // Check sector concentration
  const maxSector = Object.entries(sectorConcentration).reduce((max, [sector, percentage]) => 
    percentage > max.percentage ? { sector, percentage } : max, 
    { sector: '', percentage: 0 }
  );
  
  if (maxSector.percentage > 40) {
    concerns.push(`high concentration in ${maxSector.sector} sector (${maxSector.percentage.toFixed(1)}%)`);
  }
  
  // Check individual stock concentration
  if (topHoldings.length > 0 && topHoldings[0].percentage > 10) {
    concerns.push(`significant exposure to ${topHoldings[0].symbol} (${topHoldings[0].percentage.toFixed(1)}%)`);
  }
  
  // Check beta
  if (beta > 1.2) {
    concerns.push(`above-average market sensitivity (beta: ${beta.toFixed(2)})`);
  }
  
  if (concerns.length === 0) {
    return "Your portfolio has a well-balanced risk profile with no major concerns.";
  }
  
  return `Your portfolio shows ${concerns.join(', ')}.`;
}

// Helper function to generate concentration assessment
function generateConcentrationAssessment(sectorConcentration: Record<string, number>, topHoldings: Array<{ symbol: string; percentage: number }>): string {
  const sectorCount = Object.keys(sectorConcentration).length;
  const maxSector = Object.entries(sectorConcentration).reduce((max, [sector, percentage]) => 
    percentage > max.percentage ? { sector, percentage } : max, 
    { sector: '', percentage: 0 }
  );
  
  let assessment = "";
  
  if (sectorCount <= 2) {
    assessment += `Your portfolio is concentrated in only ${sectorCount} sectors, with ${maxSector.sector} representing ${maxSector.percentage.toFixed(1)}% of your portfolio. `;
  } else if (maxSector.percentage > 40) {
    assessment += `While you have investments across ${sectorCount} sectors, ${maxSector.sector} dominates with ${maxSector.percentage.toFixed(1)}% of your portfolio. `;
  } else {
    assessment += `Your portfolio is spread across ${sectorCount} sectors, with the largest exposure to ${maxSector.sector} at ${maxSector.percentage.toFixed(1)}%. `;
  }
  
  if (topHoldings.length > 0 && topHoldings[0].percentage > 15) {
    assessment += `Your largest holding, ${topHoldings[0].symbol}, represents ${topHoldings[0].percentage.toFixed(1)}% of your portfolio, which increases single-stock risk.`;
  } else if (topHoldings.length >= 3) {
    const top3Percentage = topHoldings.slice(0, 3).reduce((sum, holding) => sum + holding.percentage, 0);
    if (top3Percentage > 40) {
      assessment += `Your top 3 holdings account for ${top3Percentage.toFixed(1)}% of your portfolio, indicating moderate concentration risk.`;
    } else {
      assessment += `Your top holdings are reasonably sized, reducing single-stock risk.`;
    }
  }
  
  return assessment;
}

// Helper function to generate risk recommendations
function generateRiskRecommendations(sectorConcentration: Record<string, number>, topHoldings: Array<{ symbol: string; percentage: number }>, beta: number): string[] {
  const recommendations: string[] = [];
  
  // Sector diversification recommendations
  const maxSector = Object.entries(sectorConcentration).reduce((max, [sector, percentage]) => 
    percentage > max.percentage ? { sector, percentage } : max, 
    { sector: '', percentage: 0 }
  );
  
  if (maxSector.percentage > 40) {
    recommendations.push(`Consider reducing exposure to the ${maxSector.sector} sector to improve diversification.`);
  }
  
  const sectorCount = Object.keys(sectorConcentration).length;
  if (sectorCount <= 3) {
    recommendations.push(`Expand into more sectors to reduce concentration risk. Consider adding exposure to defensive sectors like Consumer Staples or Utilities.`);
  }
  
  // Individual stock recommendations
  if (topHoldings.length > 0 && topHoldings[0].percentage > 15) {
    recommendations.push(`Reduce position size in ${topHoldings[0].symbol} to limit single-stock risk.`);
  }
  
  // Beta recommendations
  if (beta > 1.3) {
    recommendations.push(`Your portfolio has high market sensitivity. Consider adding some defensive or low-beta stocks to reduce volatility.`);
  } else if (beta < 0.7) {
    recommendations.push(`Your portfolio has low market sensitivity. In a bull market, it may underperform. Consider adding some growth-oriented positions if appropriate for your goals.`);
  }
  
  // Default recommendation if none of the above apply
  if (recommendations.length === 0) {
    recommendations.push(`Maintain your current diversification strategy, which shows good balance.`);
  }
  
  return recommendations;
}

// Helper function to format risk assessment as a report
function formatRiskAssessment(assessment: RiskAssessmentResult): string {
  let report = '# Portfolio Risk Assessment\n\n';
  
  // Overall risk section
  report += '## Overall Risk Profile\n\n';
  report += `**Risk Level**: ${assessment.overallRisk.level.toUpperCase()} (${assessment.overallRisk.score}/100)\n\n`;
  report += `**Summary**: ${assessment.overallRisk.summary}\n\n`;
  
  // Market risk section
  report += '## Market Risk\n\n';
  report += `- **Beta**: ${assessment.marketRisk.beta.toFixed(2)}\n`;
  report += `- **Volatility**: ${assessment.marketRisk.volatility.toFixed(2)}%\n`;
  report += `- **Maximum Drawdown**: ${assessment.marketRisk.drawdown.max.toFixed(2)}%\n\n`;
  report += `${assessment.marketRisk.assessment}\n\n`;
  
  // Concentration risk section
  report += '## Concentration Risk\n\n';
  
  report += '### Top Holdings\n\n';
  report += '| Symbol | Percentage |\n';
  report += '|--------|------------|\n';
  assessment.concentrationRisk.topHoldings.forEach(holding => {
    report += `| ${holding.symbol} | ${holding.percentage.toFixed(2)}% |\n`;
  });
  
  report += '\n### Sector Allocation\n\n';
  report += '| Sector | Allocation |\n';
  report += '|--------|------------|\n';
  Object.entries(assessment.concentrationRisk.sectorConcentration)
    .sort((a, b) => b[1] - a[1])
    .forEach(([sector, percentage]) => {
      report += `| ${sector} | ${percentage.toFixed(2)}% |\n`;
    });
  
  report += `\n${assessment.concentrationRisk.assessment}\n\n`;
  
  // Liquidity risk section
  report += '## Liquidity Risk\n\n';
  report += `**Liquidity Score**: ${assessment.liquidityRisk.score}/100\n\n`;
  
  if (assessment.liquidityRisk.illiquidHoldings.length > 0) {
    report += '### Holdings with Liquidity Concerns\n\n';
    report += '| Symbol | Liquidity Level |\n';
    report += '|--------|----------------|\n';
    assessment.liquidityRisk.illiquidHoldings.forEach(holding => {
      report += `| ${holding.symbol} | ${capitalizeFirstLetter(holding.liquidity)} |\n`;
    });
  }
  
  report += `\n${assessment.liquidityRisk.assessment}\n\n`;
  
  // Stress test section
  report += '## Stress Test Scenarios\n\n';
  report += '| Scenario | Potential Impact |\n';
  report += '|----------|------------------|\n';
  assessment.stressTest.scenarios.forEach(scenario => {
    const impactSymbol = scenario.impact < 0 ? '▼' : '▲';
    report += `| ${scenario.name} | ${impactSymbol} ${Math.abs(scenario.impact).toFixed(2)}% |\n`;
  });
  
  report += `\n${assessment.stressTest.assessment}\n\n`;
  
  // Recommendations section
  report += '## Recommendations\n\n';
  assessment.recommendations.forEach(recommendation => {
    report += `- ${recommendation}\n`;
  });
  
  return report;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}