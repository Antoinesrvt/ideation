import { createContext, useContext, useMemo, ReactNode } from 'react'
import { AIService, AIServiceOptions } from '@/lib/services/ai/ai-service'

interface AIServiceContextValue {
  service: AIService | null
  isConfigured: boolean
  error?: Error
}

const AIServiceContext = createContext<AIServiceContextValue | null>(null)

interface AIServiceProviderProps {
  children: ReactNode
  config: AIServiceOptions
}

export function AIServiceProvider({ children, config }: AIServiceProviderProps) {
  const serviceValue = useMemo(() => {
    try {
      const service = new AIService(config)
      return { service, isConfigured: true, error: undefined }
    } catch (error) {
      console.error('Failed to initialize AI service:', error)
      return { 
        service: null, 
        isConfigured: false, 
        error: error instanceof Error ? error : new Error('Failed to initialize AI service') 
      }
    }
  }, [config])

  return (
    <AIServiceContext.Provider value={serviceValue}>
      {children}
    </AIServiceContext.Provider>
  )
}

export function useAIService() {
  const context = useContext(AIServiceContext)
  if (!context) {
    throw new Error('useAIService must be used within an AIServiceProvider')
  }
  return context
} 