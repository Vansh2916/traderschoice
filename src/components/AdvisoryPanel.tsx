import React, { useState } from 'react';
import { Stock, AdvisorySignal, LongTermAdvice } from '../types';
import { 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  PieChart, 
  Flame,
  Award,
  ChevronRight,
  Info
} from 'lucide-react';

interface AdvisoryPanelProps {
  signals: AdvisorySignal[];
  longTermAdvice: LongTermAdvice[];
  onSelectStock: (symbol: string) => void;
  onExecuteTrade?: (symbol: string, action: 'BUY' | 'SELL', price: number, sl: number, target: number) => void;
}

export const AdvisoryPanel: React.FC<AdvisoryPanelProps> = ({
  signals,
  longTermAdvice,
  onSelectStock,
  onExecuteTrade
}) => {
  const [activeTab, setActiveTab] = useState<'profit' | 'longterm'>('profit');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredSignals = signals.filter(s => {
    if (filterCategory === 'ALL') return true;
    if (filterCategory === 'BREAKOUT') return s.category === 'BREAKOUT';
    if (filterCategory === 'PULLBACK') return s.category === 'PULLBACK_VALUE';
    if (filterCategory === 'HIGH_CONFIDENCE') return s.confidencePercent >= 90;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#0F1523] rounded-xl border border-trade-cardBorder overflow-hidden shadow-2xl">
      {/* Header with Glassmorphism and Mode Switcher */}
      <div className="p-4 bg-gradient-to-r from-[#141C2E] via-[#101827] to-[#141C2E] border-b border-trade-cardBorder">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg shadow-lg shadow-blue-500/20 text-white">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Advisory Intelligence
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  REAL-TIME ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Quantitative algorithms scanning NSE/BSE momentum setups & long-term compounders
              </p>
            </div>
          </div>
        </div>

        {/* Dual Primary Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#080B11]/90 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('profit')}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${
              activeTab === 'profit'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-300" />
            <span>Best Profit / Swing Trades</span>
            <span className="ml-1 text-[10px] font-mono bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
              {signals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('longterm')}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-xs font-bold transition-all ${
              activeTab === 'longterm'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Award className="w-4 h-4 text-blue-300" />
            <span>Long-Term Wealth Gainers</span>
            <span className="ml-1 text-[10px] font-mono bg-blue-950/80 px-1.5 py-0.2 rounded border border-blue-500/30">
              3-5 Yrs
            </span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: BEST PROFIT / SWING TRADES */}
        {activeTab === 'profit' && (
          <div className="space-y-3.5">
            {/* Filter Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'ALL', label: 'All Signals' },
                { id: 'BREAKOUT', label: '🚀 Breakouts' },
                { id: 'PULLBACK', label: '🛡️ Dip Value' },
                { id: 'HIGH_CONFIDENCE', label: '⭐ >90% Win Prob' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterCategory(f.id)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                    filterCategory === f.id
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                      : 'bg-[#141C2E] text-slate-400 hover:text-slate-200 border border-trade-cardBorder'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Signal Cards */}
            {filteredSignals.map((signal) => {
              const isBuy = signal.type.includes('BUY') || signal.type.includes('ACCUMULATE');
              return (
                <div
                  key={signal.id}
                  className="bg-gradient-to-b from-[#141C2E] to-[#0F1523] rounded-xl border border-trade-cardBorder hover:border-slate-600/60 p-4 transition-all hover:shadow-xl group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onSelectStock(signal.symbol)}
                          className="text-base font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1"
                        >
                          {signal.symbol}
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                        <span className="text-xs text-slate-400 truncate max-w-[150px]">
                          {signal.stockName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Target className="w-3 h-3 text-slate-500" />
                          Horizon: <strong className="text-slate-200">{signal.timeHorizon}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`px-2.5 py-0.8 text-[11px] font-black rounded-md tracking-wider border ${
                        signal.type === 'STRONG BUY'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                          : signal.type === 'BUY'
                          ? 'bg-emerald-600/15 text-emerald-300 border-emerald-600/30'
                          : signal.type === 'BOOK PROFIT'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}>
                        {signal.type}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                        <Flame className="w-3 h-3 text-amber-400" />
                        {signal.confidencePercent}% Confidence
                      </span>
                    </div>
                  </div>

                  {/* Quantitative Target & Levels Matrix */}
                  <div className="grid grid-cols-4 gap-2 p-2.5 bg-[#080B11]/70 rounded-lg border border-slate-800/80 mb-3 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 font-mono">ENTRY ZONE</div>
                      <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">
                        ₹{signal.entryRange[0]}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-emerald-400 font-mono">TARGET 1</div>
                      <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                        ₹{signal.target1}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-teal-300 font-mono">TARGET 2 (MAX)</div>
                      <div className="text-xs font-bold text-teal-300 font-mono mt-0.5">
                        ₹{signal.target2}
                        <span className="text-[10px] text-emerald-400 block font-normal">
                          (+{signal.potentialGainPercent}%)
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-rose-400 font-mono">STOP LOSS</div>
                      <div className="text-xs font-bold text-rose-400 font-mono mt-0.5">
                        ₹{signal.stopLoss}
                        <span className="text-[10px] text-rose-400 block font-normal">
                          (-{signal.maxRiskPercent}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Risk to Reward Visualizer */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-1">
                      <span>Risk:Reward Profile: <strong className="text-emerald-400">{signal.riskRewardRatio}</strong></span>
                      <span className="text-slate-400">Target Upside: <strong className="text-teal-300">+{signal.potentialGainPercent}%</strong></span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                      <div style={{ width: '25%' }} className="bg-rose-500/80 h-full" title="Max Risk" />
                      <div style={{ width: '75%' }} className="bg-emerald-500 h-full" title="Potential Reward" />
                    </div>
                  </div>

                  {/* Catalyst and Technical Bullet Points */}
                  <div className="space-y-1.5 mb-3 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40 text-xs text-slate-300">
                    <div className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed">
                        <strong className="text-white">Catalyst:</strong> {signal.catalyst}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/60">
                    <button
                      onClick={() => onSelectStock(signal.symbol)}
                      className="flex-1 py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Inspect Chart & Depth</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    {onExecuteTrade && (
                      <button
                        onClick={() => onExecuteTrade(
                          signal.symbol, 
                          isBuy ? 'BUY' : 'SELL', 
                          signal.entryRange[0], 
                          signal.stopLoss, 
                          signal.target1
                        )}
                        className={`py-1.5 px-4 text-xs font-bold rounded-lg shadow-md transition-all active:scale-95 ${
                          isBuy
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                        }`}
                      >
                        Trade {signal.symbol}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: LONG-TERM WEALTH COMPOUNDERS (3-5 YEARS) */}
        {activeTab === 'longterm' && (
          <div className="space-y-3.5">
            <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl text-xs text-blue-300/90 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-blue-200">The Multibagger Compounding Formula:</strong> Stocks screened for high ROCE (&gt;20%), low debt-to-equity (&lt;0.5), solid promoter pedigree, pricing power moat, and high margin of safety from DCF intrinsic value.
              </div>
            </div>

            {longTermAdvice.map((advice, idx) => (
              <div
                key={advice.symbol}
                className="bg-gradient-to-b from-[#141C2E] to-[#0F1523] rounded-xl border border-trade-cardBorder hover:border-blue-500/40 p-4 transition-all hover:shadow-xl group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] flex items-center justify-center font-bold">
                        #{idx + 1}
                      </span>
                      <button
                        onClick={() => onSelectStock(advice.symbol)}
                        className="text-base font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1"
                      >
                        {advice.symbol}
                      </button>
                      <span className="text-xs text-slate-400 truncate max-w-[140px]">
                        {advice.stockName}
                      </span>
                    </div>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-400 font-mono">
                      Allocation: {advice.recommendedAllocation}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="px-2.5 py-0.8 text-[11px] font-black rounded-md tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {advice.rating}
                    </span>
                    <div className="text-[11px] font-mono text-slate-300 mt-1 flex items-center gap-1 font-bold">
                      Score: <strong className="text-emerald-400">{advice.overallScore}/100</strong>
                    </div>
                  </div>
                </div>

                {/* Growth and Price Projections */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-[#080B11]/80 rounded-lg border border-slate-800 mb-3 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 font-mono">DCF FAIR VALUE</div>
                    <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">
                      ₹{advice.fairValue}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-400 font-mono">1-YEAR TARGET</div>
                    <div className="text-xs font-bold text-blue-300 font-mono mt-0.5">
                      ₹{advice.target1Year}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-emerald-400 font-mono">3-YEAR TARGET (3X)</div>
                    <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                      ₹{advice.target3Year}
                      <span className="text-[10px] text-teal-300 block font-normal">
                        ({advice.expectedCagr}% CAGR)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scorecard Progress Bars */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3 text-[11px] font-mono">
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Business Moat</span>
                      <span className="text-blue-300">{advice.moatScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div style={{ width: `${advice.moatScore}%` }} className="bg-blue-500 h-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Quality & ROCE</span>
                      <span className="text-emerald-300">{advice.qualityScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div style={{ width: `${advice.qualityScore}%` }} className="bg-emerald-500 h-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Growth Vector</span>
                      <span className="text-purple-300">{advice.growthScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div style={{ width: `${advice.growthScore}%` }} className="bg-purple-500 h-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-slate-400 mb-0.5">
                      <span>Valuation Buffer</span>
                      <span className="text-amber-300">{advice.valuationScore}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                      <div style={{ width: `${advice.valuationScore}%` }} className="bg-amber-500 h-full" />
                    </div>
                  </div>
                </div>

                {/* Investment Thesis */}
                <p className="text-xs text-slate-300/90 leading-relaxed mb-3 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40">
                  {advice.thesisSummary}
                </p>

                {/* Action button */}
                <button
                  onClick={() => onSelectStock(advice.symbol)}
                  className="w-full py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <span>View Financial Statements & Full Analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
