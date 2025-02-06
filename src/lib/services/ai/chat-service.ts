import { BaseAIService, AIServiceOptions, AIRequestContext } from './base-service'
import { ModuleType } from '@/types/project'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatOptions extends AIServiceOptions {
  includeHistory?: boolean
  maxHistoryLength?: number
}

export class ChatService extends BaseAIService {
  private history: ChatMessage[] = []

  constructor(
    projectId: string,
    moduleType: ModuleType,
    options: ChatOptions = {}
  ) {
    super(projectId, moduleType, options)
  }

  /**
   * Send a chat message and get a response
   */
  async chat(
    message: string,
    context?: AIRequestContext
  ): Promise<string> {
    try {
      // Add user message to history
      this.history.push({ role: 'user', content: message })

      // Get system prompt
      const systemPrompt = context ? this.getSystemPrompt('contextual', {
        moduleId: context.moduleType,
        stepId: context.stepId,
        projectContext: JSON.stringify(context.contextData)
      }) : undefined

      // Add system message if provided
      if (systemPrompt) {
        this.history.unshift({ role: 'system', content: systemPrompt })
      }

      // Get AI response
      const response = await this.callAI(
        message,
        systemPrompt,
        { temperature: 0.8 } // Slightly higher temperature for more creative responses
      )

      // Add assistant response to history
      this.history.push({ role: 'assistant', content: response })

      // Store interaction
      await this.storeInteraction(
        'chat',
        message,
        response,
        context?.stepId
      )

      return response
    } catch (error) {
      console.error('Chat error:', error)
      throw error
    }
  }

  /**
   * Get chat history
   */
  getHistory(): ChatMessage[] {
    return this.history
  }

  /**
   * Clear chat history
   */
  clearHistory(): void {
    this.history = []
  }
} 