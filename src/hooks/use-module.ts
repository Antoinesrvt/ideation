import { useCallback, useState, useEffect, useMemo } from 'react'
import { useProject } from '@/context/project-context'
import { ModuleType, MODULE_CONFIG } from '@/config/modules'
import { Module, ModuleResponse } from '@/types/module'
import { useToast } from '@/hooks/use-toast'
import { useAI } from '@/context/ai-context'
import { ModuleResponseRow } from '@/lib/services/project-service'

interface UseModuleOptions {
  onComplete?: () => void
  onError?: (error: Error) => void
}

export function useModule(moduleType: ModuleType, options: UseModuleOptions = {}) {
  const { modules, updateModule, saveModuleResponse } = useProject()
  const { getQuickActionsForModule, generateSuggestion } = useAI()
  const { toast } = useToast()
  
  // Loading states
  const [isInitializing, setIsInitializing] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false)
  
  // Local state management - only for current view
  const [localResponses, setLocalResponses] = useState<Record<string, ModuleResponse>>({})
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, boolean>>({})
  const [currentStepId, setCurrentStepId] = useState<string>(() => {
    const firstStepId = MODULE_CONFIG[moduleType].steps[0]?.id
    if (!firstStepId) throw new Error('Module must have at least one step')
    return firstStepId
  })

  // Memoize module and config
  const module = useMemo(() => modules.find(m => m.type === moduleType), [modules, moduleType])
  const config = useMemo(() => MODULE_CONFIG[moduleType], [moduleType])

  // Initialize local state from module data
  useEffect(() => {
    if (module) {
      // Convert module responses to local format
      const responses = module.responses?.reduce<Record<string, ModuleResponse>>((acc, response) => {
        acc[response.step_id] = {
          content: response.content,
          lastUpdated: response.last_updated
        }
        return acc
      }, {}) || {}

      setLocalResponses(responses)
      setUnsavedChanges({})
      if (module.current_step_id) {
        setCurrentStepId(module.current_step_id)
      }
      setIsInitializing(false)
    }
  }, [module])

  // Helper functions for completion status
  const isStepCompleted = useCallback((stepId: string) => 
    module?.completed_step_ids?.includes(stepId) || false
  , [module?.completed_step_ids])

  const isModuleCompleted = useCallback(() => 
    config.steps.every(step => isStepCompleted(step.id))
  , [config.steps, isStepCompleted])

  // Save response - only updates local state
  const saveResponse = useCallback((stepId: string, content: string) => {
    const response: ModuleResponse = {
      content,
      lastUpdated: new Date().toISOString()
    }

    setLocalResponses(prev => ({
      ...prev,
      [stepId]: response
    }))
    setUnsavedChanges(prev => ({
      ...prev,
      [stepId]: true
    }))
  }, [])

  // Sync with backend - called when changing steps or completing module
  const syncStepWithBackend = useCallback(async (stepId: string) => {
    if (!module?.id || !unsavedChanges[stepId]) return

    const response = localResponses[stepId]
    if (!response) return

    try {
      await saveModuleResponse(module.id, stepId, response)
      setUnsavedChanges(prev => ({
        ...prev,
        [stepId]: false
      }))
    } catch (err) {
      console.error('Error saving response:', err)
      toast({
        title: "Error",
        description: "Failed to save your response. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }, [module?.id, localResponses, unsavedChanges, saveModuleResponse, toast])

  // Handle step completion
  const markStepAsCompleted = useCallback(async (stepId: string) => {
    if (!module?.id) return false

    setIsSyncing(true)

    try {
      // First, sync current step if there are unsaved changes
      if (unsavedChanges[stepId]) {
        await syncStepWithBackend(stepId)
      }

      // Update completed steps in backend
      const newCompletedStepIds = Array.from(new Set([...(module.completed_step_ids || []), stepId]))
      await updateModule(module.id, {
        completed_step_ids: newCompletedStepIds
      })

      // Return whether all steps are now completed
      return config.steps.every(step => newCompletedStepIds.includes(step.id))
    } catch (err) {
      console.error('Error completing step:', err)
      toast({
        title: "Error",
        description: "Failed to complete step. Please try again.",
        variant: "destructive"
      })
      throw err
    } finally {
      setIsSyncing(false)
    }
  }, [module?.id, module?.completed_step_ids, config.steps, unsavedChanges, syncStepWithBackend, updateModule, toast])

  // Handle navigation between steps
  const navigateToStep = useCallback(async (stepId: string) => {
    if (!module?.id || stepId === currentStepId) return

    setIsSyncing(true)

    try {
      // First, sync current step if there are unsaved changes
      if (unsavedChanges[currentStepId]) {
        await syncStepWithBackend(currentStepId)
      }

      // Update current step in backend
      await updateModule(module.id, {
        current_step_id: stepId
      })
      
      // Update local navigation state
      setCurrentStepId(stepId)
    } catch (err) {
      console.error('Error changing step:', err)
      toast({
        title: "Error",
        description: "Failed to change step. Please try again.",
        variant: "destructive"
      })
      throw err
    } finally {
      setIsSyncing(false)
    }
  }, [module?.id, currentStepId, unsavedChanges, syncStepWithBackend, updateModule, toast])

  // Handle module completion
  const completeModule = useCallback(async () => {
    if (!module?.id) return false

    try {
      // Verify all steps are completed
      if (!isModuleCompleted()) {
        toast({
          title: "Incomplete Steps",
          description: "Please complete all steps before finishing the module.",
          variant: "destructive"
        })
        return false
      }

      // Mark module as completed
      await updateModule(module.id, {
        completed: true
      })

      // Trigger completion callback
      if (options.onComplete) {
        options.onComplete()
      }

      return true
    } catch (err) {
      console.error('Error completing module:', err)
      toast({
        title: "Error",
        description: "Failed to complete module. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }, [module?.id, isModuleCompleted, updateModule, options, toast])

  // AI suggestion generation
  const generateAISuggestion = useCallback(async (stepId: string, context: string) => {
    if (!module?.id || isGeneratingSuggestion) return

    try {
      setIsGeneratingSuggestion(true)
      const suggestion = await generateSuggestion(context)

      if (suggestion) {
        saveResponse(stepId, suggestion)
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion",
        variant: "destructive"
      })
      throw err
    } finally {
      setIsGeneratingSuggestion(false)
    }
  }, [module?.id, isGeneratingSuggestion, generateSuggestion, saveResponse, toast])

  return {
    module,
    config,
    responses: localResponses,
    currentStep: currentStepId,
    isStepCompleted,
    isModuleCompleted: isModuleCompleted(),
    isLoading: isSyncing,
    isInitializing,
    isGeneratingSuggestion,
    saveResponse,
    markStepAsCompleted,
    navigateToStep,
    completeModule,
    generateAISuggestion,
    quickActionGroups: getQuickActionsForModule(moduleType) ? [getQuickActionsForModule(moduleType)] : []
  }
} 