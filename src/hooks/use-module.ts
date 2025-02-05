import { useCallback, useState, useEffect } from 'react'
import { useProject } from '@/context/project-context'
import { 
  ModuleType, 
  MODULE_CONFIG, 
  ModuleMetadataContent,
  StepResponse,
  BaseModuleStep,
  JsonCompatible,
  isModuleMetadata
} from '@/types/project'
import { useToast } from '@/hooks/use-toast'
import { useAI } from '@/context/ai-context'
import type { QuickAction, QuickActionGroup } from '@/types/ai'

interface UseModuleOptions {
  onComplete?: () => void
  onError?: (error: Error) => void
}

export function useModule(moduleType: ModuleType, options: UseModuleOptions = {}) {
  const { project, updateModule, createModule } = useProject()
  const { getQuickActionsForModule, generateSuggestion } = useAI()
  const { toast } = useToast()
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)

  const module = project?.modules.find(m => m.type === moduleType)
  const config = MODULE_CONFIG[moduleType]

  // Get current metadata safely
  const getCurrentMetadata = useCallback((): ModuleMetadataContent | null => {
    if (!module?.metadata || !isModuleMetadata(module.metadata)) return null
    return module.metadata
  }, [module])

  // Ensure module exists
  const ensureModuleExists = useCallback(async () => {
    if (!project || module) return true

    try {
      setIsInitializing(true)
      const moduleMetadata: ModuleMetadataContent = {
        description: config.description,
        currentStep: config.steps[0]?.step_id || null,
        progress: 0,
        summary: null,
        steps: config.steps.map(step => ({
          id: step.id,
          module_type: moduleType,
          step_id: step.step_id,
          title: step.title,
          description: step.description,
          placeholder: step.placeholder || null,
          order_index: step.order_index,
          expert_tips: step.expert_tips,
          completed: false,
          lastUpdated: new Date().toISOString()
        })),
        responses: {},
        lastUpdated: new Date().toISOString(),
        files: []
      }

      await createModule({
        project_id: project.id,
        type: moduleType,
        title: moduleType.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        completed: false,
        metadata: moduleMetadata as JsonCompatible<ModuleMetadataContent>
      })

      return true
    } catch (err) {
      console.error('Error creating module:', err)
      toast({
        title: "Error",
        description: "Failed to initialize module. Please try again.",
        variant: "destructive"
      })
      return false
    } finally {
      setIsInitializing(false)
    }
  }, [project, module, moduleType, config, createModule, toast])

  // Initialize module if it doesn't exist
  useEffect(() => {
    ensureModuleExists()
  }, [ensureModuleExists])

  const updateModuleState = useCallback(async (updates: {
    completed?: boolean
    responses?: Record<string, StepResponse>
    currentStep?: string
    progress?: number
    summary?: string
  }) => {
    const currentMetadata = getCurrentMetadata()
    if (!module?.metadata || !currentMetadata) return

    try {
      const currentSteps = currentMetadata.steps
      const updatedSteps = updates.currentStep
        ? currentSteps.map(step => ({
            ...step,
            completed: step.step_id === updates.currentStep ? true : step.completed,
            lastUpdated: step.step_id === updates.currentStep ? new Date().toISOString() : step.lastUpdated
          }))
        : currentSteps

      const progress = (updatedSteps.filter(step => step.completed).length / updatedSteps.length) * 100

      const updatedMetadata: ModuleMetadataContent = {
        description: currentMetadata.description,
        currentStep: updates.currentStep ?? currentMetadata.currentStep,
        progress: updates.progress ?? progress,
        summary: updates.summary ?? currentMetadata.summary,
        steps: updatedSteps,
        responses: {
          ...currentMetadata.responses,
          ...(updates.responses || {})
        },
        lastUpdated: new Date().toISOString(),
        files: currentMetadata.files
      }

      await updateModule(module.id, {
        completed: updates.completed ?? module.completed,
        metadata: updatedMetadata as JsonCompatible<ModuleMetadataContent>
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
  }, [module, getCurrentMetadata, updateModule, options, toast])

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
    const currentMetadata = getCurrentMetadata()
    if (!currentMetadata) return

    const updatedSteps = currentMetadata.steps.map(step => 
      step.step_id === stepId ? { ...step, completed: true, lastUpdated: new Date().toISOString() } : step
    )

    const allCompleted = updatedSteps.every(step => step.completed)
    const progress = (updatedSteps.filter(step => step.completed).length / updatedSteps.length) * 100

    await updateModuleState({
      completed: allCompleted,
      progress,
      currentStep: allCompleted ? undefined : updatedSteps.find(step => !step.completed)?.step_id
    })
  }, [getCurrentMetadata, updateModuleState])

  const setCurrentStep = useCallback(async (stepId: string) => {
    await updateModuleState({
      currentStep: stepId
    })
  }, [updateModuleState])

  const generateAISuggestion = useCallback(async (stepId: string, context: string) => {
    const currentMetadata = getCurrentMetadata()
    if (!currentMetadata || isGeneratingSuggestion) return

    try {
      setIsGeneratingSuggestion(true)
      const suggestion = await generateSuggestion(context)

      if (suggestion) {
        const currentResponse = currentMetadata.responses[stepId]
        await updateModuleState({
          responses: {
            [stepId]: {
              content: currentResponse?.content || '',
              lastUpdated: new Date().toISOString(),
              aiSuggestion: suggestion
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
  }, [getCurrentMetadata, generateSuggestion, updateModuleState, toast, isGeneratingSuggestion])

  const currentMetadata = getCurrentMetadata()

  return {
    module,
    config,
    updateModuleState,
    saveResponse,
    completeStep,
    setCurrentStep,
    generateAISuggestion,
    isGeneratingSuggestion,
    isInitializing,
    responses: currentMetadata?.responses || {},
    currentStep: currentMetadata?.currentStep,
    progress: currentMetadata?.progress || 0,
    completed: module?.completed || false,
    quickActions: getQuickActionsForModule(moduleType)?.actions || [],
    quickActionGroups: getQuickActionsForModule(moduleType) ? [getQuickActionsForModule(moduleType)] : []
  }
} 