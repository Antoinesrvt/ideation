import { Module, ModuleResponse, ModuleUpdateData } from '@/types/module'
import { Tables } from '@/types/database'
import { ModuleType } from '@/types/project'
import { Json } from '@/types/database'

type DatabaseModule = Tables['modules']['Row']
type DatabaseModuleUpdate = Partial<{
  type: ModuleType
  title: string
  completed: boolean
  current_step_id: string | null
  completed_step_ids: string[]
  metadata: Json
  last_updated: string
}>

export function transformDatabaseModule(dbModule: DatabaseModule): Module {
  return {
    id: dbModule.id,
    projectId: dbModule.project_id,
    type: dbModule.type,
    title: dbModule.title,
    completed: dbModule.completed,
    currentStepId: dbModule.current_step_id,
    completedStepIds: dbModule.completed_step_ids,
    lastUpdated: dbModule.last_updated,
    createdAt: dbModule.created_at,
    updatedAt: dbModule.updated_at,
    metadata: dbModule.metadata
  }
}

export function transformModuleForDatabase(module: Partial<Module>): Partial<DatabaseModule> {
  const result: Partial<DatabaseModule> = {}

  if (module.projectId !== undefined) result.project_id = module.projectId
  if (module.type !== undefined) result.type = module.type
  if (module.title !== undefined) result.title = module.title
  if (module.completed !== undefined) result.completed = module.completed
  if (module.currentStepId !== undefined) result.current_step_id = module.currentStepId
  if (module.completedStepIds !== undefined) result.completed_step_ids = module.completedStepIds
  if (module.lastUpdated !== undefined) result.last_updated = module.lastUpdated
  if (module.metadata !== undefined) result.metadata = module.metadata

  return result
}

export function transformModuleUpdates(updates: ModuleUpdateData): DatabaseModuleUpdate {
  const result: DatabaseModuleUpdate = {
    last_updated: new Date().toISOString()
  }

  // Only include fields that are actually being updated
  if (updates.currentStepId !== undefined) {
    result.current_step_id = updates.currentStepId
  }
  if (updates.completedStepIds !== undefined) {
    result.completed_step_ids = updates.completedStepIds
  }
  if (updates.completed !== undefined) {
    result.completed = updates.completed
  }
  if (updates.metadata !== undefined) {
    result.metadata = updates.metadata
  }

  return result
} 