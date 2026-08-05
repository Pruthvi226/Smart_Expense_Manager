import React from 'react';
import { Download } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip } from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const cashflowTrend = [
    { month: 'Jan', income: 11200, expense: 4200 },
    { month: 'Feb', income: 11500, expense: 4500 },
    { month: 'Mar', income: 11800, expense: 4100 },
    { month: 'Apr', income: 12000, expense: 4900 },
    { month: 'May', income: 12100, expense: 4300 },
    { month: 'Jun', income: 12300, expense: 4600 },
    { month: 'Jul', income: 12400, expense: 4820.50 },
  ];

  const categoryDistribution = [
    { name: 'Housing & Utilities', value: 1800, color: '#6366F1' },
    { name: 'Food & Dining', value: 950, color: '#EC4899' },
    { name: 'Shopping', value: 720, color: '#F59E0B' },
    { name: 'Infrastructure', value: 485, color: '#06B6D4' },
    { name: 'Transportation', value: 450, color: '#10B981' },
    { name: 'Wellness', value: 300, color: '#8B5CF6' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Financial Analytics & Intelligence</h1>
          <p className="text-xs text-zinc-400">Deep visual breakdowns of cashflow trends, velocity, and category distribution.</p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold border border-white/10 transition-all"
        >
          <Download size={15} />
          <span>Export Analytics PDF</span>
        </button>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Monthly Cashflow Trend</h3>
              <p className="text-xs text-zinc-400">6-Month Income vs Outflow Trajectory</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashflowTrend}>
                <defs>
                  <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#52525B" fontSize={11} />
                <YAxis stroke="#52525B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="income" stroke="#6366F1" strokeWidth={2} fill="url(#incG)" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} fill="url(#expG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Breakdown */}
        <div className="p-6 rounded-3xl glass-card space-y-4">
          <div>
            <h3 className="font-bold text-base text-white">Category Breakdown</h3>
            <p className="text-xs text-zinc-400">Proportional Monthly Share</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#18181B', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2">
            {categoryDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-300 font-medium">{item.name}</span>
                </div>
                <span className="font-mono text-white font-bold">${item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
