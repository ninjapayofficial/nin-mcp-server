import { McpMessage, McpReference } from '../../types/mcp';

export interface NewsItem {
  title: string;
  source: string;
  date: string; // ISO date string
  summary: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low';
  relatedSymbols?: string[];
}

export interface EconomicEvent {
  title: string;
  date: string; // ISO date string
  country: string;
  actual?: string | number;
  forecast?: string | number;
  previous?: string | number;
  impact: 'high' | 'medium' | 'low';
  description: string;
}

export interface MarketNewsResult {
  topNews: NewsItem[];
  sectorNews: Record<string, NewsItem[]>;
  economicCalendar: EconomicEvent[];
}

export async function getMarketNews(query: string): Promise<{
  messages: McpMessage[];
  references: McpReference[];
}> {
  // Fetch market news and economic calendar
  const newsData = await fetchMarketNews();
  
  // Format the results
  return {
    messages: [
      {
        role: 'assistant',
        content: `Here are today's top market headlines and upcoming economic events:\n\n` +
          `**Top Headlines**:\n` +
          newsData.topNews.slice(0, 3).map(news => 
            `- ${news.title} (${news.source})`
          ).join('\n') + 
          `\n\n**Upcoming Economic Events**:\n` +
          newsData.economicCalendar.slice(0, 3).map(event => 
            `- ${event.date.split('T')[0]} | ${event.country}: ${event.title} (Impact: ${event.impact})`
          ).join('\n')
      }
    ],
    references: [
      {
        type: 'text',
        title: 'Market News & Economic Calendar',
        content: formatMarketNews(newsData),
        metadata: newsData
      }
    ]
  };
}

// Helper function to fetch market news and economic calendar
async function fetchMarketNews(): Promise<MarketNewsResult> {
  // In a real implementation, you would fetch real market news and economic calendar data
  // For now, we'll return mock data
  
  const currentDate = new Date();
  const tomorrow = new Date(currentDate);
  tomorrow.setDate(currentDate.getDate() + 1);
  
  const dayAfterTomorrow = new Date(currentDate);
  dayAfterTomorrow.setDate(currentDate.getDate() + 2);
  
  return {
    topNews: [
      {
        title: "RBI Maintains Repo Rate at 6.5%, Focuses on Inflation Control",
        source: "Economic Times",
        date: currentDate.toISOString(),
        summary: "The Reserve Bank of India (RBI) kept the repo rate unchanged at 6.5% for the fifth consecutive policy meeting, prioritizing inflation management while maintaining an optimistic outlook on economic growth. The central bank projected GDP growth at 7% for the fiscal year.",
        url: "https://economictimes.indiatimes.com/news/economy/policy/URL_ADDRESS",
        sentiment: "positive",
        impact: "medium",
        relatedSymbols: ["RBI"]
      },
      {
        title: "US Treasury Yields Rise, Fed Faces Inflation Expectations",
        source: "Federal Reserve",
        date: tomorrow.toISOString(),
        summary: "The U.S. Treasury Yield Curve has shifted to the right, indicating higher yields for longer-term debt. The Federal Reserve is facing concerns about inflation, with central banks projecting higher GDP growth for the fiscal year.",
        url: "URL_ADDRESS.federalreserve.gov/monetarypolicy/fomccalendars.htm",
        sentiment: "positive",
        impact: "medium",
        relatedSymbols: ["Treasury Yield Curve"]
      },
      {
        title: "China's Economy Hits Record High, Boosts Trade",
        source: "Economic Times",
        date: dayAfterTomorrow.toISOString(),
        summary: "China's economy has reached a record high, with trade volumes surpassing previous records. The country's central bank has announced a series of monetary policy measures to support the economy.",
        url: "URL_ADDRESSictimes.indiatimes.com/news/economy/policy/URL_ADDRESS",
        sentiment: "positive",
        impact: "high",
        relatedSymbols: ["China"]
      }
    ],
    sectorNews: {
      "Technology": [
        {
          title: "Apple Inc. (AAPL) Records Strong Year-End Performance",
          source: "MarketWatch",
          date: currentDate.toISOString(),
          summary: "Apple Inc. (AAPL) has recorded strong year-end performance, with a 20% gain in stock price. The company's earnings have been reported as positive, and analysts expect a continuation of positive earnings growth.",
          url: "URL_ADDRESS.marketwatch.com/investing/stock/aapl",
          sentiment: "positive",
          impact: "high",
          relatedSymbols: ["AAPL"]
        },
        {
          title: "Microsoft Corp. (MSFT) Hits Record High, Boosts Revenue",
          source: "Financial Times",
          date: tomorrow.toISOString(),
          summary: "Microsoft Corp. (MSFT) has reached a record high in stock price, with a 15% gain in the past month. The company's earnings have been reported as positive, and analysts expect a continuation of positive earnings growth.",
          url: "URL_ADDRESS.ft.com/investing/stock/MSFT",
          sentiment: "positive",
          impact: "high",
          relatedSymbols: ["MSFT"]
        }
      ],
      "Healthcare": [
        {
          title: "Johnson & Johnson (JNJ) Records Strong Year-End Performance",
          source: "Investing.com",
          date: currentDate.toISOString(),
          summary: "Johnson & Johnson (JNJ) has recorded strong year-end performance, with a 10% gain in stock price. The company's earnings have been reported as positive, and analysts expect a continuation of positive earnings growth.",
          url: "URL_ADDRESS.investing.com/investing/stock/JNJ",
          sentiment: "positive",
          impact: "high",
          relatedSymbols: ["JNJ"]
        },
        {
          title: "P&G (PG) Records Strong Year-End Performance",
          source: "MarketWatch",
          date: tomorrow.toISOString(),
          summary: "P&G (PG) has recorded strong year-end performance, with a 5% gain in stock price. The company's earnings have been reported as positive, and analysts expect a continuation of positive earnings growth.",
          url: "URL_ADDRESS.marketwatch.com/investing/stock/PG",
          sentiment: "positive",
          impact: "high",
          relatedSymbols: ["PG"]
        }
      ]
    },
    economicCalendar: [
      {
        title: "US GDP Growth Rate Hits Record High",
        date: currentDate.toISOString(),
        country: "United States",
        actual: "7.5%",
        forecast: "7.5%",
        previous: "7.0%",
        impact: "high",
        description: "The United States' GDP growth rate has reached a record high, with a 7.5% increase in the past quarter. The country's central bank has announced a series of monetary policy measures to support the economy."
      },
      {
        title: "China's GDP Growth Rate Hits Record High",
        date: tomorrow.toISOString(),
        country: "China",
        actual: "9.0%",
        forecast: "9.0%",
        previous: "8.5%",
        impact: "high",
        description: "China's GDP growth rate has reached a record high, with a 9.0% increase in the past quarter. The country's central bank has announced a series of monetary policy measures to support the economy."
      }
    ]
  };
}

// Helper function to format market news
function formatMarketNews(newsData: MarketNewsResult): string {
  let table = '| Date | Headline | Source |\n';
  table += '|------|----------|--------|\n';
  newsData.topNews.forEach(news => {
    table += `| ${news.date.split('T')[0]} | ${news.title} | ${news.source} |\n`;
  });
  return table;
}