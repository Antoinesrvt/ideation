import { Database } from "./database"
import { Json } from "./database"
import { ModuleType } from "./project"

// Base database types
export type DbModule = Database['public']['Tables']['modules']['Row']
export type DbModuleStep = Database['public']['Tables']['module_steps']['Row']
export type DbStepResponse = Database['public']['Tables']['step_responses']['Row']
export type DbModuleResponse = DbStepResponse // For backward compatibility

// Status types from database enums
export type ModuleStatus = Database['public']['Enums']['module_status']
export type StepStatus = Database['public']['Enums']['step_status']

// Frontend extensions
export interface Module extends DbModule {
  steps?: DbModuleStep[]
  responses?: DbStepResponse[]
}

export interface ModuleStep extends DbModuleStep {
  responses?: DbStepResponse[]
}

// Insert types
export type ModuleInsertData = Database['public']['Tables']['modules']['Insert']
export type ModuleStepInsertData = Database['public']['Tables']['module_steps']['Insert']
export type StepResponseInsertData = Database['public']['Tables']['step_responses']['Insert']

// Update types
export type ModuleUpdateData = Database['public']['Tables']['modules']['Update']
export type ModuleStepUpdateData = Database['public']['Tables']['module_steps']['Update']
export type StepResponseUpdateData = Database['public']['Tables']['step_responses']['Update']

// Type guards
export function isModule(value: unknown): value is DbModule {
  if (!value || typeof value !== 'object') return false
  const module = value as Record<string, unknown>
  return (
    typeof module.id === 'string' &&
    typeof module.project_id === 'string' &&
    typeof module.type === 'string' &&
    typeof module.title === 'string' &&
    typeof module.created_at === 'string'
  )
}

export function isModuleStep(value: unknown): value is DbModuleStep {
  if (!value || typeof value !== 'object') return false
  const step = value as Record<string, unknown>
  return (
    typeof step.id === 'string' &&
    typeof step.module_id === 'string' &&
    typeof step.step_type === 'string' &&
    typeof step.order_index === 'number' &&
    typeof step.created_at === 'string'
  )
}

export function isStepResponse(value: unknown): value is DbStepResponse {
  if (!value || typeof value !== 'object') return false
  const response = value as Record<string, unknown>
  return (
    typeof response.id === 'string' &&
    typeof response.step_id === 'string' &&
    typeof response.content === 'string' &&
    typeof response.version === 'number' &&
    typeof response.created_at === 'string'
  )
}

// Utility types for metadata
export type ModuleMetadata = {
  settings?: {
    allowAI: boolean
    requireApproval: boolean
    autoSave: boolean
  }
  customFields?: Record<string, Json>
  progress?: {
    totalSteps: number
    completedSteps: number
    lastActivity: string
  }
}

export type StepMetadata = {
  validation?: {
    required: boolean
    minLength?: number
    maxLength?: number
    pattern?: string
  }
  ui?: {
    placeholder?: string
    helpText?: string
    inputType: 'text' | 'textarea' | 'markdown' | 'rich-text'
  }
  customFields?: Record<string, Json>
}

