/**
 * Dashboard Header Component
 * Design: Nature-Inspired Manufacturing CRM
 * - Logo and brand name
 * - Production status badge
 * - Sync with Odoo button with timestamp
 * - Responsive layout
 */

import { Leaf, RefreshCw } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatTimestamp } from '@/lib/formatters';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  productionStatus: 'running' | 'idle' | 'error';
  lastSyncTime: Date;
  onSync?: () => void;
}

export default function DashboardHeader({
  productionStatus,
  lastSyncTime,
  onSync,
}: DashboardHeaderProps) {
  return (
    <header className="bg-warm-white border-b border-sage-green/20 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-deep-green rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-warm-white" />
            </div>
            <div>
              <h1 className="display-text text-2xl text-charcoal">
                ROYAL SHAMBELLA
              </h1>
              <p className="text-xs text-soft-wood">Manufacturing CRM Overview</p>
            </div>
          </div>

          {/* Status and Sync Controls */}
          <div className="flex items-center gap-4 flex-wrap justify-end">
            {/* Production Status */}
            <div className="flex flex-col items-end gap-1">
              <StatusBadge status={productionStatus} label="Production" />
              <p className="text-xs text-muted-foreground">
                Synced: {formatTimestamp(lastSyncTime)}
              </p>
            </div>

            {/* Sync Button */}
            <Button
              onClick={onSync}
              className="bg-deep-green hover:bg-deep-green/90 text-warm-white gap-2 transition-all duration-300 ease-in-out"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Sync with Odoo</span>
              <span className="sm:hidden">Sync</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
