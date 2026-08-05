import React, { useState, useMemo } from 'react';
import {
  Search, HelpCircle, FileText, Bug, Lightbulb,
  MessageSquare, CheckCircle2, XCircle, AlertCircle,
  ChevronDown, ChevronUp, ExternalLink, Send, Upload,
  RefreshCw, Ticket, Clock, ChevronRight, Zap, Heart, Plus,
  Server, Database, Radio, Mail, Shield, Activity
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

// ── Types ─────────────────────────────────────────────────────────────────────
type SupportTab = 'overview' | 'faq' | 'docs' | 'bug' | 'feature' | 'feedback' | 'tickets' | 'status';
type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type SystemStatus = 'HEALTHY' | 'DEGRADED' | 'OFFLINE';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface SupportTicket {
  id: string;
  title: string;
  status: TicketStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created: string;
  updated: string;
  replies: number;
}

interface SystemService {
  name: string;
  status: SystemStatus;
  latency: string;
  uptime: string;
  icon: React.FC<any>;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const FAQ_ITEMS: FaqItem[] = [
  { id: '1', category: 'Expenses', question: 'How do I add a new expense?', answer: 'Click the "+ Add Transaction" button in the top navigation bar or use the Ctrl+K command palette. Fill in the merchant name, amount, category, and date. Each transaction is automatically assigned a UUID Idempotency-Key to prevent duplicates.' },
  { id: '2', category: 'Expenses', question: 'Can I edit or delete an existing expense?', answer: 'Yes. Open the transaction from the Transactions page and click "View Drawer →". The detail drawer shows all metadata. Editing is done via the edit form and uses JPA Optimistic Locking (version control) to prevent concurrent modification conflicts.' },
  { id: '3', category: 'Budgets', question: 'How do budget alerts work?', answer: 'Budget alerts are triggered when spending in a category reaches 80% of the limit (Warning) or exceeds 100% (Exceeded). Alerts are shown in real-time via the notification bell and can trigger email/push notifications based on your settings.' },
  { id: '4', category: 'Budgets', question: 'How do I set a budget for a new category?', answer: 'Navigate to the Budgets page and click "New Category Budget". Set the monthly cap amount and SmartExpense will track spending in real-time using Redis-cached aggregations.' },
  { id: '5', category: 'Analytics', question: 'What does the Financial Health Score mean?', answer: 'The Financial Health Score (0–100) is calculated from your savings rate, budget adherence, spending trend, and debt ratios. A score of 89+ indicates excellent financial health. The score is updated in real-time as you add new transactions.' },
  { id: '6', category: 'AI', question: 'How does the AI Copilot work?', answer: 'The AI Copilot uses your actual transaction data to answer natural language queries. Ask questions like "How much did I spend on food?" or "Predict next month\'s expenses." Responses include contextual insights and suggested optimization actions.' },
  { id: '7', category: 'Reports', question: 'How do I export my financial data?', answer: 'Go to Reports → Export. Available formats include CSV (spreadsheet), JSON (machine-readable), and PDF (print-ready report). You can also request a full account archive from the Settings → Data Export section.' },
  { id: '8', category: 'Security', question: 'How is my data secured?', answer: 'SmartExpense uses JWT-based authentication with automatic token refresh, HTTPS encryption in transit, and bcrypt password hashing. All API endpoints require authentication. Enable 2FA from Settings → Security for additional protection.' },
  { id: '9', category: 'Authentication', question: 'I forgot my password. How do I reset it?', answer: 'Click "Forgot Password?" on the login page. Enter your email address and you\'ll receive a secure reset link valid for 15 minutes. For security, the link is single-use and cannot be reused.' },
  { id: '10', category: 'Deployment', question: 'Can I self-host SmartExpense?', answer: 'Yes. SmartExpense V2 supports Docker Compose deployment with MySQL 8, Redis, and the Spring Boot backend. See the Architecture documentation for detailed setup instructions and production configuration.' },
];

const DOCS_SECTIONS = [
  { title: 'Getting Started', desc: 'Installation, initial setup, and first steps', icon: Zap, articles: 6 },
  { title: 'Transactions', desc: 'Managing expenses, incomes, and categories', icon: FileText, articles: 12 },
  { title: 'Budgets & Alerts', desc: 'Setting limits and threshold notifications', icon: AlertCircle, articles: 8 },
  { title: 'Analytics & Reports', desc: 'Charts, filters, and data exports', icon: Activity, articles: 10 },
  { title: 'AI Copilot', desc: 'Natural language finance queries and predictions', icon: Lightbulb, articles: 5 },
  { title: 'Settings & Security', desc: '2FA, API keys, sessions, and privacy', icon: Shield, articles: 9 },
  { title: 'API Reference', desc: 'REST API endpoints and authentication', icon: Server, articles: 24 },
  { title: 'Deployment Guide', desc: 'Docker, production config, and CI/CD', icon: Database, articles: 7 },
];

const INITIAL_TICKETS: SupportTicket[] = [
  { id: 'TKT-1042', title: 'Budget alert notification not firing on mobile', status: 'IN_PROGRESS', priority: 'HIGH', created: 'Aug 3, 2026', updated: '2 hours ago', replies: 4 },
  { id: 'TKT-1038', title: 'CSV export missing custom date range filter', status: 'OPEN', priority: 'MEDIUM', created: 'Aug 1, 2026', updated: 'Aug 2, 2026', replies: 1 },
  { id: 'TKT-1031', title: 'Two-factor authentication setup error', status: 'RESOLVED', priority: 'HIGH', created: 'Jul 28, 2026', updated: 'Jul 30, 2026', replies: 6 },
  { id: 'TKT-1019', title: 'AI Copilot streaming delay on slow connections', status: 'CLOSED', priority: 'LOW', created: 'Jul 20, 2026', updated: 'Jul 25, 2026', replies: 2 },
];

const SYSTEM_SERVICES: SystemService[] = [
  { name: 'Backend API', status: 'HEALTHY', latency: '12ms', uptime: '99.98%', icon: Server },
  { name: 'MySQL Database', status: 'HEALTHY', latency: '4ms', uptime: '99.99%', icon: Database },
  { name: 'Redis Cache', status: 'HEALTHY', latency: '1ms', uptime: '99.99%', icon: Zap },
  { name: 'Kafka Broker', status: 'DEGRADED', latency: '245ms', uptime: '97.4%', icon: Radio },
  { name: 'AI Inference', status: 'HEALTHY', latency: '380ms', uptime: '99.5%', icon: Lightbulb },
  { name: 'Email Service', status: 'HEALTHY', latency: '28ms', uptime: '99.9%', icon: Mail },
  { name: 'Authentication', status: 'HEALTHY', latency: '8ms', uptime: '99.99%', icon: Shield },
];

// ── Status Helpers ────────────────────────────────────────────────────────────
const statusColors: Record<SystemStatus, string> = {
  HEALTHY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  DEGRADED: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  OFFLINE: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};
const statusDot: Record<SystemStatus, string> = {
  HEALTHY: 'bg-emerald-500',
  DEGRADED: 'bg-amber-500 animate-pulse',
  OFFLINE: 'bg-rose-500',
};

const ticketStatusColors: Record<TicketStatus, string> = {
  OPEN: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  IN_PROGRESS: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  CLOSED: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};
const priorityColors: Record<string, string> = {
  CRITICAL: 'text-rose-400', HIGH: 'text-amber-400', MEDIUM: 'text-blue-400', LOW: 'text-zinc-400',
};

// ── FAQ Accordion ─────────────────────────────────────────────────────────────
const FaqAccordion: React.FC<{ item: FaqItem }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border transition-all ${open ? 'bg-white/[0.04] border-indigo-500/30' : 'bg-white/[0.02] border-white/8 hover:border-white/15'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">{item.category}</span>
          <span className="text-sm font-semibold text-white">{item.question}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-indigo-400 shrink-0" /> : <ChevronDown size={16} className="text-zinc-500 shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-white/8">
          <p className="text-xs text-zinc-300 leading-relaxed pt-3">{item.answer}</p>
        </div>
      )}
    </div>
  );
};

// ── Star Rating ───────────────────────────────────────────────────────────────
const StarRating: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        onClick={() => onChange(s)}
        className={`text-2xl transition-all hover:scale-110 ${s <= value ? 'text-amber-400' : 'text-zinc-700 hover:text-amber-300'}`}
      >
        ★
      </button>
    ))}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export const SupportPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<SupportTab>('overview');
  const [globalSearch, setGlobalSearch] = useState('');
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState('ALL');

  // Bug report form
  const [bugTitle, setBugTitle] = useState('');
  const [bugDesc, setBugDesc] = useState('');
  const [bugSeverity, setBugSeverity] = useState('MEDIUM');
  const [bugBrowser, setBugBrowser] = useState(navigator.userAgent.split(') ')[0].split(' (')[0]);
  const [bugSteps, setBugSteps] = useState('');
  const [bugSubmitted, setBugSubmitted] = useState(false);
  const [bugSubmitting, setBugSubmitting] = useState(false);

  // Feature request form
  const [featTitle, setFeatTitle] = useState('');
  const [featDesc, setFeatDesc] = useState('');
  const [featPriority, setFeatPriority] = useState('MEDIUM');
  const [featValue, setFeatValue] = useState('');
  const [featOutcome, setFeatOutcome] = useState('');
  const [featSubmitted, setFeatSubmitted] = useState(false);
  const [featSubmitting, setFeatSubmitting] = useState(false);

  // Feedback form
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const faqCategories = useMemo(() => ['ALL', ...Array.from(new Set(FAQ_ITEMS.map((f) => f.category)))], []);

  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((f) => {
      const matchCat = faqCategory === 'ALL' || f.category === faqCategory;
      const matchSearch = !faqSearch || f.question.toLowerCase().includes(faqSearch.toLowerCase()) || f.answer.toLowerCase().includes(faqSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [faqSearch, faqCategory]);

  const globalResults = useMemo(() => {
    if (!globalSearch) return [];
    return FAQ_ITEMS.filter(
      (f) => f.question.toLowerCase().includes(globalSearch.toLowerCase()) || f.answer.toLowerCase().includes(globalSearch.toLowerCase())
    ).slice(0, 5);
  }, [globalSearch]);

  const submitBug = () => {
    setBugSubmitting(true);
    setTimeout(() => {
      setBugSubmitting(false);
      setBugSubmitted(true);
      addNotification('Bug Report Submitted', `TKT-${Math.floor(Math.random() * 1000 + 2000)} created. We'll review within 24h.`, 'SUCCESS');
    }, 1500);
  };

  const submitFeature = () => {
    setFeatSubmitting(true);
    setTimeout(() => {
      setFeatSubmitting(false);
      setFeatSubmitted(true);
      addNotification('Feature Request Submitted', 'Your request has been added to our product backlog.', 'SUCCESS');
    }, 1500);
  };

  const submitFeedback = () => {
    if (!feedbackRating) return;
    setFeedbackSubmitted(true);
    addNotification('Thank You!', `Your ${feedbackRating}-star feedback has been recorded.`, 'SUCCESS');
  };

  const tabs: { id: SupportTab; label: string; icon: React.FC<any> }[] = [
    { id: 'overview', label: 'Help Center', icon: HelpCircle },
    { id: 'faq', label: 'FAQ', icon: MessageSquare },
    { id: 'docs', label: 'Documentation', icon: FileText },
    { id: 'bug', label: 'Bug Report', icon: Bug },
    { id: 'feature', label: 'Feature Request', icon: Lightbulb },
    { id: 'feedback', label: 'Feedback', icon: Heart },
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
    { id: 'status', label: 'System Status', icon: Activity },
  ];

  const healthyCount = SYSTEM_SERVICES.filter((s) => s.status === 'HEALTHY').length;
  const degradedCount = SYSTEM_SERVICES.filter((s) => s.status === 'DEGRADED').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Global Search Hero ──────────────────────────────────────────── */}
      <div className="relative p-8 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-[#121214] to-cyan-950/40 border border-white/10 glass-card text-center space-y-4 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <p className="text-xs text-indigo-400 font-semibold uppercase tracking-widest">SmartExpense V2 Help Center</p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">How can we help you today?</h1>
          <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3 bg-white/[0.06] border border-white/15 rounded-2xl focus-within:border-indigo-500/50 transition-all shadow-2xl">
            <Search size={18} className="text-indigo-400 shrink-0" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search FAQs, documentation, guides..."
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-400 focus:outline-none"
            />
            {globalSearch && (
              <button onClick={() => setGlobalSearch('')} className="text-zinc-500 hover:text-white">
                <XCircle size={15} />
              </button>
            )}
          </div>

          {/* Global search results */}
          {globalResults.length > 0 && (
            <div className="max-w-lg mx-auto bg-[#18181B] border border-white/10 rounded-2xl overflow-hidden shadow-2xl text-left">
              {globalResults.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setActiveTab('faq'); setGlobalSearch(''); setFaqSearch(r.question); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 border-b border-white/5 transition-all"
                >
                  <MessageSquare size={14} className="text-indigo-400 shrink-0" />
                  <p className="text-xs text-white">{r.question}</p>
                  <ChevronRight size={12} className="text-zinc-500 ml-auto shrink-0" />
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-center gap-6 text-xs text-zinc-400 pt-2">
            <span>Popular: </span>
            {['Budget alerts', 'AI Copilot', 'Export data', '2FA setup'].map((q) => (
              <button key={q} onClick={() => setGlobalSearch(q)} className="text-indigo-400 hover:underline">{q}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Nav ─────────────────────────────────────────────────────── */}
      <div className="flex gap-1 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow'
                  : 'text-zinc-400 hover:text-white bg-white/[0.02] border border-white/5 hover:bg-white/[0.05]'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Overview ────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick action cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Browse FAQs', desc: `${FAQ_ITEMS.length} answers`, icon: MessageSquare, tab: 'faq' as SupportTab, color: 'from-indigo-500/15 to-indigo-600/5 border-indigo-500/20 text-indigo-400' },
              { label: 'Documentation', desc: '81 articles', icon: FileText, tab: 'docs' as SupportTab, color: 'from-cyan-500/15 to-cyan-600/5 border-cyan-500/20 text-cyan-400' },
              { label: 'Report a Bug', desc: 'Submit an issue', icon: Bug, tab: 'bug' as SupportTab, color: 'from-rose-500/15 to-rose-600/5 border-rose-500/20 text-rose-400' },
              { label: 'System Status', desc: `${healthyCount}/${SYSTEM_SERVICES.length} operational`, icon: Activity, tab: 'status' as SupportTab, color: `from-emerald-500/15 to-emerald-600/5 border-emerald-500/20 text-emerald-400` },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.label}
                  onClick={() => setActiveTab(card.tab)}
                  className={`p-5 rounded-2xl bg-gradient-to-br border text-left space-y-3 hover:scale-[1.02] transition-transform glass-card ${card.color}`}
                >
                  <Icon size={22} />
                  <div>
                    <p className="text-sm font-bold text-white">{card.label}</p>
                    <p className="text-[11px] text-zinc-400">{card.desc}</p>
                  </div>
                  <ChevronRight size={14} className="text-zinc-500" />
                </button>
              );
            })}
          </div>

          {/* System status mini badge */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${degradedCount > 0 ? 'bg-amber-500/8 border-amber-500/20' : 'bg-emerald-500/8 border-emerald-500/20'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${degradedCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <p className="text-xs font-semibold text-white">
                {degradedCount > 0 ? `${degradedCount} service${degradedCount > 1 ? 's' : ''} experiencing degraded performance` : 'All systems operational'}
              </p>
            </div>
            <button onClick={() => setActiveTab('status')} className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1">
              View Status <ChevronRight size={11} />
            </button>
          </div>

          {/* Top FAQ preview */}
          <div className="p-6 rounded-3xl glass-card space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Frequently Asked Questions</h3>
              <button onClick={() => setActiveTab('faq')} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1">
                See All {FAQ_ITEMS.length} FAQs <ChevronRight size={13} />
              </button>
            </div>
            {FAQ_ITEMS.slice(0, 4).map((f) => <FaqAccordion key={f.id} item={f} />)}
          </div>

          {/* Contact support */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Mail, title: 'Email Support', desc: 'support@smartexpense.com', sub: 'Response within 24h', btn: 'Send Email', color: 'text-indigo-400' },
              { icon: MessageSquare, title: 'Live Chat', desc: 'Chat with our team', sub: 'Weekdays 9AM–6PM IST', btn: 'Start Chat', color: 'text-cyan-400' },
              { icon: FileText, title: 'Submit a Ticket', desc: 'Track your issue', sub: 'Priority queue available', btn: 'New Ticket', color: 'text-emerald-400' },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="p-5 rounded-2xl glass-card space-y-3 hover:bg-white/[0.05] transition-all">
                  <Icon size={20} className={c.color} />
                  <div>
                    <p className="text-sm font-bold text-white">{c.title}</p>
                    <p className="text-xs text-zinc-300">{c.desc}</p>
                    <p className="text-[11px] text-zinc-500">{c.sub}</p>
                  </div>
                  <button className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                    {c.btn} <ExternalLink size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      {activeTab === 'faq' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1 px-3.5 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl focus-within:border-indigo-500/50 transition-all">
              <Search size={15} className="text-zinc-500 shrink-0" />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Search FAQs..."
                className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {faqCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFaqCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${faqCategory === cat ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' : 'bg-white/[0.02] border-white/8 text-zinc-400 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <HelpCircle size={40} className="text-zinc-600 mx-auto" />
              <p className="text-zinc-400 text-sm">No FAQs match your search.</p>
              <button onClick={() => { setFaqSearch(''); setFaqCategory('ALL'); }} className="text-indigo-400 text-xs hover:underline">Clear filters</button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFaqs.map((f) => <FaqAccordion key={f.id} item={f} />)}
            </div>
          )}
        </div>
      )}

      {/* ── Documentation ───────────────────────────────────────────────── */}
      {activeTab === 'docs' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOCS_SECTIONS.map((doc) => {
              const Icon = doc.icon;
              return (
                <div key={doc.title} className="p-5 rounded-2xl glass-card glass-card-hover space-y-3 cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{doc.title}</p>
                    <p className="text-[11px] text-zinc-400">{doc.desc}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">{doc.articles} articles</span>
                    <ExternalLink size={12} className="text-indigo-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bug Report ──────────────────────────────────────────────────── */}
      {activeTab === 'bug' && (
        <div className="max-w-2xl">
          {bugSubmitted ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Bug Report Submitted!</h3>
              <p className="text-xs text-zinc-400">Our engineering team will review your report within 24 hours. You'll receive an email notification when the status changes.</p>
              <button onClick={() => { setBugSubmitted(false); setBugTitle(''); setBugDesc(''); setBugSteps(''); }} className="px-5 py-2.5 rounded-xl primary-gradient-bg text-white text-xs font-bold shadow primary-gradient-glow">
                Submit Another Report
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-3xl glass-card space-y-5">
              <div>
                <h2 className="font-bold text-lg text-white flex items-center gap-2"><Bug size={20} className="text-rose-400" /> Bug Report</h2>
                <p className="text-xs text-zinc-400 mt-1">Help us fix issues by providing detailed reproduction steps.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Bug Title *</label>
                  <input type="text" value={bugTitle} onChange={(e) => setBugTitle(e.target.value)} placeholder="Brief description of the issue" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Severity</label>
                    <select value={bugSeverity} onChange={(e) => setBugSeverity(e.target.value)} className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500">
                      {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Browser / OS</label>
                    <input type="text" value={bugBrowser} onChange={(e) => setBugBrowser(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Description *</label>
                  <textarea rows={3} value={bugDesc} onChange={(e) => setBugDesc(e.target.value)} placeholder="What did you expect to happen? What actually happened?" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Steps to Reproduce</label>
                  <textarea rows={3} value={bugSteps} onChange={(e) => setBugSteps(e.target.value)} placeholder="1. Go to…&#10;2. Click on…&#10;3. See error" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition-colors resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Screenshot (Optional)</label>
                  <label className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-dashed border-white/15 rounded-xl cursor-pointer hover:bg-white/[0.04] transition-all">
                    <Upload size={16} className="text-zinc-500" />
                    <span className="text-xs text-zinc-400">Click to attach screenshot (PNG, JPG · max 5MB)</span>
                  </label>
                </div>
              </div>

              <button
                onClick={submitBug}
                disabled={!bugTitle || !bugDesc || bugSubmitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50"
              >
                {bugSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                {bugSubmitting ? 'Submitting...' : 'Submit Bug Report'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Feature Request ──────────────────────────────────────────────── */}
      {activeTab === 'feature' && (
        <div className="max-w-2xl">
          {featSubmitted ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto">
                <Lightbulb size={36} className="text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Feature Request Submitted!</h3>
              <p className="text-xs text-zinc-400">Your idea has been added to our product backlog. Our product team will review it and provide an update on prioritization.</p>
              <button onClick={() => { setFeatSubmitted(false); setFeatTitle(''); setFeatDesc(''); setFeatValue(''); setFeatOutcome(''); }} className="px-5 py-2.5 rounded-xl primary-gradient-bg text-white text-xs font-bold shadow primary-gradient-glow">
                Submit Another Request
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-3xl glass-card space-y-5">
              <div>
                <h2 className="font-bold text-lg text-white flex items-center gap-2"><Lightbulb size={20} className="text-amber-400" /> Feature Request</h2>
                <p className="text-xs text-zinc-400 mt-1">Describe the feature and the business value it would deliver.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Feature Title *</label>
                  <input type="text" value={featTitle} onChange={(e) => setFeatTitle(e.target.value)} placeholder="Name of the feature" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Priority</label>
                  <select value={featPriority} onChange={(e) => setFeatPriority(e.target.value)} className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500">
                    {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Description *</label>
                  <textarea rows={3} value={featDesc} onChange={(e) => setFeatDesc(e.target.value)} placeholder="Describe the feature in detail…" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Business Value</label>
                  <textarea rows={2} value={featValue} onChange={(e) => setFeatValue(e.target.value)} placeholder="Why is this important? Who benefits?" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Expected Outcome</label>
                  <textarea rows={2} value={featOutcome} onChange={(e) => setFeatOutcome(e.target.value)} placeholder="What should happen when this feature is implemented?" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none" />
                </div>
              </div>

              <button
                onClick={submitFeature}
                disabled={!featTitle || !featDesc || featSubmitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl primary-gradient-bg text-white text-xs font-bold shadow-lg primary-gradient-glow transition-all disabled:opacity-50"
              >
                {featSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                {featSubmitting ? 'Submitting...' : 'Submit Feature Request'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Feedback ────────────────────────────────────────────────────── */}
      {activeTab === 'feedback' && (
        <div className="max-w-lg">
          {feedbackSubmitted ? (
            <div className="py-16 text-center space-y-5">
              <div className="w-24 h-24 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto animate-bounce">
                <Heart size={36} className="text-amber-400 fill-amber-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Thank You! 🎉</h3>
              <p className="text-sm text-zinc-400">Your {feedbackRating}-star rating means a lot to us. We'll use your feedback to keep improving SmartExpense.</p>
              <div className="flex gap-1 justify-center text-3xl">
                {[1,2,3,4,5].map((s) => (
                  <span key={s} className={s <= feedbackRating ? 'text-amber-400' : 'text-zinc-700'}>★</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-3xl glass-card space-y-6">
              <div>
                <h2 className="font-bold text-lg text-white flex items-center gap-2"><Heart size={20} className="text-amber-400" /> Share Your Feedback</h2>
                <p className="text-xs text-zinc-400 mt-1">Help us improve SmartExpense V2 with your honest review.</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-400">Overall Rating</p>
                <StarRating value={feedbackRating} onChange={setFeedbackRating} />
                <p className="text-[11px] text-zinc-500">
                  {feedbackRating === 5 ? '⭐ Excellent!' : feedbackRating === 4 ? '👍 Great!' : feedbackRating === 3 ? '🙂 Good' : feedbackRating === 2 ? '😐 Needs work' : feedbackRating === 1 ? '😞 Poor' : 'Select a rating'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Comments (Optional)</label>
                <textarea
                  rows={5}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Tell us what you love, what needs improvement, or any suggestions..."
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              <button
                onClick={submitFeedback}
                disabled={!feedbackRating}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all disabled:opacity-50"
              >
                <Send size={14} />
                Submit Feedback
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Tickets ─────────────────────────────────────────────────────── */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white">Support Tickets</h2>
            <button
              onClick={() => setActiveTab('bug')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl primary-gradient-bg text-white text-xs font-semibold shadow primary-gradient-glow"
            >
              <Plus size={14} />
              New Ticket
            </button>
          </div>

          <div className="space-y-3">
            {INITIAL_TICKETS.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl glass-card hover:bg-white/[0.05] transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-zinc-500">{t.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ticketStatusColors[t.status]}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-semibold ${priorityColors[t.priority]}`}>
                        {t.priority}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white">{t.title}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-[11px] text-zinc-500">
                      <span className="flex items-center gap-1"><Clock size={10} /> Created {t.created}</span>
                      <span className="flex items-center gap-1"><RefreshCw size={10} /> Updated {t.updated}</span>
                      <span className="flex items-center gap-1"><MessageSquare size={10} /> {t.replies} replies</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── System Status ────────────────────────────────────────────────── */}
      {activeTab === 'status' && (
        <div className="space-y-5">
          {/* Overall banner */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between ${degradedCount > 0 ? 'bg-amber-500/8 border-amber-500/25' : 'bg-emerald-500/8 border-emerald-500/25'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${degradedCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              <div>
                <p className="font-bold text-white text-sm">
                  {degradedCount > 0 ? 'Partial Outage Detected' : 'All Systems Operational'}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {SYSTEM_SERVICES.filter(s => s.status === 'HEALTHY').length} healthy · {degradedCount} degraded · Last updated 30s ago
                </p>
              </div>
            </div>
            <button className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {/* Services grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYSTEM_SERVICES.map((svc) => {
              const Icon = svc.icon;
              return (
                <div key={svc.name} className="p-5 rounded-2xl glass-card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${statusColors[svc.status]}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{svc.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-zinc-500">
                        <span>Latency: {svc.latency}</span>
                        <span>Uptime: {svc.uptime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${statusDot[svc.status]}`} />
                    <span className={`text-xs font-bold ${svc.status === 'HEALTHY' ? 'text-emerald-400' : svc.status === 'DEGRADED' ? 'text-amber-400' : 'text-rose-400'}`}>
                      {svc.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Incident history */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <h3 className="font-bold text-base text-white">Recent Incidents</h3>
            <div className="space-y-3">
              {[
                { date: 'Aug 3, 2026', title: 'Kafka Broker Elevated Latency', status: 'Ongoing', duration: '3h 12m', impact: 'Event streaming delays (non-critical)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                { date: 'Jul 28, 2026', title: 'Redis Cache Miss Spike', status: 'Resolved', duration: '45 min', impact: 'Dashboard load time increased 2-3s', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                { date: 'Jul 15, 2026', title: 'Database Connection Pool Exhaustion', status: 'Resolved', duration: '1h 20m', impact: '503 errors for 8% of requests', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              ].map((inc, i) => (
                <div key={i} className="flex items-start justify-between p-4 rounded-xl bg-white/[0.02] border border-white/8">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${inc.color}`}>{inc.status}</span>
                      <span className="text-[10px] text-zinc-500">{inc.date}</span>
                    </div>
                    <p className="text-xs font-semibold text-white">{inc.title}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{inc.impact}</p>
                  </div>
                  <span className="text-[11px] text-zinc-500 shrink-0 ml-4">{inc.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
