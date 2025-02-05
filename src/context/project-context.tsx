'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Module, ModuleMetadata, ModuleUpdateData } from '@/types/module'
import type { Json } from '@/types/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { ProjectRow, ProjectService } from '@/lib/services/project-service'
import { useSupabase } from './supabase-context'
import { ModuleType } from '@/config/modules'


interface ProjectData {
  project: ProjectRow
  modules: Module[]
}

interface ProjectState {
  project: ProjectRow | null
  modules: Module[]
  loading: boolean
  error: Error | null
}

interface ProjectContextType extends ProjectState {
  refreshProject: () => Promise<void>
  updateProject: (updates: Partial<ProjectRow>) => Promise<void>
  updateModule: (moduleId: string, updates: ModuleUpdateData) => Promise<void>
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

  // Memoize fetch project function
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

      const rawData = await projectService.getProject(projectId)
      const projectData: ProjectData = {
        project: {
          ...rawData,
          metadata: rawData.metadata || {}
        },
        modules: rawData.modules.map(module => ({
          ...module,
          metadata: module.metadata as unknown as ModuleMetadata
        }))
      }
      
      setState(prev => ({
        ...prev,
        project: projectData.project,
        modules: projectData.modules
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

      toast({
        title: 'Error Loading Project',
        description: 'There was an error loading your project.',
        variant: 'destructive'
      })
      
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error('An unexpected error occurred')
      }))
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [projectId, user, router, projectService, toast])

  // Memoize project operations
  const refreshProject = useCallback(async () => {
    await fetchProject()
  }, [fetchProject])

  const updateProject = useCallback(async (updates: Partial<ProjectRow>) => {
    if (!state.project?.id) return

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      await projectService.updateProject(state.project.id, updates)
      await refreshProject()
    } catch (err) {
      console.error('Error updating project:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error('Failed to update project')
      }))
      throw err
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [state.project?.id, projectService, refreshProject])

  const updateModule = useCallback(async (moduleId: string, updates: ModuleUpdateData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const moduleData = {
        ...updates,
        metadata: updates.metadata ? JSON.parse(JSON.stringify(updates.metadata)) : undefined
      }
      await projectService.updateModule(moduleId, moduleData)
      await refreshProject()
    } catch (err) {
      console.error('Error updating module:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error('Failed to update module')
      }))
      throw err
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [projectService, refreshProject])

  const createModule = useCallback(async (data: Omit<Module, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const moduleData = {
        ...data,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined
      }
      await projectService.createModule(moduleData)
      await refreshProject()
    } catch (err) {
      console.error('Error creating module:', err)
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err : new Error('Failed to create module')
      }))
      throw err
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }, [projectService, refreshProject])

  const ensureModule = useCallback(async (moduleType: ModuleType): Promise<Module> => {
    if (!state.project?.id) throw new Error('No project selected')

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // First check if module already exists in state
      const existingModule = state.modules.find(m => m.type === moduleType)
      if (existingModule) {
        return existingModule
      }

      // Create or get module from database
      const rawModule = await projectService.ensureModuleExists(state.project.id, moduleType)
      const module: Module = {
        ...rawModule,
        metadata: rawModule.metadata as unknown as ModuleMetadata
      }

      // Update local state immediately
      setState(prev => ({
        ...prev,
        modules: [...prev.modules, module]
      }))

      // Refresh project in background
      refreshProject().catch(console.error)

      return module
    } catch (err) {
      console.error('Error ensuring module exists:', err)
      const error = err instanceof Error ? err : new Error('Failed to ensure module exists')
      setState(prev => ({
        ...prev,
        error,
        loading: false
      }))
      throw error
    }
  }, [state.project?.id, state.modules, projectService, refreshProject])

  useEffect(() => {
    if (!authLoading) {
      fetchProject()
    }
  }, [fetchProject, authLoading])

  // Memoize context value
  const value = useMemo(() => ({
    ...state,
    refreshProject,
    updateProject,
    updateModule,
    createModule,
    ensureModule
  }), [state, refreshProject, updateProject, updateModule, createModule, ensureModule])

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