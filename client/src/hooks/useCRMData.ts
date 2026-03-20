import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

export interface CRMMetrics {
  totalLeads: number;
  wonOpportunities: number;
  conversionRate: number;
  weightedPipeline: number;
  wonRevenue: number;
  openOpportunities: number;
  idleOpportunities: number;
}

export function useCRMData(scope: 'all' | 'team' | 'mine' = 'team') {
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch opportunities list
  const { data: opportunities = [] } = trpc.crm.opportunities.list.useQuery({ scope });

  // Fetch metrics
  const { data: metrics } = trpc.crm.opportunities.metrics.useQuery({ scope });

  // Sync mutation
  const syncMutation = trpc.crm.opportunities.sync.useMutation({
    onMutate: () => {
      setIsSyncing(true);
    },
    onSuccess: () => {
      setIsSyncing(false);
    },
    onError: () => {
      setIsSyncing(false);
    },
  });

  // Auto-sync on component mount
  useEffect(() => {
    const syncData = async () => {
      try {
        await syncMutation.mutateAsync();
      } catch (error) {
        console.error('Failed to sync CRM data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    syncData();
  }, []);

  return {
    opportunities,
    metrics: metrics || {
      totalLeads: 0,
      wonOpportunities: 0,
      conversionRate: 0,
      weightedPipeline: 0,
      wonRevenue: 0,
      openOpportunities: 0,
      idleOpportunities: 0,
    },
    isLoading,
    isSyncing,
    sync: () => syncMutation.mutateAsync(),
  };
}
