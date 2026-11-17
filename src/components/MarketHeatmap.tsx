import React from 'react';
import { Stock, MarketIndex } from '../types';
import { Layers, Activity, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Users } from 'lucide-react';

interface MarketHeatmapProps {
  stocks: Stock[];
  indices: MarketIndex[];
  onSelectStock: (symbol: string) => void;
}

export const MarketHeatmap: React.FC<MarketHeatmapProps> = ({ stocks, indices, onSelectStock }) => {
  // Group stocks by sector
  const sectors = Array.from(new Set(stocks.map(s => s.sector)));

  // Calculate sector average performance
  const sectorPerformances = sectors.map(sector => {
    const sectorStocks = stocks.filter(s => s.sector === sector);
    const avgChange = sectorStocks.reduce((acc, s) => acc + s.changePercent, 0) / sectorStocks.length;
    return {
      sector,
      avgChange: Number(avgChange.toFixed(2)),
      stocks: sectorStocks
    };
  }).sort((a, b) => b.avgChange - a.avgChange);

  // Market Breadth across all stocks
  const advances = stocks.filter(s => s.change > 0).length;
  const declines = stocks.filter(s => s.change < 0).length;
  const total = stocks.length;
  const advancePercent = Math.round((advances / total) * 100);

  const indiaVix = indices.find(i => i.symbol.includes('VIX'))?.price || 13.82;

  return (
    <div className="flex flex-col h-full bg-[#0F1523] rounded-xl border border-trade-cardBorder overflow-hidden shadow-2xl p-4 space-y-4">
      {/* Top Breadth & FII/DII Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* NSE Market Breadth */}
        <div className="bg-[#141C2E] p-3 rounded-xl border border-trade-cardBorder">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              NSE Market Breadth
            </span>
            <span className="font-mono text-emerald-400 font-bold">{advances} Adv / {declines} Dec</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex mb-2">
            <div style={{ width: `${advancePercent}%` }} className="bg-emerald-500 h-full" />
            <div style={{ width: `${100 - advancePercent}%` }} className="bg-rose-500 h-full" />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span className="text-emerald-400">{advancePercent}% Advances</span>
            <span className="text-rose-400">{100 - advancePercent}% Declines</span>
          </div>
        </div>

        {/* Institutional FII / DII Flow Tracker */}
        <div className="bg-[#141C2E] p-3 rounded-xl border border-trade-cardBorder">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              FII / DII Net Flow (Today)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">
              NET BUYERS
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#080B11] p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">FII NET FLOW</div>
              <div className="text-emerald-400 font-bold">+₹1,482 Cr</div>
            </div>
            <div className="bg-[#080B11] p-1.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">DII NET FLOW</div>
              <div className="text-emerald-400 font-bold">+₹2,340 Cr</div>
            </div>
          </div>
        </div>

        {/* India VIX & Market Sentiment */}
        <div className="bg-[#141C2E] p-3 rounded-xl border border-trade-cardBorder">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              INDIA VIX Volatility
            </span>
            <span className="font-mono text-xs font-bold text-amber-300">{indiaVix}</span>
          </div>
          <div className="text-[11px] text-slate-300 bg-[#080B11] p-1.5 rounded border border-slate-800 font-mono">
            Market Regime: <strong className="text-emerald-400">Low Volatility Bullish</strong>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Favorable for trend following & swing long trades.
          </div>
        </div>
      </div>

      {/* Sector Performance Grid */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span>Sectoral Heatmap & Heavyweight Constituents</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sectorPerformances.map((sec) => {
            const isGreen = sec.avgChange >= 0;
            return (
              <div
                key={sec.sector}
                className="bg-[#141C2E] rounded-xl border border-trade-cardBorder p-3 hover:border-slate-600 transition-all"
              >
                <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-white">{sec.sector}</span>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    isGreen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {isGreen ? '+' : ''}{sec.avgChange}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {sec.stocks.map((stock) => {
                    const stockUp = stock.change >= 0;
                    return (
                      <button
                        key={stock.symbol}
                        onClick={() => onSelectStock(stock.symbol)}
                        className={`p-2 rounded-lg text-left transition-all border ${
                          stockUp
                            ? 'bg-emerald-950/20 hover:bg-emerald-900/40 border-emerald-500/20 text-emerald-300'
                            : 'bg-rose-950/20 hover:bg-rose-900/40 border-rose-500/20 text-rose-300'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span>{stock.symbol}</span>
                          {stockUp ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-rose-400" />}
                        </div>
                        <div className="text-[11px] font-mono mt-0.5 flex justify-between text-slate-300">
                          <span>₹{stock.price}</span>
                          <span className={stockUp ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                            {stockUp ? '+' : ''}{stock.changePercent}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
