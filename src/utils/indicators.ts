import { Candle } from '../types';

/**
 * Calculates EMA series for a given period
 */
export function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  
  if (prices.length === 0) return emaArray;
  
  // Start with SMA for first period
  let initialSma = 0;
  const initialPeriod = Math.min(period, prices.length);
  for (let i = 0; i < initialPeriod; i++) {
    initialSma += prices[i];
  }
  initialSma /= initialPeriod;
  
  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      emaArray.push(prices[0]);
    } else if (i < period) {
      emaArray.push((prices[i] * k) + (emaArray[i - 1] * (1 - k)));
    } else {
      emaArray.push((prices[i] * k) + (emaArray[i - 1] * (1 - k)));
    }
  }
  return emaArray;
}

/**
 * Calculates RSI (14) series
 */
export function calculateRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  if (closes.length <= period) {
    return closes.map(() => 50);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // First RSI
  for (let i = 0; i < period; i++) {
    rsi.push(50);
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(100 - (100 / (1 + rs)));

  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const currentGain = change > 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    const currentRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + currentRs)));
  }

  return rsi;
}

/**
 * Generates rich candlestick series with precalculated indicators for any timeframe
 */
export function generateCandlesForStock(
  basePrice: number,
  changePercent: number,
  timeframe: string = '1D',
  count: number = 60
): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  
  let intervalMs = 24 * 60 * 60 * 1000; // 1D default
  let volatility = 0.012; // 1.2% per bar
  
  switch (timeframe) {
    case '1m':
      intervalMs = 60 * 1000;
      volatility = 0.0018;
      break;
    case '5m':
      intervalMs = 5 * 60 * 1000;
      volatility = 0.0035;
      break;
    case '15m':
      intervalMs = 15 * 60 * 1000;
      volatility = 0.0055;
      break;
    case '1H':
      intervalMs = 60 * 60 * 1000;
      volatility = 0.0085;
      break;
    case '1D':
      intervalMs = 24 * 60 * 60 * 1000;
      volatility = 0.016;
      break;
    case '1W':
      intervalMs = 7 * 24 * 60 * 60 * 1000;
      volatility = 0.032;
      break;
    case '1M':
      intervalMs = 30 * 24 * 60 * 60 * 1000;
      volatility = 0.065;
      break;
    case '1Y':
      intervalMs = 365 * 24 * 60 * 60 * 1000;
      volatility = 0.12;
      break;
  }

  // Work backwards from basePrice so the last candle ends near basePrice
  const closes: number[] = new Array(count);
  closes[count - 1] = basePrice;
  
  // Drift factor based on overall trend
  const trendSign = changePercent >= 0 ? 1 : -1;
  const drift = (changePercent / 100) / count;

  // Generate price trajectory backwards
  for (let i = count - 2; i >= 0; i--) {
    // seeded random variation
    const noise = (Math.sin(i * 1.7) * 0.5 + Math.cos(i * 0.9) * 0.5) * volatility;
    const randomStep = (Math.random() - 0.48) * volatility;
    const step = randomStep + noise - (drift * 0.5);
    closes[i] = closes[i + 1] * (1 - step);
  }

  // Calculate EMAs and RSI on close array
  const ema20Series = calculateEMA(closes, 20);
  const ema50Series = calculateEMA(closes, 50);
  const ema200Series = calculateEMA(closes, 200);
  const rsiSeries = calculateRSI(closes, 14);

  let cumulativeTypicalVolume = 0;
  let cumulativeVolume = 0;

  for (let i = 0; i < count; i++) {
    const timestamp = now - ((count - 1 - i) * intervalMs);
    const dateObj = new Date(timestamp);
    
    let timeLabel = '';
    if (timeframe === '1m' || timeframe === '5m' || timeframe === '15m' || timeframe === '1H') {
      timeLabel = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      timeLabel = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    }

    const close = closes[i];
    const prevClose = i > 0 ? closes[i - 1] : close * 0.998;
    const open = prevClose;
    
    // High and Low with realistic wick extensions
    const maxBody = Math.max(open, close);
    const minBody = Math.min(open, close);
    const bodyHeight = maxBody - minBody;
    
    const upperWick = Math.random() * (bodyHeight * 0.8 + close * volatility * 0.3);
    const lowerWick = Math.random() * (bodyHeight * 0.8 + close * volatility * 0.3);
    
    const high = Number((maxBody + upperWick).toFixed(2));
    const low = Number(Math.max(1, minBody - lowerWick).toFixed(2));
    const fixedOpen = Number(open.toFixed(2));
    const fixedClose = Number(close.toFixed(2));
    
    const baseVol = Math.floor(basePrice > 2000 ? 45000 : 250000);
    const volNoise = Math.random() * 1.5 + 0.3;
    const volume = Math.floor(baseVol * volNoise * (Math.abs(fixedClose - fixedOpen) / (basePrice * volatility + 0.1) + 0.5));

    // VWAP calculation
    const typicalPrice = (high + low + fixedClose) / 3;
    cumulativeTypicalVolume += typicalPrice * volume;
    cumulativeVolume += volume;
    const vwap = Number((cumulativeTypicalVolume / Math.max(1, cumulativeVolume)).toFixed(2));

    // Bollinger bands approximate
    const ema20 = ema20Series[i] || fixedClose;
    const stdDev = ema20 * volatility * 1.2;

    // MACD approximation
    const macdVal = (ema20Series[i] - (ema50Series[i] || ema20Series[i])) * 1.5;
    const macdSig = macdVal * 0.8;

    candles.push({
      time: timeLabel,
      timestamp,
      open: fixedOpen,
      high,
      low,
      close: fixedClose,
      volume,
      ema20: Number(ema20Series[i].toFixed(2)),
      ema50: Number(ema50Series[i].toFixed(2)),
      ema200: Number(ema200Series[i].toFixed(2)),
      rsi: Number(rsiSeries[i].toFixed(1)),
      macd: {
        macd: Number(macdVal.toFixed(2)),
        signal: Number(macdSig.toFixed(2)),
        hist: Number((macdVal - macdSig).toFixed(2))
      },
      bbUpper: Number((ema20 + 2 * stdDev).toFixed(2)),
      bbLower: Number((ema20 - 2 * stdDev).toFixed(2)),
      vwap
    });
  }

  return candles;
}
