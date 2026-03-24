/**
 * Modernized Sidebar Navigation Component
 * Design: Contemporary dark theme with gold accents
 * - Royal Shambella logo integration
 * - Refined menu items with hover effects
 * - Gradient accents and smooth transitions
 */

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarProps {
  activeMenu?: string;
  onMenuChange?: (menu: string) => void;
  lastSyncAt?: string;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'sales', label: 'Sales Pipeline', icon: TrendingUp },
];

export default function ModernSidebar({ activeMenu = 'overview', onMenuChange, lastSyncAt }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-accent)] text-[color:var(--primary-foreground)] p-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
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
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/logo.png"
                alt="Royal Shambella"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="brand-title text-sm text-foreground leading-tight whitespace-nowrap">ROYAL SHAMBELLA</h1>
                <p className="text-xs text-muted-foreground font-light">CRM Dashboard</p>
              </div>
            </div>
            {/* Accent line */}
            <div className="h-0.5 bg-gradient-to-r from-[var(--gold-primary)] to-transparent rounded-full" />
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="space-y-1 px-3">
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-accent)] text-[color:var(--primary-foreground)] shadow-lg'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon size={20} className={isActive ? '' : 'group-hover:text-[var(--gold-primary)] transition-colors'} />
                    <span className="text-sm font-500">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-sidebar-border p-4 space-y-3 bg-gradient-to-t from-[color:var(--background)] to-transparent">
            {/* Sync Status */}
            <div className="px-4 py-3 bg-muted rounded-lg text-xs border border-border">
              <p className="text-muted-foreground mb-1 font-light">Sync Odoo</p>
              <p className="text-foreground font-500">
                {lastSyncAt || 'Not synced yet'}
              </p>
            </div>

            {/* Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-3 text-muted-foreground hover:bg-muted rounded-lg transition-all duration-300 group"
            >
              {theme === 'dark' ? (
                <Sun size={20} className="group-hover:text-[var(--gold-primary)] transition-colors" />
              ) : (
                <Moon size={20} className="group-hover:text-[var(--gold-primary)] transition-colors" />
              )}
              <span className="text-sm font-500">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* User Profile */}
            <div className="px-4 py-3 border-t border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-accent)] rounded-lg flex items-center justify-center text-[color:var(--primary-foreground)] font-bold text-sm shadow-lg">
                  RS
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-foreground truncate">ROYAL SHAMBELLA</p>
                  <p className="text-xs text-muted-foreground truncate">admin@royal.com</p>
                </div>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg transition-all duration-300 group">
                <LogOut size={16} className="group-hover:text-[var(--gold-primary)] transition-colors" />
                <span className="text-xs font-500">Logout</span>
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
