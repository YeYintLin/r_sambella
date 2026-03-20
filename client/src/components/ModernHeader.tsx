/**
 * Modernized Header Component
 * Design: Contemporary with gradient accents
 */

import { Calendar, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ModernHeaderProps {
  title: string;
  subtitle?: string;
  selectedPeriod?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  onPeriodChange?: (period: string) => void;
  onRefresh?: () => void;
  customRange?: { start?: string; end?: string };
  onCustomRangeChange?: (range: { start?: string; end?: string }) => void;
  scope?: 'all' | 'team' | 'mine';
  onScopeChange?: (scope: 'all' | 'team' | 'mine') => void;
}

export default function ModernHeader({
  title,
  subtitle,
  selectedPeriod = 'month',
  onPeriodChange,
  onRefresh,
  customRange,
  onCustomRangeChange,
  scope = 'team',
  onScopeChange,
}: ModernHeaderProps) {
  const periods = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
  ];

  return (
    <div className="bg-background border-b border-border">
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="display-text text-4xl text-foreground mb-2 tracking-tight">{title}</h1>
            {subtitle && <p className="text-muted-foreground font-light">{subtitle}</p>}
          </div>

          {/* Period Selector and Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            {onScopeChange && (
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'mine', label: 'My Pipeline' },
                  { id: 'team', label: 'Team' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onScopeChange(item.id as 'all' | 'team' | 'mine')}
                    className={`px-3 py-2 rounded text-sm font-500 transition-all duration-300 ${
                      scope === item.id
                        ? 'bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-accent)] text-[color:var(--primary-foreground)] shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
            {/* Period Buttons */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1 backdrop-blur-sm border border-border">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => onPeriodChange?.(period.id)}
                  className={`px-3 py-2 rounded text-sm font-500 transition-all duration-300 ${
                    selectedPeriod === period.id
                      ? 'bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-accent)] text-[color:var(--primary-foreground)] shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
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
              onClick={() => onPeriodChange?.('custom')}
              className="gap-2 border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-300"
            >
              <Calendar size={16} />
              Custom Range
            </Button>

            {/* Refresh Button */}
            <Button
              size="sm"
              onClick={onRefresh}
              className="gap-2 border-border text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-300"
              variant="outline"
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        </div>

        {selectedPeriod === 'custom' && (
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>From</span>
              <input
                type="date"
                value={customRange?.start ?? ''}
                onChange={(e) => onCustomRangeChange?.({ start: e.target.value, end: customRange?.end })}
                className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>To</span>
              <input
                type="date"
                value={customRange?.end ?? ''}
                onChange={(e) => onCustomRangeChange?.({ start: customRange?.start, end: e.target.value })}
                className="rounded-md border border-border bg-background px-3 py-2 text-foreground"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
