
import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { EnhancementService, EnhancementOptions, EnhancementResult } from '@/lib/services/ai/enhancement-service'
import { ModuleType } from '@/types/project'
import { DbModuleStep, DbStepResponse } from '@/types/module'

interface UseEnhancementOptions extends EnhancementOptions {
  onSuccess?: (result: EnhancementResult | string) => void
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

  // Generate suggestion mutation
  const { mutate: generateSuggestion, isPending: isGenerating } = useMutation({
    mutationFn: async ({ 
      steps,
      projectData,
      currentStepId,
      options: suggestionOptions 
    }: { 
      steps: (DbModuleStep & { responses: DbStepResponse[] })[]
      projectData: Record<string, any>
      currentStepId: string
      options?: EnhancementOptions
    }) => {
      if (!enhancementServiceRef.current) {
        throw new Error('Enhancement service not initialized')
      }
      return enhancementServiceRef.current.generateSuggestion(
        steps,
        projectData,
        currentStepId,
        { ...options, ...suggestionOptions }
      )
    },
    onSuccess: (result) => {
      options.onSuccess?.(result)
    },
    onError: (error: Error) => {
      toast({
        title: 'Generation Error',
        description: error.message,
        variant: 'destructive'
      })
      options.onError?.(error)
    }
  })

  // Enhancement mutation
  const { mutate: enhance, isPending: isEnhancing } = useMutation({
    mutationFn: async ({ 
      content, 
      steps,
      projectData,
      options: enhanceOptions 
    }: { 
      content: string
      steps: (DbModuleStep & { responses: DbStepResponse[] })[]
      projectData: Record<string, any>
      options?: EnhancementOptions
    }) => {
      if (!enhancementServiceRef.current) {
        throw new Error('Enhancement service not initialized')
      }
      return enhancementServiceRef.current.enhance(
        content,
        steps,
        projectData,
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
    generateSuggestion,
    enhance,
    isGenerating,
    isEnhancing
  }
} 