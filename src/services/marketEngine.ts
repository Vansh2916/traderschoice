import { Stock, MarketIndex, OrderBookLevel } from '../types';

/**
 * Calculates 5-Level Market Depth (Order Book) for a given stock price
 */
export function generateOrderBook(price: number, spreadPercent: number = 0.05): OrderBookLevel[] {
  const levels: OrderBookLevel[] = [];
  const spread = Math.max(0.05, (price * (spreadPercent / 100)));

  for (let i = 1; i <= 5; i++) {
    const bidPrice = Number((price - (spread * i * 0.4) - (Math.random() * 0.05)).toFixed(2));
    const askPrice = Number((price + (spread * i * 0.4) + (Math.random() * 0.05)).toFixed(2));

    const baseQty = Math.floor(Math.max(100, 2000000 / price));
    const bidQty = Math.floor(baseQty * (1 + (Math.random() * 0.8) + (5 - i) * 0.3));
    const askQty = Math.floor(baseQty * (1 + (Math.random() * 0.8) + (5 - i) * 0.3));

    levels.push({
      bidOrders: Math.floor(Math.random() * 25) + 5,
      bidQty,
      bidPrice,
      askPrice,
      askQty,
      askOrders: Math.floor(Math.random() * 25) + 5
    });
  }

  return levels;
}

/**
 * Simulates real-time price tick for a stock
 */
export function simulateStockTick(stock: Stock): Stock {
  const volatility = (stock.technicals.atr14 / stock.price) * 0.12;
  const tickDirection = Math.random() > 0.48 ? 1 : -1;
  const percentageStep = (Math.random() * volatility) * tickDirection;
  
  const rawNewPrice = stock.price * (1 + percentageStep);
  const newPrice = Number(rawNewPrice.toFixed(2));
  const newChange = Number((newPrice - stock.previousClose).toFixed(2));
  const newChangePercent = Number(((newChange / stock.previousClose) * 100).toFixed(2));
  const newDayHigh = Math.max(stock.dayHigh, newPrice);
  const newDayLow = Math.min(stock.dayLow, newPrice);
  const newVolume = stock.volume + Math.floor(Math.random() * 850) + 50;

  return {
    ...stock,
    price: newPrice,
    change: newChange,
    changePercent: newChangePercent,
    dayHigh: newDayHigh,
    dayLow: newDayLow,
    volume: newVolume
  };
}

/**
 * Indian Market IST Status
 */
export function getIndianMarketStatus(): {
  status: 'OPEN' | 'CLOSED' | 'PRE-MARKET' | 'POST-MARKET';
  istTimeString: string;
  badgeColor: string;
  sessionDescription: string;
} {
  const now = new Date();
  
  // Calculate IST Time (UTC + 5:30)
  const utcOffset = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istOffset = 5.5 * 60 * 60000;
  const istDate = new Date(utcOffset + istOffset);

  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const day = istDate.getDay(); // 0 is Sunday, 6 is Saturday

  const istTimeString = istDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const isWeekend = day === 0 || day === 6;

  if (isWeekend) {
    return {
      status: 'CLOSED',
      istTimeString,
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      sessionDescription: 'Weekend Closed (Opens Monday 9:15 AM IST)'
    };
  }

  const timeInMinutes = hours * 60 + minutes;

  // 9:00 AM to 9:15 AM IST = Pre-market
  if (timeInMinutes >= 540 && timeInMinutes < 555) {
    return {
      status: 'PRE-MARKET',
      istTimeString,
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      sessionDescription: 'NSE Pre-Opening Discovery Session'
    };
  }

  // 9:15 AM to 3:30 PM IST = Regular Market
  if (timeInMinutes >= 555 && timeInMinutes < 930) {
    return {
      status: 'OPEN',
      istTimeString,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      sessionDescription: 'NSE & BSE Normal Market Hours'
    };
  }

  // 3:30 PM to 4:00 PM IST = Post Market
  if (timeInMinutes >= 930 && timeInMinutes < 960) {
    return {
      status: 'POST-MARKET',
      istTimeString,
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      sessionDescription: 'Closing Price Settlement Session'
    };
  }

  return {
    status: 'CLOSED',
    istTimeString,
    badgeColor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    sessionDescription: 'Market Closed (Opens 9:15 AM IST)'
  };
}

/**
 * Audio Synthesizer for Terminal sounds (Trade execution chime, alert click)
 */
export class SoundEffects {
  private static ctx: AudioContext | null = null;

  private static getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  static playOrderSuccess(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio might be blocked by browser autoplay policy
    }
  }

  static playTickSound(isUp: boolean): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isUp ? 750 : 380, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore audio error
    }
  }
}
