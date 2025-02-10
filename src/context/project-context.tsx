'use client'

import { createContext, useContext, useReducer, useCallback, ReactNode, useMemo } from 'react'
import { ProjectService } from '@/lib/services/core/project-service'
import { useSupabase } from './supabase-context'
import { ProjectRow, ProjectUpdateData, ProjectWithModules } from '@/types/project'

// State types
interface ProjectState {
  currentProject: ProjectWithModules | null
  projects: ProjectRow[]
  isLoading: boolean
  error: Error | null
}

// Action types
type ProjectAction =
  | { type: 'SET_PROJECT'; payload: ProjectWithModules }
  | { type: 'SET_PROJECTS'; payload: ProjectRow[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'CLEAR_STATE' }

// Initial state
const initialState: ProjectState = {
  currentProject: null,
  projects: [],
  isLoading: false,
  error: null
}

// Context
const ProjectContext = createContext<{
  state: ProjectState
  loadProject: (projectId: string) => Promise<void>
  loadProjects: () => Promise<void>
  updateProject: (data: ProjectUpdateData) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  clearState: () => void
} | null>(null)

// Reducer
function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT':
      return {
        ...state,
        currentProject: action.payload,
        error: null
      }
    case 'SET_PROJECTS':
      return {
        ...state,
        projects: action.payload,
        error: null
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }
    case 'CLEAR_STATE':
      return initialState
    default:
      return state
  }
}

// Provider
export function ProjectProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState)
  const { supabase } = useSupabase()
  
  // Memoize the projectService instance
  const projectService = useMemo(() => new ProjectService(supabase), [supabase])

  const loadProject = useCallback(async (projectId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const project = await projectService.getProjectWithModules(projectId)
      dispatch({ type: 'SET_PROJECT', payload: project })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error('Failed to load project') })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [projectService])

  const loadProjects = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const projects = await projectService.getProjects()
      dispatch({ type: 'SET_PROJECTS', payload: projects })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error('Failed to load projects') })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [projectService])

  const updateProject = useCallback(async (data: ProjectUpdateData) => {
    try {
      if (!state.currentProject?.id) throw new Error('No project loaded')
      
      dispatch({ type: 'SET_LOADING', payload: true })
      const updatedProject = await projectService.updateProject(state.currentProject.id, data)
      
      // Reload project to get updated modules
      const project = await projectService.getProjectWithModules(updatedProject.id)
      dispatch({ type: 'SET_PROJECT', payload: project })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error('Failed to update project') })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.currentProject?.id, projectService])

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      await projectService.deleteProject(projectId)
      
      // If the deleted project was the current project, clear it
      if (state.currentProject?.id === projectId) {
        dispatch({ type: 'CLEAR_STATE' })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error('Failed to delete project') })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [projectService, state.currentProject?.id])

  const clearState = useCallback(() => {
    dispatch({ type: 'CLEAR_STATE' })
  }, [])

  return (
    <ProjectContext.Provider
      value={{
        state,
        loadProject,
        loadProjects,
        updateProject,
        deleteProject,
        clearState
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

// Hook
export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}