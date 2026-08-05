import React, { useState, useMemo } from 'react';
import {
  Download, Filter, Calendar, FileText, RefreshCw,
  TrendingUp, TrendingDown, DollarSign, Sparkles,
  BarChart3, PieChart, Printer, Share2, Clock, CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart as RPieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend,
  LineChart, Line
} from 'recharts';
import { mockExpenses, mockBudgets } from '../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────
type ReportTab = 'monthly' | 'yearly' | 'category' | 'cashflow' | 'budget';
type ExportType = 'csv' | 'json' | 'print';

// ── Mock Data ─────────────────────────────────────────────────────────────────
const monthlyData = [
  { month: 'Jan', income: 11200, expense: 4200, savings: 7000 },
  { month: 'Feb', income: 11500, expense: 4500, savings: 7000 },
  { month: 'Mar', income: 11800, expense: 4100, savings: 7700 },
  { month: 'Apr', income: 12000, expense: 4900, savings: 7100 },
  { month: 'May', income: 12100, expense: 4300, savings: 7800 },
  { month: 'Jun', income: 12300, expense: 4600, savings: 7700 },
  { month: 'Jul', income: 12400, expense: 4820, savings: 7580 },
  { month: 'Aug', income: 12400, expense: 4820, savings: 7580 },
];

const yearlyData = [
  { year: '2023', income: 108000, expense: 48000, savings: 60000 },
  { year: '2024', income: 126000, expense: 52000, savings: 74000 },
  { year: '2025', income: 138000, expense: 55000, savings: 83000 },
  { year: '2026', income: 87200, expense: 33740, savings: 53460 },
];

const categoryData = [
  { name: 'Housing & Utilities', value: 1800, color: '#6366F1', pct: 37.3 },
  { name: 'Food & Dining', value: 950, color: '#EC4899', pct: 19.7 },
  { name: 'Shopping', value: 720, color: '#F59E0B', pct: 14.9 },
  { name: 'Infrastructure', value: 485, color: '#06B6D4', pct: 10.1 },
  { name: 'Transportation', value: 450, color: '#10B981', pct: 9.3 },
  { name: 'Health & Wellness', value: 280, color: '#8B5CF6', pct: 5.8 },
  { name: 'Entertainment', value: 135.5, color: '#F97316', pct: 2.8 },
];

const cashflowWeekly = [
  { week: 'Wk 1', income: 3100, expense: 1200, net: 1900 },
  { week: 'Wk 2', income: 3100, expense: 1450, net: 1650 },
  { week: 'Wk 3', income: 3100, expense: 1080, net: 2020 },
  { week: 'Wk 4', income: 3100, expense: 1090, net: 2010 },
];

const savingsForecast = [
  { month: 'Aug', actual: 7580, predicted: 7580 },
  { month: 'Sep', actual: null, predicted: 7750 },
  { month: 'Oct', actual: null, predicted: 7900 },
  { month: 'Nov', actual: null, predicted: 8100 },
  { month: 'Dec', actual: null, predicted: 8350 },
];

// Calendar heatmap mock (7×5 grid = 35 days)
const calendarData = Array.from({ length: 31 }, (_, i) => ({
  day: i + 1,
  amount: Math.random() > 0.3 ? Math.round(Math.random() * 400 + 20) : 0,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
function exportCSV() {
  const rows = [
    ['Date', 'Title', 'Category', 'Amount', 'Payment Method'],
    ...mockExpenses.map((e) => [e.expenseDate, e.title, e.category, e.amount.toString(), e.paymentMethod || '']),
  ];
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smart-expense-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON() {
  const data = {
    generated: new Date().toISOString(),
    summary: { totalIncome: 12400, totalExpense: 4820.5, netSavings: 7579.5 },
    expenses: mockExpenses,
    budgets: mockBudgets,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `smart-expense-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Reusable Chart Card ───────────────────────────────────────────────────────
const ChartCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; className?: string }> = ({
  title, subtitle, children, className = ''
}) => (
  <div className={`p-6 rounded-3xl glass-card space-y-4 ${className}`}>
    <div>
      <h3 className="font-bold text-base text-white">{title}</h3>
      {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const TOOLTIP_STYLE = {
  backgroundColor: '#18181B',
  borderColor: 'rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '12px',
};

// ── Scheduled Report Item ─────────────────────────────────────────────────────
interface ScheduledReport {
  id: string;
  name: string;
  frequency: string;
  nextRun: string;
  active: boolean;
}

// ── Main Component ────────────────────────────────────────────────────────────
export const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('monthly');
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [exportSuccess, setExportSuccess] = useState<ExportType | null>(null);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    { id: '1', name: 'Monthly Summary', frequency: 'Monthly', nextRun: 'Sep 1, 2026', active: true },
    { id: '2', name: 'Weekly Cash Flow', frequency: 'Weekly', nextRun: 'Aug 12, 2026', active: true },
    { id: '3', name: 'Quarterly Tax Report', frequency: 'Quarterly', nextRun: 'Oct 1, 2026', active: false },
  ]);

  const tabs: { id: ReportTab; label: string; icon: React.FC<any> }[] = [
    { id: 'monthly', label: 'Monthly', icon: Calendar },
    { id: 'yearly', label: 'Yearly', icon: TrendingUp },
    { id: 'category', label: 'Category', icon: PieChart },
    { id: 'cashflow', label: 'Cash Flow', icon: BarChart3 },
    { id: 'budget', label: 'Budget', icon: DollarSign },
  ];

  const handleExport = (type: ExportType) => {
    if (type === 'csv') exportCSV();
    else if (type === 'json') exportJSON();
    else if (type === 'print') window.print();
    setExportSuccess(type);
    setTimeout(() => setExportSuccess(null), 3000);
  };

  const toggleSchedule = (id: string) => {
    setScheduledReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
  };

  // KPI Summary
  const kpis = useMemo(() => [
    { label: 'Total Income', value: '$12,400.00', trend: '+8.2%', up: true, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Total Expenses', value: '$4,820.50', trend: '-5.1%', up: true, icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    { label: 'Net Savings', value: '$7,579.50', trend: '+18.4%', up: true, icon: DollarSign, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Savings Rate', value: '61.1%', trend: 'Excellent', up: true, icon: Sparkles, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  ], []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Reports & Analytics</h1>
          <p className="text-xs text-zinc-400">Generate, filter, and export comprehensive financial reports and insights.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter controls */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            {['2024', '2025', '2026'].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10 transition-all">
            <Filter size={13} />
            Filters
          </button>

          {/* Export actions */}
          <button onClick={() => handleExport('csv')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/20 transition-all">
            {exportSuccess === 'csv' ? <CheckCircle2 size={13} /> : <Download size={13} />}
            CSV
          </button>
          <button onClick={() => handleExport('json')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-cyan-500/20 transition-all">
            {exportSuccess === 'json' ? <CheckCircle2 size={13} /> : <FileText size={13} />}
            JSON
          </button>
          <button onClick={() => handleExport('print')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10 transition-all">
            <Printer size={13} />
            Print
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10 transition-all">
            <Share2 size={13} />
            Share
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="p-5 rounded-2xl glass-card glass-card-hover space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">{kpi.label}</span>
                <div className={`p-1.5 rounded-lg border ${kpi.bg}`}>
                  <Icon size={14} className={kpi.color} />
                </div>
              </div>
              <p className="text-xl font-extrabold text-white tabular-nums">{kpi.value}</p>
              <p className={`text-xs font-semibold ${kpi.up ? 'text-emerald-400' : 'text-rose-400'}`}>{kpi.trend}</p>
            </div>
          );
        })}
      </div>

      {/* ── Tab Navigation ──────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/8 rounded-2xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Monthly Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          {/* AI Summary */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-cyan-950/40 border border-indigo-500/20 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-cyan-300 mb-1">AI Monthly Summary — {selectedMonth} {selectedYear}</p>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Your {selectedMonth} financial performance is <strong className="text-white">exceptional</strong>. Net savings of <strong className="text-emerald-400">$7,579.50</strong> represent a 61.1% savings rate — well above the recommended 20-30%. Food & Dining budget slightly exceeded by $50. <strong className="text-amber-400">Action recommended</strong>: Set a weekly food spend alert to prevent recurrence.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard className="lg:col-span-2" title="Monthly Cashflow Timeline" subtitle="Income vs Expense over the past 8 months">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="ri" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="re" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#52525B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#52525B" fontSize={11} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, '']} />
                    <Legend />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#6366F1" strokeWidth={2} fill="url(#ri)" />
                    <Area type="monotone" dataKey="expense" name="Expenses" stroke="#EF4444" strokeWidth={2} fill="url(#re)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Savings Forecast */}
            <ChartCard title="Savings Forecast" subtitle="Predicted trajectory (Sep–Dec)">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={savingsForecast}>
                    <XAxis dataKey="month" stroke="#52525B" fontSize={11} />
                    <YAxis stroke="#52525B" fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(1)}k`} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => v ? [`$${Number(v).toLocaleString()}`, ''] : [null, '']} />
                    <Line type="monotone" dataKey="actual" name="Actual" stroke="#6366F1" strokeWidth={2.5} dot={{ fill: '#6366F1', r: 4 }} connectNulls={false} />
                    <Line type="monotone" dataKey="predicted" name="Forecast" stroke="#06B6D4" strokeWidth={2} strokeDasharray="6 3" dot={{ fill: '#06B6D4', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1.5 text-indigo-400"><span className="w-3 h-0.5 bg-indigo-400 inline-block" />Actual</span>
                <span className="flex items-center gap-1.5 text-cyan-400"><span className="w-3 h-0.5 bg-cyan-400 inline-block border-dashed" />Forecast</span>
              </div>
            </ChartCard>
          </div>

          {/* Expense Calendar Heatmap */}
          <ChartCard title={`Expense Calendar — ${selectedMonth} ${selectedYear}`} subtitle="Daily spending intensity map">
            <div className="grid grid-cols-7 gap-1.5">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                <div key={d} className="text-center text-[10px] text-zinc-500 font-semibold pb-1">{d}</div>
              ))}
              {/* Offset for month start */}
              {Array.from({ length: 4 }).map((_, i) => <div key={`pad-${i}`} />)}
              {calendarData.map((d) => {
                const intensity = d.amount > 300 ? 'bg-indigo-500' : d.amount > 150 ? 'bg-indigo-500/60' : d.amount > 50 ? 'bg-indigo-500/30' : d.amount > 0 ? 'bg-indigo-500/15' : 'bg-white/5';
                return (
                  <div
                    key={d.day}
                    className={`aspect-square rounded-md ${intensity} flex items-center justify-center cursor-pointer hover:ring-1 hover:ring-indigo-400 transition-all`}
                    title={`Aug ${d.day}: $${d.amount}`}
                  >
                    <span className="text-[9px] text-white/70">{d.day}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-2">
              <span>Less</span>
              {['bg-white/5','bg-indigo-500/15','bg-indigo-500/30','bg-indigo-500/60','bg-indigo-500'].map((c, i) => (
                <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
              ))}
              <span>More</span>
            </div>
          </ChartCard>

          {/* Transaction Table */}
          <ChartCard title="Transaction Details" subtitle={`${mockExpenses.length} transactions in ${selectedMonth}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/8 text-[10px] text-zinc-500 uppercase tracking-wider">
                    <th className="pb-2 text-left">Date</th>
                    <th className="pb-2 text-left">Merchant</th>
                    <th className="pb-2 text-left">Category</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {mockExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 font-mono text-zinc-400">{e.expenseDate}</td>
                      <td className="py-2.5 text-white font-medium">{e.title}</td>
                      <td className="py-2.5"><span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-zinc-300 border border-white/8">{e.category}</span></td>
                      <td className="py-2.5 text-right text-rose-400 font-mono font-bold">-${e.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/15">
                    <td colSpan={3} className="pt-3 text-xs font-bold text-zinc-400">Total Expenses</td>
                    <td className="pt-3 text-right text-rose-400 font-mono font-bold text-sm">
                      -${mockExpenses.reduce((s, e) => s + e.amount, 0).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ChartCard>
        </div>
      )}

      {/* ── Yearly Tab ──────────────────────────────────────────────────── */}
      {activeTab === 'yearly' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-indigo-950/40 border border-emerald-500/20 flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-300 mb-1">AI Yearly Analysis</p>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Year-over-year income growth of <strong className="text-emerald-400">+9.5%</strong> vs expense growth of only <strong className="text-amber-400">+5.8%</strong>. Your savings trajectory is <strong className="text-white">accelerating positively</strong>. 2026 is on track to be your best savings year with projected $91,000 in full-year net savings.
              </p>
            </div>
          </div>

          <ChartCard title="Year-over-Year Performance" subtitle="Income, Expense & Net Savings by Year">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData} barGap={4}>
                  <XAxis dataKey="year" stroke="#52525B" fontSize={11} />
                  <YAxis stroke="#52525B" fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="savings" name="Savings" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {yearlyData.map((y) => (
              <div key={y.year} className="p-5 rounded-2xl glass-card space-y-2">
                <p className="text-xs text-zinc-400 font-semibold">{y.year}</p>
                <p className="text-xl font-extrabold text-white tabular-nums">${(y.savings/1000).toFixed(1)}k</p>
                <p className="text-[11px] text-emerald-400">Net Savings</p>
                <div className="text-[10px] text-zinc-500 space-y-0.5">
                  <div>Income: ${(y.income/1000).toFixed(0)}k</div>
                  <div>Expense: ${(y.expense/1000).toFixed(0)}k</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Category Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'category' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Category Distribution" subtitle="Proportional monthly spend breakdown">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, i) => <Cell key={i} fill={categoryData[i].color} />)}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`$${v}`, '']} />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 text-[11px]">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="text-zinc-400 truncate">{c.name}</span>
                    <span className="text-zinc-300 font-mono ml-auto">{c.pct}%</span>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Category Amounts" subtitle="Actual spend per category (August 2026)">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" barSize={14}>
                    <XAxis type="number" stroke="#52525B" fontSize={10} tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="name" stroke="#52525B" fontSize={10} width={120} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`$${v}`, 'Amount']} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* ── Cash Flow Tab ────────────────────────────────────────────────── */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          <ChartCard title="Weekly Cash Flow" subtitle="Net flow by week — August 2026">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowWeekly}>
                  <XAxis dataKey="week" stroke="#52525B" fontSize={11} />
                  <YAxis stroke="#52525B" fontSize={11} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#6366F1" radius={[4,4,0,0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[4,4,0,0]} />
                  <Bar dataKey="net" name="Net" fill="#10B981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {cashflowWeekly.map((w) => (
              <div key={w.week} className="p-5 rounded-2xl glass-card space-y-3">
                <h4 className="font-bold text-sm text-white">{w.week}</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span className="text-zinc-400">Income</span><span className="text-indigo-400 font-mono font-bold">${w.income.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">Expenses</span><span className="text-rose-400 font-mono font-bold">${w.expense.toLocaleString()}</span></div>
                  <div className="flex justify-between border-t border-white/8 pt-1.5"><span className="text-white font-semibold">Net Flow</span><span className="text-emerald-400 font-mono font-bold">${w.net.toLocaleString()}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Budget Tab ───────────────────────────────────────────────────── */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <ChartCard title="Budget vs Actual Spending" subtitle="Category allocation performance — August 2026">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockBudgets.map((b) => ({ name: b.category.split(' ')[0], limit: b.limitAmount, spent: b.spentAmount || 0 }))}>
                  <XAxis dataKey="name" stroke="#52525B" fontSize={10} />
                  <YAxis stroke="#52525B" fontSize={10} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`$${Number(v).toFixed(2)}`, '']} />
                  <Legend />
                  <Bar dataKey="limit" name="Budget Limit" fill="#6366F1" radius={[4,4,0,0]} opacity={0.4} />
                  <Bar dataKey="spent" name="Actual Spent" fill="#06B6D4" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="space-y-3">
            {mockBudgets.map((b) => {
              const pct = Math.round(((b.spentAmount || 0) / b.limitAmount) * 100);
              const isOver = pct > 100;
              return (
                <div key={b.id} className="p-4 rounded-2xl glass-card flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-white">{b.category}</span>
                      <span className="font-mono text-zinc-400">${b.spentAmount?.toFixed(2)} / ${b.limitAmount.toFixed(2)}</span>
                    </div>
                    <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${isOver ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                  <span className={`text-xs font-bold tabular-nums w-14 text-right ${isOver ? 'text-rose-400' : pct >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Scheduled Reports ────────────────────────────────────────────── */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Clock size={16} className="text-indigo-400" />
              Scheduled Reports
            </h3>
            <p className="text-xs text-zinc-400">Automate report delivery to your inbox</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl primary-gradient-bg text-white text-xs font-semibold shadow-lg primary-gradient-glow">
            <RefreshCw size={13} />
            Add Schedule
          </button>
        </div>
        <div className="space-y-3">
          {scheduledReports.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/8 hover:bg-white/[0.04] transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${r.active ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                <div>
                  <p className="text-xs font-semibold text-white">{r.name}</p>
                  <p className="text-[10px] text-zinc-500">{r.frequency} · Next: {r.nextRun}</p>
                </div>
              </div>
              <button
                onClick={() => toggleSchedule(r.id)}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all ${r.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-zinc-400 border border-white/8'}`}
              >
                {r.active ? 'Active' : 'Paused'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
