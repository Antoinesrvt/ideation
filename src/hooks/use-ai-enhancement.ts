import { useState, useCallback } from 'react'
import { useAIService } from '@/context/services/ai-service-context'
import { ModuleType } from '@/types/project'
import { useToast } from '@/hooks/use-toast'

export type EnhancementStatus = 'idle' | 'enhancing' | 'completed' | 'failed'

export interface EnhancementOptions {
  includeMarketData?: boolean
  includeCompetitorData?: boolean
  tone?: 'professional' | 'technical' | 'conversational'
  focusAreas?: string[]
}

export interface EnhancementResult {
  enhancedContent: string
  metadata?: {
    improvements: string[]
    addedSections: string[]
    wordCount: number
    readabilityScore: number
  }
}

export function useAIEnhancement(moduleType: ModuleType) {
  const { service, isConfigured, error: serviceError } = useAIService()
  const { toast } = useToast()
  
  const [status, setStatus] = useState<EnhancementStatus>('idle')
  const [enhancedContent, setEnhancedContent] = useState<string>()
  const [error, setError] = useState<Error | null>(null)
  const [metadata, setMetadata] = useState<EnhancementResult['metadata']>()

  const enhance = useCallback(async (
    content: string,
    options: EnhancementOptions = {}
  ): Promise<EnhancementResult | undefined> => {
    if (!service || !isConfigured) {
      const error = serviceError || new Error('AI service is not configured')
      setError(error)
      setStatus('failed')
      return
    }

    try {
      setStatus('enhancing')
      setError(null)
      setEnhancedContent(undefined)
      setMetadata(undefined)

      const systemPrompt = service.getEnhancementSystemPrompt(moduleType)
      
      // Build enhancement prompt
      const enhancementPrompt = `
        Please enhance the following content while maintaining its original intent:
        ${options.focusAreas ? `Focus areas: ${options.focusAreas.join(', ')}` : ''}
        ${options.includeMarketData ? 'Include relevant market data and trends.' : ''}
        ${options.includeCompetitorData ? 'Include competitor analysis where relevant.' : ''}
        Tone: ${options.tone || 'professional'}

        Original content:
        ${content}
      `.trim()

      const enhanced = await service.generateContent(enhancementPrompt, systemPrompt)

      // Extract metadata if available (assuming it's in a specific format)
      const metadataStart = enhanced.lastIndexOf('METADATA:')
      let metadata: EnhancementResult['metadata'] | undefined
      let cleanContent = enhanced

      if (metadataStart !== -1) {
        try {
          const metadataStr = enhanced.slice(metadataStart + 'METADATA:'.length)
          metadata = JSON.parse(metadataStr)
          cleanContent = enhanced.slice(0, metadataStart).trim()
        } catch (e) {
          console.warn('Failed to parse enhancement metadata:', e)
        }
      }

      setEnhancedContent(cleanContent)
      setMetadata(metadata)
      setStatus('completed')

      toast({
        title: "Success",
        description: "Content enhanced successfully",
      })

      return {
        enhancedContent: cleanContent,
        metadata
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to enhance content')
      console.error('Error enhancing content:', err)
      setError(error)
      setStatus('failed')
      
      toast({
        title: "Error",
        description: "Failed to enhance content. Please try again.",
        variant: "destructive"
      })
    }
  }, [service, isConfigured, moduleType, serviceError, toast])

  return {
    enhance,
    status,
    enhancedContent,
    error,
    metadata,
    isConfigured
  }
} 