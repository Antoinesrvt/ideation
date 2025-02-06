import { ReactNode } from 'react'
import { AIServiceProvider } from './ai-service-context'
import { ResearchServiceProvider } from './research-service-context'
import type { AIServiceOptions } from '@/lib/services/ai/ai-service'
import type { ResearchServiceOptions } from './research-service-context'

interface CoreServicesConfig {
  ai: AIServiceOptions
  research: ResearchServiceOptions
}

interface CoreServicesProviderProps {
  children: ReactNode
  config: CoreServicesConfig
}

export function CoreServicesProvider({ children, config }: CoreServicesProviderProps) {
  return (
    <AIServiceProvider config={config.ai}>
      <ResearchServiceProvider config={config.research}>
        {children}
      </ResearchServiceProvider>
    </AIServiceProvider>
  )
} 