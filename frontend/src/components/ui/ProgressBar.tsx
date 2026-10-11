import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
  percent: number;
  status?: 'healthy' | 'warning' | 'exceeded';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  status = 'healthy',
  className,
}) => (
  <div className={cn('w-full h-2 rounded-full bg-white/10 overflow-hidden', className)}>
    <div
      className={cn(
        'h-full rounded-full transition-all duration-500',
        status === 'exceeded' && 'bg-rose-500',
        status === 'warning' && 'bg-amber-500',
        status === 'healthy' && 'bg-emerald-500',
      )}
      style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
    />
  </div>
);

export function budgetStatus(spent: number, limit: number): 'healthy' | 'warning' | 'exceeded' {
  if (spent > limit) return 'exceeded';
  if (limit > 0 && spent / limit >= 0.8) return 'warning';
  return 'healthy';
}
