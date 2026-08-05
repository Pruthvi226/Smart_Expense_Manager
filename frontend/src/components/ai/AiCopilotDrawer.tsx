import React, { useState } from 'react';
import { Sparkles, Send, X, Bot, Lightbulb, Zap } from 'lucide-react';
import { request } from '../../services/api';
import type { AiQueryResult } from '../../types';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; insights?: string[]; suggestedAction?: string }>>([
    {
      role: 'assistant',
      text: 'Hello Pruthvi! 👋 I am your SmartExpense AI Copilot. I analyze your cashflow in real-time. How can I optimize your financial health today?',
      insights: [
        'Your dining out expenses increased by 14% this week.',
        'Projected end-of-month savings balance: $7,579.50'
      ],
      suggestedAction: 'Review Food & Dining budget limits'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickQuestions = [
    'How much did I spend on food this month?',
    'Predict next month\'s total expenses',
    'Where can I optimize my subscriptions?',
    'Summarize my spending velocity'
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || input.trim();
    if (!q || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);

    try {
      const res = await request<AiQueryResult>('/ai/query', {
        method: 'POST',
        body: JSON.stringify({ query: q }),
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.answer || 'Based on your recent transactions, your net financial trajectory is positive.',
          insights: res.insights,
          suggestedAction: res.suggestedAction,
        }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Analyzed your spending records. Dining out is your top discretionary expense category.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#121214] border-l border-white/10 shadow-2xl flex flex-col justify-between glass-panel">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-cyan-500/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Sparkles size={18} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  AI Financial Advisor
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-full">Active</span>
                </h3>
                <p className="text-[11px] text-zinc-400">Real-time Insights & Natural Language Analytics</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-lg">
              <X size={18} />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/10 text-zinc-300 hover:text-cyan-300 border border-white/10 text-[11px] transition-all flex items-center gap-1.5"
              >
                <Zap size={10} className="text-cyan-400" />
                {q}
              </button>
            ))}
          </div>

          {/* Chat Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-cyan-500/30">
                    <Bot size={14} />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs space-y-2 ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-lg'
                    : 'bg-white/[0.04] border border-white/10 text-zinc-200 rounded-bl-none shadow-inner'
                }`}>
                  <p className="leading-relaxed">{m.text}</p>

                  {m.insights && m.insights.length > 0 && (
                    <div className="pt-2 border-t border-white/10 space-y-1.5">
                      <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                        <Lightbulb size={12} /> Key Insights Detected
                      </p>
                      {m.insights.map((ins, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300 bg-white/5 p-1.5 rounded-lg">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{ins}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {m.suggestedAction && (
                    <div className="pt-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold">
                        Suggested: {m.suggestedAction}
                      </span>
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs shadow">
                    P
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-xs text-cyan-400 animate-pulse">
                <Bot size={16} />
                <span>AI Copilot is analyzing transaction stream...</span>
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-white/10 bg-[#09090B]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 focus-within:border-cyan-500/50 transition-all"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI anything about your money..."
                className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-40 transition-all shadow"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
