import { useCallback, useState, useEffect, useMemo } from 'react'
import { useProject } from '@/context/project-context'
import { ModuleType, MODULE_CONFIG } from '@/config/modules'
import { Module, ModuleMetadata, ModuleResponse } from '@/types/module'
import { useToast } from '@/hooks/use-toast'
import { useAI } from '@/context/ai-context'

interface UseModuleOptions {
  onComplete?: () => void
  onError?: (error: Error) => void
}

export function useModule(moduleType: ModuleType, options: UseModuleOptions = {}) {
  const { modules, updateModule } = useProject()
  const { getQuickActionsForModule, generateSuggestion } = useAI()
  const { toast } = useToast()
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  // Memoize module and config
  const module = useMemo(() => modules.find(m => m.type === moduleType), [modules, moduleType])
  const config = useMemo(() => MODULE_CONFIG[moduleType], [moduleType])

  // Get current metadata safely
  const metadata = useMemo((): ModuleMetadata | null => {
    if (!module?.metadata) return null
    return module.metadata as ModuleMetadata
  }, [module?.metadata])

  // Initialize module if needed
  useEffect(() => {
    if (module && metadata && !metadata.currentStepId && config.steps.length > 0) {
      // New module, initialize with first step
      updateModuleState({
        currentStepId: config.steps[0].id,
        completedStepIds: []
      }).catch(error => {
        console.error('Failed to initialize module:', error)
        options.onError?.(error instanceof Error ? error : new Error('Failed to initialize module'))
      })
    }
  }, [module, metadata, config.steps])

  // Memoize derived state
  const currentStep = useMemo(() => metadata?.currentStepId || (config.steps[0]?.id), [metadata?.currentStepId, config.steps])
  const progress = useMemo(() => {
    if (!metadata?.completedStepIds || !config.steps) return 0
    return (metadata.completedStepIds.length / config.steps.length) * 100
  }, [metadata?.completedStepIds, config.steps])

  // Memoize update functions
  const updateModuleState = useCallback(async (updates: {
    completed?: boolean
    responses?: Record<string, ModuleResponse>
    currentStepId?: string
    completedStepIds?: string[]
  }) => {
    if (!module?.id || !metadata) return

    try {
      const updatedMetadata: ModuleMetadata = {
        ...metadata,
        responses: {
          ...metadata.responses,
          ...(updates.responses || {})
        },
        currentStepId: updates.currentStepId ?? metadata.currentStepId,
        completedStepIds: updates.completedStepIds ?? metadata.completedStepIds,
        lastUpdated: new Date().toISOString()
      }

      await updateModule(module.id, {
        completed: updates.completed ?? module.completed,
        metadata: updatedMetadata
      })

      if (updates.completed && options.onComplete) {
        options.onComplete()
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update module')
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      if (options.onError) {
        options.onError(error)
      }
    }
  }, [module, metadata, updateModule, options, toast])

  const saveResponse = useCallback(async (stepId: string, content: string) => {
    await updateModuleState({
      responses: {
        [stepId]: {
          content,
          lastUpdated: new Date().toISOString()
        }
      }
    })
  }, [updateModuleState])

  const completeStep = useCallback(async (stepId: string) => {
    if (!metadata || !config.steps) return

    const completedStepIds = [...metadata.completedStepIds, stepId]
    const allCompleted = completedStepIds.length === config.steps.length
    const nextIncompleteStep = config.steps.find(step => !completedStepIds.includes(step.id))

    await updateModuleState({
      completed: allCompleted,
      completedStepIds,
      currentStepId: allCompleted ? undefined : nextIncompleteStep?.id
    })
  }, [metadata, config.steps, updateModuleState])

  const setCurrentStep = useCallback(async (stepId: string) => {
    await updateModuleState({
      currentStepId: stepId
    })
  }, [updateModuleState])

  const generateAISuggestion = useCallback(async (stepId: string, context: string) => {
    if (!metadata || isGeneratingSuggestion) return

    try {
      setIsGeneratingSuggestion(true)
      const suggestion = await generateSuggestion(context)

      if (suggestion) {
        await updateModuleState({
          responses: {
            [stepId]: {
              content: suggestion,
              lastUpdated: new Date().toISOString()
            }
          }
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingSuggestion(false)
    }
  }, [metadata, generateSuggestion, updateModuleState, toast, isGeneratingSuggestion])

  // Memoize return value
  return useMemo(() => ({
    module,
    config,
    updateModuleState,
    saveResponse,
    completeStep,
    setCurrentStep,
    generateAISuggestion,
    isGeneratingSuggestion,
    isInitializing,
    responses: metadata?.responses || {},
    currentStep,
    progress,
    completed: module?.completed || false,
    quickActions: getQuickActionsForModule(moduleType)?.actions || [],
    quickActionGroups: getQuickActionsForModule(moduleType) ? [getQuickActionsForModule(moduleType)] : []
  }), [
    module,
    config,
    updateModuleState,
    saveResponse,
    completeStep,
    setCurrentStep,
    generateAISuggestion,
    isGeneratingSuggestion,
    isInitializing,
    metadata?.responses,
    currentStep,
    progress,
    moduleType,
    getQuickActionsForModule
  ])
} 