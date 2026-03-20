/**
 * Modernized KPI Card Component
 * Design: Contemporary with gradient backgrounds and accent borders
 */

import { ReactNode } from 'react';

interface ModernKPICardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  iconBg?: 'gold' | 'green' | 'orange' | 'red';
  className?: string;
  trend?: number;
}

const iconBgColors = {
  gold: 'kpi-icon-gold',
  green: 'kpi-icon-green',
  orange: 'kpi-icon-orange',
  red: 'kpi-icon-red',
};

export default function ModernKPICard({
  label,
  value,
  description,
  icon,
  iconBg = 'gold',
  className = '',
  trend,
}: ModernKPICardProps) {
  return (
    <div className={`kpi-card ${className}`}>
      {/* Header with icon */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1">
          <p className="text-muted-foreground text-xs font-600 uppercase tracking-widest mb-2">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="display-text text-3xl text-foreground">{value}</p>
            {trend !== undefined && (
              <span className={`text-sm font-600 ${trend >= 0 ? 'text-[color:var(--accent-green)]' : 'text-[color:var(--accent-red)]'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${iconBgColors[iconBg]} backdrop-blur-sm`}>
            {icon}
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-muted-foreground text-sm font-light relative z-10">{description}</p>
      )}
    </div>
  );
}
