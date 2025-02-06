import { Database } from "./database"

// Base database types
export type DbModule = Database['public']['Tables']['modules']['Row']
export type DbModuleResponse = Database['public']['Tables']['module_responses']['Row']

// Frontend extensions (only when necessary)
export interface Module extends DbModule {
  responses?: DbModuleResponse[]
}

// Update types (matching database structure)
export type ModuleUpdateData = Partial<{
  type: DbModule['type']
  title: DbModule['title']
  completed: DbModule['completed']
  current_step_id: DbModule['current_step_id']
  completed_step_ids: DbModule['completed_step_ids']
  metadata: DbModule['metadata']
  last_updated: DbModule['last_updated']
}>

// Type guards
export function isModuleResponse(value: unknown): value is DbModuleResponse {
  if (!value || typeof value !== 'object') return false
  const response = value as Record<string, unknown>
  return (
    typeof response.id === 'string' &&
    typeof response.module_id === 'string' &&
    typeof response.step_id === 'string' &&
    typeof response.content === 'string' &&
    typeof response.last_updated === 'string'
  )
}

