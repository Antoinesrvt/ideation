import { useState, useCallback } from 'react'
import { useAIService } from '@/context/services/ai-service-context'
import { ModuleType } from '@/types/project'
import { useToast } from '@/hooks/use-toast'

interface UseAIChatOptions {
  moduleType: ModuleType
  onSuccess?: (response: string) => void
  onError?: (error: Error) => void
}

export function useAIChat({ moduleType, onSuccess, onError }: UseAIChatOptions) {
  const { service, isConfigured, error: serviceError } = useAIService()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const generateResponse = useCallback(async (prompt: string) => {
    if (!service || !isConfigured) {
      const error = serviceError || new Error('AI service is not configured')
      setError(error)
      onError?.(error)
      return
    }

    try {
      setIsGenerating(true)
      setError(null)

      const systemPrompt = service.getChatSystemPrompt(moduleType)
      const response = await service.generateContent(prompt, systemPrompt)

      onSuccess?.(response)
      return response
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate response')
      console.error('Error generating AI response:', err)
      setError(error)
      onError?.(error)
      
      toast({
        title: "Error",
        description: "Failed to generate response. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }, [service, isConfigured, moduleType, serviceError, onSuccess, onError, toast])

  return {
    generateResponse,
    isGenerating,
    error,
    isConfigured
  }
} 