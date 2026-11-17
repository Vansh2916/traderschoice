import React, { useState } from 'react';
import { Stock } from '../types';
import { Search, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';

interface WatchlistProps {
  stocks: Stock[];
  selectedSymbol: string;
  onSelectStock: (symbol: string) => void;
  searchQuery: string;
}

export const Watchlist: React.FC<WatchlistProps> = ({
  stocks,
  selectedSymbol,
  onSelectStock,
  searchQuery
}) => {
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');

  const sectors = ['ALL', 'Banking & Finance', 'Information Technology', 'Automobile', 'Consumer Tech', 'Energy & Conglomerate'];

  const filtered = stocks.filter((s) => {
    const matchesSearch = s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'ALL' || s.sector === sectorFilter;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="flex flex-col h-full bg-[#0F1523] rounded-xl border border-trade-cardBorder overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-3 bg-[#141C2E] border-b border-trade-cardBorder">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              NSE Watchlist
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {filtered.length}
            </span>
          </div>
        </div>

        {/* Sector Quick Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[10px] scrollbar-none">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSectorFilter(sec)}
              className={`px-2 py-0.8 rounded-md whitespace-nowrap font-medium transition-all ${
                sectorFilter === sec
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#080B11] text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec === 'ALL' ? 'All' : sec.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Stock List Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {filtered.map((stock) => {
          const isSelected = stock.symbol === selectedSymbol;
          const isUp = stock.change >= 0;

          return (
            <button
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className={`w-full p-3 text-left transition-all flex items-center justify-between group ${
                isSelected
                  ? 'bg-blue-600/15 border-l-4 border-l-blue-500'
                  : 'hover:bg-[#141C2E]/60 border-l-4 border-l-transparent'
              }`}
            >
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className={`text-xs font-bold font-sans ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                    {stock.symbol}
                  </span>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                    {stock.exchange}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px] mt-0.5">
                  {stock.name}
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs font-bold text-slate-100">
                  ₹{stock.price.toFixed(2)}
                </div>
                <div className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
