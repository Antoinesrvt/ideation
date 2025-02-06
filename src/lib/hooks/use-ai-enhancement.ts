import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { EnhancementService, EnhancementOptions, EnhancementResult } from '@/lib/services/ai/enhancement-service'
import { ModuleType } from '@/types/project'
import { AIRequestContext } from '@/lib/services/ai/base-service'

interface UseEnhancementOptions extends EnhancementOptions {
  onSuccess?: (result: EnhancementResult) => void
  onError?: (error: Error) => void
}

export function useAIEnhancement(
  projectId: string,
  moduleType: ModuleType,
  options: UseEnhancementOptions = {}
) {
  const { toast } = useToast()
  const enhancementServiceRef = useRef<EnhancementService>()

  // Initialize enhancement service if not exists
  if (!enhancementServiceRef.current) {
    enhancementServiceRef.current = new EnhancementService(projectId, moduleType, options)
  }

  // Enhancement mutation
  const { mutate: enhance, isPending } = useMutation({
    mutationFn: async ({ 
      content, 
      context,
      options: enhanceOptions 
    }: { 
      content: string
      context: AIRequestContext
      options?: EnhancementOptions
    }) => {
      if (!enhancementServiceRef.current) {
        throw new Error('Enhancement service not initialized')
      }
      return enhancementServiceRef.current.enhance(
        content,
        context,
        { ...options, ...enhanceOptions }
      )
    },
    onSuccess: (result) => {
      options.onSuccess?.(result)
    },
    onError: (error: Error) => {
      toast({
        title: 'Enhancement Error',
        description: error.message,
        variant: 'destructive'
      })
      options.onError?.(error)
    }
  })

  return {
    enhance,
    isLoading: isPending
  }
} 