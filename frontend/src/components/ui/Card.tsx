import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  className,
  hover = false,
  padding = 'md',
  children,
  ...props
}) => (
  <div
    className={cn(
      'rounded-2xl glass-card',
      paddingClasses[padding],
      hover && 'glass-card-hover',
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, className }) => (
  <div className={cn('flex items-start justify-between gap-4', className)}>
    <div>
      <h3 className="font-bold text-base text-white">{title}</h3>
      {subtitle && <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);
