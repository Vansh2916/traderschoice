import React, { useState } from 'react';
import { Stock, TradePosition, PortfolioSummary } from '../types';
import { generateOrderBook, SoundEffects } from '../services/marketEngine';
import { 
  Briefcase, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Scale,
  DollarSign
} from 'lucide-react';

interface TradingTerminalProps {
  stock: Stock;
  positions: TradePosition[];
  portfolio: PortfolioSummary;
  onPlaceOrder: (order: {
    symbol: string;
    stockName: string;
    type: 'BUY' | 'SELL';
    qty: number;
    price: number;
    stopLoss?: number;
    target?: number;
  }) => void;
  onSquareOff: (positionId: string) => void;
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  stock,
  positions,
  portfolio,
  onPlaceOrder,
  onSquareOff
}) => {
  const [activeTab, setActiveTab] = useState<'trade' | 'depth' | 'positions'>('trade');
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderPriceType, setOrderPriceType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [qty, setQty] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number>(stock.price);
  const [stopLoss, setStopLoss] = useState<string>(stock.technicals.support1.toString());
  const [target, setTarget] = useState<string>(stock.technicals.resistance1.toString());
  const [orderNotification, setOrderNotification] = useState<string | null>(null);

  const orderBook = generateOrderBook(stock.price);
  const totalBids = orderBook.reduce((acc, curr) => acc + curr.bidQty, 0);
  const totalAsks = orderBook.reduce((acc, curr) => acc + curr.askQty, 0);
  const buyerPercent = Math.round((totalBids / (totalBids + totalAsks || 1)) * 100);

  const execPrice = orderPriceType === 'MARKET' ? stock.price : limitPrice;
  const totalOrderAmount = Number((execPrice * qty).toFixed(2));

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0) return;

    if (totalOrderAmount > portfolio.cashBalance && orderType === 'BUY') {
      alert(`Insufficient funds! Margin required is ₹${totalOrderAmount.toLocaleString('en-IN')}, available is ₹${portfolio.cashBalance.toLocaleString('en-IN')}`);
      return;
    }

    onPlaceOrder({
      symbol: stock.symbol,
      stockName: stock.name,
      type: orderType,
      qty,
      price: execPrice,
      stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
      target: target ? parseFloat(target) : undefined
    });

    SoundEffects.playOrderSuccess();

    setOrderNotification(`Executed ${orderType} ${qty} shares of ${stock.symbol} @ ₹${execPrice}`);
    setTimeout(() => setOrderNotification(null), 4000);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F1523] rounded-xl border border-trade-cardBorder overflow-hidden shadow-2xl">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#141C2E] border-b border-trade-cardBorder">
        <div className="flex items-center space-x-1.5 bg-[#080B11]/80 p-0.5 rounded-lg border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('trade')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'trade'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Order Pad
          </button>
          <button
            onClick={() => setActiveTab('depth')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'depth'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Market Depth (DOM)
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'positions'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Holdings</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {positions.length}
            </span>
          </button>
        </div>

        {/* Available Virtual Capital Pill */}
        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 justify-end">
            <Wallet className="w-3 h-3 text-emerald-400" />
            <span>Virtual Capital</span>
          </div>
          <div className="text-xs font-bold font-mono text-emerald-400">
            ₹{portfolio.cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {orderNotification && (
        <div className="mx-3 mt-2 p-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{orderNotification}</span>
        </div>
      )}

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TAB 1: ORDER PAD */}
        {activeTab === 'trade' && (
          <form onSubmit={handleExecute} className="space-y-4">
            {/* BUY / SELL Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#080B11] rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setOrderType('BUY')}
                className={`py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  orderType === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>BUY (LONG)</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('SELL')}
                className={`py-2 text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-all ${
                  orderType === 'SELL'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>SELL (SHORT)</span>
              </button>
            </div>

            {/* Quantity Selector */}
            <div>
              <div className="flex justify-between items-center text-xs text-slate-300 mb-1.5">
                <label className="font-semibold">Quantity (Shares)</label>
                <div className="flex space-x-1">
                  {[10, 25, 50, 100].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setQty(preset)}
                      className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 rounded"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-[#080B11] border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-blue-500 outline-none"
              />
            </div>

            {/* Price Type (Market vs Limit) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderPriceType('MARKET')}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  orderPriceType === 'MARKET'
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                    : 'bg-[#080B11] text-slate-400 border-slate-800'
                }`}
              >
                Market (₹{stock.price})
              </button>
              <button
                type="button"
                onClick={() => setOrderPriceType('LIMIT')}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  orderPriceType === 'LIMIT'
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                    : 'bg-[#080B11] text-slate-400 border-slate-800'
                }`}
              >
                Limit Order
              </button>
            </div>

            {orderPriceType === 'LIMIT' && (
              <div>
                <label className="block text-xs text-slate-300 mb-1">Limit Price (₹)</label>
                <input
                  type="number"
                  step="0.05"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(parseFloat(e.target.value) || stock.price)}
                  className="w-full bg-[#080B11] border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:border-blue-500 outline-none"
                />
              </div>
            )}

            {/* Stop Loss and Target Price (Risk Management) */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono text-rose-400 mb-1">STOP LOSS (₹)</label>
                <input
                  type="number"
                  step="0.1"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-[#080B11] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-rose-300 focus:border-rose-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-emerald-400 mb-1">TARGET PROFIT (₹)</label>
                <input
                  type="number"
                  step="0.1"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-[#080B11] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-emerald-300 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Total Margin Requirement */}
            <div className="p-3 bg-[#080B11] rounded-lg border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Margin Required:</span>
                <span className="font-bold text-slate-200">₹{totalOrderAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Charges (STT/GST):</span>
                <span className="text-slate-400">₹{(totalOrderAmount * 0.0003).toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-2.5 text-sm font-bold rounded-lg shadow-xl transition-all active:scale-95 ${
                orderType === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60'
              }`}
            >
              EXECUTE {orderType} ({qty} @ ₹{execPrice})
            </button>
          </form>
        )}

        {/* TAB 2: MARKET DEPTH (DOM) */}
        {activeTab === 'depth' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>BUYERS: <strong className="text-emerald-400">{buyerPercent}%</strong></span>
              <span>SELLERS: <strong className="text-rose-400">{100 - buyerPercent}%</strong></span>
            </div>

            {/* Ratio Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div style={{ width: `${buyerPercent}%` }} className="bg-emerald-500 h-full" />
              <div style={{ width: `${100 - buyerPercent}%` }} className="bg-rose-500 h-full" />
            </div>

            {/* 5-Level Depth Table */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              {/* Bid Column */}
              <div className="bg-[#080B11] rounded-lg p-2.5 border border-slate-800/80">
                <div className="text-[10px] text-emerald-400 font-bold mb-2 pb-1 border-b border-slate-800 flex justify-between">
                  <span>BID QTY</span>
                  <span>BID PRICE</span>
                </div>
                <div className="space-y-1.5">
                  {orderBook.map((level, i) => (
                    <div key={i} className="flex justify-between text-slate-300">
                      <span className="text-slate-400">{level.bidQty.toLocaleString()}</span>
                      <span className="text-emerald-400 font-semibold">₹{level.bidPrice}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-1 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
                  <span>Total Bids:</span>
                  <span className="text-emerald-400 font-bold">{totalBids.toLocaleString()}</span>
                </div>
              </div>

              {/* Ask Column */}
              <div className="bg-[#080B11] rounded-lg p-2.5 border border-slate-800/80">
                <div className="text-[10px] text-rose-400 font-bold mb-2 pb-1 border-b border-slate-800 flex justify-between">
                  <span>ASK PRICE</span>
                  <span>ASK QTY</span>
                </div>
                <div className="space-y-1.5">
                  {orderBook.map((level, i) => (
                    <div key={i} className="flex justify-between text-slate-300">
                      <span className="text-rose-400 font-semibold">₹{level.askPrice}</span>
                      <span className="text-slate-400">{level.askQty.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-1 border-t border-slate-800 flex justify-between text-[10px] text-slate-400">
                  <span>Total Asks:</span>
                  <span className="text-rose-400 font-bold">{totalAsks.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOLDINGS / POSITIONS */}
        {activeTab === 'positions' && (
          <div className="space-y-3">
            {positions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No active positions in your virtual ledger.</p>
                <p className="text-[10px] text-slate-600 mt-1">Execute a paper trade to start tracking live P&L!</p>
              </div>
            ) : (
              positions.map((pos) => {
                const isProfit = pos.unrealizedPnl >= 0;
                return (
                  <div
                    key={pos.id}
                    className="p-3 bg-[#080B11] rounded-lg border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${
                          pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {pos.type}
                        </span>
                        <strong className="text-xs text-white">{pos.symbol}</strong>
                        <span className="text-[11px] font-mono text-slate-400">x{pos.qty}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        Avg: ₹{pos.avgPrice} • CMP: ₹{pos.currentPrice}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right font-mono">
                        <div className={`text-xs font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProfit ? '+' : ''}₹{pos.unrealizedPnl.toFixed(2)}
                        </div>
                        <div className={`text-[10px] ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ({isProfit ? '+' : ''}{pos.unrealizedPnlPercent.toFixed(2)}%)
                        </div>
                      </div>

                      <button
                        onClick={() => onSquareOff(pos.id)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 rounded transition-colors"
                        title="Square off position"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
