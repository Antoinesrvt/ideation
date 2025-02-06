import { createContext, useContext, useMemo, ReactNode } from 'react'
import { ResearchService } from '@/lib/services/core/research-service'

export interface ResearchServiceOptions {
  apiKey: string
  cacheConfig?: {
    ttl: number
    storage: 'memory' | 'indexedDB'
  }
}

interface ResearchServiceContextValue {
  service: ResearchService | null
  isConfigured: boolean
  error?: Error
}

const ResearchServiceContext = createContext<ResearchServiceContextValue | null>(null)

interface ResearchServiceProviderProps {
  children: ReactNode
  config: ResearchServiceOptions
}

export function ResearchServiceProvider({ children, config }: ResearchServiceProviderProps) {
  const serviceValue = useMemo(() => {
    try {
      const service = new ResearchService(config)
      return { service, isConfigured: true, error: undefined }
    } catch (error) {
      console.error('Failed to initialize Research service:', error)
      return { 
        service: null, 
        isConfigured: false, 
        error: error instanceof Error ? error : new Error('Failed to initialize Research service') 
      }
    }
  }, [config])

  return (
    <ResearchServiceContext.Provider value={serviceValue}>
      {children}
    </ResearchServiceContext.Provider>
  )
}

export function useResearchService() {
  const context = useContext(ResearchServiceContext)
  if (!context) {
    throw new Error('useResearchService must be used within a ResearchServiceProvider')
  }
  return context
} 