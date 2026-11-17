import React, { useState, useEffect } from 'react';
import { Stock, MarketIndex, TradePosition, PortfolioSummary } from './types';
import { INITIAL_STOCKS, INITIAL_INDICES } from './data/stocks';
import { generateTradingSignals, generateLongTermAdvice } from './services/advisoryEngine';
import { simulateStockTick, getIndianMarketStatus, SoundEffects } from './services/marketEngine';

import { Header } from './components/Header';
import { Watchlist } from './components/Watchlist';
import { StockChart } from './components/StockChart';
import { TradingTerminal } from './components/TradingTerminal';
import { AdvisoryPanel } from './components/AdvisoryPanel';
import { AICopilot } from './components/AICopilot';
import { MarketHeatmap } from './components/MarketHeatmap';
import { StockFundamentals } from './components/StockFundamentals';

import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Bot, 
  Layers, 
  Briefcase,
  Activity,
  Award
} from 'lucide-react';

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [indices, setIndices] = useState<MarketIndex[]>(INITIAL_INDICES);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [activeView, setActiveView] = useState<'terminal' | 'advisory' | 'copilot' | 'heatmap' | 'fundamentals'>('terminal');
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [marketStatus, setMarketStatus] = useState(getIndianMarketStatus());
  const [isCopilotDrawerOpen, setIsCopilotDrawerOpen] = useState<boolean>(false);

  // Virtual Portfolio state
  const [portfolio, setPortfolio] = useState<PortfolioSummary>({
    cashBalance: 1000000, // ₹10,00,000 INR starting capital
    investedValue: 0,
    currentValue: 1000000,
    totalPnl: 0,
    totalPnlPercent: 0,
    todaysPnl: 0,
    todaysPnlPercent: 0
  });

  const [positions, setPositions] = useState<TradePosition[]>([]);

  // Update market status clock every 10 seconds
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setMarketStatus(getIndianMarketStatus());
    }, 10000);
    return () => clearInterval(clockInterval);
  }, []);

  // Real-Time Price Simulation Engine (Streaming Ticker)
  useEffect(() => {
    if (!isStreaming) return;

    const streamInterval = setInterval(() => {
      // Pick 2-3 random stocks to update per cycle
      const randomIndex1 = Math.floor(Math.random() * stocks.length);
      const randomIndex2 = (randomIndex1 + 3) % stocks.length;

      setStocks((prevStocks) => {
        return prevStocks.map((stock, i) => {
          if (i === randomIndex1 || i === randomIndex2) {
            const updatedStock = simulateStockTick(stock);
            if (soundEnabled && stock.symbol === selectedSymbol) {
              SoundEffects.playTickSound(updatedStock.change >= stock.change);
            }
            return updatedStock;
          }
          return stock;
        });
      });

      // Also gently fluctuate NIFTY & SENSEX
      setIndices((prevIndices) => {
        return prevIndices.map((idx) => {
          if (idx.symbol === 'NIFTY 50' || idx.symbol === 'BANK NIFTY') {
            const shift = (Math.random() - 0.49) * 4.2;
            const newPrice = Number((idx.price + shift).toFixed(2));
            const newChange = Number((idx.change + shift).toFixed(2));
            return {
              ...idx,
              price: newPrice,
              change: newChange,
              changePercent: Number(((newChange / (newPrice - newChange)) * 100).toFixed(2))
            };
          }
          return idx;
        });
      });
    }, 2800);

    return () => clearInterval(streamInterval);
  }, [isStreaming, soundEnabled, selectedSymbol, stocks.length]);

  // Recalculate Portfolio Values when stocks tick
  useEffect(() => {
    if (positions.length === 0) return;

    let totalInvested = 0;
    let totalCurrent = 0;

    const updatedPositions = positions.map((pos) => {
      const stock = stocks.find((s) => s.symbol === pos.symbol);
      const currentPrice = stock ? stock.price : pos.currentPrice;
      const currentAmount = Number((currentPrice * pos.qty).toFixed(2));
      const pnl = pos.type === 'BUY'
        ? Number(((currentPrice - pos.avgPrice) * pos.qty).toFixed(2))
        : Number(((pos.avgPrice - currentPrice) * pos.qty).toFixed(2));
      const pnlPercent = Number(((pnl / pos.investedAmount) * 100).toFixed(2));

      totalInvested += pos.investedAmount;
      totalCurrent += currentAmount;

      return {
        ...pos,
        currentPrice,
        currentAmount,
        unrealizedPnl: pnl,
        unrealizedPnlPercent: pnlPercent
      };
    });

    const totalPnl = Number((totalCurrent - totalInvested).toFixed(2));
    const totalPnlPercent = totalInvested > 0 ? Number(((totalPnl / totalInvested) * 100).toFixed(2)) : 0;

    setPortfolio((prev) => ({
      ...prev,
      investedValue: totalInvested,
      currentValue: prev.cashBalance + totalCurrent,
      totalPnl,
      totalPnlPercent,
      todaysPnl: totalPnl,
      todaysPnlPercent: totalPnlPercent
    }));
  }, [stocks]);

  // Active Selected Stock
  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];

  // Dynamic Advisory Signals & Multibagger reports
  const tradingSignals = generateTradingSignals(stocks);
  const longTermAdvice = generateLongTermAdvice(stocks);

  // Handle Placing Order
  const handlePlaceOrder = (order: {
    symbol: string;
    stockName: string;
    type: 'BUY' | 'SELL';
    qty: number;
    price: number;
    stopLoss?: number;
    target?: number;
  }) => {
    const investedAmount = Number((order.price * order.qty).toFixed(2));

    const newPosition: TradePosition = {
      id: `pos-${Date.now()}`,
      symbol: order.symbol,
      stockName: order.stockName,
      type: order.type,
      qty: order.qty,
      avgPrice: order.price,
      currentPrice: order.price,
      investedAmount,
      currentAmount: investedAmount,
      unrealizedPnl: 0,
      unrealizedPnlPercent: 0,
      stopLoss: order.stopLoss,
      target: order.target,
      timestamp: Date.now()
    };

    setPositions((prev) => [newPosition, ...prev]);
    setPortfolio((prev) => ({
      ...prev,
      cashBalance: prev.cashBalance - (order.type === 'BUY' ? investedAmount : 0)
    }));
  };

  // Handle Square Off (Close Position)
  const handleSquareOff = (positionId: string) => {
    const pos = positions.find((p) => p.id === positionId);
    if (!pos) return;

    setPortfolio((prev) => ({
      ...prev,
      cashBalance: prev.cashBalance + pos.currentAmount + pos.unrealizedPnl
    }));

    setPositions((prev) => prev.filter((p) => p.id !== positionId));
    if (soundEnabled) SoundEffects.playOrderSuccess();
  };

  // Quick trade from signals or chart
  const handleExecuteSignalTrade = (symbol: string, action: 'BUY' | 'SELL', price: number, sl: number, target: number) => {
    setSelectedSymbol(symbol);
    setActiveView('terminal');
    const targetStock = stocks.find(s => s.symbol === symbol) || selectedStock;
    handlePlaceOrder({
      symbol,
      stockName: targetStock.name,
      type: action,
      qty: 15,
      price,
      stopLoss: sl,
      target: target
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#080B11] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-blue-200 relative">
      {/* Top Main Navigation Header */}
      <Header
        indices={indices}
        marketStatus={marketStatus}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeView={activeView}
        onSelectView={setActiveView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3">
        {/* Left Watchlist Sidebar (Collapsible / Responsive) */}
        <div className="hidden md:flex w-72 lg:w-80 shrink-0 h-[calc(100vh-105px)]">
          <Watchlist
            stocks={stocks}
            selectedSymbol={selectedSymbol}
            onSelectStock={(sym) => {
              setSelectedSymbol(sym);
              if (activeView === 'heatmap') setActiveView('terminal');
            }}
            searchQuery={searchQuery}
          />
        </div>

        {/* Center / Main Content Body */}
        <div className="flex-1 flex flex-col h-[calc(100vh-105px)] overflow-hidden">
          {/* VIEW 1: TRADING TERMINAL (Interactive Chart + Order Pad + DOM + Snapshot) */}
          {activeView === 'terminal' && (
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-1">
              {/* Selected Stock Overview Header Strip */}
              <div className="bg-[#0F1523] rounded-xl border border-trade-cardBorder p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h2 className="text-xl font-black text-white font-sans tracking-tight">
                      {selectedStock.symbol}
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">
                      {selectedStock.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 font-semibold">
                      {selectedStock.sector}
                    </span>
                    {selectedStock.isFno && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                        F&O LOT: {selectedStock.lotSize}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono text-slate-400 mt-1">
                    <span>Day Range: <strong className="text-rose-400">₹{selectedStock.dayLow}</strong> - <strong className="text-emerald-400">₹{selectedStock.dayHigh}</strong></span>
                    <span>Volume: <strong className="text-slate-200">{(selectedStock.volume / 1000000).toFixed(2)}M</strong></span>
                    <span>Turnover: <strong className="text-slate-200">₹{selectedStock.turnoverCr} Cr</strong></span>
                  </div>
                </div>

                {/* Right: Live CMP Badge */}
                <div className="flex items-center space-x-3">
                  <div className="text-right font-mono">
                    <div className="text-2xl font-black text-white">
                      ₹{selectedStock.price.toFixed(2)}
                    </div>
                    <div className={`text-xs font-bold flex items-center justify-end gap-1 ${
                      selectedStock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {selectedStock.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      <span>{selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%)</span>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col text-[11px] font-mono bg-[#080B11] p-2 rounded-lg border border-slate-800 text-slate-300">
                    <div>RSI(14): <strong className="text-indigo-400">{selectedStock.technicals.rsi14}</strong> ({selectedStock.technicals.rsiStatus})</div>
                    <div>Trend: <strong className="text-emerald-400">{selectedStock.technicals.trend}</strong></div>
                  </div>
                </div>
              </div>

              {/* Chart (Left) + Order Pad / DOM (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-[500px]">
                {/* 2 Cols: High Precision Interactive TradingView-Style Chart */}
                <div className="lg:col-span-2 h-[500px] lg:h-full">
                  <StockChart
                    stock={selectedStock}
                    onQuickTrade={(action) => handlePlaceOrder({
                      symbol: selectedStock.symbol,
                      stockName: selectedStock.name,
                      type: action,
                      qty: 10,
                      price: selectedStock.price
                    })}
                  />
                </div>

                {/* 1 Col: Trading Pad & Order Book */}
                <div className="h-[500px] lg:h-full">
                  <TradingTerminal
                    stock={selectedStock}
                    positions={positions}
                    portfolio={portfolio}
                    onPlaceOrder={handlePlaceOrder}
                    onSquareOff={handleSquareOff}
                  />
                </div>
              </div>

              {/* Bottom Strip: Real-Time AI Advisory Highlight Pill */}
              <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-emerald-950/40 border border-blue-500/30 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      Top Signal Detected: <span className="text-emerald-400">{tradingSignals[0]?.stockName} ({tradingSignals[0]?.symbol})</span>
                    </span>
                    <p className="text-[11px] text-slate-300">
                      {tradingSignals[0]?.type} Setup • Target 2: ₹{tradingSignals[0]?.target2} (+{tradingSignals[0]?.potentialGainPercent}%) • Risk:Reward {tradingSignals[0]?.riskRewardRatio}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveView('advisory')}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>View All High Profit & Long Term Picks</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: AI ADVISORY (BEST PROFIT TRADES & LONG-TERM WEALTH GAINERS) */}
          {activeView === 'advisory' && (
            <div className="flex-1 h-full">
              <AdvisoryPanel
                signals={tradingSignals}
                longTermAdvice={longTermAdvice}
                onSelectStock={(sym) => {
                  setSelectedSymbol(sym);
                  setActiveView('terminal');
                }}
                onExecuteTrade={handleExecuteSignalTrade}
              />
            </div>
          )}

          {/* VIEW 3: CHANAKYA AI COPILOT CHATBOT */}
          {activeView === 'copilot' && (
            <div className="flex-1 h-full">
              <AICopilot
                currentStock={selectedStock}
                allStocks={stocks}
                onSelectStock={(sym) => {
                  setSelectedSymbol(sym);
                  setActiveView('terminal');
                }}
                onQuickTrade={(sym, action) => {
                  const targetStock = stocks.find(s => s.symbol === sym) || selectedStock;
                  handlePlaceOrder({
                    symbol: sym,
                    stockName: targetStock.name,
                    type: action,
                    qty: 10,
                    price: targetStock.price
                  });
                  setActiveView('terminal');
                }}
              />
            </div>
          )}

          {/* VIEW 4: SECTOR HEATMAP & MARKET BREADTH */}
          {activeView === 'heatmap' && (
            <div className="flex-1 h-full">
              <MarketHeatmap
                stocks={stocks}
                indices={indices}
                onSelectStock={(sym) => {
                  setSelectedSymbol(sym);
                  setActiveView('terminal');
                }}
              />
            </div>
          )}

          {/* VIEW 5: FUNDAMENTAL DEEP DIVE */}
          {activeView === 'fundamentals' && (
            <div className="flex-1 h-full">
              <StockFundamentals stock={selectedStock} />
            </div>
          )}
        </div>
      </div>

      {/* Floating Global Chanakya AI Copilot Pill */}
      {activeView !== 'copilot' && (
        <div className="fixed bottom-5 right-5 z-40">
          <button
            onClick={() => setIsCopilotDrawerOpen(!isCopilotDrawerOpen)}
            className="flex items-center space-x-2.5 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-full shadow-2xl shadow-purple-950/90 border border-purple-400/40 transition-all hover:scale-105 active:scale-95 group"
          >
            <div className="relative">
              <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            </div>
            <div className="text-left font-sans">
              <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
                <span>Chanakya AI</span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/90 text-emerald-300 border border-emerald-500/30">
                  INSTANT
                </span>
              </div>
              <div className="text-[10px] text-purple-200/90 font-mono">
                Ask about {selectedStock.symbol}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Floating Slide-Over Drawer for Instant Context Queries */}
      {isCopilotDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] z-50 p-3 flex flex-col bg-black/60 backdrop-blur-sm animate-in slide-in-from-right duration-200">
          <div className="flex-1 h-full shadow-2xl">
            <AICopilot
              currentStock={selectedStock}
              allStocks={stocks}
              onSelectStock={(sym) => {
                setSelectedSymbol(sym);
              }}
              onQuickTrade={(sym, action) => {
                const targetStock = stocks.find(s => s.symbol === sym) || selectedStock;
                handlePlaceOrder({
                  symbol: sym,
                  stockName: targetStock.name,
                  type: action,
                  qty: 10,
                  price: targetStock.price
                });
                setIsCopilotDrawerOpen(false);
              }}
              isFloatingDrawer={true}
              onCloseDrawer={() => setIsCopilotDrawerOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
