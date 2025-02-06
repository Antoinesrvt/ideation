import { AIService, AIServiceOptions } from './ai/ai-service'
import { ServiceError } from '../errors/base-error'

export interface ServiceConfig {
  apiKeys: {
    anthropic?: string
  }
  options?: {
    ai?: Omit<AIServiceOptions, 'apiKey'>
    cache?: {
      ttl: number
      storage: 'memory' | 'indexedDB'
    }
  }
}

type ServiceType = 'ai'
type ServiceInstance = AIService

export class ServiceRegistry {
  private static instance: ServiceRegistry
  private services: Map<ServiceType, ServiceInstance> = new Map()
  private config: ServiceConfig

  private constructor(config: ServiceConfig) {
    this.validateConfig(config)
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
    } else if (config) {
      // Update config if provided
      ServiceRegistry.instance.updateConfig(config)
    }
    return ServiceRegistry.instance
  }

  private validateConfig(config: ServiceConfig): void {
    if (!config.apiKeys) {
      throw new ServiceError(
        'ConfigValidationError',
        'API keys configuration is required'
      )
    }
  }

  public getAIService(): AIService {
    return this.getOrCreateService('ai', () => {
      if (!this.config.apiKeys.anthropic) {
        throw new ServiceError(
          'ServiceConfigError',
          'Anthropic API key is required for AI service'
        )
      }

      const aiOptions: AIServiceOptions = {
        apiKey: this.config.apiKeys.anthropic,
        ...this.config.options?.ai,
        // Default values if not provided in options
        model: this.config.options?.ai?.model || 'claude-3-opus-20240229',
        maxTokens: this.config.options?.ai?.maxTokens || 4000,
        temperature: this.config.options?.ai?.temperature || 0.7
      }

      return new AIService(aiOptions)
    })
  }

  private getOrCreateService<T extends ServiceInstance>(
    key: ServiceType,
    factory: () => T
  ): T {
    if (!this.services.has(key)) {
      try {
        const service = factory()
        this.services.set(key, service)
      } catch (error) {
        throw new ServiceError(
          'ServiceCreationError',
          `Failed to create ${key} service: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }
    return this.services.get(key) as T
  }

  public updateConfig(newConfig: Partial<ServiceConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
      apiKeys: {
        ...this.config.apiKeys,
        ...newConfig.apiKeys
      },
      options: {
        ...this.config.options,
        ...newConfig.options,
        ai: {
          ...this.config.options?.ai,
          ...newConfig.options?.ai
        }
      }
    }
    this.clearServices() // Reset services to use new config
  }

  public clearServices(): void {
    this.services.clear()
  }

  public getConfig(): Readonly<ServiceConfig> {
    return Object.freeze({ ...this.config })
  }
} 