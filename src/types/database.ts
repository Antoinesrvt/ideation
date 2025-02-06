export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface ProfileMetadata {
  bio: string
  company: string
  role: string
  location: string
  website: string
  social_links: {
    twitter: string
    linkedin: string
    github: string
  }
}

export type ModuleType = 'vision-problem' | 'market-analysis' | 'business-model' | 'go-to-market' | 'financial-projections' | 'risk-assessment' | 'implementation-timeline' | 'pitch-deck'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          metadata: ProfileMetadata
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          metadata?: Partial<ProfileMetadata>
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          metadata?: Partial<ProfileMetadata>
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          industry: string | null
          stage: 'idea' | 'mvp' | 'growth' | null
          owner_id: string
          created_at: string
          updated_at: string
          is_archived: boolean
          metadata: Json
        }
        Insert: {
          title: string
          description?: string | null
          industry?: string | null
          stage?: 'idea' | 'mvp' | 'growth' | null
          owner_id: string
          metadata?: Json
        }
        Update: {
          title?: string
          description?: string | null
          industry?: string | null
          stage?: 'idea' | 'mvp' | 'growth' | null
          is_archived?: boolean
          metadata?: Json
        }
      }
           modules: {
        Row: {
          id: string
          project_id: string
          type: ModuleType
          title: string
          status: ModuleStatus
          current_step_id: string | null
          metadata: Json
          created_by: string
          created_at: string
          updated_at: string
          last_activity_at: string
        }
        Insert: {
          project_id: string
          type: ModuleType
          title: string
          status?: ModuleStatus
          metadata?: Json
          created_by: string
        }
        Update: {
          title?: string
          status?: ModuleStatus
          current_step_id?: string | null
          metadata?: Json
          last_activity_at?: string
        }
      }
      module_steps: {
        Row: {
          id: string
          module_id: string
          step_type: string
          order_index: number
          status: StepStatus
          metadata: Json
          created_at: string
          updated_at: string
          completed_at: string | null
          completed_by: string | null
        }
        Insert: {
          module_id: string
          step_type: string
          order_index: number
          status?: StepStatus
          metadata?: Json
        }
        Update: {
          status?: StepStatus
          metadata?: Json
          completed_at?: string | null
          completed_by?: string | null
        }
      }
      step_responses: {
        Row: {
          id: string
          step_id: string
          content: string
          version: number
          is_latest: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          step_id: string
          content: string
          version?: number
          created_by: string
        }
        Update: {
          is_latest?: boolean
        }
      }
      ai_interactions: {
        Row: {
          id: string
          project_id: string
          module_id: string | null
          step_id: string | null
          type: 'content' | 'context' | 'research'
          prompt: string
          response: Json
          has_been_applied: boolean
          metadata: Json
          created_by: string
          created_at: string
        }
        Insert: {
          project_id: string
          module_id?: string | null
          step_id?: string | null
          type: 'content' | 'context' | 'research'
          prompt: string
          response: Json
          created_by: string
          metadata?: Json
        }
        Update: {
          has_been_applied?: boolean
          metadata?: Json
        }
      }
      module_step_templates: {
        Row: {
          id: string
          module_type: ModuleType
          step_id: string
          title: string
          description: string
          placeholder: string | null
          order_index: number
          expert_tips: string[]
          created_at: string
        }
        Insert: {
          module_type: ModuleType
          step_id: string
          title: string
          description: string
          placeholder?: string | null
          order_index: number
          expert_tips?: string[]
        }
        Update: {
          title?: string
          description?: string
          placeholder?: string | null
          order_index?: number
          expert_tips?: string[]
        }
      }
      steps: {
        Row: {
          id: string
          module_id: string
          template_id: string
          title: string
          content: string | null
          order_index: number
          completed: boolean
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          module_id: string
          template_id: string
          title: string
          content?: string | null
          order_index: number
          completed?: boolean
          metadata?: Json
        }
        Update: {
          title?: string
          content?: string | null
          order_index?: number
          completed?: boolean
          metadata?: Json
        }
      }
      document_templates: {
        Row: {
          id: string
          module_type: ModuleType
          name: string
          description: string | null
          template_path: string
          version: number
          tags: string[]
          metadata: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          module_type: ModuleType
          name: string
          description?: string | null
          template_path: string
          version?: number
          tags?: string[]
          metadata?: Json
          created_by: string
        }
        Update: {
          name?: string
          description?: string | null
          template_path?: string
          version?: number
          tags?: string[]
          metadata?: Json
        }
      }
      documents: {
        Row: {
          id: string
          project_id: string
          module_type: ModuleType
          name: string
          type: 'pdf' | 'docx' | 'md'
          storage_path: string
          version: number
          template_version: number
          status: 'pending' | 'processing' | 'completed' | 'failed'
          tags: string[]
          metadata: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          project_id: string
          module_type: ModuleType
          name: string
          type: 'pdf' | 'docx' | 'md'
          storage_path: string
          version?: number
          template_version?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          tags?: string[]
          metadata?: Json
          created_by: string
        }
        Update: {
          name?: string
          type?: 'pdf' | 'docx' | 'md'
          storage_path?: string
          version?: number
          template_version?: number
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          tags?: string[]
          metadata?: Json
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          project_id: string
          user_id: string
          role: string
        }
        Update: {
          role?: string
        }
      }
      research_cache: {
        Row: {  
          id: string
          type: string
          key: string
          data: Json
          expiry: number
          created_at: string
        }
        Insert: {
          type: string
          key: string
          data: Json
          expiry: number
        }
        Update: {
          data: Json
          expiry: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      module_type: ModuleType
      ai_analysis_type: 'content' | 'context' | 'research'
      document_type: 'pdf' | 'docx' | 'md'
      document_status: 'pending' | 'processing' | 'completed' | 'failed'
      member_role: 'admin' | 'member'
      module_status: ModuleStatus
      step_status: StepStatus
    }
  }
}

export type Tables = Database['public']['Tables'] 
export type ModuleStatus = 'draft' | 'in_progress' | 'completed' | 'archived'
export type StepStatus = 'not_started' | 'in_progress' | 'completed'
