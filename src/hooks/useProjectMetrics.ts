import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ProjectMetrics } from '@/types/project';
import { ProjectMetricsService } from '@/lib/services/metrics/project-metrics-service';
import { useProjectStore } from '@/store';

/**
 * Hook for accessing and managing project metrics
 */
export function useProjectMetrics(projectId?: string) {
  const queryClient = useQueryClient();
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Get project data from store
  const { currentData, comparisonMode, stagedData } = useProjectStore();
  
  // Get the project from the appropriate data source
  const project = useMemo(() => {
    if (comparisonMode && stagedData?.project) {
      return stagedData.project;
    }
    return currentData.project;
  }, [currentData, stagedData, comparisonMode]);
  
  // Get metrics from metadata
  const metrics = useMemo(() => {
    if (!project?.metadata) return null;
    return (project.metadata as any).metrics as ProjectMetrics | undefined;
  }, [project]);
  
  // Check if metrics are stale (older than 5 minutes)
  const isStale = useMemo(() => {
    if (!metrics?.lastCalculated) return true;
    const lastCalculated = new Date(metrics.lastCalculated);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastCalculated < fiveMinutesAgo;
  }, [metrics]);
  
  // Function to calculate metrics
  const calculateMetrics = useCallback(async () => {
    if (!projectId || calculating) return null;
    
    try {
      setCalculating(true);
      setError(null);
      
      const metricsService = new ProjectMetricsService(projectId);
      const newMetrics = await metricsService.calculateMetrics();
      
      // Invalidate queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      
      return newMetrics;
    } catch (err) {
      console.error('Failed to calculate metrics:', err);
      setError(err instanceof Error ? err : new Error('Failed to calculate metrics'));
      return null;
    } finally {
      setCalculating(false);
    }
  }, [projectId, calculating, queryClient]);
  
  // Automatically calculate if stale
  useEffect(() => {
    if (isStale && !calculating && !error) {
      calculateMetrics();
    }
  }, [isStale, calculating, calculateMetrics, error]);
  
  return {
    metrics,
    isStale,
    calculating,
    error,
    calculateMetrics
  };
} 