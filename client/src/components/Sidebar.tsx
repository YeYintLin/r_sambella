/**
 * Sidebar Navigation Component
 * Design: Dark Theme CRM with Yellow/Gold Accents
 * - Left sidebar with navigation menu
 * - Company branding at top
 * - Menu items with icons
 * - User profile at bottom
 */

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  Zap,
  Heart,
  AlertCircle,
  TrendingDown,
  Moon,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeMenu?: string;
  onMenuChange?: (menu: string) => void;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'sales', label: 'Sales Pipeline', icon: TrendingUp },
  { id: 'opportunities', label: 'Opportunities', icon: Target },
  { id: 'performance', label: 'Sales Performance', icon: Activity },
  { id: 'pipeline', label: 'Pipeline Health', icon: Zap },
  { id: 'client', label: 'Client Health', icon: Heart },
  { id: 'sla', label: 'SLA Monitoring', icon: AlertCircle },
  { id: 'revenue', label: 'Revenue & Forecast', icon: TrendingDown },
];

export default function Sidebar({ activeMenu = 'overview', onMenuChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-yellow-600 text-black p-2 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center text-black font-bold text-lg">
                RS
              </div>
              <div>
                <h1 className="brand-title text-lg text-white whitespace-nowrap">ROYAL SHAMBELLA</h1>
                <p className="text-xs text-text-muted">CRM Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="space-y-2 px-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onMenuChange?.(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-yellow-600 text-black'
                        : 'text-text-secondary hover:bg-sidebar-border'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-sidebar-border p-4 space-y-3">
            {/* Sync Status */}
            <div className="px-4 py-3 bg-sidebar-border rounded-lg text-xs">
              <p className="text-text-muted mb-1">Sync Odoo</p>
              <p className="text-text-primary">3/29/2025</p>
            </div>

            {/* Light Mode Toggle */}
            <button className="w-full flex items-center gap-3 px-4 py-3 text-text-secondary hover:bg-sidebar-border rounded-lg transition-all duration-200">
              <Moon size={20} />
              <span className="text-sm font-medium">Light Mode</span>
            </button>

            {/* User Profile */}
            <div className="px-4 py-3 border-t border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-sm">
                  R
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">ROYAL SHAMBELLA</p>
                  <p className="text-xs text-text-muted truncate">admin@royal.com</p>
                </div>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-text-secondary hover:bg-sidebar-border rounded-lg transition-all duration-200">
                <LogOut size={16} />
                <span className="text-xs font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
