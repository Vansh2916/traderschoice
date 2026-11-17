import React, { useState, useEffect, useRef } from 'react';
import { Stock, TimeFrame, Candle } from '../types';
import { generateCandlesForStock } from '../utils/indicators';
import { 
  TrendingUp, 
  BarChart2, 
  Activity, 
  Layers, 
  Eye, 
  EyeOff, 
  Maximize2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface StockChartProps {
  stock: Stock;
  onQuickTrade?: (action: 'BUY' | 'SELL') => void;
}

export const StockChart: React.FC<StockChartProps> = ({ stock, onQuickTrade }) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');
  const [chartType, setChartType] = useState<'candle' | 'area'>('candle');
  const [showEMA20, setShowEMA20] = useState<boolean>(true);
  const [showEMA50, setShowEMA50] = useState<boolean>(true);
  const [showEMA200, setShowEMA200] = useState<boolean>(false);
  const [showBollinger, setShowBollinger] = useState<boolean>(false);
  const [showVWAP, setShowVWAP] = useState<boolean>(true);
  const [showRSI, setShowRSI] = useState<boolean>(true);
  const [showMACD, setShowMACD] = useState<boolean>(false);

  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Generate candles whenever stock or timeframe changes
  const [candles, setCandles] = useState<Candle[]>(() => 
    generateCandlesForStock(stock.price, stock.changePercent, '1D', 65)
  );

  useEffect(() => {
    const count = timeframe === '1m' || timeframe === '5m' ? 50 : 65;
    setCandles(generateCandlesForStock(stock.price, stock.changePercent, timeframe, count));
  }, [stock.symbol, timeframe, stock.price]);

  // Redraw canvas on resize, data change, hover change, or indicator toggles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Layout partitioning:
    // Main price chart: 65% of height (or 85% if subcharts off)
    // Volume & Oscillators: remaining 35%
    const subchartCount = (showRSI ? 1 : 0) + (showMACD ? 1 : 0);
    const subchartHeight = subchartCount === 2 ? 80 : subchartCount === 1 ? 100 : 0;
    const volumeHeight = 55;
    const priceChartHeight = height - subchartHeight - volumeHeight - 30; // 30px for time axis

    // Clear background
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, width, height);

    if (candles.length === 0) return;

    // Calculate price domain
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    candles.forEach((c) => {
      minPrice = Math.min(minPrice, c.low);
      maxPrice = Math.max(maxPrice, c.high);
      if (showBollinger && c.bbLower && c.bbUpper) {
        minPrice = Math.min(minPrice, c.bbLower);
        maxPrice = Math.max(maxPrice, c.bbUpper);
      }
      maxVolume = Math.max(maxVolume, c.volume);
    });

    const pricePadding = (maxPrice - minPrice) * 0.08;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice || 1;

    // Drawing coordinates helper
    const candleWidth = Math.max(2, (width - 70) / candles.length);
    const spacing = candleWidth * 0.25;
    const bodyWidth = Math.max(1.5, candleWidth - spacing);

    const getX = (index: number) => 15 + index * candleWidth + candleWidth / 2;
    const getY = (price: number) => priceChartHeight - ((price - minPrice) / priceRange) * priceChartHeight + 10;

    // 1. Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Horizontal price grid lines
    const gridStep = priceRange / 5;
    for (let i = 0; i <= 5; i++) {
      const p = minPrice + (i * gridStep);
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(width - 65, y);
      ctx.stroke();

      // Right axis price label
      ctx.fillStyle = '#64748B';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`₹${p.toFixed(1)}`, width - 60, y + 3);
    }
    ctx.setLineDash([]);

    // 2. Draw Bollinger Bands Cloud if enabled
    if (showBollinger) {
      ctx.beginPath();
      for (let i = 0; i < candles.length; i++) {
        const x = getX(i);
        const yUpper = getY(candles[i].bbUpper || candles[i].high);
        if (i === 0) ctx.moveTo(x, yUpper);
        else ctx.lineTo(x, yUpper);
      }
      for (let i = candles.length - 1; i >= 0; i--) {
        const x = getX(i);
        const yLower = getY(candles[i].bbLower || candles[i].low);
        ctx.lineTo(x, yLower);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(59, 130, 246, 0.06)';
      ctx.fill();

      // Upper & Lower boundary strokes
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Draw EMA lines
    const drawLineIndicator = (values: (number | undefined)[], color: string, widthPx: number = 1.5, dashed: boolean = false) => {
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < candles.length; i++) {
        const val = values[i];
        if (val !== undefined && !isNaN(val)) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = widthPx;
      if (dashed) ctx.setLineDash([3, 3]);
      else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    if (showEMA20) drawLineIndicator(candles.map(c => c.ema20), '#06B6D4', 1.8);
    if (showEMA50) drawLineIndicator(candles.map(c => c.ema50), '#F59E0B', 1.8);
    if (showEMA200) drawLineIndicator(candles.map(c => c.ema200), '#A855F7', 2);
    if (showVWAP) drawLineIndicator(candles.map(c => c.vwap), '#EAB308', 1.5, true);

    // 4. Draw Main Price Chart (Candlestick or Area)
    if (chartType === 'area') {
      // Area gradient
      const gradient = ctx.createLinearGradient(0, 10, 0, priceChartHeight);
      const isOverallUp = stock.change >= 0;
      gradient.addColorStop(0, isOverallUp ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

      ctx.beginPath();
      ctx.moveTo(getX(0), priceChartHeight + 10);
      for (let i = 0; i < candles.length; i++) {
        ctx.lineTo(getX(i), getY(candles[i].close));
      }
      ctx.lineTo(getX(candles.length - 1), priceChartHeight + 10);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Line stroke
      ctx.beginPath();
      for (let i = 0; i < candles.length; i++) {
        const x = getX(i);
        const y = getY(candles[i].close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = isOverallUp ? '#10B981' : '#EF4444';
      ctx.lineWidth = 2.2;
      ctx.stroke();
    } else {
      // Candlestick rendering
      candles.forEach((c, i) => {
        const x = getX(i);
        const isBullish = c.close >= c.open;
        const candleColor = isBullish ? '#10B981' : '#EF4444';
        const yOpen = getY(c.open);
        const yClose = getY(c.close);
        const yHigh = getY(c.high);
        const yLow = getY(c.low);

        // Wick
        ctx.strokeStyle = candleColor;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, yHigh);
        ctx.lineTo(x, yLow);
        ctx.stroke();

        // Body
        const topY = Math.min(yOpen, yClose);
        const bodyH = Math.max(1.8, Math.abs(yClose - yOpen));
        ctx.fillStyle = candleColor;
        ctx.fillRect(x - bodyWidth / 2, topY, bodyWidth, bodyH);
      });
    }

    // 5. Draw Volume Bars
    const volTopY = priceChartHeight + 15;
    candles.forEach((c, i) => {
      const x = getX(i);
      const isBullish = c.close >= c.open;
      const volBarH = (c.volume / (maxVolume || 1)) * (volumeHeight - 12);
      ctx.fillStyle = isBullish ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)';
      ctx.fillRect(x - bodyWidth / 2, volTopY + (volumeHeight - 12) - volBarH, bodyWidth, volBarH);
    });

    // Volume label
    ctx.fillStyle = '#64748B';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('VOL', 15, volTopY + 12);

    // 6. Draw Oscillators (RSI / MACD)
    let currentOffsetY = volTopY + volumeHeight + 5;

    if (showRSI) {
      const rsiH = subchartHeight / subchartCount - 15;
      
      // RSI background & zones
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.fillRect(15, currentOffsetY, width - 80, rsiH);

      // 70 and 30 guide lines
      const y70 = currentOffsetY + rsiH - (70 / 100) * rsiH;
      const y30 = currentOffsetY + rsiH - (30 / 100) * rsiH;
      const y50 = currentOffsetY + rsiH - (50 / 100) * rsiH;

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.moveTo(15, y70);
      ctx.lineTo(width - 65, y70);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.beginPath();
      ctx.moveTo(15, y30);
      ctx.lineTo(width - 65, y30);
      ctx.stroke();

      // Middle 50 line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(15, y50);
      ctx.lineTo(width - 65, y50);
      ctx.stroke();
      ctx.setLineDash([]);

      // RSI Line
      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = getX(i);
        const rsiVal = c.rsi || 50;
        const y = currentOffsetY + rsiH - (rsiVal / 100) * rsiH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#8B5CF6';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = '#8B5CF6';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`RSI(14): ${candles[candles.length - 1]?.rsi || 50}`, 15, currentOffsetY + 12);
      ctx.fillStyle = '#64748B';
      ctx.fillText('70', width - 58, y70 + 3);
      ctx.fillText('30', width - 58, y30 + 3);

      currentOffsetY += rsiH + 15;
    }

    if (showMACD) {
      const macdH = subchartHeight / subchartCount - 15;
      const macdZero = currentOffsetY + macdH / 2;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      ctx.moveTo(15, macdZero);
      ctx.lineTo(width - 65, macdZero);
      ctx.stroke();

      // Draw Histogram
      candles.forEach((c, i) => {
        const x = getX(i);
        const hist = c.macd?.hist || 0;
        const barH = (hist * 2.5);
        ctx.fillStyle = hist >= 0 ? '#10B981' : '#EF4444';
        ctx.fillRect(x - bodyWidth / 2, macdZero - barH, bodyWidth, barH);
      });

      // Draw MACD and Signal
      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = getX(i);
        const val = c.macd?.macd || 0;
        const y = macdZero - (val * 2.5);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.beginPath();
      candles.forEach((c, i) => {
        const x = getX(i);
        const val = c.macd?.signal || 0;
        const y = macdZero - (val * 2.5);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#FB923C';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('MACD (12, 26, 9)', 15, currentOffsetY + 12);
    }

    // 7. Laser Line at Current Market Price
    const lastY = getY(stock.price);
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = stock.change >= 0 ? '#10B981' : '#EF4444';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(15, lastY);
    ctx.lineTo(width - 65, lastY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price badge on the right scale
    ctx.fillStyle = stock.change >= 0 ? '#10B981' : '#EF4444';
    ctx.fillRect(width - 64, lastY - 9, 60, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`₹${stock.price.toFixed(1)}`, width - 60, lastY + 4);

    // 8. Crosshair Cursor on Hover
    if (mousePos && hoverIndex !== null && candles[hoverIndex]) {
      const activeCandle = candles[hoverIndex];
      const hx = getX(hoverIndex);
      const hy = getY(activeCandle.close);

      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hx, 10);
      ctx.lineTo(hx, height - 20);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(15, hy);
      ctx.lineTo(width - 65, hy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point circle
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }

  }, [candles, chartType, showEMA20, showEMA50, showEMA200, showBollinger, showVWAP, showRSI, showMACD, hoverIndex, mousePos, stock.price, stock.change]);

  // Handle Mouse Hover on Canvas for Interactive Inspection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePos({ x, y });

    const candleWidth = Math.max(2, (rect.width - 70) / candles.length);
    const index = Math.floor((x - 15) / candleWidth);
    if (index >= 0 && index < candles.length) {
      setHoverIndex(index);
    } else {
      setHoverIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoverIndex(null);
  };

  const activeCandle = hoverIndex !== null && candles[hoverIndex] 
    ? candles[hoverIndex] 
    : candles[candles.length - 1];

  return (
    <div className="flex flex-col h-full bg-[#0F1523] rounded-xl border border-trade-cardBorder overflow-hidden shadow-2xl">
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#141C2E]/90 border-b border-trade-cardBorder gap-2">
        {/* Left: Timeframe Switcher */}
        <div className="flex items-center space-x-1 bg-[#080B11]/80 p-0.5 rounded-lg border border-slate-800">
          {(['1m', '5m', '15m', '1H', '1D', '1W', '1M', '1Y'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Center: Chart Type (Candle vs Area) */}
        <div className="flex items-center space-x-1 bg-[#080B11]/80 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setChartType('candle')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              chartType === 'candle'
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Candles</span>
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              chartType === 'area'
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Area</span>
          </button>
        </div>

        {/* Right: Technical Indicators Toggles */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setShowEMA20(!showEMA20)}
            className={`px-2 py-1 rounded font-mono transition-all ${
              showEMA20 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            EMA20
          </button>
          <button
            onClick={() => setShowEMA50(!showEMA50)}
            className={`px-2 py-1 rounded font-mono transition-all ${
              showEMA50 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            EMA50
          </button>
          <button
            onClick={() => setShowEMA200(!showEMA200)}
            className={`px-2 py-1 rounded font-mono transition-all ${
              showEMA200 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            EMA200
          </button>
          <button
            onClick={() => setShowVWAP(!showVWAP)}
            className={`px-2 py-1 rounded font-mono transition-all ${
              showVWAP ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            VWAP
          </button>
          <button
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2 py-1 rounded font-mono transition-all ${
              showBollinger ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Bollinger
          </button>
          <button
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2 py-1 rounded font-mono transition-all ${
              showRSI ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            RSI
          </button>
          <button
            onClick={() => setShowMACD(!showMACD)}
            className={`px-2 py-1 rounded font-mono transition-all ${
              showMACD ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            MACD
          </button>
        </div>
      </div>

      {/* Live Crosshair Inspection Bar */}
      {activeCandle && (
        <div className="flex flex-wrap items-center justify-between px-4 py-1.5 bg-[#0A0E17] text-[11px] font-mono border-b border-trade-cardBorder/60 text-slate-300 gap-x-4 gap-y-1">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400 font-sans flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              {activeCandle.time}
            </span>
            <span>O: <strong className="text-slate-100">₹{activeCandle.open}</strong></span>
            <span>H: <strong className="text-emerald-400">₹{activeCandle.high}</strong></span>
            <span>L: <strong className="text-rose-400">₹{activeCandle.low}</strong></span>
            <span>C: <strong className={activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-rose-400'}>₹{activeCandle.close}</strong></span>
            <span>Vol: <strong className="text-slate-200">{(activeCandle.volume / 1000).toFixed(1)}k</strong></span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            {showEMA20 && activeCandle.ema20 && (
              <span className="text-cyan-400">EMA20: ₹{activeCandle.ema20}</span>
            )}
            {showEMA50 && activeCandle.ema50 && (
              <span className="text-amber-400">EMA50: ₹{activeCandle.ema50}</span>
            )}
            {showVWAP && activeCandle.vwap && (
              <span className="text-yellow-400">VWAP: ₹{activeCandle.vwap}</span>
            )}
            {showRSI && activeCandle.rsi && (
              <span className="text-indigo-400">RSI(14): {activeCandle.rsi}</span>
            )}
          </div>
        </div>
      )}

      {/* Main Interactive Canvas Area */}
      <div ref={containerRef} className="relative flex-1 w-full min-h-[380px] cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Quick Trade Floating Overlays */}
        {onQuickTrade && (
          <div className="absolute top-3 left-4 flex items-center space-x-2 pointer-events-auto">
            <button
              onClick={() => onQuickTrade('BUY')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-950/60 transition-all active:scale-95 border border-emerald-400/40"
            >
              <span>BUY</span>
              <span className="text-[10px] font-mono opacity-80">₹{stock.price}</span>
            </button>
            <button
              onClick={() => onQuickTrade('SELL')}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-rose-950/60 transition-all active:scale-95 border border-rose-400/40"
            >
              <span>SELL / SHORT</span>
              <span className="text-[10px] font-mono opacity-80">₹{stock.price}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
