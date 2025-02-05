import { ModuleType } from '@/config/modules'
import { Database } from "./database";


type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];


export interface ModuleResponse {
  content: string
  lastUpdated: string
  aiSuggestion?: string
}

export interface ModuleMetadata {
  responses: {
    [stepId: string]: ModuleResponse
  }
  currentStepId: string
  completedStepIds: string[]
  lastUpdated: string
}

// Extend the base Supabase type with strongly-typed metadata
export interface Module extends Omit<ModuleRow, 'metadata'> {
  metadata: ModuleMetadata
}

// Type for updating a module
export type ModuleUpdateData = Partial<Pick<ModuleRow, 'title' | 'completed'>> & {
  metadata?: Partial<ModuleMetadata>
}