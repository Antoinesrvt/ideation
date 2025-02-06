import { useState, useCallback } from 'react'
import { useResearchService } from '@/context/services/research-service-context'
import { useToast } from '@/hooks/use-toast'
import type { ResearchQuery, ResearchResult } from '@/lib/services/core/research-service'

export function useResearch() {
  const { service, isConfigured, error: serviceError } = useResearchService()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const search = useCallback(async (query: ResearchQuery): Promise<ResearchResult[]> => {
    if (!service || !isConfigured) {
      const error = serviceError || new Error('Research service is not configured')
      setError(error)
      toast({
        title: "Error",
        description: "Research service is not configured",
        variant: "destructive"
      })
      return []
    }

    try {
      setIsLoading(true)
      setError(null)

      const results = await service.search(query)
      return results
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to perform research')
      console.error('Error performing research:', err)
      setError(error)
      
      toast({
        title: "Error",
        description: "Failed to perform research. Please try again.",
        variant: "destructive"
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [service, isConfigured, serviceError, toast])

  const getCachedResults = useCallback(async (
    type: ResearchQuery['type'],
    key: string
  ): Promise<ResearchResult[] | null> => {
    if (!service || !isConfigured) return null

    try {
      return await service.getCachedResults(type, key)
    } catch (err) {
      console.error('Error getting cached results:', err)
      return null
    }
  }, [service, isConfigured])

  return {
    search,
    getCachedResults,
    isLoading,
    error,
    isConfigured
  }
} 