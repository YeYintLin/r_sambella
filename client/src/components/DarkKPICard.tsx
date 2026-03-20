/**
 * Dark Theme KPI Card Component
 * Design: Dark CRM with Yellow/Gold Accents
 * - Dark background with border
 * - Large metric value
 * - Icon in top right with gold background
 * - Description text
 */

import { ReactNode } from 'react';

interface DarkKPICardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  iconBg?: 'gold' | 'green' | 'orange' | 'red';
  className?: string;
}

const iconBgColors = {
  gold: 'bg-yellow-900/30 text-yellow-500',
  green: 'bg-green-900/30 text-green-400',
  orange: 'bg-orange-900/30 text-orange-400',
  red: 'bg-red-900/30 text-red-400',
};

export default function DarkKPICard({
  label,
  value,
  description,
  icon,
  iconBg = 'gold',
  className = '',
}: DarkKPICardProps) {
  return (
    <div className={`card-dark ${className}`}>
      {/* Header with icon */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-text-muted text-sm font-medium uppercase tracking-wide mb-2">
            {label}
          </p>
          <p className="display-text text-3xl text-white">{value}</p>
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${iconBgColors[iconBg]}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-text-secondary text-sm">{description}</p>
      )}
    </div>
  );
}
