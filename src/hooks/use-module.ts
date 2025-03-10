import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/context/supabase-context'
import { ModuleService } from '@/lib/services/core/module-service'
import { DbModule, ModuleStatus, ModuleUpdateData } from '@/types/module'
import { useToast } from '@/hooks/use-toast'
import { getModuleConfig, ModuleType } from '@/config/modules'

interface UseModuleOptions {
  moduleType: ModuleType
  projectId: string
  onError?: (error: Error) => void
  onComplete?: () => void
}

export function useModule(options: UseModuleOptions) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const moduleService = new ModuleService(supabase)

  // Fetch module data using type
  const { data: moduleResponse, isLoading, error } = useQuery({
    queryKey: ['module', options.projectId, options.moduleType],
    queryFn: async () => {
      const result = await moduleService.getModuleByType(options.projectId, options.moduleType)
      // It's ok if no module exists yet
      if (!result) {
        return null
      }
      return result
    },
    enabled: !!options.projectId && !!options.moduleType
  })

  const module = moduleResponse

  // Get module configuration
  const config = getModuleConfig(options.moduleType)

  // Module status helpers
  const isModuleCompleted = useCallback(() => 
    module?.status === 'completed', [module?.status])

  const isModuleDraft = useCallback(() => 
    module?.status === 'draft', [module?.status])

  const isModuleInProgress = useCallback(() => 
    module?.status === 'in_progress', [module?.status])

  // Step navigation helpers
  const getCurrentStep = useCallback(() => 
    module?.current_step_id || null, [module?.current_step_id])

  const getStepIndex = useCallback((stepId: string) => {
    if (!config?.steps) return -1
    return config.steps.findIndex(step => step.id === stepId)
  }, [config?.steps])

  const getTotalSteps = useCallback(() => 
    config?.steps?.length || 0, [config?.steps])

  const getCurrentStepIndex = useCallback(() => {
    const currentStepId = getCurrentStep()
    return currentStepId ? getStepIndex(currentStepId) : -1
  }, [getCurrentStep, getStepIndex])

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: async (data: ModuleUpdateData) => 
      module?.id ? moduleService.updateModule(module.id, data) : null,
    onSuccess: (newModule) => {
      if (newModule) {
        queryClient.setQueryData(
          ['module', options.projectId, options.moduleType], 
          newModule
        )
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
      options.onError?.(error instanceof Error ? error : new Error('Failed to update module'))
    }
  })

  // Update module status
  const updateStatus = useCallback(async (status: ModuleStatus) => {
    if (!module?.id) return
    await updateModuleMutation.mutateAsync({ status })
  }, [module?.id, updateModuleMutation])

  // Mark module as completed
  const completeModule = useCallback(async () => {
    if (!module) return false

    try {
      await updateStatus('completed')
      options.onComplete?.()
      return true
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Failed to complete module'))
      return false
    }
  }, [module, updateStatus, options])

  return {
    module,
    config,
    isLoading,
    error,
    // Status helpers
    isCompleted: isModuleCompleted(),
    isDraft: isModuleDraft(),
    isInProgress: isModuleInProgress(),
    // Step helpers
    currentStepId: getCurrentStep(),
    currentStepIndex: getCurrentStepIndex(),
    totalSteps: getTotalSteps(),
    getStepIndex,
    // Actions
    updateModule: updateModuleMutation.mutate,
    updateModuleAsync: updateModuleMutation.mutateAsync,
    updateStatus,
    completeModule,
    // Loading states
    isUpdating: updateModuleMutation.isPending
  }
} 