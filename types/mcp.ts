// MCP Types based on Model Context Protocol specification

export interface McpMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
}

export interface McpReference {
  type: 'text' | 'image' | 'file' | 'code';
  title: string;
  content: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface McpRequest {
  context_id: string;
  messages: McpMessage[];
  options?: {
    stream?: boolean;
    max_tokens?: number;
    temperature?: number;
    references_required?: boolean;
  };
}

export interface McpResponse {
  context_id: string;
  response: {
    messages: McpMessage[];
    references: McpReference[];
  };
}