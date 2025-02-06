import { Anthropic, HUMAN_PROMPT } from '@anthropic-ai/sdk'
import { ModuleType } from '@/types/project'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export interface AIServiceOptions {
  temperature?: number
  maxTokens?: number
  model?: string
}

const DEFAULT_OPTIONS: Required<AIServiceOptions> = {
  temperature: 0.7,
  maxTokens: 1000,
  model: 'claude-3-opus-20240229'
}

export class AIService {
  private options: Required<AIServiceOptions>

  constructor(options: Partial<AIServiceOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * Generate content using AI
   */
  async generateContent(
    prompt: string,
    systemPrompt?: string,
    options: Partial<AIServiceOptions> = {}
  ): Promise<string> {
    try {
      const mergedOptions: Required<AIServiceOptions> = { 
        ...this.options,
        ...options
      }

      const response = await anthropic.messages.create({
        model: mergedOptions.model,
        max_tokens: mergedOptions.maxTokens,
        temperature: mergedOptions.temperature,
        messages: [
          { role: 'user', content: prompt }
        ],
        system: systemPrompt
      })

      // Safely extract the text content from the response
      const content = response.content[0]
      if ('text' in content) {
        return content.text
      }
      throw new Error('Unexpected response format from AI service')
    } catch (error) {
      console.error('Error generating AI content:', error)
      throw error
    }
  }

  /**
   * Get system prompt for module enhancement
   */
  getEnhancementSystemPrompt(moduleType: ModuleType): string {
    return `You are an expert business consultant specializing in ${moduleType.replace('-', ' ')}. 
    Your task is to enhance the provided content while maintaining its original intent and key points.
    
    Follow these guidelines:
    1. Maintain professional and clear language
    2. Add relevant industry-specific insights
    3. Ensure logical flow and structure
    4. Include concrete examples where appropriate
    5. Keep the tone consistent with business documentation
    
    The enhanced content should be comprehensive yet concise, focusing on actionable insights and clear value propositions.`
  }

  /**
   * Get system prompt for chat interactions
   */
  getChatSystemPrompt(moduleType: ModuleType): string {
    return `You are an AI assistant specializing in business development and startup guidance, 
    specifically focused on ${moduleType.replace('-', ' ')}.
    
    Your role is to:
    1. Provide actionable advice and suggestions
    2. Ask clarifying questions when needed
    3. Share relevant industry insights and best practices
    4. Help refine and improve business ideas
    5. Maintain a professional yet approachable tone
    
    Base your responses on current business trends and proven methodologies while keeping them practical and implementable.`
  }

  /**
   * Get system prompt for document generation
   */
  getDocumentSystemPrompt(moduleType: ModuleType): string {
    return `You are a professional business document generator specializing in ${moduleType.replace('-', ' ')}.
    Your task is to create well-structured, professional documents based on the provided content and context.
    
    Follow these guidelines:
    1. Maintain consistent formatting and style
    2. Use clear section headings and organization
    3. Include relevant data and metrics
    4. Ensure executive-level quality
    5. Focus on clarity and professionalism
    
    The generated document should be suitable for business stakeholders, investors, and decision-makers.`
  }
} 