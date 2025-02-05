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
          completed: boolean
          current_step_id: string | null
          completed_step_ids: string[]
          last_updated: string
          created_at: string
          updated_at: string
          metadata: Json // For additional flexible data
        }
        Insert: {
          project_id: string
          type: ModuleType
          title: string
          completed?: boolean
          current_step_id?: string | null
          completed_step_ids?: string[]
          metadata?: Json
        }
        Update: {
          type?: ModuleType
          title?: string
          completed?: boolean
          current_step_id?: string | null
          completed_step_ids?: string[]
          metadata?: Json
        }
      }
      module_responses: {
        Row: {
          id: string
          module_id: string
          step_id: string
          content: string
          last_updated: string
          created_at: string
        }
        Insert: {
          module_id: string
          step_id: string
          content: string
          last_updated?: string
        }
        Update: {
          content?: string
          last_updated?: string
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
      ai_interactions: {
        Row: {
          id: string
          project_id: string
          module_id: string | null
          step_id: string | null
          type: 'content' | 'context' | 'research'
          prompt: string
          response: Json
          created_at: string
        }
        Insert: {
          project_id: string
          module_id?: string | null
          step_id?: string | null
          type: 'content' | 'context' | 'research'
          prompt: string
          response: Json
        }
        Update: {
          type?: 'content' | 'context' | 'research'
          prompt?: string
          response?: Json
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
    }
  }
} 