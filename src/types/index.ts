export type MarketExchange = 'NSE' | 'BSE';

export type TimeFrame = '1m' | '5m' | '15m' | '1H' | '1D' | '1W' | '1M' | '1Y';

export type Sector = 
  | 'Banking & Finance'
  | 'Information Technology'
  | 'Energy & Conglomerate'
  | 'Automobile'
  | 'FMCG & Retail'
  | 'Metals & Mining'
  | 'Pharmaceuticals'
  | 'Infrastructure & Industrials'
  | 'Defense & Aerospace'
  | 'Consumer Tech';

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  rsi?: number;
  macd?: {
    macd: number;
    signal: number;
    hist: number;
  };
  bbUpper?: number;
  bbLower?: number;
  vwap?: number;
}

export interface TechnicalIndicators {
  rsi14: number;
  rsiStatus: 'Oversold' | 'Bullish' | 'Neutral' | 'Overbought';
  macd: {
    value: number;
    signal: number;
    histogram: number;
    trend: 'Bullish Crossover' | 'Bearish Crossover' | 'Bullish Divergence' | 'Bearish Divergence' | 'Neutral';
  };
  ema20: number;
  ema50: number;
  ema200: number;
  trend: 'Strong Uptrend' | 'Mild Uptrend' | 'Consolidation' | 'Mild Downtrend' | 'Strong Downtrend';
  supertrend: {
    value: number;
    direction: 'BUY' | 'SELL';
  };
  vwap: number;
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
  };
  support1: number;
  support2: number;
  resistance1: number;
  resistance2: number;
  pivot: number;
  atr14: number; // Average True Range for volatility & stoploss
}

export interface Fundamentals {
  marketCapCr: number; // In ₹ Crores
  pe: number;
  industryPe: number;
  pb: number;
  pegRatio: number;
  roePercent: number;
  rocePercent: number;
  debtToEquity: number;
  dividendYield: number;
  epsTtm: number;
  revenueGrowthYoy: number; // %
  profitGrowthYoy: number; // %
  promoterHolding: number; // %
  fiiHolding: number; // %
  diiHolding: number; // %
  publicHolding: number; // %
  moat: 'Wide Moat' | 'Narrow Moat' | 'None';
  financialHealth: 'Excellent' | 'Good' | 'Moderate' | 'Strained';
  intrinsicValue: number; // ₹ Calculated DCF / fair value
  marginOfSafety: number; // % discount from CMP
}

export interface Stock {
  symbol: string;
  name: string;
  exchange: MarketExchange;
  sector: Sector;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  open: number;
  previousClose: number;
  volume: number;
  turnoverCr: number;
  yearHigh: number;
  yearLow: number;
  lotSize: number;
  isFno: boolean;
  technicals: TechnicalIndicators;
  fundamentals: Fundamentals;
  description: string;
  catalysts: string[];
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  advanceCount: number;
  declineCount: number;
}

export interface AdvisorySignal {
  id: string;
  symbol: string;
  stockName: string;
  type: 'STRONG BUY' | 'BUY' | 'ACCUMULATE' | 'HOLD / NEUTRAL' | 'BOOK PROFIT' | 'SELL / SHORT';
  category: 'INTRADAY' | 'SWING_MOMENTUM' | 'BREAKOUT' | 'PULLBACK_VALUE';
  entryRange: [number, number];
  target1: number;
  target2: number;
  stopLoss: number;
  riskRewardRatio: string;
  timeHorizon: string; // e.g., "1 - 3 Days", "Intraday (Today)", "1 - 2 Weeks"
  confidencePercent: number;
  potentialGainPercent: number;
  maxRiskPercent: number;
  catalyst: string;
  technicalReasoning: string[];
  timestamp: string;
}

export interface LongTermAdvice {
  symbol: string;
  stockName: string;
  rating: 'STRONG WEALTH COMPOUNDER' | 'GROWTH MULTIBAGGER' | 'DIVIDEND CASH COW' | 'VALUE OPPORTUNITY' | 'AVOID / OVERVALUED';
  overallScore: number; // 0 - 100
  valuationScore: number; // 0 - 100
  growthScore: number;
  qualityScore: number;
  moatScore: number;
  fairValue: number;
  target1Year: number;
  target3Year: number;
  expectedCagr: number; // %
  thesisSummary: string;
  keyDrivers: string[];
  risksToWatch: string[];
  recommendedAllocation: string; // e.g., "5% - 8% of Equity Portfolio"
}

export interface OrderBookLevel {
  bidOrders: number;
  bidQty: number;
  bidPrice: number;
  askPrice: number;
  askQty: number;
  askOrders: number;
}

export interface TradePosition {
  id: string;
  symbol: string;
  stockName: string;
  type: 'BUY' | 'SELL';
  qty: number;
  avgPrice: number;
  currentPrice: number;
  investedAmount: number;
  currentAmount: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  stopLoss?: number;
  target?: number;
  timestamp: number;
}

export interface PortfolioSummary {
  cashBalance: number;
  investedValue: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  todaysPnl: number;
  todaysPnlPercent: number;
}

export interface ChatActionButton {
  label: string;
  actionType: 'VIEW_STOCK' | 'BUY_ORDER' | 'SELL_ORDER' | 'PROMPT';
  payload: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  stockSymbol?: string;
  actionButtons?: ChatActionButton[];
  suggestedFollowUps?: string[];
  recommendation?: {
    action: string;
    horizon: string;
    target: number;
    stopLoss: number;
  };
}
