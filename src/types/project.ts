import type { Database } from './database'
import type { Json } from './database'
import type { Module } from './module'

// Type helper for JSON metadata that ensures compatibility with Supabase's Json type
export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[]

export type JsonCompatible<T> = {
  [P in keyof T]: T[P] extends JsonValue ? T[P] : JsonValue
}

// Database row types
export type ProjectRow = Database['public']['Tables']['projects']['Row']
export type ModuleRow = Database['public']['Tables']['modules']['Row']
export type ProjectMemberRow = Database['public']['Tables']['team_members']['Row']

// Module types
export type ModuleType = ModuleRow['type']
export type ModuleStatus = Database['public']['Enums']['module_status']
export type StepStatus = Database['public']['Enums']['step_status']

// Module type constants
export const MODULE_TYPES = [
  'vision-problem',
  'market-analysis',
  'business-model',
  'go-to-market',
  'financial-projections',
  'risk-assessment',
  'implementation-timeline',
  'pitch-deck'
] as const

// Member role type and constants
export type MemberRole = 'admin' | 'member'
export const MEMBER_ROLES = ['admin', 'member'] as const

// Frontend-only types for module configuration
export interface ModuleStepTemplate {
  id: string
  title: string
  description: string
  placeholder?: string
  expertTips: string[]
  orderIndex: number
}

// Project metadata
export interface ProjectSettings {
  allowCollaboration: boolean
  requireApproval: boolean
  autoSave: boolean
}

// Project phase type
export type ProjectPhase = 'concept' | 'development' | 'validation' | 'refinement' | 'launch-ready';

// Project insight type
export interface ProjectInsight {
  id: string;
  title: string;
  value: number;
  description: string;
  icon: string;
  color: string;
  section?: string;
}

// Project risk type
export interface ProjectRisk {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  action?: string;
}

// Recommended action type
export interface RecommendedAction {
  id: string;
  title: string;
  description: string;
  priority: number;
  section: string;
}

// Project metrics type
export interface ProjectMetrics {
  lastCalculated: string;
  sectionCompletion: Record<string, number>;
  healthScore: number;
  phase: ProjectPhase;
  insights: ProjectInsight[];
  risks: ProjectRisk[];
  recommendedActions: RecommendedAction[];
}

export interface ProjectMetadata {
  path: 'guided' | 'expert' | null
  currentStep: ModuleType | null
  completedAt: string | null
  stage: 'idea' | 'mvp' | 'growth' | null
  industry: string | null
  settings: ProjectSettings
  // New metrics field
  metrics?: ProjectMetrics;
  customFields: Record<string, JsonValue>
}

// Type-safe metadata type for database storage
export type ProjectMetadataContent = JsonCompatible<ProjectMetadata>

// Extended types with relationships
export interface ProjectWithModules extends ProjectRow {
  modules: Module[]
  members?: ProjectMemberRow[]
}

export interface ProjectMember extends ProjectMemberRow {
  profile?: {
    full_name: string | null
    avatar_url: string | null
  }
}

// Insert and Update types
export type ProjectInsertData = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdateData = Database['public']['Tables']['projects']['Update']
export type ProjectMemberInsertData = Database['public']['Tables']['team_members']['Insert']
export type ProjectMemberUpdateData = Database['public']['Tables']['team_members']['Update']

// Type guards
export function isProject(value: unknown): value is ProjectRow {
  if (!value || typeof value !== 'object') return false
  const project = value as Record<string, unknown>
  return (
    typeof project.id === 'string' &&
    typeof project.title === 'string' &&
    typeof project.created_at === 'string'
  )
}

export function isProjectMember(value: unknown): value is ProjectMemberRow {
  if (!value || typeof value !== 'object') return false
  const member = value as Record<string, unknown>
  return (
    typeof member.id === 'string' &&
    typeof member.project_id === 'string' &&
    typeof member.user_id === 'string' &&
    typeof member.role === 'string'
  )
}


