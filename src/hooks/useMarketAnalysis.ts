import { useFeatureData } from './use-feature-data';
import { useCallback } from 'react';
import { Database } from '@/types/database';

// Database types for market analysis tables
type MarketPersona = Database['public']['Tables']['market_personas']['Row'];
type MarketInterview = Database['public']['Tables']['market_interviews']['Row'];
type MarketCompetitor = Database['public']['Tables']['market_competitors']['Row'];
type MarketTrend = Database['public']['Tables']['market_trends']['Row'];

// Combined type for all market analysis data
type MarketAnalysisData = {
  customerInsights: {
    personas: MarketPersona[];
    interviews: MarketInterview[];
  };
  competitors: MarketCompetitor[];
  trends: MarketTrend[];
};

// Type for any market analysis item
type MarketAnalysisItem = MarketPersona | MarketInterview | MarketCompetitor | MarketTrend;

/**
 * Hook for managing market analysis data in a project
 * @param projectId - The ID of the current project
 */
export function useMarketAnalysis(projectId: string | undefined) {
  const featureData = useFeatureData<MarketAnalysisData, MarketAnalysisItem>(
    projectId,
    'marketAnalysis',
    {
      defaultData: {
        customerInsights: {
          personas: [],
          interviews: []
        },
        competitors: [],
        trends: []
      }
    }
  );

  // ===== Customer Personas =====
  const addPersona = useCallback(async (persona: Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...persona,
      project_id: projectId,
      created_at: null,
      updated_at: null
    }, 'customerInsights.personas');
  }, [featureData, projectId]);

  const updatePersona = useCallback((id: string, data: Partial<Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data, 'customerInsights.personas');
  }, [featureData]);

  const deletePersona = useCallback((id: string) => {
    return featureData.deleteItem(id, 'customerInsights.personas');
  }, [featureData]);

  // ===== Customer Interviews =====
  const addInterview = useCallback(async (interview: Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...interview,
      project_id: projectId,
      created_at: null,
      updated_at: null
    }, 'customerInsights.interviews');
  }, [featureData, projectId]);

  const updateInterview = useCallback((id: string, data: Partial<Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data, 'customerInsights.interviews');
  }, [featureData]);

  const deleteInterview = useCallback((id: string) => {
    return featureData.deleteItem(id, 'customerInsights.interviews');
  }, [featureData]);

  // ===== Competitors =====
  const addCompetitor = useCallback(async (competitor: Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...competitor,
      project_id: projectId,
      created_at: null,
      updated_at: null
    }, 'competitors');
  }, [featureData, projectId]);

  const updateCompetitor = useCallback((id: string, data: Partial<Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data, 'competitors');
  }, [featureData]);

  const deleteCompetitor = useCallback((id: string) => {
    return featureData.deleteItem(id, 'competitors');
  }, [featureData]);

  // ===== Market Trends =====
  const addTrend = useCallback(async (trend: Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...trend,
      project_id: projectId,
      created_at: null,
      updated_at: null
    }, 'trends');
  }, [featureData, projectId]);

  const updateTrend = useCallback((id: string, data: Partial<Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data, 'trends');
  }, [featureData]);

  const deleteTrend = useCallback((id: string) => {
    return featureData.deleteItem(id, 'trends');
  }, [featureData]);

  return {
    // Raw data
    data: featureData.data,
    isLoading: featureData.isLoading,
    error: featureData.error,

    // Customer Personas
    personas: featureData.data?.customerInsights.personas || [],
    addPersona,
    updatePersona,
    deletePersona,

    // Customer Interviews
    interviews: featureData.data?.customerInsights.interviews || [],
    addInterview,
    updateInterview,
    deleteInterview,

    // Competitors
    competitors: featureData.data?.competitors || [],
    addCompetitor,
    updateCompetitor,
    deleteCompetitor,

    // Market Trends
    trends: featureData.data?.trends || [],
    addTrend,
    updateTrend,
    deleteTrend,
  };
}