import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { MarketAnalysisService, MarketAnalysisData } from '@/lib/services/features/market-analysis-service';
import { useProjectStore } from '@/store';
import type { 
  MarketPersona,
  MarketInterview,
  MarketCompetitor,
  MarketTrend,
  ChangeType,
  Insert,
  Update
} from '@/store/types';
import { marketAnalysisService } from '@/lib/services';
import { useOptimisticCreate, useOptimisticUpdate, useOptimisticDelete } from '../utils/optimistic-helpers';
import { v4 as uuidv4 } from 'uuid';
import { MarketPartner } from '@/features/market/types';
import { toast } from '@/components/ui/use-toast';

// Mock partner data
const mockPartners: MarketPartner[] = [
  {
    id: '1',
    name: 'TechSupply Co',
    type: 'supplier',
    description: 'Key technology component supplier with competitive pricing',
    potential_value: 4,
    potential_challenges: ['Long lead times', 'Minimum order quantities'],
    contact_info: 'contact@techsupply.co',
    website: 'https://techsupply.co',
    notes: 'Established relationship since 2020',
  },
  {
    id: '2',
    name: 'DistributeNow',
    type: 'distributor',
    description: 'Nationwide distribution network with excellent reach',
    potential_value: 5,
    potential_challenges: ['High commission rates', 'Exclusivity requirements'],
    contact_info: 'partners@distributenow.com',
    website: 'https://distributenow.com',
  },
  {
    id: '3',
    name: 'MarketBoost Agency',
    type: 'marketing',
    description: 'Digital marketing agency specializing in SaaS products',
    potential_value: 3,
    potential_challenges: ['High retainer fees', 'Performance metrics clarity'],
    contact_info: 'hello@marketboost.co',
    website: 'https://marketboost.co',
    notes: 'Good industry connections',
  },
];

// Extend the interface to include MarketOverview data and partners
export interface ExtendedMarketAnalysisData extends MarketAnalysisData {
  partners: MarketPartner[];
  overview?: {
    marketDefinition?: {
      industry: string;
      geography: string;
      maturity: 'emerging' | 'growing' | 'mature' | 'declining';
    };
    marketSize?: {
      tam: number;
      sam: number;
      som: number;
      tamMethod: 'top-down' | 'bottom-up' | 'value-theory';
      samPercentage: number;
      somPercentage: number;
    };
    segments?: Array<{
      name: string;
      size: number;
      growth: number;
    }>;
  };
}

export interface UseMarketAnalysisReturn {
  data: ExtendedMarketAnalysisData;
  isLoading: boolean;
  error: Error | null;

  // Personas
  addPersona: (persona: Insert<'market_personas'>) => Promise<MarketPersona | null>;
  updatePersona: (params: { id: string; data: Update<'market_personas'> }) => Promise<MarketPersona | null>;
  deletePersona: (id: string) => Promise<boolean>;

  // Interviews
  addInterview: (interview: Insert<'market_interviews'>) => Promise<MarketInterview | null>;
  updateInterview: (params: { id: string; data: Update<'market_interviews'> }) => Promise<MarketInterview | null>;
  deleteInterview: (id: string) => Promise<boolean>;

  // Competitors
  addCompetitor: (competitor: Insert<'market_competitors'>) => Promise<MarketCompetitor | null>;
  updateCompetitor: (params: { id: string; data: Update<'market_competitors'> }) => Promise<MarketCompetitor | null>;
  deleteCompetitor: (id: string) => Promise<boolean>;

  // Trends
  addTrend: (trend: Insert<'market_trends'>) => Promise<MarketTrend | null>;
  updateTrend: (params: { id: string; data: Update<'market_trends'> }) => Promise<MarketTrend | null>;
  deleteTrend: (id: string) => Promise<boolean>;

  // Partners (mock implementation)
  addPartner: (partner: Omit<MarketPartner, 'id'>) => Promise<MarketPartner | null>;
  updatePartner: (params: { id: string; data: Partial<Omit<MarketPartner, 'id'>> }) => Promise<MarketPartner | null>;
  deletePartner: (id: string) => Promise<boolean>;

  // Diff helpers
  getPersonaChangeType: (id: string) => ChangeType;
  getInterviewChangeType: (id: string) => ChangeType;
  getCompetitorChangeType: (id: string) => ChangeType;
  getTrendChangeType: (id: string) => ChangeType;
  getPartnerChangeType: (id: string) => ChangeType;
  isDiffMode: boolean;

  // New methods for persona-interview linking
  linkInterviewToPersona: (interviewId: string, personaId: string) => Promise<MarketInterview | null>;
  getInterviewsByPersona: (personaId: string) => MarketInterview[];
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Executes a function with retry logic
 */
async function executeWithRetry<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      // Exponential backoff
      await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Helper function to check array equality
function arraysEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  
  // Check if arrays have same items (not concerned with order for this use case)
  const sortedA = [...a].sort((x, y) => 
    (x.id && y.id) ? x.id.localeCompare(y.id) : 0
  );
  const sortedB = [...b].sort((x, y) => 
    (x.id && y.id) ? x.id.localeCompare(y.id) : 0
  );
  
  // Simple comparison of stringified arrays (works for our case of objects with IDs)
  return JSON.stringify(sortedA) === JSON.stringify(sortedB);
}

export function useMarketAnalysis(projectId: string | undefined): UseMarketAnalysisReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Mock partners state
  const [partners, setPartners] = useState<MarketPartner[]>(mockPartners);

  // Create stable, memoized query keys
  const queryKeys = useMemo(() => ({
    all: ['marketAnalysis', projectId] as const,
    personas: ['marketAnalysis', projectId, 'personas'] as const,
    interviews: ['marketAnalysis', projectId, 'interviews'] as const,
    competitors: ['marketAnalysis', projectId, 'competitors'] as const,
    trends: ['marketAnalysis', projectId, 'trends'] as const,
  }), [projectId]);

  // Use React Query to fetch data
  const { 
    data: personasData, 
    isLoading: personasLoading, 
    error: personasError 
  } = useQuery({
    queryKey: queryKeys.personas,
    queryFn: () => marketAnalysisService.getPersonas(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: interviewsData, 
    isLoading: interviewsLoading, 
    error: interviewsError 
  } = useQuery({
    queryKey: queryKeys.interviews,
    queryFn: () => marketAnalysisService.getInterviews(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: competitorsData, 
    isLoading: competitorsLoading, 
    error: competitorsError 
  } = useQuery({
    queryKey: queryKeys.competitors,
    queryFn: () => marketAnalysisService.getCompetitors(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: trendsData, 
    isLoading: trendsLoading, 
    error: trendsError 
  } = useQuery({
    queryKey: queryKeys.trends,
    queryFn: () => marketAnalysisService.getTrends(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update store when data changes, but only if data has actually changed
  useEffect(() => {
    if (personasData && !arraysEqual(personasData, store.currentData.marketPersonas)) {
      console.log('Setting marketPersonas in store, received data:', personasData);
      store.setMarketPersonas(personasData);
    }
  }, [personasData, store]);

  useEffect(() => {
    if (interviewsData && !arraysEqual(interviewsData, store.currentData.marketInterviews)) {
      store.setMarketInterviews(interviewsData);
    }
  }, [interviewsData, store]);

  useEffect(() => {
    if (competitorsData && !arraysEqual(competitorsData, store.currentData.marketCompetitors)) {
      store.setMarketCompetitors(competitorsData);
    }
  }, [competitorsData, store]);

  useEffect(() => {
    if (trendsData && !arraysEqual(trendsData, store.currentData.marketTrends)) {
      store.setMarketTrends(trendsData);
    }
  }, [trendsData, store]);

  // Get data from the store for comparison mode
  const storeData = useMemo(() => {
    const source = store.comparisonMode && store.stagedData ? store.stagedData : store.currentData;
    return {
      marketPersonas: source.marketPersonas || [],
      marketInterviews: source.marketInterviews || [],
      marketCompetitors: source.marketCompetitors || [],
      marketTrends: source.marketTrends || []
    };
  }, [store.currentData, store.stagedData, store.comparisonMode]);

  // Use either store data or query data based on comparison mode
  const data = useMemo((): ExtendedMarketAnalysisData => {
    if (store.comparisonMode) {
      // Map the personas data to ensure new fields are handled
      const mappedPersonas = storeData.marketPersonas.map(persona => {
        console.log('Mapping comparison mode persona:', persona);
        return {
          ...persona,
          // Ensure new fields have defaults
          influence_score: persona.influence_score || null,
          priority: persona.priority || null,
          persona_segments: persona.persona_segments || [],
          empathy_map: persona.empathy_map || null
        };
      });
      
      return {
        personas: mappedPersonas,
        interviews: storeData.marketInterviews,
        competitors: storeData.marketCompetitors,
        trends: storeData.marketTrends,
        partners: partners, // Add mock partners
        overview: {
          marketDefinition: {
            industry: 'Software as a Service',
            geography: 'global',
            maturity: 'growing'
          },
          marketSize: {
            tam: 150000000000, // $150B
            sam: 45000000000, // $45B
            som: 4500000000, // $4.5B
            tamMethod: 'top-down',
            samPercentage: 30,
            somPercentage: 10
          },
          segments: [
            {
              name: 'Enterprise',
              size: 60,
              growth: 15
            },
            {
              name: 'Mid-market',
              size: 30,
              growth: 22
            },
            {
              name: 'Small Business',
              size: 10,
              growth: 18
            }
          ]
        }
      };
    } else {
      // Map the personas data to ensure new fields are handled
      const mappedPersonas = (personasData || []).map(persona => {
        console.log('Mapping query mode persona:', persona);
        return {
          ...persona,
          // Ensure new fields have defaults
          influence_score: persona.influence_score || null,
          priority: persona.priority || null,
          persona_segments: persona.persona_segments || [],
          empathy_map: persona.empathy_map || null
        };
      });
      
      return {
        personas: mappedPersonas,
        interviews: interviewsData || [],
        competitors: competitorsData || [],
        trends: trendsData || [],
        partners: partners, // Add mock partners
        overview: {
          marketDefinition: {
            industry: 'Software as a Service',
            geography: 'global',
            maturity: 'growing'
          },
          marketSize: {
            tam: 150000000000, // $150B
            sam: 45000000000, // $45B
            som: 4500000000, // $4.5B
            tamMethod: 'top-down',
            samPercentage: 30,
            somPercentage: 10
          },
          segments: [
            {
              name: 'Enterprise',
              size: 60,
              growth: 15
            },
            {
              name: 'Mid-market',
              size: 30,
              growth: 22
            },
            {
              name: 'Small Business',
              size: 10,
              growth: 18
            }
          ]
        }
      };
    }
  }, [
    store.comparisonMode, 
    storeData,
    personasData,
    interviewsData,
    competitorsData,
    trendsData,
    partners // Add partners dependency
  ]);

  // Compute loading and error states
  const isLoading = personasLoading || interviewsLoading || competitorsLoading || trendsLoading;
  const queryError = personasError || interviewsError || competitorsError || trendsError;

  // === Persona Operations ===
  // Use our optimistic helper hooks
  const addPersonaOptimistic = useOptimisticCreate<'market_personas'>({
    projectId,
    tableName: 'market_personas',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.personas],
    setSubmitting,
    methods: {
      add: 'addPersona'
    }
  });

  const updatePersonaOptimistic = useOptimisticUpdate<'market_personas'>({
    tableName: 'market_personas',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.personas],
    setSubmitting,
    methods: {
      update: 'updatePersona'
    }
  });

  const deletePersonaOptimistic = useOptimisticDelete({
    tableName: 'market_personas',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.personas],
    setSubmitting,
    methods: {
      delete: 'deletePersona'
    }
  });

  // Exposed persona operations with proper typing
  const addPersona = useCallback(async (persona: Insert<'market_personas'>): Promise<MarketPersona | null> => {
    console.log('useMarketAnalysis - Adding persona:', persona);
    
    // Ensure all new fields have values
    const personaWithDefaults = {
      ...persona,
      influence_score: persona.influence_score || null,
      priority: persona.priority || null,
      persona_segments: persona.persona_segments || [],
      empathy_map: persona.empathy_map || null
    };
    
    console.log('useMarketAnalysis - Sending to addPersonaOptimistic:', personaWithDefaults);
    try {
      const result = await addPersonaOptimistic(personaWithDefaults);
      console.log('useMarketAnalysis - Add persona result:', result);
      return result;
    } catch (error) {
      console.error('useMarketAnalysis - Error in addPersona:', error);
      throw error;
    }
  }, [addPersonaOptimistic]);

  const updatePersona = useCallback(async (params: { id: string; data: Update<'market_personas'> }): Promise<MarketPersona | null> => {
    return updatePersonaOptimistic(params.id, params.data);
  }, [updatePersonaOptimistic]);

  const deletePersona = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deletePersonaOptimistic(id);
      return true;
    } catch (error) {
      console.error('Error deleting persona:', error);
      return false;
    }
  }, [deletePersonaOptimistic]);

  // === Interview Operations ===
  // Use our optimistic helper hooks
  const addInterviewOptimistic = useOptimisticCreate<'market_interviews'>({
    projectId,
    tableName: 'market_interviews',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.interviews],
    setSubmitting,
    methods: {
      add: 'addInterview'
    }
  });

  const updateInterviewOptimistic = useOptimisticUpdate<'market_interviews'>({
    tableName: 'market_interviews',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.interviews],
    setSubmitting,
    methods: {
      update: 'updateInterview'
    }
  });

  const deleteInterviewOptimistic = useOptimisticDelete({
    tableName: 'market_interviews',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.interviews],
    setSubmitting,
    methods: {
      delete: 'deleteInterview'
    }
  });

  // Exposed interview operations with proper typing
  const addInterview = useCallback(async (interview: Insert<'market_interviews'>): Promise<MarketInterview | null> => {
    return addInterviewOptimistic(interview);
  }, [addInterviewOptimistic]);

  const updateInterview = useCallback(async (params: { id: string; data: Update<'market_interviews'> }): Promise<MarketInterview | null> => {
    return updateInterviewOptimistic(params.id, params.data);
  }, [updateInterviewOptimistic]);

  const deleteInterview = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteInterviewOptimistic(id);
      return true;
    } catch (error) {
      console.error('Error deleting interview:', error);
      return false;
    }
  }, [deleteInterviewOptimistic]);

  // Function to link an interview to a persona
  const linkInterviewToPersona = useCallback(async (interviewId: string, personaId: string): Promise<MarketInterview | null> => {
    return updateInterview({
      id: interviewId,
      data: { persona_id: personaId }
    });
  }, [updateInterview]);

  // Function to get interviews by persona
  const getInterviewsByPersona = useCallback((personaId: string): MarketInterview[] => {
    return data.interviews.filter(interview => interview.persona_id === personaId);
  }, [data.interviews]);

  // === Competitor Operations ===
  // Use our optimistic helper hooks
  const addCompetitorOptimistic = useOptimisticCreate<'market_competitors'>({
    projectId,
    tableName: 'market_competitors',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.competitors],
    setSubmitting,
    methods: {
      add: 'addCompetitor'
    }
  });

  const updateCompetitorOptimistic = useOptimisticUpdate<'market_competitors'>({
    tableName: 'market_competitors',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.competitors],
    setSubmitting,
    methods: {
      update: 'updateCompetitor'
    }
  });

  const deleteCompetitorOptimistic = useOptimisticDelete({
    tableName: 'market_competitors',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.competitors],
    setSubmitting,
    methods: {
      delete: 'deleteCompetitor'
    }
  });

  // Exposed competitor operations with proper typing
  const addCompetitor = useCallback(async (competitor: Insert<'market_competitors'>): Promise<MarketCompetitor | null> => {
    return addCompetitorOptimistic(competitor);
  }, [addCompetitorOptimistic]);

  const updateCompetitor = useCallback(async (params: { id: string; data: Update<'market_competitors'> }): Promise<MarketCompetitor | null> => {
    return updateCompetitorOptimistic(params.id, params.data);
  }, [updateCompetitorOptimistic]);

  const deleteCompetitor = useCallback(async (id: string): Promise<boolean> => {
    return deleteCompetitorOptimistic(id);
  }, [deleteCompetitorOptimistic]);

  // === Trend Operations ===
  // Use our optimistic helper hooks
  const addTrendOptimistic = useOptimisticCreate<'market_trends'>({
    projectId,
    tableName: 'market_trends',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.trends],
    setSubmitting,
    methods: {
      add: 'addTrend'
    }
  });

  const updateTrendOptimistic = useOptimisticUpdate<'market_trends'>({
    tableName: 'market_trends',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.trends],
    setSubmitting,
    methods: {
      update: 'updateTrend'
    }
  });

  const deleteTrendOptimistic = useOptimisticDelete({
    tableName: 'market_trends',
    store,
    service: marketAnalysisService,
    queryClient,
    queryKey: [...queryKeys.trends],
    setSubmitting,
    methods: {
      delete: 'deleteTrend'
    }
  });

  // Exposed trend operations with proper typing
  const addTrend = useCallback(async (trend: Insert<'market_trends'>): Promise<MarketTrend | null> => {
    return addTrendOptimistic(trend);
  }, [addTrendOptimistic]);

  const updateTrend = useCallback(async (params: { id: string; data: Update<'market_trends'> }): Promise<MarketTrend | null> => {
    return updateTrendOptimistic(params.id, params.data);
  }, [updateTrendOptimistic]);

  const deleteTrend = useCallback(async (id: string): Promise<boolean> => {
    return deleteTrendOptimistic(id);
  }, [deleteTrendOptimistic]);

  // Mock partners operations
  const addPartner = useCallback(async (partner: Omit<MarketPartner, 'id'>): Promise<MarketPartner | null> => {
    try {
      setSubmitting(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPartner: MarketPartner = {
        ...partner,
        id: uuidv4(),
        project_id: projectId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setPartners(prev => [...prev, newPartner]);
      return newPartner;
    } catch (err) {
      console.error('Error adding partner:', err);
      setError(err instanceof Error ? err : new Error('Unknown error adding partner'));
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId]);

  const updatePartner = useCallback(async (params: { id: string; data: Partial<Omit<MarketPartner, 'id'>> }): Promise<MarketPartner | null> => {
    try {
      setSubmitting(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedPartner: MarketPartner | null = null;
      
      setPartners(prev => {
        const newPartners = prev.map(p => {
          if (p.id === params.id) {
            updatedPartner = {
              ...p,
              ...params.data,
              updated_at: new Date().toISOString()
            };
            return updatedPartner;
          }
          return p;
        });
        return newPartners;
      });
      
      return updatedPartner;
    } catch (err) {
      console.error('Error updating partner:', err);
      setError(err instanceof Error ? err : new Error('Unknown error updating partner'));
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const deletePartner = useCallback(async (id: string): Promise<boolean> => {
    try {
      setSubmitting(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPartners(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting partner:', err);
      setError(err instanceof Error ? err : new Error('Unknown error deleting partner'));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Diff helpers
  const getPersonaChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('marketPersonas', id), [store]);

  const getInterviewChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('marketInterviews', id), [store]);

  const getCompetitorChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('marketCompetitors', id), [store]);

  const getTrendChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('marketTrends', id), [store]);

  // For partner change type (mock implementation)
  const getPartnerChangeType = useCallback((id: string): ChangeType => {
    // In a real implementation, this would check the diff between staged and current data
    return 'unchanged';
  }, []);

  return {
    data,
    isLoading,
    error: queryError,

    // Personas
    addPersona,
    updatePersona,
    deletePersona,

    // Interviews
    addInterview,
    updateInterview,
    deleteInterview,

    // Competitors
    addCompetitor,
    updateCompetitor,
    deleteCompetitor,

    // Trends
    addTrend,
    updateTrend,
    deleteTrend,
    
    // Partners
    addPartner,
    updatePartner,
    deletePartner,

    // Diff helpers
    getPersonaChangeType,
    getInterviewChangeType,
    getCompetitorChangeType,
    getTrendChangeType,
    getPartnerChangeType,
    isDiffMode: store.comparisonMode,
    
    // New methods for persona-interview linking
    linkInterviewToPersona,
    getInterviewsByPersona
  };
}