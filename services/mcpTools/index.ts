// services/mcpTools/index.ts:
import { analyzeFundamentals } from './fundamentalAnalysis';
import { analyzeMarket } from './marketAnalysis';
import { getMarketNews } from './marketNews';
import { analyzeOptions } from './optionsAnalysis';
import { analyzePortfolio } from './portfolioAnalysis';
import { screenStocks } from './stockScreener';
import { analyzeTechnicals } from './technicalAnalysis';
import { getUserHoldings } from './userHoldings';
import { getUserBinanceHoldings } from './userBinanceHoldings';

// Import Groww API tools
import { getGrowwHoldings } from './growwHoldings';
import { getGrowwPositions } from './growwPositions';
import { 
  getGrowwSymbolsLTP, 
  getGrowwSymbolsOHLC, 
  getGrowwSymbolQuote 
} from './growwLiveData';
import { 
  placeGrowwOrder, 
  modifyGrowwOrder, 
  cancelGrowwOrder, 
  getGrowwOrderStatus 
} from './growwOrders';
import { 
  getGrowwUserMargin, 
  getGrowwOrderMargin 
} from './growwMargins';

export const mcpTools = {
  analyzeFundamentals,
  analyzeMarket,
  getMarketNews,
  analyzeOptions,
  analyzePortfolio,
  screenStocks,
  analyzeTechnicals,
  getUserHoldings,
  getUserBinanceHoldings,
  
  // Groww API tools
  getGrowwHoldings,
  getGrowwPositions,
  getGrowwSymbolsLTP,
  getGrowwSymbolsOHLC,
  getGrowwSymbolQuote,
  placeGrowwOrder,
  modifyGrowwOrder,
  cancelGrowwOrder,
  getGrowwOrderStatus,
  getGrowwUserMargin,
  getGrowwOrderMargin
};

export type McpTools = typeof mcpTools;