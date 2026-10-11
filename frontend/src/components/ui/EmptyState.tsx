import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}) => (
  <div className={cn('text-center py-10 text-zinc-500', className)}>
    {Icon && <Icon size={28} className="mx-auto mb-3 opacity-40" />}
    <p className="text-sm font-semibold text-zinc-300">{title}</p>
    {description && <p className="text-xs mt-1 text-zinc-500">{description}</p>}
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);
