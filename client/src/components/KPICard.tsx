/**
 * KPI Card Component
 * Design: Nature-Inspired Manufacturing CRM
 * - Gradient background (white to sage green)
 * - Large metric value with Geist font
 * - Subtle sparkline for trend visualization
 * - Soft shadows and hover effects
 */

import { ReactNode } from 'react';
import { TrendingUp } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: number;
  showSparkline?: boolean;
  className?: string;
}

export default function KPICard({
  label,
  value,
  unit,
  icon,
  trend,
  showSparkline = false,
  className = '',
}: KPICardProps) {
  return (
    <div
      className={`card-gradient rounded-lg p-6 border border-sage-green/20 transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 ${className}`}
    >
      {/* Header with icon and label */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-soft-wood">{label}</h3>
        {icon && <div className="text-deep-green opacity-60">{icon}</div>}
      </div>

      {/* Main value */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="display-text text-3xl text-charcoal">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>

      {/* Trend indicator */}
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-xs text-green-700">
          <TrendingUp className="w-3 h-3" />
          <span>+{trend}% from last period</span>
        </div>
      )}

      {/* Sparkline placeholder */}
      {showSparkline && (
        <div className="mt-3 h-8 bg-sage-green/30 rounded opacity-40 flex items-end justify-between px-1 py-1">
          {[40, 60, 50, 70, 55, 80, 65].map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-deep-green/40 rounded-sm mx-0.5"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
