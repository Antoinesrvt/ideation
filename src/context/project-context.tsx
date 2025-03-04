'use client'

import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

// Define proper types from database schema
type ProjectRow = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

// Simplified state types
interface ProjectState {
  currentProject: ProjectRow | null
  projects: ProjectRow[]
  isLoading: boolean
  error: Error | null
  unreadNotifications: number
}

// Action types
type ProjectAction =
  | { type: 'SET_CURRENT_PROJECT'; payload: ProjectRow | null }
  | { type: 'SET_PROJECTS'; payload: ProjectRow[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_NOTIFICATIONS'; payload: number }
  | { type: 'CLEAR_STATE' }

// Initial state
const initialState: ProjectState = {
  currentProject: null,
  projects: [],
  isLoading: false,
  error: null,
  unreadNotifications: 0
}

// Context
const ProjectContext = createContext<{
  state: ProjectState
  loadProject: (projectId: string) => Promise<void>
  loadProjects: () => Promise<void>
  updateProject: (projectId: string, data: Partial<ProjectUpdate>) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  loadUnreadNotifications: (projectId: string) => Promise<void>
  clearState: () => void
} | null>(null)

// Reducer
function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_CURRENT_PROJECT':
      return {
        ...state,
        currentProject: action.payload
      }
    case 'SET_PROJECTS':
      return {
        ...state,
        projects: action.payload
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
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        unreadNotifications: action.payload
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
  const queryClient = useQueryClient()
  
  // Load a project by ID using Supabase
  const loadProject = useCallback(async (projectId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      
      if (error) throw error
      
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: data })
    } catch (error) {
      console.error('Failed to load project:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error 
          ? error 
          : new Error('Failed to load project') 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Load all projects using Supabase
  const loadProjects = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })
      
      if (error) throw error
      
      dispatch({ type: 'SET_PROJECTS', payload: data || [] })
    } catch (error) {
      console.error('Failed to load projects:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error 
          ? error 
          : new Error('Failed to load projects') 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Update a project using Supabase
  const updateProject = useCallback(async (projectId: string, data: Partial<ProjectUpdate>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const supabase = createClient()
      const { data: updatedProject, error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', projectId)
        .select()
        .single()
      
      if (error) throw error
      
      // Update the project in state
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: updatedProject })
      
      // Update the project in the projects list
      dispatch({
        type: 'SET_PROJECTS',
        payload: state.projects.map(p => 
          p.id === projectId ? { ...p, ...updatedProject } : p
        )
      })
      
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    } catch (error) {
      console.error('Failed to update project:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error 
          ? error 
          : new Error('Failed to update project') 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.projects, queryClient])

  // Delete a project using Supabase
  const deleteProject = useCallback(async (projectId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const supabase = createClient()
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
      
      if (error) throw error
      
      // Remove the project from the projects list
      dispatch({
        type: 'SET_PROJECTS',
        payload: state.projects.filter(p => p.id !== projectId)
      })
      
      // Clear the current project if it was deleted
      if (state.currentProject?.id === projectId) {
        dispatch({ type: 'SET_CURRENT_PROJECT', payload: null })
      }
      
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    } catch (error) {
      console.error('Failed to delete project:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error 
          ? error 
          : new Error('Failed to delete project') 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.projects, state.currentProject, queryClient])

  // Get unread notification count for a project
  const loadUnreadNotifications = useCallback(async (projectId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const supabase = createClient()
      const { count, error } = await supabase
        .from('project_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('is_read', false)
      
      if (error) throw error
      
      dispatch({ type: 'SET_NOTIFICATIONS', payload: count || 0 })
    } catch (error) {
      console.error('Failed to load notifications count:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error 
          ? error 
          : new Error('Failed to load notification count') 
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Clear state
  const clearState = useCallback(() => {
    dispatch({ type: 'CLEAR_STATE' })
  }, [])

  const value = {
    state,
    loadProject,
    loadProjects,
    updateProject,
    deleteProject,
    loadUnreadNotifications,
    clearState
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

// Hook to use the context
export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}