'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Module, ModuleResponse, ModuleUpdateData } from '@/types/module'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { ProjectService, ProjectRow, ModuleResponseRow } from '@/lib/services/project-service'
import { useSupabase } from './supabase-context'
import { ModuleType } from '@/config/modules'
import { Json } from '@/types/supabase'

interface ProjectState {
  project: ProjectRow | null
  modules: Module[]
  loading: boolean
  error: Error | null
}

interface ProjectContextType extends ProjectState {
  refreshProject: () => Promise<void>
  updateProject: (updates: Partial<ProjectRow>) => Promise<void>
  updateModule: (moduleId: string, updates: ModuleUpdateData) => Promise<Module>
  saveModuleResponse: (moduleId: string, stepId: string, response: ModuleResponse) => Promise<ModuleResponseRow>
  createModule: (data: Omit<Module, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  ensureModule: (moduleType: ModuleType) => Promise<Module>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProjectState>({
    project: null,
    modules: [],
    loading: true,
    error: null
  })
  
  const searchParams = useSearchParams()
  const projectId = searchParams.get('project')
  const router = useRouter()
  const { toast } = useToast()
  const { supabase, user, loading: authLoading } = useSupabase()

  // Memoize project service instance
  const projectService = useMemo(() => new ProjectService(supabase), [supabase])

  // Fetch project with optimistic error handling
  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setState(prev => ({ ...prev, loading: false }))
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      if (!user) {
        router.push('/signin')
        return
      }

      const data = await projectService.getProject(projectId)
      setState(prev => ({
        ...prev,
        project: data,
        modules: data.modules
      }))
    } catch (err) {
      console.error('Error in project context:', err)

      if (err instanceof Error && (
        err.message.includes('Authentication error') || 
        err.message.includes('JWT expired') ||
        err.message.includes('Invalid JWT')
      )) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in again to continue.',
          variant: 'destructive'
        })
        router.push('/signin')
        return
      }

      if (err instanceof Error && err.message.includes('Project not found')) {
        setState(prev => ({ ...prev, project: null, modules: [] }))
        router.push('/dashboard/projects')
        toast({
          title: 'Project Not Found',
          description: 'The requested project could not be found.',
          variant: 'destructive'
        })
        return
      }

      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error('An unexpected error occurred')
      }))
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [projectId, user, router, projectService, toast])

  const refreshProject = useCallback(async () => {
    await fetchProject()
  }, [fetchProject])

  // Project update
  const updateProject = useCallback(async (updates: Partial<ProjectRow>) => {
    if (!state.project?.id) return

    try {
      const updated = await projectService.updateProject(state.project.id, updates)
      setState(prev => ({
        ...prev,
        project: updated
      }))
    } catch (err) {
      console.error('Error updating project:', err)
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }, [state.project?.id, projectService, toast])

  // Module update
  const updateModule = useCallback(async (moduleId: string, updates: ModuleUpdateData) => {
    try {
      const updated = await projectService.updateModule(moduleId, updates)
      setState(prev => ({
        ...prev,
        modules: prev.modules.map(m => m.id === moduleId ? updated : m)
      }))
      return updated
    } catch (err) {
      console.error('Error updating module:', err)
      toast({
        title: "Error",
        description: "Failed to update module. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }, [projectService, toast])

  // Module creation
  const createModule = useCallback(async (data: Omit<Module, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const created = await projectService.createModule(data)
      setState(prev => ({
        ...prev,
        modules: [...prev.modules, created]
      }))
    } catch (err) {
      console.error('Error creating module:', err)
      toast({
        title: "Error",
        description: "Failed to create module. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }, [projectService, toast])

  // Module response update
  const saveModuleResponse = useCallback(async (
    moduleId: string,
    stepId: string,
    response: ModuleResponse
  ): Promise<ModuleResponseRow> => {
    try {
      const savedResponse = await projectService.saveModuleResponse(moduleId, stepId, response)
      setState(prev => ({
        ...prev,
        modules: prev.modules.map(m => 
          m.id === moduleId ? {
            ...m,
            responses: [
              ...(m.responses || []).filter(r => r.step_id !== stepId),
              savedResponse
            ]
          } : m
        )
      }))
      return savedResponse
    } catch (err) {
      console.error('Error saving module response:', err)
      toast({
        title: "Error",
        description: "Failed to save response. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }, [projectService, toast])

  // Ensure module exists
  const ensureModule = useCallback(async (moduleType: ModuleType): Promise<Module> => {
    if (!state.project?.id) throw new Error('No project selected')

    const existingModule = state.modules.find(m => m.type === moduleType)
    if (existingModule) return existingModule

    try {
      const module = await projectService.ensureModuleExists(state.project.id, moduleType)
      setState(prev => ({
        ...prev,
        modules: [...prev.modules, module]
      }))
      return module
    } catch (err) {
      console.error('Error ensuring module exists:', err)
      toast({
        title: "Error",
        description: "Failed to create module. Please try again.",
        variant: "destructive"
      })
      throw err
    }
  }, [state.project?.id, state.modules, projectService, toast])

  useEffect(() => {
    if (!authLoading) {
      fetchProject()
    }
  }, [fetchProject, authLoading])

  const value = useMemo(() => ({
    ...state,
    refreshProject,
    updateProject,
    updateModule,
    createModule,
    ensureModule,
    saveModuleResponse
  }), [state, refreshProject, updateProject, updateModule, createModule, ensureModule, saveModuleResponse])

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}