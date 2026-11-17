# 🇮🇳 Bharat Pulse AI Terminal
### Real-Time Indian Stock Market (NSE & BSE) Intelligence, Technical Charts & AI Wealth Advisory Platform

Bharat Pulse is a high-performance, institutional-grade Indian stock market terminal and intelligent advisory platform engineered to empower traders and investors with **real-time market analytics**, **interactive TradingView-caliber charts**, **high-conviction swing/momentum profit trades**, and **long-term multibagger wealth compounders**.

---

## 🌟 Key Capabilities & Features

### 1. 📊 Interactive TradingView-Style Technical Charts
- **Dual Chart Modes**: High-precision 60fps Candlesticks (with real open/high/low/close wicks) and smooth Gradient Area curves.
- **Multiple Timeframes**: `1m`, `5m`, `15m`, `1H`, `1D`, `1W`, `1M`, `1Y`.
- **Institutional Technical Overlays**:
  - **EMA 20** (Short-term trend momentum)
  - **EMA 50** (Medium-term dynamic support)
  - **EMA 200** (Institutional bull/bear pivot line)
  - **Bollinger Bands** (20, 2) volatility envelopes
  - **VWAP** (Volume-Weighted Average Price)
- **Sub-Chart Oscillators**:
  - **RSI (14)** with Overbought (70) and Oversold (30) threshold zones.
  - **MACD (12, 26, 9)** with Signal Line and green/red histogram bars.
  - **Volume Bars** color-coded by bar direction.
- **Interactive Inspection Crosshair**: Hover anywhere to view real-time timestamp, Open, High, Low, Close, Volume, and indicator values.

### 2. ⚡ AI Advisory Engine ("Best Profit & Long-Term Gain")
- **Best Profit & Swing Momentum Setups**:
  - Scans NSE/BSE heavyweights for high-probability setups (Breakouts, 50 EMA pullbacks, RSI divergence).
  - Explicit actionable parameters: **Entry Price Zone**, **Target 1 (Quick Profit)**, **Target 2 (Extended Runner)**, **Strict Stop Loss (SL)**, **Risk-to-Reward Ratio** (e.g., 1:2.8), and **Confidence Score** (85%–95%).
  - Detailed technical catalyst explanation.
- **Long-Term Wealth Compounders (3–5 Years)**:
  - Multibagger quantitative scorecard (Moat, Quality, Growth, Valuation).
  - Financial ratios: P/E vs Industry P/E, PEG Ratio, ROCE %, ROE %, Debt-to-Equity, FII/DII institutional holdings.
  - DCF Intrinsic Fair Value & Margin of Safety %.
  - 1-Year and 3-Year price projection targets with expected CAGR %.

### 3. 🤖 Chanakya AI Copilot
- Built-in AI market assistant fluent in Indian market dynamics (NIFTY expiry, RBI policy, corporate earnings, sectoral rotations).
- One-click prompt chips:
  - 🚀 *Top Swing Trades for Today*
  - 💎 *Top Multibaggers for 3-5 Years*
  - 🛡️ *Highest Dividend Cash Cows*
  - 📊 *Detailed Technical Breakdown of Selected Stock*
- Natural language query box for instant analysis of any stock.

### 4. 💼 Simulated Paper Trading & 5-Level Market Depth (DOM)
- **Virtual Starting Capital**: ₹10,00,000 (10 Lakhs INR).
- **Execution**: Instant Market & Limit BUY and SELL orders with custom quantity, Stop Loss, and Take Profit.
- **5-Level Order Book (DOM)**: Displays top 5 Bids and Asks with order counts, quantities, and real-time buyer vs seller pressure ratio.
- **Holdings Ledger**: Real-time unrealized and realized P&L tracking, position sizing, and one-click square off.
- **Web Audio Sound Effects**: Synthesized audio chimes for trade executions and tick updates.

### 5. 🔥 Sector Heatmap & Market Breadth
- **NSE Advances vs Declines** breadth ratio gauge.
- **Sectoral Performance Treemap**: Banking, IT, Auto, FMCG, Metals, Pharma, Energy, Defense.
- **Institutional Flow Tracker**: Real-time FII and DII net cash buy/sell figures in ₹ Crores.
- **India VIX Volatility Gauge**: Real-time volatility regime evaluation.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Launch
```bash
# 1. Clone or navigate to the project directory
cd /Users/vanshrustagi/Desktop/Trading

# 2. Start the development server
npm run dev
# or
npm start
```
The terminal will launch at **`http://localhost:3000`** (or the port specified by Vite).

### Production Build
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack
- **Frontend Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS (Fintech Bloomberg/Linear dark mode aesthetic)
- **Icons**: Lucide React
- **Charting**: High-performance Canvas 2D engine with sub-pixel rendering & crosshairs
- **Audio Engine**: Native Web Audio API procedural sound synthesizer
