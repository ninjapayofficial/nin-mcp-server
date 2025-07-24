// server/manifest.ts
import express from 'express';
import { Router } from 'express';

export const manifestRouter = Router();

manifestRouter.get('/', (req, res) => {
  res.json({
    schema_version: "v1",
    name: "NIN Terminal",
    description: "Financial analysis tools for Indian markets",
    auth: {
      type: "none"
    },
    api: {
      type: "openapi",
      url: `http://${req.headers.host}/api/openapi.json`
    },
    contact_email: "support@ninterm.com",
    logo_url: `http://${req.headers.host}/logo.png`,
    legal_info_url: `http://${req.headers.host}/legal`,
    mcp_server: {
      name: "NIN Terminal MCP Server",
      description: "Financial analysis tools for Indian markets via MCP",
      path: "/Users/NANDA/Documents/Development/NIN/nin-terminal/server/mcp-server-sdk.ts"
    }
  });
});

manifestRouter.get('/openapi.json', (req, res) => {
  res.json({
    openapi: "3.0.0",
    info: {
      title: "NIN Terminal API",
      description: "Financial analysis tools for Indian markets",
      version: "1.0.0"
    },
    servers: [
      {
        url: `http://${req.headers.host}/api`
      }
    ],
    paths: {
      "/claude/mcp": {
        post: {
          summary: "Execute MCP tools",
          operationId: "executeMcpTool",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "arguments"],
                  properties: {
                    name: {
                      type: "string",
                      description: "The name of the tool to execute",
                      enum: [
                        "analyzeFundamentals",
                        "analyzeMarket",
                        "getMarketNews",
                        "analyzeOptions",
                        "analyzePortfolio",
                        "screenStocks",
                        "analyzeTechnicals"
                      ]
                    },
                    arguments: {
                      type: "object",
                      properties: {
                        symbol: { type: "string" },
                        query: { type: "string" },
                        criteria: { type: "object" },
                        holdings: { type: "array" }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Tool executed successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      messages: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            role: { type: "string" },
                            content: { type: "string" }
                          }
                        }
                      },
                      references: {
                        type: "array",
                        items: {
                          type: "object"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
});

// Add MCP configuration endpoint
manifestRouter.get('/mcp-config', (req, res) => {
  res.json({
    name: "NIN Terminal MCP Server",
    version: "1.0.0",
    description: "Financial analysis tools for Indian markets",
    tools: [
      {
        name: "analyzeFundamentals",
        description: "Analyze fundamental metrics for a stock"
      },
      {
        name: "analyzeMarket",
        description: "Analyze overall market conditions"
      },
      {
        name: "getMarketNews",
        description: "Get latest market news"
      },
      {
        name: "analyzeOptions",
        description: "Analyze options data for a stock"
      },
      {
        name: "analyzePortfolio",
        description: "Analyze a portfolio of stocks"
      },
      {
        name: "screenStocks",
        description: "Screen stocks based on criteria"
      },
      {
        name: "analyzeTechnicals",
        description: "Analyze technical indicators for a stock"
      }
    ]
  });
});