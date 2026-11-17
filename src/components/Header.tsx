import React from 'react';
import { MarketIndex } from '../types';
import { 
  Activity, 
  Search, 
  Volume2, 
  VolumeX, 
  Radio, 
  Clock, 
  Sparkles,
  BarChart2,
  Zap,
  Bot,
  Layers,
  Briefcase
} from 'lucide-react';

interface HeaderProps {
  indices: MarketIndex[];
  marketStatus: {
    status: string;
    istTimeString: string;
    badgeColor: string;
    sessionDescription: string;
  };
  isStreaming: boolean;
  onToggleStreaming: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeView: 'terminal' | 'advisory' | 'copilot' | 'heatmap' | 'fundamentals';
  onSelectView: (view: 'terminal' | 'advisory' | 'copilot' | 'heatmap' | 'fundamentals') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  indices,
  marketStatus,
  isStreaming,
  onToggleStreaming,
  soundEnabled,
  onToggleSound,
  activeView,
  onSelectView,
  searchQuery,
  onSearchChange
}) => {
  return (
    <header className="bg-[#0B0F19] border-b border-trade-cardBorder sticky top-0 z-50">
      {/* Top Banner: Logo + Main Nav Tabs + Status Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 gap-4">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-600 shadow-lg shadow-emerald-500/20 text-white font-black text-lg">
            <span>₹</span>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-tight text-white font-sans">
                BHARAT<span className="text-emerald-400">PULSE</span>
              </h1>
              <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-mono">
                AI PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">NSE & BSE Real-Time Intelligence</p>
          </div>
        </div>

        {/* Center: Main View Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-[#141C2E]/80 p-1 rounded-xl border border-trade-cardBorder text-xs font-semibold">
          <button
            onClick={() => onSelectView('terminal')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'terminal'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => onSelectView('advisory')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'advisory'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-300" />
            <span>AI Advisory (Best Profit)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => onSelectView('copilot')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'copilot'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Chanakya AI Copilot</span>
          </button>

          <button
            onClick={() => onSelectView('heatmap')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'heatmap'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sector Heatmap</span>
          </button>

          <button
            onClick={() => onSelectView('fundamentals')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === 'fundamentals'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Fundamentals</span>
          </button>
        </nav>

        {/* Right: Search + Market Clock & Live Status Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Search Box */}
          <div className="relative hidden md:block w-48 lg:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search NSE stock..."
              className="w-full bg-[#141C2E] border border-trade-cardBorder rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Market Status Pill */}
          <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono ${marketStatus.badgeColor}`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="font-bold">{marketStatus.status}</span>
            <span className="opacity-70 font-sans">({marketStatus.istTimeString} IST)</span>
          </div>

          {/* Live Stream Toggle */}
          <button
            onClick={onToggleStreaming}
            title={isStreaming ? 'Pause Real-Time Price Simulation' : 'Resume Real-Time Price Simulation'}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-bold font-mono rounded-lg border transition-all ${
              isStreaming
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'animate-pulse text-emerald-400' : 'text-slate-500'}`} />
            <span>{isStreaming ? 'STREAM: ON' : 'PAUSED'}</span>
          </button>

          {/* Audio Chime Mute Button */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Trade Chimes' : 'Unmute Trade Chimes'}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-trade-cardBorder"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Ticker Tape: Real-Time Indian Indices & Volatility Bar */}
      <div className="flex items-center px-4 py-1.5 bg-[#080B11] border-t border-trade-cardBorder/70 overflow-x-auto scrollbar-none text-xs font-mono">
        <div className="flex items-center space-x-6 min-w-max">
          {indices.map((idx) => {
            const isUp = idx.change >= 0;
            return (
              <div key={idx.symbol} className="flex items-center space-x-2">
                <span className="font-bold text-slate-300">{idx.symbol}:</span>
                <span className="font-semibold text-white">₹{idx.price.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</span>
                <span className={`flex items-center text-[11px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? '+' : ''}{idx.change.toFixed(1)} ({isUp ? '+' : ''}{idx.changePercent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
};
