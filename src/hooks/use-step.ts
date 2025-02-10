import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/context/supabase-context'
import { StepService } from '@/lib/services/core/step-service'
import { DbModuleStep, DbStepResponse, StepStatus } from '@/types/module'
import { useToast } from '@/hooks/use-toast'
import { useAIEnhancement } from '@/lib/hooks/use-ai-enhancement'
import { ModuleType } from '@/types/project'
import { EnhancementResult } from '@/lib/services/ai/enhancement-service'

interface UseStepOptions {
  onComplete?: () => void
  onError?: (error: Error) => void
  moduleType: ModuleType
  projectId: string
}

export function useStep(stepId: string | null, options: UseStepOptions) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const stepService = new StepService(supabase)
  
  // Initialize AI enhancement hook
  const {
    generateSuggestion,
    enhance: enhanceContent,
    isGenerating: isGeneratingSuggestion,
    isEnhancing
  } = useAIEnhancement(options.projectId, options.moduleType, {
    onSuccess: (result) => {
      if ((result as EnhancementResult)?.enhancedContent) {
        saveResponse((result as EnhancementResult).enhancedContent)
      }
    }
  })

  // Fetch step data
  const { data: step, isLoading: isLoadingStep } = useQuery({
    queryKey: ['step', stepId],
    queryFn: () => stepId ? stepService.getStep(stepId) : null,
    enabled: !!stepId
  })

  // Fetch step responses
  const { data: responses, isLoading: isLoadingResponses } = useQuery({
    queryKey: ['step-responses', stepId],
    queryFn: () => stepId ? stepService.getStepResponses(stepId) : [],
    enabled: !!stepId
  })

  // Get latest response
  const latestResponse = responses?.find(r => r.is_latest)

  // Update step mutation
  const updateStepMutation = useMutation({
    mutationFn: async ({ status }: { status: StepStatus }) => {
      if (!stepId) return null
      return stepService.updateStepStatus(stepId, status)
    },
    onSuccess: (newStep) => {
      if (newStep) {
        queryClient.setQueryData(['step', stepId], newStep)
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      options.onError?.(error instanceof Error ? error : new Error('Failed to update step'))
    }
  })

  // Save response mutation
  const saveResponseMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!stepId) return null
      return stepService.saveStepResponse(stepId, content)
    },
    onSuccess: (newResponse) => {
      if (newResponse) {
        queryClient.setQueryData(['step-responses', stepId], 
          (old: DbStepResponse[] | undefined) => {
            const responses = old || []
            return [
              ...responses.map(r => ({ ...r, is_latest: false })),
              newResponse
            ]
          }
        )
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      options.onError?.(error instanceof Error ? error : new Error('Failed to save response'))
    }
  })

  // Helper functions
  const isCompleted = useCallback(() => 
    step?.status === 'completed', [step?.status])

  const markAsCompleted = useCallback(async () => {
    if (!stepId) return false

    try {
      await updateStepMutation.mutateAsync({ status: 'completed' })
      options.onComplete?.()
      return true
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Failed to complete step'))
      return false
    }
  }, [stepId, updateStepMutation, options])

  const saveResponse = useCallback(async (content: string) => {
    await saveResponseMutation.mutateAsync(content)
  }, [saveResponseMutation])

  // AI functions
  const generateAISuggestion = useCallback(async (prompt: string) => {
    if (!step?.module_id || !stepId || !responses) return null

    try {
      const suggestion = await generateSuggestion({
        steps: [{ ...step, responses }],
        projectData: {},
        currentStepId: stepId
      })

      if (typeof suggestion === 'string') {
        await saveResponse(suggestion)
        return suggestion
      }

      return null
    } catch (error) {
      console.error('Error generating suggestion:', error)
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion. Please try again.",
        variant: "destructive"
      })
      return null
    }
  }, [step, stepId, responses, generateSuggestion, saveResponse, toast])

  const enhanceStepContent = useCallback(async (content: string, instructions: string) => {
    if (!step?.module_id || !stepId || !responses) return null

    try {
      enhanceContent({
        content,
        steps: [{ ...step, responses }],
        projectData: {},
        options: { customInstructions: instructions }
      })

      // The result will be handled in the onSuccess callback
      return content
    } catch (error) {
      console.error('Error enhancing content:', error)
      toast({
        title: "Error",
        description: "Failed to enhance content. Please try again.",
        variant: "destructive"
      })
      return null
    }
  }, [step, stepId, responses, enhanceContent, toast])

  return {
    step,
    responses: responses || [],
    latestResponse,
    isLoading: isLoadingStep || isLoadingResponses,
    error: null,
    isCompleted: isCompleted(),
    markAsCompleted,
    saveResponse,
    generateAISuggestion,
    enhanceStepContent,
    isGeneratingSuggestion,
    isEnhancing,
    isSaving: saveResponseMutation.isPending
  }
} 