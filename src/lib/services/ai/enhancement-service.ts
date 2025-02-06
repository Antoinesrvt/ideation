import { BaseAIService, AIServiceOptions, AIRequestContext } from './base-service'
import { ModuleType } from '@/types/project'
import { ContextData } from './context-builder'

export interface EnhancementOptions extends AIServiceOptions {
  useMarketData?: boolean
  useCompetitorData?: boolean
  useFinancialData?: boolean
  customInstructions?: string
}

export interface EnhancementResult {
  enhancedContent: string
  metadata: {
    originalLength: number
    enhancedLength: number
    enhancementType: string[]
    processingTime: number
  }
}

export class EnhancementService extends BaseAIService {
  constructor(
    projectId: string,
    moduleType: ModuleType,
    options: EnhancementOptions = {}
  ) {
    super(projectId, moduleType, options)
  }

  /**
   * Enhance content using AI and context
   */
  async enhance(
    content: string,
    context: AIRequestContext,
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult> {
    const startTime = Date.now()

    try {
      // Build or use provided context
      const contextData = await this.buildContext(content, context, options)

      // Get enhancement prompt
      const systemPrompt = this.getSystemPrompt('analyze', {
        moduleId: context.moduleType,
        stepId: context.stepId,
        content,
        ...this.extractContextMetadata(contextData)
      })

      // Get AI response
      const enhancedContent = await this.callAI(
        content,
        systemPrompt,
        { temperature: 0.4 } // Lower temperature for more focused improvements
      )

      // Store interaction
      await this.storeInteraction(
        'enhancement',
        content,
        enhancedContent,
        context.stepId
      )

      return {
        enhancedContent,
        metadata: {
          originalLength: content.length,
          enhancedLength: enhancedContent.length,
          enhancementType: this.getEnhancementTypes(options),
          processingTime: Date.now() - startTime
        }
      }
    } catch (error) {
      console.error('Enhancement error:', error)
      throw error
    }
  }

  /**
   * Build context for enhancement
   */
  private async buildContext(
    content: string,
    context: AIRequestContext,
    options: EnhancementOptions
  ): Promise<ContextData> {
    if (context.contextData) {
      return context.contextData
    }

    // Add current content
    this.contextBuilder.addModuleResponses({
      [context.stepId || 'current']: {
        content,
        step_id: context.stepId || 'current',
        module_id: context.moduleType,
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        id: 'temp'
      }
    })

    // Enrich context based on options
    await this.contextBuilder.enrichContext({
      includeMarketData: options.useMarketData,
      includeCompetitorData: options.useCompetitorData,
      includeFinancialData: options.useFinancialData,
      customInstructions: options.customInstructions
    })

    return this.contextBuilder.getContext()
  }

  /**
   * Extract metadata from context for prompt
   */
  private extractContextMetadata(context: ContextData): Record<string, any> {
    const metadata: Record<string, any> = {}

    context.sources.forEach(source => {
      if (source.type === 'project_data') {
        metadata.industry = source.content.industry
        metadata.businessModel = source.content.businessModel
        metadata.targetMarket = source.content.targetMarket
      }
    })

    return metadata
  }

  /**
   * Get enhancement types based on options
   */
  private getEnhancementTypes(options: EnhancementOptions): string[] {
    const types: string[] = ['content']
    if (options.useMarketData) types.push('market')
    if (options.useCompetitorData) types.push('competitor')
    if (options.useFinancialData) types.push('financial')
    return types
  }
} 