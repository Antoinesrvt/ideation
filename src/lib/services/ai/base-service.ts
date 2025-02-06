import { ModuleType } from '@/types/project'
import { ContextData, AIContextBuilder } from './context-builder'
import { AI_PROMPTS } from './prompts'

export interface AIServiceOptions {
  temperature?: number
  maxTokens?: number
  model?: string
}

export interface AIRequestContext {
  moduleType: ModuleType
  projectId: string
  stepId?: string
  contextData?: ContextData
}

export const DEFAULT_OPTIONS: Required<AIServiceOptions> = {
  temperature: 0.7,
  maxTokens: 1000,
  model: 'claude-3-opus-20240229'
}

export class BaseAIService {
  protected options: Required<AIServiceOptions>
  protected contextBuilder: AIContextBuilder

  constructor(
    protected projectId: string,
    protected moduleType: ModuleType,
    options: AIServiceOptions = {}
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.contextBuilder = new AIContextBuilder(moduleType, projectId)
  }

  /**
   * Core method to call AI API
   */
  protected async callAI(
    prompt: string,
    systemPrompt?: string,
    options: Partial<AIServiceOptions> = {}
  ): Promise<string> {
    try {
      const mergedOptions = { ...this.options, ...options }

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemPrompt,
          options: mergedOptions
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to generate AI content')
      }

      const data = await response.json()
      return data.content
    } catch (error) {
      console.error('Error calling AI service:', error)
      throw error
    }
  }

  /**
   * Store AI interaction in database
   */
  protected async storeInteraction(
    type: 'chat' | 'enhancement' | 'research',
    prompt: string,
    response: string,
    stepId?: string
  ) {
    try {
      const { error } = await fetch('/api/ai/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: this.projectId,
          moduleType: this.moduleType,
          stepId,
          type,
          prompt,
          response
        })
      }).then(res => res.json())

      if (error) throw error
    } catch (error) {
      console.error('Error storing AI interaction:', error)
      // Don't throw - this is non-critical
    }
  }

  /**
   * Get system prompt based on type and context
   */
  protected getSystemPrompt(
    type: keyof typeof AI_PROMPTS,
    context: Record<string, any> = {}
  ): string {
    let prompt = AI_PROMPTS[type]
    
    // Replace template variables
    Object.entries(context).forEach(([key, value]) => {
      prompt = prompt.replace(`{${key}}`, value)
    })

    return prompt
  }
} 