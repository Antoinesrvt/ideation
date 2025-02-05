'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import type { 
  ModuleType, 
  ProjectMetadataContent,
  ModuleMetadataContent,
  ProjectRow,
  ModuleRow,
  JsonCompatible
} from '@/types/project'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { ProjectService, ProjectWithModules, Tables } from '@/lib/services/project-service'
import { useSupabase } from './supabase-context'

interface ProjectContextType {
  project: ProjectWithModules | null
  loading: boolean
  error: Error | null
  refreshProject: () => Promise<void>
  updateProject: (updates: Partial<Omit<ProjectRow, 'metadata'>> & { metadata?: ProjectMetadataContent }) => Promise<void>
  updateModule: (moduleId: string, updates: Partial<Omit<ModuleRow, 'metadata'>> & { metadata?: ModuleMetadataContent }) => Promise<void>
  createModule: (data: Omit<ModuleRow, 'id' | 'created_at' | 'updated_at'> & { metadata?: ModuleMetadataContent }) => Promise<void>
  ensureModule: (moduleType: ModuleType) => Promise<ModuleRow>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<ProjectWithModules | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
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
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (!user) {
        console.warn('No authenticated user found, redirecting to login', {
          currentPath: window.location.pathname,
          projectId,
          timestamp: new Date().toISOString()
        })
        router.push('/signin')
        return
      }

      console.log('Fetching project:', {
        projectId,
        userId: user.id,
        timestamp: new Date().toISOString()
      })

      const projectData = await projectService.getProject(projectId)
      
      setProject(projectData)
    } catch (err) {
      console.error('Error in project context:', {
        error: err,
        type: err instanceof Error ? err.name : typeof err,
        projectId,
        path: window.location.pathname,
        timestamp: new Date().toISOString()
      })

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
        setProject(null)
        router.push('/dashboard/projects')
        toast({
          title: 'Project Not Found',
          description: 'The requested project could not be found. Redirecting to projects page.',
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'Error Loading Project',
        description: 'There was an error loading your project. Please try refreshing the page.',
        variant: 'destructive'
      })
      
      setError(err instanceof Error ? err : new Error('An unexpected error occurred'))
    } finally {
      setLoading(false)
    }
  }, [projectId, user, router, projectService, toast])

  // Memoize project operations
  const refreshProject = useCallback(async () => {
    await fetchProject()
  }, [fetchProject])

  const updateProject = useCallback(async (
    updates: Partial<Omit<ProjectRow, 'metadata'>> & { metadata?: ProjectMetadataContent }
  ) => {
    if (!project?.id) return

    try {
      setLoading(true)
      setError(null)

      const updateData = {
        ...updates,
        metadata: updates.metadata ? updates.metadata as JsonCompatible<ProjectMetadataContent> : undefined
      } as Tables['projects']['Update']

      await projectService.updateProject(project.id, updateData)
      await refreshProject()
    } catch (err) {
      console.error('Error updating project:', {
        error: err,
        projectId: project.id,
        updates,
        timestamp: new Date().toISOString()
      })
      setError(err instanceof Error ? err : new Error('Failed to update project'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [project?.id, projectService, refreshProject])

  const updateModule = useCallback(async (
    moduleId: string,
    updates: Partial<Omit<ModuleRow, 'metadata'>> & { metadata?: ModuleMetadataContent }
  ) => {
    try {
      setLoading(true)
      setError(null)

      const updateData = {
        ...updates,
        metadata: updates.metadata ? updates.metadata as JsonCompatible<ModuleMetadataContent> : undefined
      } as Tables['modules']['Update']

      await projectService.updateModule(moduleId, updateData)
      await refreshProject()
    } catch (err) {
      console.error('Error updating module:', {
        error: err,
        moduleId,
        updates,
        timestamp: new Date().toISOString()
      })
      setError(err instanceof Error ? err : new Error('Failed to update module'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [projectService, refreshProject])

  const createModule = useCallback(async (
    data: Omit<ModuleRow, 'id' | 'created_at' | 'updated_at'> & { metadata?: ModuleMetadataContent }
  ) => {
    try {
      setLoading(true)
      setError(null)

      const createData = {
        ...data,
        metadata: data.metadata ? data.metadata as JsonCompatible<ModuleMetadataContent> : undefined
      } as Tables['modules']['Insert']

      await projectService.createModule(createData)
      await refreshProject()
    } catch (err) {
      console.error('Error creating module:', {
        error: err,
        data,
        timestamp: new Date().toISOString()
      })
      setError(err instanceof Error ? err : new Error('Failed to create module'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [projectService, refreshProject])

  const ensureModule = useCallback(async (moduleType: ModuleType) => {
    if (!project?.id) throw new Error('No project selected')

    try {
      setLoading(true)
      setError(null)

      const module = await projectService.ensureModuleExists(project.id, moduleType)
      await refreshProject()
      return module
    } catch (err) {
      console.error('Error ensuring module exists:', {
        error: err,
        projectId: project.id,
        moduleType,
        timestamp: new Date().toISOString()
      })
      setError(err instanceof Error ? err : new Error('Failed to ensure module exists'))
      throw err
    } finally {
      setLoading(false)
    }
  }, [project?.id, projectService, refreshProject])

  useEffect(() => {
    if (!authLoading) {
      fetchProject()
    }
  }, [fetchProject, authLoading])

  // Memoize context value
  const value = useMemo(() => ({
    project,
    loading: loading || authLoading,
    error,
    refreshProject,
    updateProject,
    updateModule,
    createModule,
    ensureModule
  }), [
    project,
    loading,
    authLoading,
    error,
    refreshProject,
    updateProject,
    updateModule,
    createModule,
    ensureModule
  ])

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