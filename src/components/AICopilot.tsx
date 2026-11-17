import React, { useState, useRef, useEffect } from 'react';
import { Stock, ChatMessage, ChatActionButton } from '../types';
import { generateAICopilotResponse, CopilotResult } from '../services/advisoryEngine';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Trash2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  ArrowUpRight, 
  CheckCircle2, 
  TrendingUp, 
  Zap,
  CornerDownRight,
  StopCircle
} from 'lucide-react';

interface AICopilotProps {
  currentStock: Stock;
  allStocks: Stock[];
  onSelectStock?: (symbol: string) => void;
  onQuickTrade?: (symbol: string, action: 'BUY' | 'SELL') => void;
  isFloatingDrawer?: boolean;
  onCloseDrawer?: () => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({ 
  currentStock, 
  allStocks, 
  onSelectStock,
  onQuickTrade,
  isFloatingDrawer = false,
  onCloseDrawer
}) => {
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      content: `Namaste! I am **Chanakya AI**, your high-speed Indian Stock Market Analyst & Wealth Copilot.\n\nI continuously monitor real-time NSE/BSE order depth, technical breakouts across 20/50/200 EMAs, DCF intrinsic values, and institutional flow.\n\nAsk me about any stock, compare two companies, or click a prompt below to see instant high-conviction trades!`,
      timestamp: 'Just now',
      suggestedFollowUps: [
        '🚀 Top swing trading picks today',
        `📊 Detailed breakdown of ${currentStock.symbol}`,
        '💎 3-5 Year multibaggers',
        '🛡️ High dividend safe stocks'
      ],
      actionButtons: [
        { label: `Analyze ${currentStock.symbol}`, actionType: 'VIEW_STOCK', payload: currentStock.symbol }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const streamingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Clean up any streaming intervals or speech on unmount
  useEffect(() => {
    return () => {
      if (streamingTimerRef.current) clearInterval(streamingTimerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    // Stop previous streaming if any
    if (streamingTimerRef.current) {
      clearInterval(streamingTimerRef.current);
      streamingTimerRef.current = null;
    }

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Compute the response immediately (Zero API delay!)
    const result: CopilotResult = generateAICopilotResponse(query, currentStock, allStocks);
    const fullText = result.text;
    const aiMsgId = `ai-${Date.now()}`;

    // Create placeholder assistant message that will be streamed token-by-token
    const assistantMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
      stockSymbol: result.stockSymbol,
      actionButtons: result.actionButtons,
      suggestedFollowUps: result.suggestedFollowUps
    };

    setMessages((prev) => [...prev, assistantMsg]);

    // Stream text in fast realistic chunks (approx 20-30 chars per tick every 18ms for hyper-responsiveness)
    let charIndex = 0;
    const chunkSize = 18;

    streamingTimerRef.current = setInterval(() => {
      charIndex += chunkSize;
      if (charIndex >= fullText.length) {
        // Complete streaming
        if (streamingTimerRef.current) clearInterval(streamingTimerRef.current);
        streamingTimerRef.current = null;
        setIsTyping(false);

        setMessages((prev) => 
          prev.map((m) => m.id === aiMsgId ? { ...m, content: fullText, isStreaming: false } : m)
        );
      } else {
        const partialText = fullText.slice(0, charIndex);
        setMessages((prev) => 
          prev.map((m) => m.id === aiMsgId ? { ...m, content: partialText } : m)
        );
      }
    }, 16);
  };

  const handleStopStreaming = () => {
    if (streamingTimerRef.current) {
      clearInterval(streamingTimerRef.current);
      streamingTimerRef.current = null;
      setIsTyping(false);
      setMessages((prev) => 
        prev.map((m) => m.isStreaming ? { ...m, isStreaming: false } : m)
      );
    }
  };

  const handleClear = () => {
    if (streamingTimerRef.current) {
      clearInterval(streamingTimerRef.current);
      streamingTimerRef.current = null;
    }
    setIsTyping(false);
    setMessages([
      {
        id: `welcome-init-${Date.now()}`,
        sender: 'assistant',
        content: `Chat history cleared. I'm ready to evaluate setups on **${currentStock.symbol}** or scan the entire NSE market. What shall we analyze next?`,
        timestamp: 'Just now',
        suggestedFollowUps: [
          '🚀 Top swing trading picks today',
          '💎 3-5 Year multibaggers',
          `📊 Breakdown of ${currentStock.symbol}`
        ]
      }
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeakingId === id) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for smooth audio readout
    const cleanText = text
      .replace(/[*#_`~|]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/₹/g, 'Rupees ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);

    setIsSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleActionButton = (btn: ChatActionButton) => {
    if (btn.actionType === 'VIEW_STOCK') {
      if (onSelectStock) onSelectStock(btn.payload);
      if (onCloseDrawer) onCloseDrawer();
    } else if (btn.actionType === 'BUY_ORDER') {
      if (onQuickTrade) onQuickTrade(btn.payload, 'BUY');
      if (onSelectStock) onSelectStock(btn.payload);
    } else if (btn.actionType === 'SELL_ORDER') {
      if (onQuickTrade) onQuickTrade(btn.payload, 'SELL');
      if (onSelectStock) onSelectStock(btn.payload);
    } else if (btn.actionType === 'PROMPT') {
      handleSend(btn.payload);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#0F1523] rounded-xl border border-trade-cardBorder overflow-hidden shadow-2xl ${
      isFloatingDrawer ? 'shadow-2xl shadow-black/80' : ''
    }`}>
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#141C2E] via-[#101827] to-[#141C2E] border-b border-trade-cardBorder shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="relative p-2 bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 rounded-xl text-white shadow-lg shadow-purple-950/50">
            <Bot className="w-5 h-5 animate-pulse" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#141C2E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-1.5">
                Chanakya AI Copilot
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                ULTRA-FAST
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Active Context: <strong className="text-blue-400">{currentStock.symbol}</strong> (₹{currentStock.price.toFixed(1)})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleClear}
            title="Clear Conversation"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {onCloseDrawer && (
            <button
              onClick={onCloseDrawer}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Quick Interactive Prompt Chips Carousel */}
      <div className="px-3 py-2 bg-[#0A0E17] border-b border-trade-cardBorder/60 flex items-center space-x-2 overflow-x-auto text-[11px] shrink-0 scrollbar-none">
        <button
          onClick={() => handleSend(`What are today's top swing trading setups for quick profit?`)}
          className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full whitespace-nowrap transition-all active:scale-95 flex items-center gap-1 font-semibold"
        >
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>🚀 Best Profit Trades</span>
        </button>

        <button
          onClick={() => handleSend(`Recommend top 3 long-term wealth compounder stocks for 3-5 years`)}
          className="px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full whitespace-nowrap transition-all active:scale-95 flex items-center gap-1 font-semibold"
        >
          <span>💎 3-5Y Multibaggers</span>
        </button>

        <button
          onClick={() => handleSend(`Give me a detailed technical & fundamental breakdown of ${currentStock.symbol}`)}
          className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full whitespace-nowrap transition-all active:scale-95 flex items-center gap-1 font-semibold"
        >
          <span>📊 Analyze {currentStock.symbol}</span>
        </button>

        <button
          onClick={() => handleSend(`Compare ${currentStock.symbol} with its top sector peers`)}
          className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full whitespace-nowrap transition-all active:scale-95 flex items-center gap-1 font-semibold"
        >
          <span>⚔️ Peer Comparison</span>
        </button>

        <button
          onClick={() => handleSend(`What is the current NIFTY 50 trend and key support resistance levels?`)}
          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full whitespace-nowrap transition-all active:scale-95 flex items-center gap-1 font-semibold"
        >
          <span>🇮🇳 Nifty Outlook</span>
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Sender Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-blue-900/40'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white border border-purple-400/40 shadow-purple-950/40'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble Content */}
            <div className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-lg ${
              msg.sender === 'user'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-tr-none'
                : 'bg-[#141C2E] text-slate-200 border border-trade-cardBorder rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap font-sans">
                {msg.content}
                {msg.isStreaming && (
                  <span className="inline-block w-2 h-3.5 ml-1 bg-purple-400 animate-pulse font-mono align-middle">
                    ▋
                  </span>
                )}
              </div>

              {/* Action Buttons inside Message (if any) */}
              {msg.actionButtons && msg.actionButtons.length > 0 && !msg.isStreaming && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-700/60">
                  {msg.actionButtons.map((btn, i) => (
                    <button
                      key={i}
                      onClick={() => handleActionButton(btn)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all active:scale-95 flex items-center gap-1 shadow-sm ${
                        btn.actionType === 'BUY_ORDER'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : btn.actionType === 'SELL_ORDER'
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      <ArrowUpRight className="w-3 h-3" />
                      <span>{btn.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Suggested Follow-Ups (if any) */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && !msg.isStreaming && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mb-1">
                    <CornerDownRight className="w-3 h-3 text-purple-400" />
                    <span>Suggested Next Queries:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((chip, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(chip)}
                        className="px-2 py-0.8 bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 rounded-md text-[10px] transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Controls: Timestamp, Copy, and Text-to-Speech */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-800/40 font-mono">
                <span>{msg.timestamp}</span>

                {msg.sender === 'assistant' && !msg.isStreaming && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      title="Copy to Clipboard"
                      className="hover:text-slate-200 transition-colors"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleSpeak(msg.id, msg.content)}
                      title={isSpeakingId === msg.id ? 'Stop Speech' : 'Read Aloud'}
                      className="hover:text-slate-200 transition-colors"
                    >
                      {isSpeakingId === msg.id ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box with Instant Stop & Submit */}
      <div className="p-3 bg-[#141C2E] border-t border-trade-cardBorder shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${currentStock.symbol}, swing setups, comparisons...`}
            className="flex-1 bg-[#080B11] border border-slate-700 focus:border-purple-500 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />

          {isTyping ? (
            <button
              type="button"
              onClick={handleStopStreaming}
              className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all active:scale-95 shadow-md shadow-rose-950/40 shrink-0 flex items-center gap-1 text-xs font-semibold"
              title="Stop Generating"
            >
              <StopCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-lg transition-all active:scale-95 shadow-md shadow-purple-950/40 shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
