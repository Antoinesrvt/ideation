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
          stage: 'idea' | 'mvp' | 'growth'
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
          stage?: 'idea' | 'mvp' | 'growth'
          owner_id: string
          metadata?: Json
        }
        Update: {
          title?: string
          description?: string | null
          industry?: string | null
          stage?: 'idea' | 'mvp' | 'growth'
          is_archived?: boolean
          metadata?: Json
        }
      }
      modules: {
        Row: {
          id: string
          project_id: string
          type: 'business_model' | 'market_analysis' | 'financial_projections' | 'risk_assessment' | 'implementation_timeline' | 'pitch_deck'
          title: string
          description: string | null
          order_index: number
          completed: boolean
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          project_id: string
          type: 'business_model' | 'market_analysis' | 'financial_projections' | 'risk_assessment' | 'implementation_timeline' | 'pitch_deck'
          title: string
          description?: string | null
          order_index: number
          metadata?: Json
        }
        Update: {
          title?: string
          description?: string | null
          order_index?: number
          completed?: boolean
          metadata?: Json
        }
      }
      steps: {
        Row: {
          id: string
          module_id: string
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
          title: string
          content?: string | null
          order_index: number
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
      module_type: 'business_model' | 'market_analysis' | 'financial_projections' | 'risk_assessment' | 'implementation_timeline' | 'pitch_deck'
      ai_analysis_type: 'content' | 'context' | 'research'
    }
  }
} 