# MCP (Model Context Protocol) Integration

This document describes the MCP server integration added to the NIN Terminal AI chat interface.

## Features

### 🔧 MCP Server Management
- **Add MCP Button**: Purple chip in the chat input area to add new MCP servers
- **Server Management Modal**: Interface to add, enable/disable MCP servers
- **Active Server Display**: Green chips showing currently enabled MCP servers
- **Server Types**: Support for both SSE (Server-Sent Events) and STDIO transports

### 🚀 Integration Details

#### Frontend (APIChat.tsx)
- Added MCP server state management with `useState`
- Purple "Add MCP" button in the chat input area
- Modal interface for managing MCP servers
- Green chips displaying active MCP servers
- MCP server data passed to API via `useChat` body parameter

#### Backend (route.ts)
- Updated to use Vercel AI SDK 4.2+ with `experimental_createMCPClient`
- Dynamic MCP client creation for enabled servers
- Tool integration from MCP servers alongside built-in trading tools
- Error handling for failed MCP server connections

## Usage

### Adding an MCP Server
1. Click the purple "Add MCP" button in the chat input area
2. Fill in the server details:
   - **Name**: Display name for the server
   - **URL**: Server endpoint (e.g., `http://localhost:8765/sse`)
   - **Type**: Choose between SSE or STDIO transport
3. Click "Add Server" to save

### Managing Servers
- **Enable/Disable**: Click on server entries in the modal to toggle
- **Active Servers**: Enabled servers appear as green chips below the input
- **Remove**: Click the X on active server chips to disable

### Example MCP Server URLs
```
# Local development server
http://localhost:8765/sse

# File system server
stdio://mcp-server-filesystem

# Database server
http://localhost:3001/mcp
```

## Technical Implementation

### State Management
```typescript
interface MCPServer {
  id: string
  name: string
  url: string
  type: 'sse' | 'stdio'
  enabled: boolean
}
```

### API Integration
```typescript
// Frontend sends MCP servers to API
const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
  api: '/api/ai/chat',
  body: {
    mcpServers: mcpServers
  }
})

// Backend creates MCP clients
for (const server of mcpServers.filter((s: any) => s.enabled)) {
  const mcpClient = experimental_createMCPClient({
    name: server.name,
    url: server.url,
    transport: server.type
  })
  
  const serverTools = await mcpClient.getTools()
  Object.assign(mcpTools, serverTools)
}
```

## Dependencies

- **Vercel AI SDK 4.2+**: For MCP client support
- **@modelcontextprotocol/sdk**: MCP protocol implementation
- **React**: For UI components and state management

## Migration Notes

This implementation follows the Vercel AI SDK 4.2 migration guide:
- Uses `experimental_createMCPClient` for MCP server connections
- Integrates MCP tools with existing trading tools
- Maintains backward compatibility with existing functionality

## Security Considerations

- MCP servers run with user permissions
- Validate server URLs before connection
- Consider implementing server allowlists for production
- Monitor MCP server resource usage

## Troubleshooting

### Common Issues
1. **Connection Failed**: Check server URL and ensure MCP server is running
2. **No Tools Available**: Verify MCP server implements tool discovery
3. **Transport Errors**: Ensure correct transport type (SSE vs STDIO)

### Debug Logging
Check browser console and server logs for MCP connection status:
```
Connected to MCP server: [server-name]
Failed to connect to MCP server [server-name]: [error]
```