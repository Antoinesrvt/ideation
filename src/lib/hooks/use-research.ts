
import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import {
  ResearchQuery,
  ResearchResult,
  MarketData,
  CompetitorData,
  FinancialData,
  fetchMarketResearch,
  fetchCompetitorResearch,
  fetchFinancialResearch
} from '@/lib/services/core/research-service'

// Type-safe hooks for specific research types
export function useMarketResearch(
  query: ResearchQuery,
  options?: UseQueryOptions<ResearchResult<MarketData>, Error>
) {
  return useQuery<ResearchResult<MarketData>, Error>({
    queryKey: ['market-research', query],
    queryFn: () => fetchMarketResearch(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    ...options
  })
}

export function useCompetitorResearch(
  query: ResearchQuery,
  options?: UseQueryOptions<ResearchResult<CompetitorData>, Error>
) {
  return useQuery<ResearchResult<CompetitorData>, Error>({
    queryKey: ['competitor-research', query],
    queryFn: () => fetchCompetitorResearch(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    ...options
  })
}

export function useFinancialResearch(
  query: ResearchQuery,
  options?: UseQueryOptions<ResearchResult<FinancialData>, Error>
) {
  return useQuery<ResearchResult<FinancialData>, Error>({
    queryKey: ['financial-research', query],
    queryFn: () => fetchFinancialResearch(query),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
    ...options
  })
}

// Generic research hook for dynamic research types
export function useResearch<T>(type: 'market' | 'competitor' | 'financial') {
  const { toast } = useToast()
  const mutation = useMutation<ResearchResult<T>, Error, ResearchQuery>({
    mutationFn: async (query: ResearchQuery) => {
      switch (type) {
        case 'market':
          return fetchMarketResearch(query) as Promise<ResearchResult<T>>
        case 'competitor':
          return fetchCompetitorResearch(query) as Promise<ResearchResult<T>>
        case 'financial':
          return fetchFinancialResearch(query) as Promise<ResearchResult<T>>
        default:
          throw new Error(`Unsupported research type: ${type}`)
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Research error: ${error.message}`,
        variant: "destructive"
      })
    }
  })

  return {
    search: mutation.mutate,
    searchAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    data: mutation.data
  }
} 