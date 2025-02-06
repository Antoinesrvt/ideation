import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { ModuleType } from '@/types/project'
import { AIService, AIServiceOptions } from './ai/ai-service'
import { ResearchService } from './core/research-service'
import { ServiceError } from '../errors/base-error'

export interface ServiceConfig {
  supabase: SupabaseClient<Database>
  projectId: string
  moduleType: ModuleType
  apiKeys?: {
    anthropic?: string
    marketResearch?: string
    financialData?: string
    newsApi?: string
  }
}

export class ServiceRegistry {
  private static instance: ServiceRegistry
  private services: Map<string, any> = new Map()
  private config: ServiceConfig

  private constructor(config: ServiceConfig) {
    this.config = config
  }

  public static getInstance(config?: ServiceConfig): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      if (!config) {
        throw new ServiceError(
          'ServiceInitializationError',
          'Configuration required for service initialization'
        )
      }
      ServiceRegistry.instance = new ServiceRegistry(config)
    }
    return ServiceRegistry.instance
  }

  public getAIService(): AIService {
    const serviceKey = 'ai'
    if (!this.services.has(serviceKey)) {
      if (!this.config.apiKeys?.anthropic) {
        throw new ServiceError(
          'ServiceConfigError',
          'Anthropic API key is required for AI service'
        )
      }

      const aiOptions: AIServiceOptions = {
        apiKey: this.config.apiKeys.anthropic,
        model: 'claude-3-opus-20240229',
        maxTokens: 4000,
        temperature: 0.7
      }

      this.services.set(serviceKey, new AIService(aiOptions))
    }
    return this.services.get(serviceKey)
  }

  public getResearchService(): ResearchService {
    const serviceKey = 'research'
    if (!this.services.has(serviceKey)) {
      this.services.set(
        serviceKey,
        new ResearchService(
          this.config.supabase,
          this.config.projectId,
          this.config.moduleType
        )
      )
    }
    return this.services.get(serviceKey)
  }

  public clearServices(): void {
    this.services.clear()
  }

  public getConfig(): ServiceConfig {
    return { ...this.config }
  }

  public updateConfig(newConfig: Partial<ServiceConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      apiKeys: {
        ...this.config.apiKeys,
        ...newConfig.apiKeys
      }
    }
    this.clearServices() // Reset services to use new config
  }
} 