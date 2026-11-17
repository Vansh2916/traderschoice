import React from 'react';
import { Stock } from '../types';
import { 
  Building2, 
  Percent, 
  DollarSign, 
  PieChart, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';

interface StockFundamentalsProps {
  stock: Stock;
}

export const StockFundamentals: React.FC<StockFundamentalsProps> = ({ stock }) => {
  const { fundamentals, technicals, yearHigh, yearLow, price } = stock;
  const rangeSpan = yearHigh - yearLow;
  const rangePositionPercent = Math.min(100, Math.max(0, ((price - yearLow) / (rangeSpan || 1)) * 100));

  return (
    <div className="flex flex-col h-full bg-[#0F1523] rounded-xl border border-trade-cardBorder overflow-hidden shadow-2xl p-4 space-y-4">
      {/* 52-Week Range Visual Slider */}
      <div className="bg-[#141C2E] p-3.5 rounded-xl border border-trade-cardBorder">
        <div className="flex justify-between items-center text-xs font-mono mb-2">
          <span className="text-slate-400">52-Week Low: <strong className="text-rose-400">₹{yearLow}</strong></span>
          <span className="text-white font-bold">CMP: ₹{price} ({rangePositionPercent.toFixed(0)}% of range)</span>
          <span className="text-slate-400">52-Week High: <strong className="text-emerald-400">₹{yearHigh}</strong></span>
        </div>
        <div className="relative w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${rangePositionPercent}%` }}
            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all"
          />
        </div>
      </div>

      {/* Ratios & Fundamentals Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-[#141C2E] p-3 rounded-xl border border-trade-cardBorder">
          <div className="text-[10px] text-slate-400">P/E RATIO vs INDUSTRY</div>
          <div className="text-sm font-bold text-white mt-1">
            {fundamentals.pe} <span className="text-[11px] text-slate-400 font-normal">/ {fundamentals.industryPe}</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">
            PEG Ratio: {fundamentals.pegRatio}
          </div>
        </div>

        <div className="bg-[#141C2E] p-3 rounded-xl border border-trade-cardBorder">
          <div className="text-[10px] text-slate-400">ROCE & ROE</div>
          <div className="text-sm font-bold text-emerald-400 mt-1">
            {fundamentals.rocePercent}% <span className="text-[11px] text-slate-300 font-normal">ROCE</span>
          </div>
          <div className="text-[10px] text-blue-400 mt-1">
            ROE: {fundamentals.roePercent}%
          </div>
        </div>

        <div className="bg-[#141C2E] p-3 rounded-xl border border-trade-cardBorder">
          <div className="text-[10px] text-slate-400">DEBT TO EQUITY</div>
          <div className={`text-sm font-bold mt-1 ${fundamentals.debtToEquity < 0.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {fundamentals.debtToEquity}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Div Yield: {fundamentals.dividendYield}%
          </div>
        </div>

        <div className="bg-[#141C2E] p-3 rounded-xl border border-trade-cardBorder">
          <div className="text-[10px] text-slate-400">DCF INTRINSIC VALUE</div>
          <div className="text-sm font-bold text-teal-300 mt-1">
            ₹{fundamentals.intrinsicValue}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">
            +{fundamentals.marginOfSafety}% Margin of Safety
          </div>
        </div>
      </div>

      {/* Shareholding Pattern & Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Shareholding Breakdown */}
        <div className="bg-[#141C2E] p-3.5 rounded-xl border border-trade-cardBorder">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-3">
            <PieChart className="w-3.5 h-3.5 text-blue-400" />
            <span>Institutional Shareholding Pattern</span>
          </h4>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Promoters</span>
                <span className="font-bold text-white">{fundamentals.promoterHolding}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div style={{ width: `${fundamentals.promoterHolding}%` }} className="bg-blue-500 h-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Foreign Institutions (FII)</span>
                <span className="font-bold text-emerald-400">{fundamentals.fiiHolding}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div style={{ width: `${fundamentals.fiiHolding}%` }} className="bg-emerald-500 h-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Domestic Institutions (DII)</span>
                <span className="font-bold text-purple-400">{fundamentals.diiHolding}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div style={{ width: `${fundamentals.diiHolding}%` }} className="bg-purple-500 h-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Retail & Public</span>
                <span className="font-bold text-slate-400">{fundamentals.publicHolding}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div style={{ width: `${fundamentals.publicHolding}%` }} className="bg-slate-500 h-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Growth & Catalysts */}
        <div className="bg-[#141C2E] p-3.5 rounded-xl border border-trade-cardBorder space-y-3">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Growth Drivers & Investment Catalysts</span>
          </h4>

          <div className="space-y-2 text-xs text-slate-300">
            {stock.catalysts.map((cat, i) => (
              <div key={i} className="flex items-start gap-2 bg-[#080B11]/80 p-2 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">{cat}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Competitive Moat:</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
              {fundamentals.moat}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
