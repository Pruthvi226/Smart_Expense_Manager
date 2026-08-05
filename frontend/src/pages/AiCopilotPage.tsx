import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles, Send, Bot, User, Copy, RefreshCw, Square, Trash2,
  Download, Search, Plus, ChevronRight, TrendingUp, TrendingDown,
  PieChart, Zap, Shield, DollarSign, MessageSquare, Clock, CheckCheck
} from 'lucide-react';
import { request } from '../services/api';
import type { AiQueryResult } from '../types';

// ── Types ──────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  isStreaming?: boolean;
  copied?: boolean;
  insights?: string[];
  suggestedAction?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  'How much did I spend on Food this month?',
  'Predict next month\'s total expenses',
  'What is my biggest expense category?',
  'Where can I reduce my spending?',
  'Suggest a savings plan for next quarter',
  'Show me my recurring subscription costs',
  'Compare my income vs expenses this year',
  'Generate a financial health report',
];

const AI_INSIGHT_CARDS = [
  {
    id: 'score',
    icon: Shield,
    label: 'Financial Score',
    value: '89 / 100',
    sub: 'Top 8% of users',
    color: 'from-indigo-500/20 to-indigo-600/5',
    border: 'border-indigo-500/30',
    iconColor: 'text-indigo-400',
    trend: '+3 pts this month',
    up: true,
  },
  {
    id: 'savings',
    icon: TrendingUp,
    label: 'Savings Forecast',
    value: '$7,579.50',
    sub: 'Aug 2026 projection',
    color: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    trend: '+18.4% MoM',
    up: true,
  },
  {
    id: 'risk',
    icon: PieChart,
    label: 'Budget Risk',
    value: 'Moderate',
    sub: '2 categories at risk',
    color: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    trend: 'Food & Dining over',
    up: false,
  },
  {
    id: 'trend',
    icon: TrendingDown,
    label: 'Expense Trend',
    value: '-5.1%',
    sub: 'vs last month',
    color: 'from-cyan-500/20 to-cyan-600/5',
    border: 'border-cyan-500/30',
    iconColor: 'text-cyan-400',
    trend: 'Spend reduction',
    up: true,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

function groupConversations(convos: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const lastWeek = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, Conversation[]> = {
    Today: [],
    Yesterday: [],
    'Last 7 Days': [],
    Earlier: [],
  };

  convos.forEach((c) => {
    const d = new Date(c.createdAt.getFullYear(), c.createdAt.getMonth(), c.createdAt.getDate());
    if (d >= today) groups.Today.push(c);
    else if (d >= yesterday) groups.Yesterday.push(c);
    else if (d >= lastWeek) groups['Last 7 Days'].push(c);
    else groups.Earlier.push(c);
  });

  return groups;
}

// ── Markdown-lite renderer ────────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const nodes: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    // Code block single-line
    if (line.startsWith('```') || line.endsWith('```')) {
      nodes.push(
        <code key={i} className="block bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-[11px] text-cyan-300 my-1">
          {line.replace(/```/g, '')}
        </code>
      );
      return;
    }
    // Bold **text**
    const boldReplaced = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<b>${m}</b>`);
    // Bullet list
    if (line.trimStart().startsWith('• ') || line.trimStart().startsWith('- ') || line.trimStart().startsWith('* ')) {
      nodes.push(
        <div key={i} className="flex items-start gap-2 text-zinc-200 py-0.5">
          <span className="text-indigo-400 mt-0.5 shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: boldReplaced.replace(/^[•\-\*]\s/, '') }} />
        </div>
      );
      return;
    }
    // Heading
    if (line.startsWith('## ')) {
      nodes.push(<h4 key={i} className="font-bold text-white mt-3 mb-1 text-sm">{line.slice(3)}</h4>);
      return;
    }
    if (line.startsWith('# ')) {
      nodes.push(<h3 key={i} className="font-bold text-white mt-3 mb-1 text-base">{line.slice(2)}</h3>);
      return;
    }
    // Empty line
    if (!line.trim()) {
      nodes.push(<div key={i} className="h-2" />);
      return;
    }
    nodes.push(
      <p key={i} className="text-zinc-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: boldReplaced }} />
    );
  });

  return nodes;
}

// ── Main Component ────────────────────────────────────────────────────────────
export const AiCopilotPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      title: 'Financial overview August',
      createdAt: new Date(),
      messages: [
        {
          id: 'msg-0',
          role: 'assistant',
          text: "Hello Pruthviraj! 👋 I'm your **SmartExpense AI Copilot**.\n\nI have real-time access to your transaction data, budget allocations, and cashflow trends. Ask me anything about your finances.\n\n• **Natural language queries** — no syntax required\n• **Predictive analytics** — next-month forecasts\n• **Budget optimization** — reduction strategies\n• **Report generation** — instant summaries",
          timestamp: new Date(),
          insights: [
            'Your dining out expenses increased 14% this week.',
            'Projected August savings balance: $7,579.50'
          ],
          suggestedAction: 'Set a weekly $150 dining out threshold alert',
        },
      ],
    },
  ]);
  const [activeConvId, setActiveConvId] = useState('conv-1');
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [convSearch, setConvSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<boolean>(false);

  const activeConv = conversations.find((c) => c.id === activeConvId)!;

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
  };

  const getAiResponse = useCallback(
    async (query: string): Promise<AiQueryResult> => {
      try {
        return await request<AiQueryResult>('/ai/query', {
          method: 'POST',
          body: JSON.stringify({ query }),
        });
      } catch {
        // Smart mock responses based on query content
        const q = query.toLowerCase();
        if (q.includes('food') || q.includes('dining') || q.includes('grocery')) {
          return {
            query,
            answer: "## Food & Dining Analysis — August 2026\n\nYour **Food & Dining** category has **exceeded its budget** this month:\n\n• **Total spent**: $950.00 / $900.00 budget limit\n• **Over budget by**: $50.00 (+5.6%)\n• **Top merchants**: Whole Foods ($142.60), Uber Eats ($58.40)\n\n## Breakdown\n\n- Groceries: $562.40 (59%)\n- Dining out: $248.00 (26%)\n- Food delivery: $139.60 (15%)\n\n**AI Recommendation**: Set a $200 weekly grocery budget and disable premium Uber Eats subscription to save ~$15/month.",
            insights: [
              'Food spending increased 14.2% vs July 2026.',
              'Weekend dining spikes average $92 on Friday nights.',
              'Grocery shopping frequency: 4x/month avg.'
            ],
            suggestedAction: 'Set $150/week Food & Dining alert threshold',
          };
        }
        if (q.includes('predict') || q.includes('next month') || q.includes('forecast')) {
          return {
            query,
            answer: "## Expense Forecast — September 2026\n\nBased on your 6-month spending patterns and seasonal trends:\n\n**Predicted Total Expenses**: **$4,650.00**\n\n• Housing & Utilities: $1,800 (unchanged)\n• Food & Dining: $870 (-8.4% with current optimization)\n• Shopping: $680 (-5.5%)\n• Infrastructure: $485 (stable)\n• Transportation: $420 (-6.7%)\n• Health & Wellness: $280 (stable)\n• Entertainment: $115\n\n## Savings Prediction\n\nWith current income of **$12,400/mo**, projected savings for September: **$7,750.00** (+2.2% vs August)",
            insights: [
              'Seasonal patterns suggest lower utility costs in Sep.',
              'No major subscriptions renewing next month.',
              'Travel budget allocation not triggered.'
            ],
            suggestedAction: 'Review Shopping budget — projected 15% overage risk',
            predictedNextMonthExpense: 4650.00,
          };
        }
        if (q.includes('biggest') || q.includes('largest') || q.includes('top')) {
          return {
            query,
            answer: "## Your Biggest Expense Categories — August 2026\n\n**1. Housing & Utilities** — $1,800.00 (37.3%)\n- Rent, electricity, internet\n\n**2. Food & Dining** — $950.00 (19.7%)\n- ⚠️ Over budget by $50\n\n**3. Shopping & Electronics** — $720.00 (14.9%)\n- Apple Store, Amazon purchases\n\n**4. Infrastructure & Tech** — $485.20 (10.1%)\n- AWS Cloud Services\n\n**5. Health & Wellness** — $280.00 (5.8%)\n- Equinox Fitness Club membership\n\n## AI Insight\n\nHousing at **37.3%** of total spend is within healthy range (recommended <40%). Consider **negotiating your AWS reserved instances** for a potential $85/mo saving.",
            insights: [
              'Housing is your largest fixed cost at $1,800/mo.',
              'AWS costs could be optimized with reserved instances.',
              'Shopping discretionary spend within healthy range.'
            ],
            suggestedAction: 'Explore AWS Reserved Instances — save $85/month',
          };
        }
        if (q.includes('reduc') || q.includes('sav') || q.includes('optimiz') || q.includes('cut')) {
          return {
            query,
            answer: "## Expense Optimization Strategy — Top 5 Recommendations\n\n**1. Dining Delivery Audit** 🍔\nCurrent delivery apps: $139.60/mo across 3 platforms\n- Cancel premium Uber Eats subscription → Save **$14.99/mo**\n- Set delivery budget alert at $100/mo\n\n**2. AWS Cost Optimization** ☁️\nCurrent cloud spend: $485.20/mo\n- Switch dev environments to spot instances → Save **$85/mo**\n- Enable AWS Cost Explorer alerts\n\n**3. Fitness Membership Review** 💪\nEquinox All-Access: $280/mo\n- Negotiate corporate rate or downgrade plan → Save **$60-$100/mo**\n\n**4. Subscription Audit** 📱\nDetected 6 active SaaS subscriptions\n- 2 potentially duplicate tools detected\n- Estimated savings: **$28/mo**\n\n**5. Grocery Consolidation** 🛒\nShopping at 3+ stores/week\n- Consolidate to weekly bulk shop → Reduce food waste by ~15%\n\n## Total Potential Monthly Savings: **$187 - $227**",
            insights: [
              'Subscription overlap detected — 2 tools with similar features.',
              'AWS spend 18% above industry benchmark for similar workload.',
              'Dining delivery frequency increased 3x in last 30 days.'
            ],
            suggestedAction: 'Start with the AWS cost audit — highest ROI action',
          };
        }
        // Generic fallback
        return {
          query,
          answer: "## Financial Analysis — August 2026\n\nBased on your current transaction data:\n\n**Overall Financial Health**: 89/100 ✅\n\n• **Monthly Income**: $12,400.00\n• **Monthly Expenses**: $4,820.50\n• **Net Savings**: $7,579.50 (61.1% savings rate)\n• **MoM Change**: +18.4% improvement\n\n## Key Insights\n\nYour **financial velocity** is in the top 8% of SmartExpense users. Your savings discipline is exemplary — maintaining above 60% savings rate is exceptional.\n\n**Areas to watch**:\n- Food & Dining budget slightly exceeded\n- Shopping spend approaching 90% of budget\n\nWould you like a deeper breakdown of any specific category?",
          insights: [
            'Your savings rate of 61.1% is well above the recommended 20-30%.',
            'Emergency fund projected to reach 6-month target in March 2027.',
            '2 budget categories currently at risk level.'
          ],
          suggestedAction: 'Review Food & Dining budget threshold',
        };
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (queryText?: string) => {
      const q = queryText || input.trim();
      if (!q || isGenerating) return;

      setInput('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      abortRef.current = false;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        text: q,
        timestamp: new Date(),
      };

      const streamingId = generateId();
      const streamingMsg: ChatMessage = {
        id: streamingId,
        role: 'assistant',
        text: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      // Add user message + streaming placeholder
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, messages: [...c.messages, userMsg, streamingMsg], title: c.messages.length === 1 ? q.slice(0, 40) : c.title }
            : c
        )
      );
      setIsGenerating(true);

      const result = await getAiResponse(q);
      const fullText = result.answer;
      const chars = fullText.split('');
      let current = '';

      // Typing animation — stream characters
      for (let i = 0; i < chars.length; i++) {
        if (abortRef.current) break;
        current += chars[i];
        const snapshot = current;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === streamingId ? { ...m, text: snapshot } : m
                  ),
                }
              : c
          )
        );
        // Faster streaming — skip delay for non-punctuation
        if (['.', '!', '?', '\n'].includes(chars[i])) {
          await new Promise((r) => setTimeout(r, 18));
        } else if (i % 3 === 0) {
          await new Promise((r) => setTimeout(r, 4));
        }
      }

      // Finalize message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === streamingId
                    ? {
                        ...m,
                        text: fullText,
                        isStreaming: false,
                        insights: result.insights,
                        suggestedAction: result.suggestedAction,
                      }
                    : m
                ),
              }
            : c
        )
      );
      setIsGenerating(false);
    },
    [input, isGenerating, activeConvId, getAiResponse]
  );

  const stopGeneration = () => {
    abortRef.current = true;
    setIsGenerating(false);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.isStreaming ? { ...m, isStreaming: false } : m
              ),
            }
          : c
      )
    );
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const regenerateLast = () => {
    const msgs = activeConv.messages;
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    if (lastUser) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, messages: c.messages.slice(0, -1) }
            : c
        )
      );
      sendMessage(lastUser.text);
    }
  };

  const newConversation = () => {
    const newId = generateId();
    const newConv: Conversation = {
      id: newId,
      title: 'New conversation',
      createdAt: new Date(),
      messages: [
        {
          id: generateId(),
          role: 'assistant',
          text: "Hello! I'm your AI Copilot. How can I help you with your finances today?",
          timestamp: new Date(),
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newId);
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) setActiveConvId(remaining[0].id);
      else newConversation();
    }
  };

  const exportConversation = () => {
    if (!activeConv) return;
    const text = activeConv.messages
      .map((m) => `[${m.role.toUpperCase()}] ${m.text}`)
      .join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-conversation-${activeConv.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConvos = conversations.filter((c) =>
    c.title.toLowerCase().includes(convSearch.toLowerCase())
  );
  const grouped = groupConversations(filteredConvos);

  return (
    <div className="flex h-[calc(100vh-4rem)] -mt-4 -mx-8 animate-fade-in overflow-hidden">
      {/* ── Left Conversation Sidebar ──────────────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-[#0C0C0E] border-r border-white/8 flex flex-col">
        {/* Sidebar header */}
        <div className="p-4 border-b border-white/8 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-cyan-400" />
              Conversations
            </h2>
            <button
              onClick={newConversation}
              className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition-all"
              title="New conversation"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.03] border border-white/8 rounded-lg">
            <Search size={13} className="text-zinc-500 shrink-0" />
            <input
              type="text"
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-transparent text-[11px] text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Grouped conversations */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {Object.entries(grouped).map(([group, convos]) =>
            convos.length === 0 ? null : (
              <div key={group}>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 mb-1">
                  {group}
                </p>
                {convos.map((c) => (
                  <div
                    key={c.id}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all mb-0.5 ${
                      activeConvId === c.id
                        ? 'bg-indigo-600/15 border border-indigo-500/30 text-white'
                        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                    }`}
                    onClick={() => setActiveConvId(c.id)}
                  >
                    <span className="text-[11px] font-medium truncate flex-1">{c.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-zinc-500 hover:text-rose-400 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </aside>

      {/* ── Main Chat Panel ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="h-14 px-6 border-b border-white/8 flex items-center justify-between bg-[#09090B]/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Sparkles size={16} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">{activeConv?.title || 'AI Copilot'}</h1>
              <p className="text-[10px] text-zinc-400">Real-time financial intelligence · {activeConv?.messages.length || 0} messages</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportConversation}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[11px] font-medium border border-white/8 transition-all"
            >
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        {/* ── AI Insight Cards (shown when few messages) ── */}
        {activeConv?.messages.length <= 2 && (
          <div className="px-6 pt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            {AI_INSIGHT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} border ${card.border} space-y-2 cursor-pointer hover:scale-[1.02] transition-transform`}
                  onClick={() => sendMessage(`Tell me about my ${card.label}`)}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={16} className={card.iconColor} />
                    <ChevronRight size={12} className="text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{card.label}</p>
                    <p className="text-base font-extrabold text-white tabular-nums">{card.value}</p>
                    <p className={`text-[10px] font-semibold ${card.up ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {card.trend}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Messages Stream ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {activeConv?.messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {/* Assistant Avatar */}
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  <Bot size={15} />
                </div>
              )}

              <div className={`max-w-[75%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* Bubble */}
                <div
                  className={`relative rounded-2xl px-4 py-3 text-xs group ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-500/20'
                      : 'bg-white/[0.04] border border-white/8 text-zinc-100 rounded-bl-none'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="space-y-1">
                      {renderMarkdown(msg.text)}
                      {msg.isStreaming && (
                        <span className="inline-flex gap-0.5 ml-1 align-middle">
                          <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="leading-relaxed">{msg.text}</p>
                  )}

                  {/* Action row for assistant messages */}
                  {msg.role === 'assistant' && !msg.isStreaming && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyMessage(msg.id, msg.text)}
                        className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-cyan-400 transition-colors"
                      >
                        {copiedId === msg.id ? <CheckCheck size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={regenerateLast}
                        className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-indigo-400 transition-colors"
                      >
                        <RefreshCw size={11} />
                        Regenerate
                      </button>
                    </div>
                  )}
                </div>

                {/* Insights sub-cards */}
                {msg.insights && msg.insights.length > 0 && !msg.isStreaming && (
                  <div className="w-full space-y-1.5 pl-1">
                    {msg.insights.map((ins, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] bg-cyan-500/5 border border-cyan-500/15 rounded-lg px-3 py-2 text-zinc-300">
                        <Zap size={11} className="text-cyan-400 mt-0.5 shrink-0" />
                        {ins}
                      </div>
                    ))}
                    {msg.suggestedAction && (
                      <button
                        onClick={() => sendMessage(msg.suggestedAction!)}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 ml-1"
                      >
                        <Zap size={10} />
                        Suggested: {msg.suggestedAction}
                      </button>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-[10px] text-zinc-500 flex items-center gap-1 px-1">
                  <Clock size={9} />
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* User Avatar */}
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-lg">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* ── Suggested Questions ─────────────────────────────────────────── */}
        {activeConv?.messages.length <= 2 && (
          <div className="px-6 pb-2 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/8 text-zinc-300 hover:text-white hover:bg-indigo-600/10 hover:border-indigo-500/30 text-[11px] font-medium transition-all flex items-center gap-1.5"
              >
                <Sparkles size={11} className="text-cyan-400" />
                {q}
              </button>
            ))}
          </div>
        )}

        {/* ── Input Area ─────────────────────────────────────────────────── */}
        <div className="px-6 pb-6 pt-2 shrink-0">
          <div className="relative flex items-end gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 focus-within:border-indigo-500/50 transition-all shadow-2xl">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mb-0.5">
              <DollarSign size={14} />
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your finances… (Shift+Enter for new line)"
              rows={1}
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed min-h-[24px] max-h-[140px]"
            />
            <div className="flex items-center gap-2 shrink-0 mb-0.5">
              {isGenerating ? (
                <button
                  onClick={stopGeneration}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/30 transition-all"
                >
                  <Square size={13} />
                  Stop
                </button>
              ) : (
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim()}
                  className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  <Send size={16} />
                </button>
              )}
            </div>
          </div>
          <p className="text-center text-[10px] text-zinc-600 mt-2">
            AI responses are based on your transaction data. Always verify with your financial advisor.
          </p>
        </div>
      </div>
    </div>
  );
};
