/**
 * Dark Theme Header Component
 * Design: Dark CRM with Yellow/Gold Accents
 * - Top header with title and time period selector
 * - Yellow/gold accent button for selected period
 * - Refresh and custom range options
 */

import { Calendar, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DarkHeaderProps {
  title: string;
  subtitle?: string;
  selectedPeriod?: 'today' | 'week' | 'month' | 'quarter' | 'year';
  onPeriodChange?: (period: string) => void;
  onRefresh?: () => void;
}

export default function DarkHeader({
  title,
  subtitle,
  selectedPeriod = 'month',
  onPeriodChange,
  onRefresh,
}: DarkHeaderProps) {
  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
  ];

  return (
    <div className="bg-background border-b border-border">
      <div className="ml-64 px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="display-text text-3xl text-white mb-1">{title}</h1>
            {subtitle && <p className="text-text-secondary">{subtitle}</p>}
          </div>

          {/* Period Selector and Controls */}
          <div className="flex items-center gap-4">
            {/* Period Buttons */}
            <div className="flex items-center gap-2 bg-sidebar rounded-lg p-1">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => onPeriodChange?.(period.id)}
                  className={`px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period.id
                      ? 'bg-yellow-600 text-black'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>

            {/* Custom Range Button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border text-text-secondary hover:text-white"
            >
              <Calendar size={16} />
              Custom Range
            </Button>

            {/* Refresh Button */}
            <Button
              size="sm"
              onClick={onRefresh}
              className="gap-2 border-border text-text-secondary hover:text-white"
              variant="outline"
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
