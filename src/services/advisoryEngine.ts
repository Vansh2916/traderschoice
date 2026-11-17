import { Stock, AdvisorySignal, LongTermAdvice, ChatActionButton } from '../types';

/**
 * Generates Real-time High Profit / Momentum / Swing Trading Signals
 */
export function generateTradingSignals(stocks: Stock[]): AdvisorySignal[] {
  const signals: AdvisorySignal[] = [];

  stocks.forEach((stock) => {
    const { price, technicals, name, symbol, catalysts } = stock;
    const { rsi14, ema20, ema50, supertrend, vwap, atr14, resistance1, resistance2, support1 } = technicals;

    // Condition 1: High Momentum Breakout (Price > 20 EMA & 50 EMA, RSI > 58, Supertrend BUY)
    if (price > ema20 && price > ema50 && rsi14 >= 58 && rsi14 <= 74 && supertrend.direction === 'BUY') {
      const entryLow = Number((price * 0.996).toFixed(1));
      const entryHigh = Number((price * 1.004).toFixed(1));
      const sl = Number(Math.max(support1, price - (atr14 * 1.5)).toFixed(1));
      const risk = price - sl;
      const t1 = Number((price + (risk * 2.0)).toFixed(1));
      const t2 = Number((price + (risk * 3.4)).toFixed(1));
      const gainPercent = Number((((t2 - price) / price) * 100).toFixed(1));
      const riskPercent = Number((((price - sl) / price) * 100).toFixed(1));
      const rrRatio = `1 : ${(gainPercent / Math.max(0.1, riskPercent)).toFixed(1)}`;

      signals.push({
        id: `sig-breakout-${symbol}`,
        symbol,
        stockName: name,
        type: rsi14 > 64 ? 'STRONG BUY' : 'BUY',
        category: 'BREAKOUT',
        entryRange: [entryLow, entryHigh],
        target1: t1,
        target2: t2,
        stopLoss: sl,
        riskRewardRatio: rrRatio,
        timeHorizon: '2 - 5 Days (Swing)',
        confidencePercent: Math.min(95, Math.floor(78 + (rsi14 * 0.22))),
        potentialGainPercent: gainPercent,
        maxRiskPercent: riskPercent,
        catalyst: catalysts[0] || 'Technical breakout on high institutional volume',
        technicalReasoning: [
          `Trading firmly above 20 EMA (₹${ema20}) and 50 EMA (₹${ema50}) indicating bullish momentum`,
          `RSI at ${rsi14} in strong expansion zone without overbought exhaustion`,
          `Supertrend generated strong BUY confirmation with VWAP at ₹${vwap}`,
          `Immediate resistance at ₹${resistance1} primed for multi-day continuation`
        ],
        timestamp: 'Just now'
      });
    }

    // Condition 2: Deep Pullback / Value Buy at Support (RSI between 45 and 55, near 50 EMA or VWAP)
    else if (price >= support1 * 0.985 && price <= ema20 * 1.015 && rsi14 >= 44 && rsi14 <= 57) {
      const entryLow = Number((price * 0.995).toFixed(1));
      const entryHigh = Number((price * 1.002).toFixed(1));
      const sl = Number((support1 * 0.985).toFixed(1));
      const risk = price - sl;
      const t1 = Number((resistance1).toFixed(1));
      const t2 = Number((resistance2).toFixed(1));
      const gainPercent = Number((((t2 - price) / price) * 100).toFixed(1));
      const riskPercent = Number((((price - sl) / price) * 100).toFixed(1));
      const rrRatio = `1 : ${(gainPercent / Math.max(0.1, riskPercent)).toFixed(1)}`;

      signals.push({
        id: `sig-pullback-${symbol}`,
        symbol,
        stockName: name,
        type: 'ACCUMULATE',
        category: 'PULLBACK_VALUE',
        entryRange: [entryLow, entryHigh],
        target1: t1,
        target2: t2,
        stopLoss: sl,
        riskRewardRatio: rrRatio,
        timeHorizon: '1 - 2 Weeks',
        confidencePercent: 88,
        potentialGainPercent: gainPercent,
        maxRiskPercent: riskPercent,
        catalyst: 'Healthy mean-reversion test of key institutional moving average support',
        technicalReasoning: [
          `Stock tested key support level at ₹${support1} with strong rejection of lower wicks`,
          `RSI stabilized around ${rsi14}, exiting oversold territory with positive divergence`,
          `Risk-to-reward highly favorable near 50 EMA floor (₹${ema50})`
        ],
        timestamp: '10 mins ago'
      });
    }

    // Condition 3: Overbought / Book Profit alert (RSI > 75)
    else if (rsi14 >= 71) {
      signals.push({
        id: `sig-profit-${symbol}`,
        symbol,
        stockName: name,
        type: 'BOOK PROFIT',
        category: 'SWING_MOMENTUM',
        entryRange: [price, price],
        target1: Number((price * 0.97).toFixed(1)),
        target2: Number((price * 0.94).toFixed(1)),
        stopLoss: Number((price * 1.025).toFixed(1)),
        riskRewardRatio: '1 : 2.0',
        timeHorizon: '1 - 3 Days',
        confidencePercent: 84,
        potentialGainPercent: 4.5,
        maxRiskPercent: 2.5,
        catalyst: 'Extended rally reaching upper Bollinger Band exhaustion zone',
        technicalReasoning: [
          `RSI at elevated level ${rsi14} signaling short-term overbought state`,
          `Price trading near Upper Bollinger Band (₹${technicals.bollingerBands.upper})`,
          `Advisable to lock partial gains (50%) and trail stop loss to entry`
        ],
        timestamp: '15 mins ago'
      });
    }
  });

  return signals.sort((a, b) => (b.confidencePercent + b.potentialGainPercent) - (a.confidencePercent + a.potentialGainPercent));
}

/**
 * Generates Long-Term Multi-Bagger & Wealth Compounder Scorecard
 */
export function generateLongTermAdvice(stocks: Stock[]): LongTermAdvice[] {
  return stocks.map((stock) => {
    const { symbol, name, price, fundamentals, catalysts } = stock;
    const {
      pe,
      industryPe,
      rocePercent,
      roePercent,
      debtToEquity,
      revenueGrowthYoy,
      profitGrowthYoy,
      moat,
      marginOfSafety,
      fiiHolding,
      diiHolding
    } = fundamentals;

    // Quality Score (0 - 100)
    let quality = 0;
    if (rocePercent >= 30) quality += 35;
    else if (rocePercent >= 20) quality += 28;
    else if (rocePercent >= 15) quality += 20;
    else quality += 10;

    if (roePercent >= 25) quality += 25;
    else if (roePercent >= 18) quality += 20;
    else quality += 12;

    if (debtToEquity < 0.2) quality += 30;
    else if (debtToEquity < 0.6) quality += 22;
    else if (debtToEquity < 1.2) quality += 15;
    else quality += 5;

    if (moat === 'Wide Moat') quality += 10;
    else if (moat === 'Narrow Moat') quality += 5;

    // Growth Score (0 - 100)
    let growth = 0;
    if (profitGrowthYoy >= 30) growth += 50;
    else if (profitGrowthYoy >= 18) growth += 40;
    else if (profitGrowthYoy >= 10) growth += 30;
    else growth += 15;

    if (revenueGrowthYoy >= 25) growth += 40;
    else if (revenueGrowthYoy >= 15) growth += 32;
    else if (revenueGrowthYoy >= 8) growth += 22;
    else growth += 10;

    if (fiiHolding + diiHolding > 40) growth += 10;

    // Valuation Score (0 - 100)
    let valuation = 50;
    if (marginOfSafety > 20) valuation += 35;
    else if (marginOfSafety > 10) valuation += 20;
    else if (marginOfSafety > 0) valuation += 5;
    else valuation -= 15;

    if (pe < industryPe * 0.85) valuation += 15;
    else if (pe > industryPe * 1.5) valuation -= 15;

    // Overall Score
    const overallScore = Math.min(99, Math.max(45, Math.round((quality * 0.38) + (growth * 0.38) + (valuation * 0.24))));

    // Target Projections
    const expectedCagr = Math.round(
      Math.max(12, Math.min(38, (profitGrowthYoy * 0.6) + (rocePercent * 0.3) + (marginOfSafety > 0 ? 5 : 0)))
    );

    const target1Year = Number((price * (1 + (expectedCagr / 100))).toFixed(1));
    const target3Year = Number((price * Math.pow(1 + (expectedCagr / 100), 3)).toFixed(1));

    // Rating determination
    let rating: LongTermAdvice['rating'] = 'STRONG WEALTH COMPOUNDER';
    if (growth >= 85 && profitGrowthYoy > 35) {
      rating = 'GROWTH MULTIBAGGER';
    } else if (fundamentals.dividendYield > 2.5) {
      rating = 'DIVIDEND CASH COW';
    } else if (marginOfSafety > 18) {
      rating = 'VALUE OPPORTUNITY';
    } else if (pe > 90 && marginOfSafety < 5) {
      rating = 'AVOID / OVERVALUED';
    }

    return {
      symbol,
      stockName: name,
      rating,
      overallScore,
      valuationScore: Math.min(98, Math.max(30, valuation)),
      growthScore: Math.min(99, Math.max(35, growth)),
      qualityScore: Math.min(99, Math.max(40, quality)),
      moatScore: moat === 'Wide Moat' ? 95 : moat === 'Narrow Moat' ? 75 : 45,
      fairValue: fundamentals.intrinsicValue,
      target1Year,
      target3Year,
      expectedCagr,
      thesisSummary: stock.description,
      keyDrivers: catalysts,
      risksToWatch: [
        'Macro interest rate trajectory & global inflation pressures',
        'Sectoral raw material margin compression',
        'Valuation multiples re-rating during broader market pullbacks'
      ],
      recommendedAllocation: overallScore > 85 ? '7% - 10% of Core Portfolio' : '3% - 5% of Satellite Portfolio'
    };
  }).sort((a, b) => b.overallScore - a.overallScore);
}

export interface CopilotResult {
  text: string;
  actionButtons?: ChatActionButton[];
  suggestedFollowUps?: string[];
  stockSymbol?: string;
}

/**
 * Intelligent Dynamic AI Copilot Query Engine with Full Context & NLP Awareness
 */
export function generateAICopilotResponse(
  query: string, 
  currentStock: Stock, 
  allStocks: Stock[]
): CopilotResult {
  const q = query.toLowerCase().trim();

  // Helper function to find a stock mentioned anywhere in text
  const findMentionedStock = (text: string): Stock | undefined => {
    // Check symbols first
    for (const s of allStocks) {
      const sym = s.symbol.toLowerCase();
      if (text.includes(sym)) return s;
    }
    // Check common company aliases
    const aliases: Record<string, string> = {
      'reliance': 'RELIANCE',
      'jio': 'RELIANCE',
      'tcs': 'TCS',
      'hdfc': 'HDFCBANK',
      'hdfc bank': 'HDFCBANK',
      'icici': 'ICICIBANK',
      'icici bank': 'ICICIBANK',
      'sbi': 'SBIN',
      'state bank': 'SBIN',
      'tata motors': 'TATAMOTORS',
      'tatamotors': 'TATAMOTORS',
      'airtel': 'BHARTIARTL',
      'bharti': 'BHARTIARTL',
      'itc': 'ITC',
      'l&t': 'LT',
      'larsen': 'LT',
      'trent': 'TRENT',
      'zudio': 'TRENT',
      'hal': 'HAL',
      'hindustan aeronautics': 'HAL',
      'bel': 'BEL',
      'bharat electronics': 'BEL',
      'zomato': 'ZOMATO',
      'blinkit': 'ZOMATO',
      'bajaj finance': 'BAJFINANCE',
      'bajaj': 'BAJFINANCE',
      'titan': 'TITAN',
      'tanishq': 'TITAN',
      'sun pharma': 'SUNPHARMA',
      'dixon': 'DIXON',
      'infosys': 'INFY',
      'infy': 'INFY'
    };

    for (const [alias, symbol] of Object.entries(aliases)) {
      if (text.includes(alias)) {
        return allStocks.find(s => s.symbol === symbol);
      }
    }
    return undefined;
  };

  // 1. COMPARISON INTENT (e.g., "Compare TCS vs INFY", "HDFC vs ICICI")
  if (q.includes('vs') || q.includes('compare') || (q.includes('or') && (q.includes('better') || q.includes('buy')))) {
    // Extract candidates
    const mentioned: Stock[] = [];
    allStocks.forEach(s => {
      const sym = s.symbol.toLowerCase();
      const n = s.name.toLowerCase();
      if (q.includes(sym) || q.includes(n.split(' ')[0].toLowerCase())) {
        if (!mentioned.some(m => m.symbol === s.symbol)) {
          mentioned.push(s);
        }
      }
    });

    if (mentioned.length >= 2) {
      const [s1, s2] = mentioned;
      const winner = s1.technicals.rsi14 > s2.technicals.rsi14 ? s1 : s2;
      const ltWinner = s1.fundamentals.rocePercent > s2.fundamentals.rocePercent ? s1 : s2;

      return {
        text: `⚔️ **Head-to-Head Comparison: ${s1.symbol} vs ${s2.symbol}**\n\n` +
          `| Financial Metric | **${s1.symbol}** | **${s2.symbol}** |\n` +
          `| :--- | :--- | :--- |\n` +
          `| **Current Price (CMP)** | ₹${s1.price} (${s1.changePercent >= 0 ? '+' : ''}${s1.changePercent}%) | ₹${s2.price} (${s2.changePercent >= 0 ? '+' : ''}${s2.changePercent}%) |\n` +
          `| **P/E vs Industry** | ${s1.fundamentals.pe} (Ind: ${s1.fundamentals.industryPe}) | ${s2.fundamentals.pe} (Ind: ${s2.fundamentals.industryPe}) |\n` +
          `| **ROCE % / ROE %** | **${s1.fundamentals.rocePercent}%** / ${s1.fundamentals.roePercent}% | **${s2.fundamentals.rocePercent}%** / ${s2.fundamentals.roePercent}% |\n` +
          `| **RSI Momentum** | ${s1.technicals.rsi14} (${s1.technicals.rsiStatus}) | ${s2.technicals.rsi14} (${s2.technicals.rsiStatus}) |\n` +
          `| **DCF Fair Value** | ₹${s1.fundamentals.intrinsicValue} (+${s1.fundamentals.marginOfSafety}%) | ₹${s2.fundamentals.intrinsicValue} (+${s2.fundamentals.marginOfSafety}%) |\n` +
          `| **Debt to Equity** | ${s1.fundamentals.debtToEquity} | ${s2.fundamentals.debtToEquity} |\n\n` +
          `💡 **Chanakya's Verdict:**\n` +
          `• **Short-Term Profit / Swing:** 🚀 **${winner.symbol}** has stronger relative momentum with RSI at ${winner.technicals.rsi14}.\n` +
          `• **Long-Term Multi-Year Compounding:** 💎 **${ltWinner.symbol}** leads on capital efficiency with higher ROCE (${ltWinner.fundamentals.rocePercent}%).`,
        actionButtons: [
          { label: `Inspect ${s1.symbol}`, actionType: 'VIEW_STOCK', payload: s1.symbol },
          { label: `Inspect ${s2.symbol}`, actionType: 'VIEW_STOCK', payload: s2.symbol },
          { label: `Buy ${winner.symbol}`, actionType: 'BUY_ORDER', payload: winner.symbol }
        ],
        suggestedFollowUps: [
          `Give me entry levels for ${winner.symbol}`,
          `What is the stop loss for ${s1.symbol}?`,
          `Show 3-Year Target for ${s2.symbol}`
        ]
      };
    }
  }

  // 2. SPECIFIC STOCK DEEP DIVE (User asked about any specific stock)
  const targetStock = findMentionedStock(q);
  if (targetStock && (targetStock.symbol !== currentStock.symbol || q.includes(targetStock.symbol.toLowerCase()) || q.includes(targetStock.name.split(' ')[0].toLowerCase()))) {
    const tech = targetStock.technicals;
    const fund = targetStock.fundamentals;
    const isBull = targetStock.price > tech.ema20 && tech.rsi14 >= 50;

    return {
      stockSymbol: targetStock.symbol,
      text: `📊 **Real-Time Tactical & Fundamental Breakdown: ${targetStock.name} (${targetStock.symbol})**\n\n` +
        `• **Current Market Price:** **₹${targetStock.price.toFixed(2)}** (${targetStock.change >= 0 ? '+' : ''}${targetStock.changePercent}%)\n` +
        `• **Technical Stance:** ${isBull ? '🟢 **BULLISH EXPANSION**' : '🟡 **CONSOLIDATION / ACCUMULATION**'} (${tech.trend})\n` +
        `• **RSI (14):** **${tech.rsi14}** — ${tech.rsiStatus}\n` +
        `• **Key Moving Averages:** 20 EMA: ₹${tech.ema20} | 50 EMA: ₹${tech.ema50} | 200 EMA: ₹${tech.ema200}\n` +
        `• **Key Floor / Ceiling:** Support at **₹${tech.support1}**, Resistance at **₹${tech.resistance1}**\n` +
        `• **DCF Intrinsic Fair Value:** **₹${fund.intrinsicValue}** (Margin of Safety: **+${fund.marginOfSafety}%**)\n` +
        `• **Capital Return:** ROCE of **${fund.rocePercent}%**, ROE of **${fund.roePercent}%**, Debt/Equity **${fund.debtToEquity}**\n\n` +
        `🎯 **Actionable Advice:** ${tech.rsi14 < 70 
          ? `Buy/Accumulate near ₹${tech.ema20} with Target ₹${tech.resistance2} (+${((tech.resistance2 - targetStock.price)/targetStock.price*100).toFixed(1)}%) and Stop Loss below ₹${tech.support1}.` 
          : `RSI is stretched (${tech.rsi14}). Book partial profits and trail stop loss to entry.`}\n\n` +
        `🚀 **Key Catalyst:** ${targetStock.catalysts[0]}`,
      actionButtons: [
        { label: `View Chart (${targetStock.symbol})`, actionType: 'VIEW_STOCK', payload: targetStock.symbol },
        { label: `Buy ${targetStock.symbol}`, actionType: 'BUY_ORDER', payload: targetStock.symbol },
        { label: `Sell / Short ${targetStock.symbol}`, actionType: 'SELL_ORDER', payload: targetStock.symbol }
      ],
      suggestedFollowUps: [
        `What is the exact Stop Loss for ${targetStock.symbol}?`,
        `What is the 3-Year Target for ${targetStock.symbol}?`,
        `Compare ${targetStock.symbol} with its peers`
      ]
    };
  }

  // 3. SECTOR INQUIRIES (e.g., "Best banking stocks", "IT stocks", "Defense stocks")
  if (q.includes('bank') || q.includes('it stock') || q.includes('defense') || q.includes('auto') || q.includes('fmcg') || q.includes('pharma')) {
    let matchedSector = '';
    if (q.includes('bank')) matchedSector = 'Banking & Finance';
    else if (q.includes('it') || q.includes('tech')) matchedSector = 'Information Technology';
    else if (q.includes('defense')) matchedSector = 'Defense & Aerospace';
    else if (q.includes('auto')) matchedSector = 'Automobile';
    else if (q.includes('fmcg')) matchedSector = 'FMCG & Retail';
    else if (q.includes('pharma')) matchedSector = 'Pharmaceuticals';

    const sectorStocks = allStocks.filter(s => s.sector === matchedSector);
    if (sectorStocks.length > 0) {
      const topPerformer = [...sectorStocks].sort((a, b) => b.changePercent - a.changePercent)[0];
      const topQuality = [...sectorStocks].sort((a, b) => b.fundamentals.rocePercent - a.fundamentals.rocePercent)[0];

      return {
        text: `🏛️ **${matchedSector} Sector Real-Time Intelligence & Picks**\n\n` +
          `• **Sector Breadth:** ${sectorStocks.length} heavyweight constituents tracked.\n` +
          `• **Today's Momentum Leader:** 🚀 **${topPerformer.symbol}** (+${topPerformer.changePercent}%) at ₹${topPerformer.price}\n` +
          `• **Highest Quality Multi-Year Pick:** 💎 **${topQuality.symbol}** (ROCE: ${topQuality.fundamentals.rocePercent}%, P/E: ${topQuality.fundamentals.pe})\n\n` +
          `📋 **Constituent Snapshot:**\n` +
          sectorStocks.map(s => `  - **${s.symbol}**: ₹${s.price} (${s.changePercent >= 0 ? '+' : ''}${s.changePercent}%) | RSI: ${s.technicals.rsi14} | Fair Value: ₹${s.fundamentals.intrinsicValue}`).join('\n') +
          `\n\n💡 **Strategy:** Accumulate leaders on tests of their 20/50 EMA dynamic supports.`,
        actionButtons: [
          { label: `Inspect ${topPerformer.symbol}`, actionType: 'VIEW_STOCK', payload: topPerformer.symbol },
          { label: `Inspect ${topQuality.symbol}`, actionType: 'VIEW_STOCK', payload: topQuality.symbol }
        ],
        suggestedFollowUps: [
          `Top swing trade in ${matchedSector}`,
          `Which ${matchedSector} stock has the lowest P/E?`,
          `Sector Heatmap overview`
        ]
      };
    }
  }

  // 4. MARKET REGIME, NIFTY 50 & EXPIRY (e.g., "Nifty trend", "Market direction", "Is market bullish?")
  if (q.includes('nifty') || q.includes('market') || q.includes('sensex') || q.includes('bullish') || q.includes('bearish') || q.includes('expiry') || q.includes('vix')) {
    const nifty = allStocks.length > 0 ? 24385.60 : 24385.60;
    return {
      text: `🇮🇳 **Indian Benchmark Indices & Macro Sentiment Analysis**\n\n` +
        `• **NIFTY 50 Stance:** 🟢 **Bullish Momentum** holding firmly above 24,250 key support zone.\n` +
        `• **Immediate Key Levels:**\n` +
        `  - Major Support (Floor): **24,200 - 24,250** (20 EMA & Highest Put OI)\n` +
        `  - Target Resistance (Ceiling): **24,500 - 24,650** (Call writing zone)\n` +
        `• **INDIA VIX Regime:** **13.82** (Sub-15 volatility represents favorable low-risk bull trend).\n` +
        `• **Institutional Flow:** Foreign Institutions (FII) & DIIs are net buyers (+₹3,800+ Cr cumulative), providing strong liquidity absorption.\n\n` +
        `🎯 **Actionable Trading Strategy:**\n` +
        `Avoid aggressive shorting against institutional flow. Use intraday pullbacks towards 24,300 to enter high-beta swing leaders (Auto, IT, and Defense heavyweights).`,
      actionButtons: [
        { label: 'View Sector Heatmap', actionType: 'PROMPT', payload: 'Sectoral Heatmap & Heavyweight Constituents' },
        { label: 'Top Swing Picks Today', actionType: 'PROMPT', payload: 'What are today\'s top swing trading setups for quick profit?' }
      ],
      suggestedFollowUps: [
        'Top 3 stocks to buy in this bull run',
        'Is BANK NIFTY outperforming NIFTY?',
        'How to hedge with Put Options?'
      ]
    };
  }

  // 5. SWING TRADING & QUICK PROFIT (e.g. "swing", "profit", "short term", "quick gain")
  if (q.includes('swing') || q.includes('profit') || q.includes('short term') || q.includes('today') || q.includes('entry') || q.includes('setup')) {
    const signals = generateTradingSignals(allStocks);
    const topBuy = signals.find(s => s.type === 'STRONG BUY' || s.type === 'BUY') || signals[0];

    return {
      stockSymbol: topBuy.symbol,
      text: `🎯 **Top Real-Time Swing Trading Signal for Maximum Profit:**\n\n` +
        `**Stock:** **${topBuy.stockName} (${topBuy.symbol})**\n` +
        `• **Action:** 🟢 **${topBuy.type}** (${topBuy.category})\n` +
        `• **Entry Zone:** ₹${topBuy.entryRange[0]} - ₹${topBuy.entryRange[1]}\n` +
        `• **Target 1 (Quick Gain):** ₹${topBuy.target1} (+${((topBuy.target1 - topBuy.entryRange[0])/topBuy.entryRange[0]*100).toFixed(1)}%)\n` +
        `• **Target 2 (Extended Runner):** ₹${topBuy.target2} (+${topBuy.potentialGainPercent}%)\n` +
        `• **Strict Stop Loss:** ₹${topBuy.stopLoss} (-${topBuy.maxRiskPercent}%)\n` +
        `• **Risk-to-Reward:** **${topBuy.riskRewardRatio}** | **Confidence:** **${topBuy.confidencePercent}%**\n\n` +
        `📌 **Key Catalyst:** ${topBuy.catalyst}\n\n` +
        `*Execution Rule: Book 50% profit at Target 1 and immediately trail Stop Loss to cost price (Break-even)!*`,
      actionButtons: [
        { label: `View Chart (${topBuy.symbol})`, actionType: 'VIEW_STOCK', payload: topBuy.symbol },
        { label: `Buy ${topBuy.symbol}`, actionType: 'BUY_ORDER', payload: topBuy.symbol }
      ],
      suggestedFollowUps: [
        `Show second best swing pick`,
        `What is the volume surge in ${topBuy.symbol}?`,
        `How much capital to allocate to this trade?`
      ]
    };
  }

  // 6. LONG TERM MULTIBAGGERS (e.g., "long term", "3-5 years", "compounder", "multibagger")
  if (q.includes('long term') || q.includes('multibagger') || q.includes('compound') || q.includes('wealth') || q.includes('3-5 year') || q.includes('invest')) {
    const longTerm = generateLongTermAdvice(allStocks);
    const top1 = longTerm[0];
    const top2 = longTerm[1];

    return {
      stockSymbol: top1.symbol,
      text: `💎 **Top Indian Wealth Compounders for 3–5 Years (Multibagger Potential):**\n\n` +
        `1️⃣ **${top1.stockName} (${top1.symbol})**\n` +
        `• **Rating:** 🌟 **${top1.rating}** (Score: **${top1.overallScore}/100**)\n` +
        `• **Current Price:** ₹${allStocks.find(s => s.symbol === top1.symbol)?.price}\n` +
        `• **1-Year Target:** ₹${top1.target1Year} | **3-Year Target:** **₹${top1.target3Year}**\n` +
        `• **Expected Compounding CAGR:** **+${top1.expectedCagr}% per annum**\n` +
        `• **Competitive Moat:** High capital efficiency, market share monopoly, negative net debt.\n\n` +
        `2️⃣ **${top2.stockName} (${top2.symbol})**\n` +
        `• **Rating:** 🌟 **${top2.rating}** (Score: **${top2.overallScore}/100**)\n` +
        `• **1-Year Target:** ₹${top2.target1Year} | **3-Year Target:** **₹${top2.target3Year}**\n` +
        `• **Expected Compounding CAGR:** **+${top2.expectedCagr}% per annum**\n\n` +
        `💡 *Portfolio Rule: Deploy capital in 3 systematic tranches or monthly SIP for maximum rupee-cost averaging.*`,
      actionButtons: [
        { label: `Inspect ${top1.symbol}`, actionType: 'VIEW_STOCK', payload: top1.symbol },
        { label: `Inspect ${top2.symbol}`, actionType: 'VIEW_STOCK', payload: top2.symbol }
      ],
      suggestedFollowUps: [
        `What are the risks in ${top1.symbol}?`,
        `Why is ${top2.symbol} expected to grow at ${top2.expectedCagr}%?`,
        `Show dividend cash cows`
      ]
    };
  }

  // 7. DIVIDEND & CAPITAL PRESERVATION (e.g. "dividend", "safe", "passive income")
  if (q.includes('dividend') || q.includes('safe') || q.includes('passive income') || q.includes('low risk')) {
    const dividendStocks = [...allStocks].sort((a, b) => b.fundamentals.dividendYield - a.fundamentals.dividendYield);
    const top = dividendStocks[0];
    const top2 = dividendStocks[1];

    return {
      stockSymbol: top.symbol,
      text: `🛡️ **Safest High-Dividend Cash Cows in Indian Markets:**\n\n` +
        `• **${top.name} (${top.symbol})**\n` +
        `  - **Dividend Yield:** **${top.fundamentals.dividendYield}%** (P/E: ${top.fundamentals.pe}, Debt/Equity: ${top.fundamentals.debtToEquity})\n` +
        `  - Monopolistic cash generation with high free cash flow conversion.\n\n` +
        `• **${top2.name} (${top2.symbol})**\n` +
        `  - **Dividend Yield:** **${top2.fundamentals.dividendYield}%** (P/E: ${top2.fundamentals.pe})\n` +
        `  - Resilient business model with predictable quarterly/annual payouts.\n\n` +
        `Both protect your capital against inflation while delivering passive cash yields directly into your bank account.`,
      actionButtons: [
        { label: `Inspect ${top.symbol}`, actionType: 'VIEW_STOCK', payload: top.symbol },
        { label: `Buy ${top.symbol}`, actionType: 'BUY_ORDER', payload: top.symbol }
      ],
      suggestedFollowUps: [
        `What is the dividend payout history of ${top.symbol}?`,
        `Compare ${top.symbol} vs Fixed Deposits`,
        `Top growth stocks instead`
      ]
    };
  }

  // 8. TECHNICAL EDUCATION (e.g., "what is rsi", "supertrend", "stop loss", "ema")
  if (q.includes('what is') || q.includes('how to use') || q.includes('explain') || q.includes('indicator') || q.includes('rsi') || q.includes('supertrend')) {
    let concept = 'Technical Indicator';
    let explanation = '';

    if (q.includes('rsi')) {
      concept = 'RSI (Relative Strength Index)';
      explanation = `RSI measures the speed and change of price movements on a scale of 0 to 100.\n• Above 70: Overbought (Potential pullback or pause).\n• Below 30: Oversold (Potential rebound opportunity).\n• In strong bull trends, RSI typically oscillates between 45 and 80 without dipping below 40.`;
    } else if (q.includes('supertrend')) {
      concept = 'Supertrend Indicator';
      explanation = `Supertrend uses Average True Range (ATR) to track trends and trailing stop losses.\n• Green Line below price: Strong BUY signal / Bullish trend.\n• Red Line above price: Strong SELL signal / Bearish trend.`;
    } else if (q.includes('ema') || q.includes('moving average')) {
      concept = 'EMA (Exponential Moving Average)';
      explanation = `EMA gives higher weight to recent prices:\n• 20 EMA: Short-term momentum floor.\n• 50 EMA: Swing institutional support.\n• 200 EMA: Major structural bull/bear division. When 50 EMA crosses above 200 EMA, it triggers the famous 'Golden Cross'!`;
    } else {
      concept = 'Risk Management & Position Sizing';
      explanation = `The golden rule of successful trading is never risking more than 1% to 2% of total capital on a single trade. Always set your Stop Loss before entering and calculate position size: (Capital at Risk) / (Entry - Stop Loss).`;
    }

    return {
      text: `🎓 **Chanakya Masterclass: ${concept}**\n\n${explanation}\n\n*In Bharat Pulse, all these indicators are computed in real time on our interactive charts!*`,
      actionButtons: [
        { label: `Inspect ${currentStock.symbol} Chart`, actionType: 'VIEW_STOCK', payload: currentStock.symbol }
      ],
      suggestedFollowUps: [
        `What is ${currentStock.symbol}'s current RSI?`,
        `Show Golden Cross breakout stocks`,
        `How to set a trailing stop loss?`
      ]
    };
  }

  // 9. DEFAULT: COMPREHENSIVE CONTEXTUAL BREAKDOWN FOR CURRENT SELECTED STOCK
  const tech = currentStock.technicals;
  const fund = currentStock.fundamentals;
  return {
    stockSymbol: currentStock.symbol,
    text: `📊 **Active Intelligence Brief: ${currentStock.name} (${currentStock.symbol})**\n\n` +
      `• **Current Market Price (CMP):** **₹${currentStock.price.toFixed(2)}** (${currentStock.change >= 0 ? '+' : ''}${currentStock.changePercent}%)\n` +
      `• **Short-Term Technical Stance:** **${tech.trend}** with RSI at **${tech.rsi14}** (${tech.rsiStatus})\n` +
      `• **Key Levels:** Support: ₹${tech.support1} / ₹${tech.support2} | Resistance: ₹${tech.resistance1} / ₹${tech.resistance2}\n` +
      `• **Moving Averages:** 20 EMA: ₹${tech.ema20} | 50 EMA: ₹${tech.ema50} | 200 EMA: ₹${tech.ema200}\n` +
      `• **Fundamental Valuation:** P/E of ${fund.pe} vs Industry ${fund.industryPe}. DCF Fair Value ₹${fund.intrinsicValue} (Margin of Safety: **+${fund.marginOfSafety}%**)\n` +
      `• **Advisory Recommendation:** ${tech.rsi14 < 70 ? '🟢 **ACCUMULATE ON PULLBACKS** with target ₹' + tech.resistance2 + ' and Stop Loss at ₹' + tech.support1 : '🟡 **HOLD / TRAIL STOP LOSS** near upper band'}.\n\n` +
      `🚀 **Key Catalyst:** ${currentStock.catalysts[0]}`,
    actionButtons: [
      { label: `View Chart (${currentStock.symbol})`, actionType: 'VIEW_STOCK', payload: currentStock.symbol },
      { label: `Buy ${currentStock.symbol}`, actionType: 'BUY_ORDER', payload: currentStock.symbol },
      { label: `Sell ${currentStock.symbol}`, actionType: 'SELL_ORDER', payload: currentStock.symbol }
    ],
    suggestedFollowUps: [
      `What is the 3-Year Target for ${currentStock.symbol}?`,
      `Show top swing pick instead`,
      `Compare ${currentStock.symbol} with its sector peers`
    ]
  };
}
