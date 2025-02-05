import type { Database } from './database'
import type { Json } from './database'

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


