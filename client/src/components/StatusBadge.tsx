/**
 * Status Badge Component
 * Design: Nature-Inspired Manufacturing CRM
 * - Color-coded status indicators (Running, Idle, Error)
 * - Animated pulse for running status
 * - Rounded pill shape
 */

import { getStatusColor, getStatusIcon } from '@/lib/formatters';

interface StatusBadgeProps {
  status: 'running' | 'idle' | 'error';
  label?: string;
}

export default function StatusBadge({ status, label = '' }: StatusBadgeProps) {
  const colorClass = getStatusColor(status);
  const icon = getStatusIcon(status);

  return (
    <span className={`status-badge ${colorClass}`}>
      <span
        className={`text-lg leading-none ${
          status === 'running' ? 'animate-pulse' : ''
        }`}
      >
        {icon}
      </span>
      <span className="capitalize">
        {label || status}
      </span>
    </span>
  );
}
