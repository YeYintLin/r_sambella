/**
 * Royal Shambella CRM Dashboard - Modernized Home Page
 * Design: Contemporary dark theme with gold accents and sophisticated animations
 * Data: Real CRM data synced from Odoo
 */

import { useMemo, useState } from 'react';
import { BarChart3, Users, TrendingUp, DollarSign, Target, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import ModernSidebar from '@/components/ModernSidebar';
import ModernHeader from '@/components/ModernHeader';
import ModernKPICard from '@/components/ModernKPICard';
import {
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/_core/hooks/useAuth';
import { useCRMData } from '@/hooks/useCRMData';
import { toast } from 'sonner';

export default function Home() {
  const { user, loading } = useAuth();
  const [scope, setScope] = useState<'all' | 'team' | 'mine'>('team');
  const { opportunities, metrics, isLoading, isSyncing, sync } = useCRMData(scope);
  const [activeMenu, setActiveMenu] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [customRange, setCustomRange] = useState<{ start?: string; end?: string }>({});

  const handleRefresh = async () => {
    try {
      await sync();
      toast.success('CRM data synced successfully!');
    } catch (error) {
      toast.error('Failed to sync CRM data');
      console.error('Sync error:', error);
    }
  };

  const now = new Date();

  const filteredOpportunities = useMemo(() => {
    const safeDate = (value: Date | string | null | undefined) => {
      if (!value) return null;
      const d = value instanceof Date ? value : new Date(value);
      return isNaN(d.getTime()) ? null : d;
    };

    let rangeStart: Date | null = null;
    let rangeEnd: Date | null = null;

    if (selectedPeriod === 'custom') {
      const start = customRange.start ? parseISO(customRange.start) : null;
      const end = customRange.end ? parseISO(customRange.end) : null;
      rangeStart = start && !isNaN(start.getTime()) ? startOfDay(start) : null;
      rangeEnd = end && !isNaN(end.getTime()) ? endOfDay(end) : null;
    } else if (selectedPeriod === 'today') {
      rangeStart = startOfDay(now);
      rangeEnd = endOfDay(now);
    } else if (selectedPeriod === 'week') {
      rangeStart = startOfWeek(now, { weekStartsOn: 1 });
      rangeEnd = endOfWeek(now, { weekStartsOn: 1 });
    } else if (selectedPeriod === 'month') {
      rangeStart = startOfMonth(now);
      rangeEnd = endOfMonth(now);
    } else if (selectedPeriod === 'quarter') {
      rangeStart = startOfQuarter(now);
      rangeEnd = endOfQuarter(now);
    } else if (selectedPeriod === 'year') {
      rangeStart = startOfYear(now);
      rangeEnd = endOfYear(now);
    }

    if (!rangeStart || !rangeEnd) {
      return opportunities;
    }

    return opportunities.filter((o) => {
      const dateValue =
        selectedPeriod === 'today'
          ? safeDate(o.syncedAt || o.updatedAt || o.createdAt)
          : safeDate(o.createdAt);
      if (!dateValue) return false;
      return isWithinInterval(dateValue, { start: rangeStart!, end: rangeEnd! });
    });
  }, [customRange.end, customRange.start, opportunities, now, selectedPeriod]);

  const lastSyncAt = useMemo(() => {
    if (!opportunities.length) return '';
    const latest = opportunities.reduce<Date | null>((acc, o) => {
      const value = (o.syncedAt || o.updatedAt || o.createdAt) as Date | string | undefined;
      if (!value) return acc;
      const d = value instanceof Date ? value : new Date(value);
      if (isNaN(d.getTime())) return acc;
      if (!acc || d > acc) return d;
      return acc;
    }, null);
    if (!latest) return '';
    return format(latest, 'MMM d, yyyy HH:mm');
  }, [opportunities]);

  const metricsForPeriod = useMemo(() => {
    const all = filteredOpportunities;
    const won = all.filter((o) => o.stage === 'Won');
    const open = all.filter((o) => o.stage !== 'Won');
    const qualified = all.filter((o) => o.stage === 'Qualified');

    const totalLeads = all.length;
    const wonOpportunities = won.length;
    const conversionRate = totalLeads > 0 ? Math.round((wonOpportunities / totalLeads) * 100) : 0;
    const weightedPipeline = all.reduce((sum, o) => sum + (o.expectedRevenue || 0), 0);
    const wonRevenue = won.reduce((sum, o) => sum + (o.amount || 0), 0);
    const openOpportunities = open.length;
    const idleOpportunities = qualified.length;

    return {
      totalLeads,
      wonOpportunities,
      conversionRate,
      weightedPipeline,
      wonRevenue,
      openOpportunities,
      idleOpportunities,
    };
  }, [filteredOpportunities]);

  const stageStats = filteredOpportunities.reduce<Record<string, { count: number; avgDays: number }>>(
    (acc, opp) => {
      const stage = opp.stage || 'New';
      const createdAt = opp.createdAt ? new Date(opp.createdAt) : now;
      const ageDays = Math.max(0, (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      if (!acc[stage]) {
        acc[stage] = { count: 0, avgDays: 0 };
      }
      acc[stage].count += 1;
      acc[stage].avgDays += ageDays;
      return acc;
    },
    {}
  );

  const stageCards = Object.entries(stageStats)
    .map(([stage, stats]) => ({
      stage,
      count: stats.count,
      avgDays: stats.count ? stats.avgDays / stats.count : 0,
    }));

  const stageOrder = useMemo(() => {
    const fromEnv = (import.meta.env.VITE_STAGE_ORDER as string | undefined) || '';
    const ordered = fromEnv
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const existing = stageCards.map((s) => s.stage);
    const remaining = existing.filter((s) => !ordered.includes(s)).sort((a, b) => a.localeCompare(b));
    return [...ordered, ...remaining];
  }, [stageCards]);

  const sortByStageOrder = (a: string, b: string) => {
    const aIdx = stageOrder.indexOf(a);
    const bIdx = stageOrder.indexOf(b);
    const aPos = aIdx === -1 ? Number.MAX_SAFE_INTEGER : aIdx;
    const bPos = bIdx === -1 ? Number.MAX_SAFE_INTEGER : bIdx;
    if (aPos !== bPos) return aPos - bPos;
    return a.localeCompare(b);
  };

  stageCards.sort((a, b) => sortByStageOrder(a.stage, b.stage));

  const totalOpportunities = filteredOpportunities.length;
  const funnelData = [...stageCards].sort((a, b) => sortByStageOrder(a.stage, b.stage));
  const bottleneckStage = stageCards.reduce<{ stage: string; avgDays: number } | null>((acc, item) => {
    if (!acc || item.avgDays > acc.avgDays) {
      return { stage: item.stage, avgDays: item.avgDays };
    }
    return acc;
  }, null);

  // Group opportunities by stage for pipeline chart
  const pipelineData = stageCards
    .map((s) => ({ name: s.stage, value: s.count }))
    .filter((d) => d.value > 0);

  // Stage distribution for pie chart
  const stageDistributionData = stageCards
    .map((s, index) => ({
      name: s.stage,
      value: s.count,
      fill: index % 2 === 0 ? 'var(--chart-1)' : 'var(--chart-3)',
    }))
    .filter((d) => d.value > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <ModernSidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} lastSyncAt={lastSyncAt} />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <ModernHeader
          title={activeMenu === 'sales' ? 'Sales Pipeline' : 'Overview'}
          subtitle={
            activeMenu === 'sales'
              ? 'Stage-by-stage conversion analysis'
              : 'CRM health snapshot and key metrics'
          }
          selectedPeriod={selectedPeriod as any}
          onPeriodChange={setSelectedPeriod}
          customRange={customRange}
          onCustomRangeChange={setCustomRange}
          scope={scope}
          onScopeChange={setScope}
          onRefresh={handleRefresh}
        />

        {/* Content */}
        <main className="px-8 py-8">
          {activeMenu === 'sales' && (
            <>
              {/* Pipeline alert */}
              {bottleneckStage && (
                <div className="mb-6 p-4 rounded-xl border border-border bg-card text-foreground flex items-start gap-3">
                  <div className="mt-0.5 text-[color:var(--accent-orange)]">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <p className="font-600">Pipeline Bottleneck: {bottleneckStage.stage}</p>
                    <p className="text-sm text-muted-foreground">
                      {totalOpportunities} total opportunities across {stageCards.length} stages. Average {bottleneckStage.avgDays.toFixed(1)} days in stage.
                    </p>
                  </div>
                </div>
              )}

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="card-modern">
                  <h3 className="display-text text-lg text-foreground mb-2">Leads per Stage</h3>
                  <p className="text-sm text-muted-foreground mb-6">Current lead distribution across your pipeline</p>
                  {stageCards.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={stageCards} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                          dataKey="stage"
                          stroke="var(--muted-foreground)"
                          style={{ fontSize: '12px' }}
                          angle={-30}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.75rem',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            color: 'var(--foreground)',
                          }}
                          labelStyle={{ color: 'var(--foreground)' }}
                          itemStyle={{ color: 'var(--foreground)' }}
                        />
                        <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>

                <div className="card-modern">
                  <h3 className="display-text text-lg text-foreground mb-2">Pipeline Funnel</h3>
                  <p className="text-sm text-muted-foreground mb-6">Lead progression across your pipeline</p>
                  {funnelData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={260}>
                      <FunnelChart>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || payload.length === 0) return null;
                            const entry = payload[0];
                            return (
                              <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-lg">
                                <div className="text-foreground font-600">
                                  {entry?.payload?.stage ?? 'Stage'}
                                </div>
                                <div className="text-muted-foreground">Count: {entry?.value ?? 0}</div>
                              </div>
                            );
                          }}
                        />
                        <Funnel
                          dataKey="count"
                          data={funnelData}
                          isAnimationActive={false}
                          fill="var(--chart-3)"
                        >
                          <LabelList position="right" fill="var(--muted-foreground)" stroke="none" dataKey="stage" />
                        </Funnel>
                      </FunnelChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Pipeline cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {stageCards.map((item) => {
                  const convRate = totalOpportunities
                    ? Math.round((item.count / totalOpportunities) * 100)
                    : 0;
                  const isWon = item.stage.toLowerCase() === 'won';
                  const pct = totalOpportunities ? (item.count / totalOpportunities) * 100 : 0;
                  return (
                    <div
                      key={item.stage}
                      className="rounded-2xl border border-border bg-card p-6 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">
                            {item.stage}
                          </p>
                          <div className="text-4xl text-foreground font-600 mt-2">{item.count}</div>
                        </div>
                        {isWon && (
                          <span className="text-[10px] px-2 py-1 rounded-full border border-[color:var(--accent-green)] text-[color:var(--accent-green)]">
                            WON
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Avg days</span>
                          <span className="text-foreground">{item.avgDays.toFixed(1)}d</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Conv. rate</span>
                          <span className="text-[color:var(--accent-green)]">{convRate}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Drop-off</span>
                          <span className="text-muted-foreground">0%</span>
                        </div>
                      </div>

                      <div className="mt-6 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--gold-primary)] to-[var(--gold-accent)]"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{pct.toFixed(0)}% of total</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {activeMenu === 'overview' && (
            <>
          {/* Loading State */}
          {isLoading && (
            <div className="mb-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-300">
              Loading CRM data from Odoo...
            </div>
          )}

          {/* Sync Status */}
          {isSyncing && (
            <div className="mb-8 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg text-yellow-300 flex items-center gap-2">
              <RefreshCw size={16} className="animate-spin" />
              Syncing data from Odoo...
            </div>
          )}

          {/* KPI Cards Grid - First Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ModernKPICard
              label="Total Leads"
              value={metricsForPeriod.totalLeads}
              description="Created in period"
              icon={<Users size={24} />}
              iconBg="gold"
              trend={12}
            />
            <ModernKPICard
              label="Won Opportunities"
              value={metricsForPeriod.wonOpportunities}
              description="Closed in period"
              icon={<CheckCircle size={24} />}
              iconBg="green"
              trend={8}
            />
            <ModernKPICard
              label="Conversion Rate"
              value={`${metricsForPeriod.conversionRate}%`}
              description="Won / Total"
              icon={<TrendingUp size={24} />}
              iconBg="gold"
              trend={5}
            />
            <ModernKPICard
              label="Weighted Pipeline"
              value={`$${(metricsForPeriod.weightedPipeline / 1000000).toFixed(1)}M`}
              description="Expected × Probability"
              icon={<DollarSign size={24} />}
              iconBg="gold"
              trend={15}
            />
          </div>

          {/* KPI Cards Grid - Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <ModernKPICard
              label="Won Revenue"
              value={`$${(metricsForPeriod.wonRevenue / 1000000).toFixed(1)}M`}
              description="Closed in period"
              icon={<DollarSign size={24} />}
              iconBg="green"
              trend={22}
            />
            <ModernKPICard
              label="Open Opportunities"
              value={metricsForPeriod.openOpportunities}
              description="Active pipeline"
              icon={<Target size={24} />}
              iconBg="orange"
              trend={-3}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            {/* Opportunities by Pipeline */}
            <div className="card-modern">
              <h3 className="display-text text-lg text-foreground mb-6">Opportunities by Pipeline</h3>
              {pipelineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={pipelineData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4A574" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#E8B88A" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--muted-foreground)"
                      style={{ fontSize: '12px' }}
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      }}
                      labelStyle={{ color: 'var(--foreground)' }}
                    />
                    <Bar dataKey="value" fill="url(#colorBar)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>

            {/* Stage Distribution */}
            <div className="card-modern">
              <h3 className="display-text text-lg text-foreground mb-6">Stage Distribution</h3>
              {stageDistributionData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stageDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {stageDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '0.75rem',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        }}
                        labelStyle={{ color: 'var(--foreground)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                    {stageDistributionData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 group cursor-pointer transition-all duration-300 hover:translate-x-1">
                        <div
                          className="w-3 h-3 rounded-full transition-all duration-300 group-hover:scale-125"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
