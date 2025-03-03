import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MarketAnalysis, CustomerPersona, CustomerInterview, Competitor, MarketTrend } from '@/types';

/**
 * Hook for market analysis operations
 */
export function useMarketAnalysis() {
  const queryClient = useQueryClient();
  
  // Add a new customer persona
  const addPersona = useMutation({
    mutationFn: (persona: CustomerPersona) => {
      // This would typically be an API call
      return Promise.resolve(persona);
    },
    onSuccess: (persona) => {
      // Update the cache
      queryClient.setQueryData(['project'], (oldData: any) => {
        if (!oldData) return oldData;
        
        const marketAnalysis = oldData.marketAnalysis || {
          customerInsights: { personas: [], interviews: [] },
          competitors: [],
          trends: []
        };
        
        return {
          ...oldData,
          marketAnalysis: {
            ...marketAnalysis,
            customerInsights: {
              ...marketAnalysis.customerInsights,
              personas: [...marketAnalysis.customerInsights.personas, persona]
            }
          }
        };
      });
    },
  });
  
  // Add a new customer interview
  const addInterview = useMutation({
    mutationFn: (interview: CustomerInterview) => {
      // This would typically be an API call
      return Promise.resolve(interview);
    },
    onSuccess: (interview) => {
      // Update the cache
      queryClient.setQueryData(['project'], (oldData: any) => {
        if (!oldData) return oldData;
        
        const marketAnalysis = oldData.marketAnalysis || {
          customerInsights: { personas: [], interviews: [] },
          competitors: [],
          trends: []
        };
        
        return {
          ...oldData,
          marketAnalysis: {
            ...marketAnalysis,
            customerInsights: {
              ...marketAnalysis.customerInsights,
              interviews: [...marketAnalysis.customerInsights.interviews, interview]
            }
          }
        };
      });
    },
  });
  
  // Add a new competitor
  const addCompetitor = useMutation({
    mutationFn: (competitor: Competitor) => {
      // This would typically be an API call
      return Promise.resolve(competitor);
    },
    onSuccess: (competitor) => {
      // Update the cache
      queryClient.setQueryData(['project'], (oldData: any) => {
        if (!oldData) return oldData;
        
        const marketAnalysis = oldData.marketAnalysis || {
          customerInsights: { personas: [], interviews: [] },
          competitors: [],
          trends: []
        };
        
        return {
          ...oldData,
          marketAnalysis: {
            ...marketAnalysis,
            competitors: [...marketAnalysis.competitors, competitor]
          }
        };
      });
    },
  });
  
  // Add a new market trend
  const addTrend = useMutation({
    mutationFn: (trend: MarketTrend) => {
      // This would typically be an API call
      return Promise.resolve(trend);
    },
    onSuccess: (trend) => {
      // Update the cache
      queryClient.setQueryData(['project'], (oldData: any) => {
        if (!oldData) return oldData;
        
        const marketAnalysis = oldData.marketAnalysis || {
          customerInsights: { personas: [], interviews: [] },
          competitors: [],
          trends: []
        };
        
        return {
          ...oldData,
          marketAnalysis: {
            ...marketAnalysis,
            trends: [...marketAnalysis.trends, trend]
          }
        };
      });
    },
  });
  
  return {
    addPersona: addPersona.mutate,
    addInterview: addInterview.mutate,
    addCompetitor: addCompetitor.mutate,
    addTrend: addTrend.mutate,
  };
}