import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/context/supabase-context'
import { ModuleService } from '@/lib/services/core/module-service'
import { DbModule, ModuleStatus, ModuleUpdateData } from '@/types/module'
import { useToast } from '@/hooks/use-toast'
import { getModuleConfig } from '@/config/modules'

interface UseModuleOptions {
  onError?: (error: Error) => void
  onComplete?: () => void
}

export function useModule(moduleId: string | null, options: UseModuleOptions = {}) {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const moduleService = new ModuleService(supabase)

  // Fetch module data
  const { data: module, isLoading, error } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => moduleId ? moduleService.getModule(moduleId) : null,
    enabled: !!moduleId
  })

  // Get module configuration
  const config = module?.type ? getModuleConfig(module.type) : null

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
      moduleId ? moduleService.updateModule(moduleId, data) : null,
    onSuccess: (newModule) => {
      if (newModule) {
        queryClient.setQueryData(['module', moduleId], newModule)
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
    if (!moduleId) return
    await updateModuleMutation.mutateAsync({ status })
  }, [moduleId, updateModuleMutation])

  // Mark module as completed
  const completeModule = useCallback(async () => {
    if (!module || !moduleId) return false

    try {
      await updateStatus('completed')
      options.onComplete?.()
      return true
    } catch (error) {
      options.onError?.(error instanceof Error ? error : new Error('Failed to complete module'))
      return false
    }
  }, [module, moduleId, updateStatus, options])

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