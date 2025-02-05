import { ModuleType } from '@/config/modules'
import { Database } from "./database";
import { Json } from './supabase'


type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];
type ModuleResponseRow = Database["public"]["Tables"]["module_responses"]["Row"];


export interface ModuleResponse {
  content: string;
  lastUpdated: string;
  aiSuggestion?: string;
}

// Extend the base Supabase type with responses
export interface Module {
  id: string;
  projectId: string;
  type: ModuleType;
  title: string;
  completed: boolean;
  currentStepId: string | null;
  completedStepIds: string[];
  responses?: ModuleResponseRow[];
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  metadata: Json;
}

// Type for updating a module
export type ModuleUpdateData = {
  completed?: boolean
  currentStepId?: string | null
  completedStepIds?: string[]
  metadata?: Json
  lastUpdated?: string
}

// Helper to create a new module
export function createModule(partial: Partial<Module> = {}): Module {
  return {
    id: '',
    projectId: '',
    type: 'vision-problem',
    title: '',
    completed: false,
    currentStepId: null,
    completedStepIds: [],
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: null,
    ...partial
  }
}

// Helper to convert database response to ModuleResponse
export function parseModuleResponse(row: ModuleResponseRow): ModuleResponse {
  return {
    content: row.content,
    lastUpdated: row.last_updated
  }
}

// Helper to convert ModuleResponse to database format
export function prepareModuleResponse(response: ModuleResponse): Omit<ModuleResponseRow, 'id' | 'module_id' | 'created_at'> {
  return {
    step_id: '',
    content: response.content,
    last_updated: response.lastUpdated
  }
}

// Type guard to check if a value is a ModuleResponse
export function isModuleResponse(value: unknown): value is ModuleResponse {
  if (!value || typeof value !== 'object') return false
  const response = value as Record<string, unknown>
  return (
    typeof response.content === 'string' &&
    typeof response.lastUpdated === 'string'
  )
}

// Type guard to check if a value is a ModuleResponseRow
export function isModuleResponseRow(value: unknown): value is ModuleResponseRow {
  if (!value || typeof value !== 'object') return false
  const response = value as Record<string, unknown>
  return (
    typeof response.id === 'string' &&
    typeof response.module_id === 'string' &&
    typeof response.step_id === 'string' &&
    typeof response.content === 'string' &&
    typeof response.last_updated === 'string' &&
    typeof response.created_at === 'string'
  )
}

