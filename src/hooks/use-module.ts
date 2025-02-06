import { useCallback, useState, useEffect, useMemo } from 'react'
import { useProject } from '@/context/project-context'
import { ModuleType, MODULE_CONFIG } from '@/config/modules'
import { Module, DbModuleResponse } from '@/types/module'
import { useToast } from '@/hooks/use-toast'
import { useAIService } from '@/context/services/ai-service-context'
import { ModuleResponseRow } from '@/lib/services/core/project-service'
import { Database } from '@/types/database'
import { useSupabase } from '@/context/supabase-context'
import { ProjectService } from '@/lib/services/core/project-service'

type AIInteraction = Database['public']['Tables']['ai_interactions']['Row']

interface UseModuleOptions {
  onComplete?: () => void
  onError?: (error: Error) => void
}

export function useModule(moduleType: ModuleType, options: UseModuleOptions = {}) {
  const { supabase } = useSupabase()
  const { project, modules, updateModule } = useProject()
  const { service: aiService, isConfigured: isAIConfigured } = useAIService()
  const { toast } = useToast()
  
  // Loading states
  const [isInitializing, setIsInitializing] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false)
  const [initializationError, setInitializationError] = useState<Error | null>(null)
  const [lastAIInteraction, setLastAIInteraction] = useState<AIInteraction>()
  
  // Local state management - only for current view
  const [responses, setResponses] = useState<Record<string, DbModuleResponse>>({})
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, boolean>>({})
  const [currentModule, setCurrentModule] = useState<Module | null>(null)
  const [currentStepId, setCurrentStepId] = useState<string>(() => {
    // Initialize with first step but this will be updated during initialization
    return MODULE_CONFIG[moduleType].steps[0]?.id || ''
  })

  // Memoize module and config
  const module = useMemo(() => modules.find(m => m.type === moduleType), [modules, moduleType])
  const config = useMemo(() => MODULE_CONFIG[moduleType], [moduleType])
  const projectService = useMemo(() => new ProjectService(supabase), [supabase])

  // Initialize module
  useEffect(() => {
    let mounted = true

    async function initializeModule() {
      if (!project?.id || !mounted) return
      
      try {
        console.log('🚀 Starting module initialization...')
        setIsInitializing(true)
        setInitializationError(null)

        const projectService = new ProjectService(supabase)
        
        // Only initialize if module doesn't exist
        if (!module) {
          const initializedModule = await projectService.ensureModuleExists(project.id, moduleType)
          console.log('✅ Module initialized:', initializedModule)
        }

        // Set default step if needed
        if (module && !module.current_step_id) {
          const firstStep = config.steps[0].id
          console.log('1️⃣ Using first step as default:', firstStep)
          
          await updateModule(module.id, {
            current_step_id: firstStep
          })
          console.log('✅ Current step set to:', firstStep)
        }
      } catch (error) {
        console.error('❌ Error initializing module:', error)
        setInitializationError(error instanceof Error ? error : new Error('Failed to initialize module'))
        options.onError?.(error instanceof Error ? error : new Error('Failed to initialize module'))
      } finally {
        if (mounted) {
          setIsInitializing(false)
          console.log('🏁 Module initialization complete')
        }
      }
    }

    initializeModule()

    return () => {
      mounted = false
    }
  }, [project?.id, moduleType, supabase])

  // Helper functions for completion status
  const isStepCompleted = useCallback((stepId: string) => 
    module?.completed_step_ids?.includes(stepId) || false
  , [module?.completed_step_ids])

  const isModuleCompleted = useCallback(() => 
    config.steps.every(step => isStepCompleted(step.id))
  , [config.steps, isStepCompleted])

  // Save response - only updates local state
  const saveResponse = useCallback((stepId: string, content: string) => {
    const response: DbModuleResponse = {
      id: '', // Will be set by the backend
      step_id: stepId,
      content,
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString(),
      module_id: module?.id || ''
    }

    setResponses(prev => {
      const newResponses = {
        ...prev,
        [stepId]: response
      }
      console.log('📝 Updated local responses:', newResponses)
      return newResponses
    })
    setUnsavedChanges(prev => ({
      ...prev,
      [stepId]: true
    }))
  }, [])

  // Sync with backend - called when changing steps or completing module
  const syncStepWithBackend = useCallback(async (stepId: string) => {
    if (!module?.id || !unsavedChanges[stepId]) return

    const response = responses[stepId]
    if (!response) return

    try {
      await projectService.saveModuleResponse(module.id, stepId, response)
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
  }, [module?.id, responses, unsavedChanges, projectService, toast])

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
  }, [module?.id, isModuleCompleted, updateModule, toast])

  // AI suggestion generation
  const generateAISuggestion = useCallback(async (stepId: string, context: string) => {
    if (!module?.id || isGeneratingSuggestion || !aiService || !isAIConfigured) return

    try {
      setIsGeneratingSuggestion(true)
      const systemPrompt = aiService.getChatSystemPrompt(moduleType)
      const suggestion = await aiService.generateContent(context, systemPrompt)

      if (suggestion) {
        // Save AI interaction
        const { data: interaction, error } = await supabase
          .from('ai_interactions')
          .insert({
            project_id: module.project_id,
            module_id: module.id,
            step_id: stepId,
            type: 'content',
            prompt: context,
            response: suggestion
          })
          .select()
          .single()

        if (error) throw error
        if (interaction) {
          setLastAIInteraction(interaction)
        }
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
  }, [module?.id, module?.project_id, isGeneratingSuggestion, aiService, isAIConfigured, moduleType, supabase, toast])

  return {
    module,
    config,
    responses,
    currentStep: currentStepId,
    isStepCompleted,
    isModuleCompleted: isModuleCompleted(),
    isLoading: isSyncing,
    isInitializing,
    isGeneratingSuggestion,
    error: initializationError,
    saveResponse,
    markStepAsCompleted,
    navigateToStep,
    completeModule,
    generateAISuggestion,
    quickActionGroups: [],
    lastAIInteraction
  }
} 