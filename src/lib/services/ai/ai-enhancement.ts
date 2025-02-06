import { ModuleType } from '@/types/project'
import { AIContextBuilder } from '@/lib/services/ai/context-builder'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export interface EnhancementOptions {
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

export class AIEnhancementService {
  private contextBuilder: AIContextBuilder

  constructor(
    private supabase: SupabaseClient<Database>,
    private projectId: string,
    private moduleType: ModuleType
  ) {
    this.contextBuilder = new AIContextBuilder(moduleType, projectId)
  }

  /**
   * Enhance content using AI and context
   */
  async enhanceContent(
    content: string,
    stepId: string,
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult> {
    const startTime = Date.now()

    try {
      // 1. Build context
      const context = await this.buildContext(content, stepId, options)

      // 2. Get enhancement prompt based on module type and step
      const prompt = this.getEnhancementPrompt(stepId, context)

      // 3. Call AI service
      const enhancedContent = await this.callAIService(prompt, content)

      // 4. Store interaction
      await this.storeInteraction(stepId, prompt, enhancedContent)

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
      console.error('Error enhancing content:', error)
      throw error
    }
  }

  /**
   * Build context for enhancement
   */
  private async buildContext(
    content: string,
    stepId: string,
    options: EnhancementOptions
  ) {
    // Add current content
    this.contextBuilder.addModuleResponses({
      [stepId]: {
        content,
        step_id: stepId,
        module_id: '', // Will be filled by context builder
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        id: '' // Will be filled by context builder
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
   * Get enhancement prompt based on module type and step
   */
  private getEnhancementPrompt(stepId: string, context: any): string {
    // TODO: Implement prompt templates based on module type and step
    const basePrompt = `Enhance the following content for the ${this.moduleType} module, step ${stepId}. 
    Consider the following context and requirements:
    
    1. Maintain the original message intent and key points
    2. Improve clarity and structure
    3. Add relevant details from the context
    4. Ensure professional tone and language
    5. Optimize for completeness and accuracy
    
    Context Summary:
    ${JSON.stringify(context)}
    
    Original Content:
    `

    return basePrompt
  }

  /**
   * Call AI service with prompt
   */
  private async callAIService(prompt: string, content: string): Promise<string> {
    // TODO: Implement actual AI service call
    // This is a placeholder that returns the original content
    return content
  }

  /**
   * Store AI interaction in database
   */
  private async storeInteraction(
    stepId: string,
    prompt: string,
    response: string
  ) {
    await this.supabase.from('ai_interactions').insert({
      project_id: this.projectId,
      module_id: null, // Optional
      step_id: stepId,
      type: 'content',
      prompt,
      response
    })
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