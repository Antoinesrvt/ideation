'use client'

import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import { ModuleService } from '@/lib/services/core/module-service'
import { useSupabase } from './supabase-context'
import { DbModule, DbModuleResponse, ModuleUpdateData } from '@/types/module'
import { ModuleType } from '@/types/project'

// State types
interface ModuleState {
  currentModule: DbModule | null
  responses: Record<string, DbModuleResponse>
  isLoading: boolean
  error: Error | null
}

// Action types
type ModuleAction =
  | { type: 'SET_MODULE'; payload: DbModule }
  | { type: 'SET_RESPONSES'; payload: Record<string, DbModuleResponse> }
  | { type: 'UPDATE_RESPONSE'; payload: { stepId: string; response: DbModuleResponse } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'CLEAR_STATE' }

// Initial state
const initialState: ModuleState = {
  currentModule: null,
  responses: {},
  isLoading: false,
  error: null
}

// Context
const ModuleContext = createContext<{
  state: ModuleState
  loadModule: (moduleId: string) => Promise<void>
  updateModule: (data: ModuleUpdateData) => Promise<void>
  saveResponse: (stepId: string, content: string) => Promise<void>
  clearState: () => void
} | null>(null)

// Reducer
function moduleReducer(state: ModuleState, action: ModuleAction): ModuleState {
  switch (action.type) {
    case 'SET_MODULE':
      return {
        ...state,
        currentModule: action.payload,
        error: null
      }
    case 'SET_RESPONSES':
      return {
        ...state,
        responses: action.payload,
        error: null
      }
    case 'UPDATE_RESPONSE':
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.payload.stepId]: action.payload.response
        }
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
export function ModuleProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(moduleReducer, initialState)
  const { supabase } = useSupabase()
  const moduleService = new ModuleService(supabase)

  const loadModule = useCallback(async (moduleId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const module = await moduleService.getModule(moduleId)
      dispatch({ type: 'SET_MODULE', payload: module })
      
      // Convert responses array to record for easier access
      const responsesRecord = module.responses?.reduce((acc, response) => ({
        ...acc,
        [response.step_id]: response
      }), {}) || {}
      dispatch({ type: 'SET_RESPONSES', payload: responsesRecord })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error('Failed to load module') })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [moduleService])

  const updateModule = useCallback(async (data: ModuleUpdateData) => {
    try {
      if (!state.currentModule?.id) throw new Error('No module loaded')
      
      dispatch({ type: 'SET_LOADING', payload: true })
      const updatedModule = await moduleService.updateModule(state.currentModule.id, data)
      dispatch({ type: 'SET_MODULE', payload: updatedModule })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error('Failed to update module') })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.currentModule?.id, moduleService])

  const saveResponse = useCallback(async (stepId: string, content: string) => {
    try {
      if (!state.currentModule?.id) throw new Error('No module loaded')
      
      dispatch({ type: 'SET_LOADING', payload: true })
      const response = await moduleService.saveModuleResponse(
        state.currentModule.id,
        stepId,
        content
      )
      dispatch({
        type: 'UPDATE_RESPONSE',
        payload: { stepId, response }
      })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error : new Error('Failed to save response') })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.currentModule?.id, moduleService])

  const clearState = useCallback(() => {
    dispatch({ type: 'CLEAR_STATE' })
  }, [])

  return (
    <ModuleContext.Provider
      value={{
        state,
        loadModule,
        updateModule,
        saveResponse,
        clearState
      }}
    >
      {children}
    </ModuleContext.Provider>
  )
}

// Hook
export function useModule() {
  const context = useContext(ModuleContext)
  if (!context) {
    throw new Error('useModule must be used within a ModuleProvider')
  }
  return context
} 