import { useCallback, useMemo } from 'react'
import { useModule } from '@/context/module-context'
import { ModuleType } from '@/types/project'
import { getModuleConfig } from '@/config/modules'
import { DbModuleResponse } from '@/types/module'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/context/supabase-context'
import { ModuleService } from '@/lib/services/core/module-service'

interface UseModuleStateOptions {
  onError?: (error: Error) => void
  onComplete?: () => void
}

export function useModuleState(moduleId: string | null, options: UseModuleStateOptions = {}) {
  const queryClient = useQueryClient()
  const { supabase } = useSupabase()
  const moduleService = new ModuleService(supabase)

  // Fetch module data
  const { data: module, isLoading, error } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => moduleId ? moduleService.getModule(moduleId) : null,
    enabled: !!moduleId
  })

  // Get module configuration
  const config = useMemo(() => {
    if (!module?.type) return null
    try {
      return getModuleConfig(module.type as ModuleType)
    } catch {
      return null
    }
  }, [module?.type])

  // Convert responses array to record
  const responses = useMemo(() => {
    return module?.responses?.reduce((acc: Record<string, DbModuleResponse>, response) => ({
      ...acc,
      [response.step_id]: response
    }), {}) || {}
  }, [module?.responses])

  // Step completion status
  const isStepCompleted = useCallback((stepId: string) => {
    return module?.completed_step_ids?.includes(stepId) || false
  }, [module?.completed_step_ids])

  // Module completion status
  const isModuleCompleted = useMemo(() => {
    if (!config?.steps || !module?.completed_step_ids) return false
    return config.steps.every(step => module.completed_step_ids.includes(step.id))
  }, [config?.steps, module?.completed_step_ids])

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: async (data: { moduleId: string, data: any }) => 
      moduleService.updateModule(data.moduleId, data.data),
    onSuccess: (newModule) => {
      queryClient.setQueryData(['module', moduleId], newModule)
    },
    onError: (error) => {
      options.onError?.(error instanceof Error ? error : new Error('Failed to update module'))
    }
  })

  // Save response mutation
  const saveResponseMutation = useMutation({
    mutationFn: async (data: { stepId: string, content: string }) => 
      moduleId ? moduleService.saveModuleResponse(moduleId, data.stepId, data.content) : null,
    onSuccess: (newResponse) => {
      if (newResponse) {
        queryClient.setQueryData(['module', moduleId], (old: any) => ({
          ...old,
          responses: [...(old?.responses || []).filter((r: any) => r.step_id !== newResponse.step_id), newResponse]
        }))
      }
    },
    onError: (error) => {
      options.onError?.(error instanceof Error ? error : new Error('Failed to save response'))
    }
  })

  // Mark step as completed
  const markStepAsCompleted = useCallback(async (stepId: string) => {
    if (!module || !moduleId) return false

    const completedStepIds = new Set(module.completed_step_ids || [])
    if (completedStepIds.has(stepId)) return true

    completedStepIds.add(stepId)
    await updateModuleMutation.mutateAsync({
      moduleId,
      data: {
        completed_step_ids: Array.from(completedStepIds),
        current_step_id: stepId
      }
    })

    return true
  }, [module, moduleId, updateModuleMutation])

  // Navigate to step
  const navigateToStep = useCallback(async (stepId: string) => {
    if (!module || !moduleId) return
    await updateModuleMutation.mutateAsync({
      moduleId,
      data: { current_step_id: stepId }
    })
  }, [module, moduleId, updateModuleMutation])

  // Complete module
  const completeModule = useCallback(async () => {
    if (!module || !moduleId || !config?.steps) return false

    try {
      // Ensure all steps are completed
      const allStepsCompleted = config.steps.every(step => isStepCompleted(step.id))
      if (!allStepsCompleted) return false

      // Mark module as completed
      await updateModuleMutation.mutateAsync({
        moduleId,
        data: {
          completed: true,
          completed_step_ids: config.steps.map(step => step.id)
        }
      })

      options.onComplete?.()
      return true
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Failed to complete module'))
      return false
    }
  }, [module, moduleId, config?.steps, isStepCompleted, updateModuleMutation, options])

  // Get response for a step
  const getStepResponse = useCallback((stepId: string): DbModuleResponse | undefined => {
    return responses[stepId]
  }, [responses])

  // Save response
  const saveResponse = useCallback(async (stepId: string, content: string) => {
    await saveResponseMutation.mutateAsync({ stepId, content })
  }, [saveResponseMutation])

  return {
    module,
    config,
    responses,
    isLoading,
    error,
    currentStepId: module?.current_step_id || null,
    isStepCompleted,
    isModuleCompleted,
    markStepAsCompleted,
    navigateToStep,
    completeModule,
    getStepResponse,
    saveResponse
  }
} 