import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { MarketAnalysisService, MarketAnalysisData } from '@/lib/services/features/market-analysis-service';
import type { 
  MarketPersona,
  MarketInterview,
  MarketCompetitor,
  MarketTrend
} from '@/store/types';

// Create service instance
const marketAnalysisService = new MarketAnalysisService(createClient());

export interface UseMarketAnalysisReturn {
  data: MarketAnalysisData;
  isLoading: boolean;
  error: Error | null;

  // Personas
  addPersona: (persona: Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>) => void;
  updatePersona: (params: { id: string; data: Partial<Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deletePersona: (id: string) => void;

  // Interviews
  addInterview: (interview: Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>) => void;
  updateInterview: (params: { id: string; data: Partial<Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteInterview: (id: string) => void;

  // Competitors
  addCompetitor: (competitor: Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCompetitor: (params: { id: string; data: Partial<Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteCompetitor: (id: string) => void;

  // Trends
  addTrend: (trend: Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTrend: (params: { id: string; data: Partial<Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteTrend: (id: string) => void;
}

/**
 * Hook for managing market analysis data in a project
 */
export function useMarketAnalysis(projectId: string | undefined): UseMarketAnalysisReturn {
  const queryClient = useQueryClient();

  // Query key factory
  const keys = {
    all: ['marketAnalysis', projectId] as const,
    personas: ['marketAnalysis', projectId, 'personas'] as const,
    interviews: ['marketAnalysis', projectId, 'interviews'] as const,
    competitors: ['marketAnalysis', projectId, 'competitors'] as const,
    trends: ['marketAnalysis', projectId, 'trends'] as const,
  };

  // Queries
  const personas = useQuery({
    queryKey: keys.personas,
    queryFn: () => projectId ? marketAnalysisService.getPersonas(projectId) : [],
    enabled: !!projectId,
  });

  const interviews = useQuery({
    queryKey: keys.interviews,
    queryFn: () => projectId ? marketAnalysisService.getInterviews(projectId) : [],
    enabled: !!projectId,
  });

  const competitors = useQuery({
    queryKey: keys.competitors,
    queryFn: () => projectId ? marketAnalysisService.getCompetitors(projectId) : [],
    enabled: !!projectId,
  });

  const trends = useQuery({
    queryKey: keys.trends,
    queryFn: () => projectId ? marketAnalysisService.getTrends(projectId) : [],
    enabled: !!projectId,
  });

  // Mutations
  const addPersona = useMutation({
    mutationFn: (persona: Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      return marketAnalysisService.addPersona(projectId, persona);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.personas });
    },
  });

  const updatePersona = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<MarketPersona, 'id' | 'created_at' | 'updated_at'>> }) => {
      return marketAnalysisService.updatePersona(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.personas });
    },
  });

  const deletePersona = useMutation({
    mutationFn: (id: string) => {
      return marketAnalysisService.deletePersona(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.personas });
    },
  });

  const addInterview = useMutation({
    mutationFn: (interview: Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      return marketAnalysisService.addInterview(projectId, interview);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.interviews });
    },
  });

  const updateInterview = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<MarketInterview, 'id' | 'created_at' | 'updated_at'>> }) => {
      return marketAnalysisService.updateInterview(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.interviews });
    },
  });

  const deleteInterview = useMutation({
    mutationFn: (id: string) => {
      return marketAnalysisService.deleteInterview(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.interviews });
    },
  });

  const addCompetitor = useMutation({
    mutationFn: (competitor: Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      return marketAnalysisService.addCompetitor(projectId, competitor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.competitors });
    },
  });

  const updateCompetitor = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<MarketCompetitor, 'id' | 'created_at' | 'updated_at'>> }) => {
      return marketAnalysisService.updateCompetitor(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.competitors });
    },
  });

  const deleteCompetitor = useMutation({
    mutationFn: (id: string) => {
      return marketAnalysisService.deleteCompetitor(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.competitors });
    },
  });

  const addTrend = useMutation({
    mutationFn: (trend: Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      return marketAnalysisService.addTrend(projectId, trend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.trends });
    },
  });

  const updateTrend = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<MarketTrend, 'id' | 'created_at' | 'updated_at'>> }) => {
      return marketAnalysisService.updateTrend(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.trends });
    },
  });

  const deleteTrend = useMutation({
    mutationFn: (id: string) => {
      return marketAnalysisService.deleteTrend(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.trends });
    },
  });

  return {
    // Data queries
    data: {
      personas: personas.data || [],
      interviews: interviews.data || [],
      competitors: competitors.data || [],
      trends: trends.data || [],
    },
    isLoading: personas.isLoading || interviews.isLoading || competitors.isLoading || trends.isLoading,
    error: personas.error || interviews.error || competitors.error || trends.error,

    // Personas
    addPersona: addPersona.mutate,
    updatePersona: updatePersona.mutate,
    deletePersona: deletePersona.mutate,

    // Interviews
    addInterview: addInterview.mutate,
    updateInterview: updateInterview.mutate,
    deleteInterview: deleteInterview.mutate,

    // Competitors
    addCompetitor: addCompetitor.mutate,
    updateCompetitor: updateCompetitor.mutate,
    deleteCompetitor: deleteCompetitor.mutate,

    // Trends
    addTrend: addTrend.mutate,
    updateTrend: updateTrend.mutate,
    deleteTrend: deleteTrend.mutate,
  };
}