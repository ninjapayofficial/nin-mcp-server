// services/mcpService.ts: // ignore... not using
import { McpMessage, McpReference, McpRequest, McpResponse } from '../types/mcp';

// Service to handle MCP-related functionality
export class McpService {
  // Process an MCP request and generate a response
  async processRequest(request: McpRequest): Promise<McpResponse> {
    const { context_id, messages } = request;
    
    // Initialize response
    const response: McpResponse = {
      context_id,
      response: {
        messages: [],
        references: []
      }
    };
    
    try {
      // Extract the query from the last user message
      const lastUserMessage = this.getLastUserMessage(messages);
      if (!lastUserMessage) {
        return response;
      }
      
      // Get relevant context based on the user's query
      const contextData = await this.getRelevantContext(lastUserMessage.content, context_id);
      
      // Add context to the response
      response.response.messages = contextData.messages;
      response.response.references = contextData.references;
      
      return response;
    } catch (error) {
      console.error('Error processing MCP request:', error);
      return response;
    }
  }
  
  // Helper to get the last user message from the messages array
  private getLastUserMessage(messages: McpMessage[]): McpMessage | null {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i];
      }
    }
    return null;
  }
  
  // Get relevant context based on the user's query
  private async getRelevantContext(query: string, contextId: string): Promise<{
    messages: McpMessage[];
    references: McpReference[];
  }> {
    // Implement your logic to retrieve relevant context
    // This could involve:
    // 1. Searching your database
    // 2. Retrieving relevant documents
    // 3. Processing data from your platform
    
    // Example implementation (replace with your actual logic)
    // Check if query is related to holdings or portfolio
    if (query.toLowerCase().includes('holding') || 
        query.toLowerCase().includes('portfolio') || 
        query.toLowerCase().includes('investment')) {
      return await this.getHoldingsData();
    }
    
    // Default response if no specific context is matched
    return {
      messages: [
        {
          role: 'assistant',
          content: `I found some information related to your query about "${query}".`
        }
      ],
      references: [
        {
          type: 'text',
          title: 'Platform Documentation',
          content: 'Here is some relevant information from our platform...',
          url: 'https://your-platform.com/docs'
        }
      ]
    };
  }

  // Fetch holdings data from the API
  private async getHoldingsData(): Promise<{
    messages: McpMessage[];
    references: McpReference[];
  }> {
    try {
      // In a real implementation, you would fetch this from your API
      // For now, we'll use a mock implementation
      const portfolioData = await this.fetchPortfolioData();
      
      // Calculate total portfolio value and P&L
      const totalValue = portfolioData.reduce(
        (sum, holding) => sum + holding.currentPrice * holding.shares, 0
      );
      
      const totalPnL = portfolioData.reduce(
        (sum, holding) => sum + holding.pnl, 0
      );
      
      // Format the data for display
      const holdingsTable = this.formatHoldingsTable(portfolioData);
      
      return {
        messages: [
          {
            role: 'assistant',
            content: `Here is your current portfolio summary:\n\nTotal Portfolio Value: ₹${totalValue.toLocaleString()}\nTotal P&L: ₹${totalPnL.toLocaleString()} (${((totalPnL/totalValue)*100).toFixed(2)}%)`
          }
        ],
        references: [
          {
            type: 'text',
            title: 'Portfolio Holdings',
            content: holdingsTable,
            metadata: {
              totalValue,
              totalPnL,
              holdingsCount: portfolioData.length
            }
          }
        ]
      };
    } catch (error) {
      console.error('Error fetching holdings data:', error);
      return {
        messages: [
          {
            role: 'assistant',
            content: 'I encountered an error while fetching your holdings data. Please try again later.'
          }
        ],
        references: []
      };
    }
  }

  // Mock function to fetch portfolio data
  // Update the fetchPortfolioData method to use the real API endpoint
  
  private async fetchPortfolioData(): Promise<Array<{
    symbol: string;
    shares: number;
    industry: string;
    avgPrice: number;
    currentPrice: number;
    pnl: number;
  }>> {
    try {
      // Use the API endpoint we created
      const response = await fetch('http://localhost:3000/api/mcp/holdings');
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }
      const data = await response.json();
      return data.portfolio;
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      // Fallback to mock data if the API call fails
      return [
        {
          symbol: 'RELIANCE',
          shares: 10,
          industry: 'Oil & Gas',
          avgPrice: 2500,
          currentPrice: 2650,
          pnl: 1500
        },
        // ... other mock data
      ];
    }
  }

  // Format holdings data as a table
  private formatHoldingsTable(holdings: Array<{
    symbol: string;
    shares: number;
    industry: string;
    avgPrice: number;
    currentPrice: number;
    pnl: number;
  }>): string {
    let table = '| Symbol | Industry | Shares | Avg Price | Current Price | Current Value | P&L | P&L % |\n';
    table += '|--------|----------|--------|-----------|---------------|---------------|-----|-------|\n';
    
    holdings.forEach(holding => {
      const currentValue = holding.currentPrice * holding.shares;
      const pnlPercentage = (holding.pnl / (holding.avgPrice * holding.shares)) * 100;
      
      table += `| ${holding.symbol} | ${holding.industry} | ${holding.shares} | ₹${holding.avgPrice} | ₹${holding.currentPrice} | ₹${currentValue.toLocaleString()} | ₹${holding.pnl.toLocaleString()} | ${pnlPercentage.toFixed(2)}% |\n`;
    });
    
    return table;
  }
}

// Export a singleton instance
export const mcpService = new McpService();