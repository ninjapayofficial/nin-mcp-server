// // server/mcp-server.ts: ignore... not using
// import express, { Request, Response } from 'express';
// import cors from 'cors';
// import rateLimit from 'express-rate-limit';
// import { serverConfig } from '../config/server';
// import { mcpTools, McpTools } from '../services/mcpTools';
// import { manifestRouter } from './manifest';
// import path from 'path';

// const app = express();

// // Middleware
// app.use(cors(serverConfig.cors));
// app.use(express.json());
// app.use(rateLimit(serverConfig.rateLimit));

// // Serve static files
// app.use(express.static(path.join(__dirname, '../public')));

// // Manifest endpoints
// app.use('/api', manifestRouter);

// // Health check endpoint
// app.get('/health', (req: Request, res: Response): void => {
//   res.status(200).json({ status: 'ok' });
// });

// // Define the request body interfaces
// interface McpRequest {
//   tool: keyof McpTools;
//   params: any;
// }

// interface ClaudeMcpRequest {
//   name: string;
//   arguments: {
//     symbol?: string;
//     query?: string;
//     criteria?: any;
//     holdings?: any[];
//     [key: string]: any;
//   };
// }

// // Claude MCP endpoint
// app.post('/api/claude/mcp', async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { name, arguments: args } = req.body as ClaudeMcpRequest;
    
//     // Map Claude's function name to our tool
//     const toolMap: Record<string, keyof McpTools> = {
//       'analyzeFundamentals': 'analyzeFundamentals',
//       'analyzeMarket': 'analyzeMarket',
//       'getMarketNews': 'getMarketNews',
//       'analyzeOptions': 'analyzeOptions',
//       'analyzePortfolio': 'analyzePortfolio',
//       'screenStocks': 'screenStocks',
//       'analyzeTechnicals': 'analyzeTechnicals'
//     };
    
//     const tool = toolMap[name];
    
//     if (!tool || !(tool in mcpTools)) {
//       res.status(400).json({ 
//         error: 'Invalid tool specified',
//         messages: [{
//           role: 'assistant',
//           content: `I'm sorry, the tool "${name}" is not available.`
//         }]
//       });
//       return;
//     }
    
//     // Parse arguments based on the tool
//     const params = args.symbol || args.query || args.criteria || args.holdings || {};
    
//     // Call the appropriate tool with type safety
//     const toolFunction = mcpTools[tool];
//     const result = await toolFunction(params);
//     res.json(result);
//     return;
//   } catch (error) {
//     console.error('Claude MCP API Error:', error);
//     res.status(500).json({ 
//       error: 'Internal server error',
//       messages: [{
//         role: 'assistant',
//         content: 'I encountered an error while processing your request. Please try again later.'
//       }]
//     });
//     return;
//   }
// });

// // Original MCP Tools endpoint
// app.post('/api/mcp', async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { tool, params } = req.body as McpRequest;
    
//     if (!tool || !(tool in mcpTools)) {
//       res.status(400).json({ error: 'Invalid tool specified' });
//       return;
//     }
    
//     // Type assertion to ensure TypeScript knows this is a valid tool
//     const toolFunction = mcpTools[tool as keyof McpTools];
//     const result = await toolFunction(params);
//     res.json(result);
//     return;
//   } catch (error) {
//     console.error('MCP API Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//     return;
//   }
// });

// // Start server
// const server = app.listen(serverConfig.port, () => {
//   console.log(`Server running at http://${serverConfig.host}:${serverConfig.port}`);
//   console.log(`MCP manifest available at http://${serverConfig.host}:${serverConfig.port}/api`);
// });

// export default server;
