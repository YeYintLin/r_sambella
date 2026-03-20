/**
 * Machine Efficiency Widget Component
 * Design: Nature-Inspired Manufacturing CRM
 * - Displays uptime for multiple machines
 * - Circular progress indicators
 * - Status indicators
 */

import { MachineMetric } from '@/lib/mockData';
import StatusBadge from './StatusBadge';
import { Activity } from 'lucide-react';

interface MachineEfficiencyWidgetProps {
  machines: MachineMetric[];
}

export default function MachineEfficiencyWidget({
  machines,
}: MachineEfficiencyWidgetProps) {
  return (
    <div className="card-gradient rounded-lg p-6 border border-sage-green/20 h-full">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-deep-green" />
        <h2 className="display-text text-lg text-charcoal">Machine Efficiency</h2>
      </div>

      <div className="space-y-6">
        {machines.map((machine) => (
          <div key={machine.name} className="flex items-center gap-4">
            {/* Circular Progress */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#E8F0EB"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#1B5E3F"
                  strokeWidth="8"
                  strokeDasharray={`${2.827 * machine.uptime} 282.7`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="display-text text-sm text-charcoal">
                  {machine.uptime}%
                </span>
              </div>
            </div>

            {/* Machine info */}
            <div className="flex-1">
              <h3 className="font-medium text-charcoal mb-1">{machine.name}</h3>
              <StatusBadge status={machine.status} />
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {machine.lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
