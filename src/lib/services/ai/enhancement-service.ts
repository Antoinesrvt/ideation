import { BaseAIService, AIServiceOptions, AIRequestContext } from './base-service'
import { ModuleType } from '@/types/project'
import { DbModuleStep, DbStepResponse } from '@/types/module'
import { ContextData } from './context-builder'

export interface EnhancementOptions extends AIServiceOptions {
  includeMarketData?: boolean
  includeCompetitorData?: boolean
  includeFinancialData?: boolean
  customInstructions?: string
}

export interface EnhancementResult {
  enhancedContent: string
  metadata: {
    originalLength: number
    enhancedLength: number
    enhancementType: string[]
    processingTime: number
    confidence: number
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
   * Generate an AI suggestion for a step
   */
  async generateSuggestion(
    steps: (DbModuleStep & { responses: DbStepResponse[] })[],
    projectData: Record<string, any>,
    currentStepId: string,
    options: EnhancementOptions = {}
  ): Promise<string> {
    try {
      // 1. Build context from previous steps
      this.contextBuilder
        .addStepResponses(steps)
        .addProjectData(projectData)

      // 2. Enrich context if requested
      if (options.includeMarketData || options.includeCompetitorData || options.includeFinancialData) {
        await this.contextBuilder.enrichContext(options)
      }

      // 3. Get current step configuration
      const currentStep = steps.find(s => s.id === currentStepId)
      if (!currentStep) {
        throw new Error(`Step ${currentStepId} not found`)
      }

      // 4. Get system prompt
      const systemPrompt = this.getSystemPrompt('analyze', {
        moduleType: this.moduleType,
        stepType: currentStep.step_type,
        customInstructions: options.customInstructions
      })

      // 5. Generate suggestion
      const suggestion = await this.callAI(
        JSON.stringify(this.contextBuilder.getContext()),
        systemPrompt,
        { temperature: 0.7 }
      )

      // 6. Store interaction
      await this.storeInteraction(
        'enhancement',
        'suggestion',
        suggestion,
        currentStepId
      )

      return suggestion
    } catch (error) {
      console.error('Error generating suggestion:', error)
      throw error instanceof Error ? error : new Error('Failed to generate suggestion')
    }
  }

  /**
   * Enhance existing content with AI
   */
  async enhance(
    content: string,
    steps: (DbModuleStep & { responses: DbStepResponse[] })[],
    projectData: Record<string, any>,
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult> {
    const startTime = Date.now()

    try {
      // 1. Build context
      this.contextBuilder
        .addStepResponses(steps)
        .addProjectData(projectData)

      // 2. Enrich context if requested
      if (options.includeMarketData || options.includeCompetitorData || options.includeFinancialData) {
        await this.contextBuilder.enrichContext(options)
      }

      // 3. Get system prompt
      const systemPrompt = this.getSystemPrompt('analyze', {
        moduleType: this.moduleType,
        content,
        customInstructions: options.customInstructions
      })

      // 4. Generate enhancement
      const enhancedContent = await this.callAI(
        JSON.stringify(this.contextBuilder.getContext()),
        systemPrompt,
        { temperature: 0.4 }
      )

      // 5. Store interaction
      await this.storeInteraction(
        'enhancement',
        content,
        enhancedContent
      )

      return {
        enhancedContent,
        metadata: {
          originalLength: content.length,
          enhancedLength: enhancedContent.length,
          enhancementType: this.getEnhancementTypes(options),
          processingTime: Date.now() - startTime,
          confidence: 0.85 // TODO: Get from AI response
        }
      }
    } catch (error) {
      console.error('Error enhancing content:', error)
      throw error instanceof Error ? error : new Error('Failed to enhance content')
    }
  }

  /**
   * Get enhancement types based on options
   */
  private getEnhancementTypes(options: EnhancementOptions): string[] {
    const types: string[] = ['content']
    if (options.includeMarketData) types.push('market')
    if (options.includeCompetitorData) types.push('competitor')
    if (options.includeFinancialData) types.push('financial')
    return types
  }
} 