import React from 'react';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export type StatTone = 'teal' | 'emerald' | 'rose' | 'cyan' | 'amber';

const toneMap: Record<StatTone, { color: string; bg: string; border: string }> = {
  teal: { color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  emerald: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  rose: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  cyan: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  amber: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
};

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone?: StatTone;
  trend?: 'up' | 'down';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon: Icon,
  tone = 'teal',
  trend = 'up',
  onClick,
}) => {
  const styles = toneMap[tone];
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <button
      type="button"
      onClick={onClick}
      className="p-6 rounded-2xl glass-card glass-card-hover space-y-3 text-left hover:ring-1 hover:ring-white/10 transition-all w-full"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{label}</span>
        <div className={cn('p-2 rounded-xl border', styles.bg, styles.color, styles.border)}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-white tabular-nums tracking-tight">{value}</h2>
        <div className={cn('flex items-center gap-1.5 text-xs font-semibold mt-1', styles.color)}>
          <TrendIcon size={14} />
          <span>{change}</span>
        </div>
      </div>
    </button>
  );
};
