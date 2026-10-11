import React, { useMemo } from 'react';
import { Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useExpenses } from '../context/ExpenseContext';
import { Button, Card, CardHeader, EmptyState } from '../components/ui';
import { formatCurrency } from '../lib/utils';
import { encodeCsv } from '../lib/csv';

function downloadCsv(filename: string, rows: string[][]) {
  const csv = encodeCsv(rows);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const ReportsPage: React.FC = () => {
  const { expenses } = useExpenses();

  const byMonth = useMemo(() => {
    const map = new Map<string, { expense: number; count: number }>();
    for (const e of expenses) {
      const key = e.expenseDate.slice(0, 7);
      const cur = map.get(key) ?? { expense: 0, count: 0 };
      cur.expense += e.amount;
      cur.count += 1;
      map.set(key, cur);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, ...v }));
  }, [expenses]);

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const exportReport = () => {
    downloadCsv(`expense-report-${new Date().toISOString().slice(0, 10)}.csv`, [
      ['Date', 'Title', 'Category', 'Amount'],
      ...expenses.map((e) => [e.expenseDate, e.title, e.category, e.amount.toFixed(2)]),
    ]);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Reports</h1>
          <p className="text-xs text-zinc-400">
            Monthly totals from current expenses · {formatCurrency(total)} across {expenses.length} rows
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={exportReport} disabled={expenses.length === 0}>
          <Download size={15} />
          Export CSV
        </Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState title="Nothing to report" description="Add expenses, then export a CSV of this workspace." />
      ) : (
        <Card className="space-y-4">
          <CardHeader title="Spend by month" subtitle="Grouped from expenseDate" />
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth}>
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
                <Bar dataKey="expense" fill="#14B8A6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-zinc-500 uppercase tracking-wider text-[10px] border-b border-white/10">
                  <th className="pb-2">Month</th>
                  <th className="pb-2">Transactions</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {byMonth.map((row) => (
                  <tr key={row.month}>
                    <td className="py-2 font-semibold">{row.month}</td>
                    <td className="py-2 text-zinc-400">{row.count}</td>
                    <td className="py-2 text-right font-mono">{formatCurrency(row.expense)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
