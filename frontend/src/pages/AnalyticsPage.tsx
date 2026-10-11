import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip } from 'recharts';
import { useExpenses } from '../context/ExpenseContext';
import { Button, Card, CardHeader, EmptyState } from '../components/ui';
import { formatCurrency } from '../lib/utils';

const COLORS = ['#14B8A6', '#22D3EE', '#F43F5E', '#F59E0B', '#10B981', '#8B5CF6'];

export const AnalyticsPage: React.FC = () => {
  const { expenses } = useExpenses();

  const categoryDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount);
    }
    return [...map.entries()]
      .map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const monthlyTrend = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of expenses) {
      const key = e.expenseDate.slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + e.amount);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, expense]) => ({ month, expense }));
  }, [expenses]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
          <p className="text-xs text-zinc-400">
            Built from {expenses.length} loaded expenses · {formatCurrency(total)} total outflow
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Download size={15} />
          Print
        </Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState title="No expense data yet" description="Add transactions to see category and monthly charts." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-4">
            <CardHeader title="Monthly outflow" subtitle="Sum of expenses by year-month" />
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#52525B" fontSize={11} />
                  <YAxis stroke="#52525B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f1c27',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#14B8A6"
                    strokeWidth={2}
                    fill="url(#expG)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="space-y-4">
            <CardHeader title="By category" subtitle="Share of loaded expenses" />
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
                    {categoryDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f1c27', borderRadius: '12px', color: '#fff' }}
                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                  />
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
                  <span className="font-mono text-white font-bold">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
