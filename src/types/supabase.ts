export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          metadata: Json | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
          metadata: Json | null
          status: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
          status?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
          status?: string
        }
      }
      modules: {
        Row: {
          id: string
          project_id: string
          type: string
          title: string
          completed: boolean
          created_at: string
          updated_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          project_id: string
          type: string
          title: string
          completed?: boolean
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          project_id?: string
          type?: string
          title?: string
          completed?: boolean
          created_at?: string
          updated_at?: string
          metadata?: Json | null
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
      [_ in never]: never
    }
  }
} 