import type { Database } from './database'
import type { Json } from './database'
import type { ModuleMetadata, ModuleResponse } from './module'

// Type helper for JSON metadata that ensures compatibility with Supabase's Json type
export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[]

export type JsonCompatible<T> = {
  [P in keyof T]: T[P] extends JsonValue ? T[P] : never
}

// Database row types
export type ProjectRow = Database['public']['Tables']['projects']['Row']
export type ModuleRow = Database['public']['Tables']['modules']['Row']

// Module types
export type ModuleType = ModuleRow['type']

export const MODULE_TYPES: ModuleType[] = [
  'vision-problem',
  'market-analysis',
  'business-model',
  'go-to-market',
  'financial-projections',
  'risk-assessment',
  'implementation-timeline',
  'pitch-deck'
] as const

// Frontend-only types for module configuration
export interface ModuleStepTemplate {
  id: string
  title: string
  description: string
  placeholder?: string
  expertTips: string[]
  orderIndex: number
}

// Project metadata types
export interface ProjectMetadataContent {
  path: 'guided' | 'expert' | null
  currentStep: ModuleType | null
  completedAt: string | null
  stage: 'idea' | 'mvp' | 'growth' | null
  industry: string | null
}

// Type-safe metadata type for database storage
export type ProjectMetadata = JsonCompatible<ProjectMetadataContent>

// Extended types with relationships
export interface Project extends Omit<ProjectRow, 'metadata'> {
  metadata: ProjectMetadata
  modules: Module[]
}

export interface Module extends Omit<ModuleRow, 'metadata'> {
  metadata: ModuleMetadata
}

// Type guard for project metadata
export function isProjectMetadata(metadata: unknown): metadata is ProjectMetadataContent {
  if (!metadata || typeof metadata !== 'object') return false
  
  const m = metadata as ProjectMetadataContent
  return (
    (m.path === 'guided' || m.path === 'expert' || m.path === null) &&
    (typeof m.currentStep === 'string' || m.currentStep === null) &&
    (typeof m.completedAt === 'string' || m.completedAt === null) &&
    (m.stage === 'idea' || m.stage === 'mvp' || m.stage === 'growth' || m.stage === null) &&
    (typeof m.industry === 'string' || m.industry === null)
  )
}