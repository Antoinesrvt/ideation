import { useCallback, useMemo } from 'react'
import { ModuleType } from '@/types/project'
import { getModuleConfig } from '@/config/modules'
import { useModuleState } from './use-module-state'
import { useAI } from '@/context/ai-context'
import { useToast } from './use-toast'

interface UseModuleOptions {
  onComplete?: () => void
  onError?: (error: Error) => void
}

export function useModule(moduleId: string | null, options: UseModuleOptions = {}) {
  const { toast } = useToast()
  const { generateSuggestion, enhanceContent, isGenerating: isGeneratingSuggestion, isEnhancing } = useAI()

  // Use our new module state management
  const {
    module,
    config,
    responses,
    isLoading,
    error,
    currentStepId,
    isStepCompleted,
    isModuleCompleted,
    markStepAsCompleted,
    navigateToStep,
    completeModule,
    getStepResponse,
    saveResponse
  } = useModuleState(moduleId, {
    onComplete: options.onComplete,
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      options.onError?.(error)
    }
  })

  // Get current step configuration
  const currentStep = useMemo(() => {
    if (!config?.steps || !currentStepId) return null
    return config.steps.find(step => step.id === currentStepId) || null
  }, [config?.steps, currentStepId])

  // Generate AI suggestion for current step
  const generateAISuggestion = useCallback(async (prompt: string) => {
    if (!module?.id || !currentStepId) return null

    try {
      const suggestion = await generateSuggestion({
        moduleId: module.id,
        stepId: currentStepId,
        prompt
      })

      if (suggestion) {
        await saveResponse(currentStepId, suggestion)
      }

      return suggestion
    } catch (error) {
      console.error('Error generating suggestion:', error)
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion. Please try again.",
        variant: "destructive"
      })
      return null
    }
  }, [module?.id, currentStepId, generateSuggestion, saveResponse, toast])

  // Enhance content with AI
  const enhanceStepContent = useCallback(async (content: string, instructions: string) => {
    if (!module?.id || !currentStepId) return null

    try {
      const enhanced = await enhanceContent({
        moduleId: module.id,
        stepId: currentStepId,
        content,
        instructions
      })

      if (enhanced) {
        await saveResponse(currentStepId, enhanced)
      }

      return enhanced
    } catch (error) {
      console.error('Error enhancing content:', error)
      toast({
        title: "Error",
        description: "Failed to enhance content. Please try again.",
        variant: "destructive"
      })
      return null
    }
  }, [module?.id, currentStepId, enhanceContent, saveResponse, toast])

  return {
    module,
    config,
    responses,
    currentStep: currentStepId,
    isLoading,
    error,
    isStepCompleted,
    isModuleCompleted,
    markStepAsCompleted,
    navigateToStep,
    completeModule,
    saveResponse,
    generateAISuggestion,
    enhanceStepContent,
    isGeneratingSuggestion,
    isEnhancing
  }
} 