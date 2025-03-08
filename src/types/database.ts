export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_conversation_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string | null
          id: string
          is_pinned: boolean | null
          metadata: Json | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          metadata?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          metadata?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversation_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          archived: boolean | null
          context: string | null
          created_at: string | null
          created_by: string | null
          feature_context: string | null
          id: string
          pinned: boolean | null
          project_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          archived?: boolean | null
          context?: string | null
          created_at?: string | null
          created_by?: string | null
          feature_context?: string | null
          id?: string
          pinned?: boolean | null
          project_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          archived?: boolean | null
          context?: string | null
          created_at?: string | null
          created_by?: string | null
          feature_context?: string | null
          id?: string
          pinned?: boolean | null
          project_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generated_content: {
        Row: {
          content: string
          content_type: string | null
          created_at: string | null
          created_by: string | null
          feature_context: string | null
          feedback: Json | null
          has_been_applied: boolean | null
          id: string
          project_id: string | null
          prompt_used: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          content_type?: string | null
          created_at?: string | null
          created_by?: string | null
          feature_context?: string | null
          feedback?: Json | null
          has_been_applied?: boolean | null
          id?: string
          project_id?: string | null
          prompt_used?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          content_type?: string | null
          created_at?: string | null
          created_by?: string | null
          feature_context?: string | null
          feedback?: Json | null
          has_been_applied?: boolean | null
          id?: string
          project_id?: string | null
          prompt_used?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_content_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_interactions: {
        Row: {
          created_at: string | null
          created_by: string | null
          has_been_applied: boolean | null
          id: string
          metadata: Json | null
          module_id: string | null
          project_id: string | null
          prompt: string
          response: Json
          step_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          has_been_applied?: boolean | null
          id?: string
          metadata?: Json | null
          module_id?: string | null
          project_id?: string | null
          prompt: string
          response: Json
          step_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          has_been_applied?: boolean | null
          id?: string
          metadata?: Json | null
          module_id?: string | null
          project_id?: string | null
          prompt?: string
          response?: Json
          step_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_interactions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_interactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_interactions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "module_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompts: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_favorite: boolean | null
          is_system: boolean | null
          metadata: Json | null
          project_id: string | null
          prompt_text: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_system?: boolean | null
          metadata?: Json | null
          project_id?: string | null
          prompt_text: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          is_system?: boolean | null
          metadata?: Json | null
          project_id?: string | null
          prompt_text?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_settings: {
        Row: {
          created_at: string | null
          custom_instructions: string | null
          id: string
          max_tokens: number | null
          model_preference: string | null
          persona: string | null
          preferred_output_format: string | null
          temperature: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          custom_instructions?: string | null
          id?: string
          max_tokens?: number | null
          model_preference?: string | null
          persona?: string | null
          preferred_output_format?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          custom_instructions?: string | null
          id?: string
          max_tokens?: number | null
          model_preference?: string | null
          persona?: string | null
          preferred_output_format?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      canvas_items: {
        Row: {
          checked: boolean | null
          color: string | null
          created_at: string | null
          created_by: string | null
          id: string
          order_index: number | null
          project_id: string | null
          section_id: string | null
          tags: string[] | null
          text: string
          updated_at: string | null
        }
        Insert: {
          checked?: boolean | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          order_index?: number | null
          project_id?: string | null
          section_id?: string | null
          tags?: string[] | null
          text: string
          updated_at?: string | null
        }
        Update: {
          checked?: boolean | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          order_index?: number | null
          project_id?: string | null
          section_id?: string | null
          tags?: string[] | null
          text?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canvas_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "canvas_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "canvas_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      canvas_sections: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          order_index: number | null
          project_id: string | null
          section_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          order_index?: number | null
          project_id?: string | null
          section_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          order_index?: number | null
          project_id?: string | null
          section_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "canvas_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      document_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          document_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          document_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          document_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_audit_log_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_collaborators: {
        Row: {
          created_at: string | null
          document_id: string | null
          id: string
          permission: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          permission?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          id?: string
          permission?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_collaborators_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          metadata: Json
          module_type: string
          name: string
          tags: string[] | null
          template_path: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          module_type: string
          name: string
          tags?: string[] | null
          template_path: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          module_type?: string
          name?: string
          tags?: string[] | null
          template_path?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          content_preview: string | null
          created_at: string
          created_by: string
          document_data: Json | null
          id: string
          last_viewed_at: string | null
          metadata: Json
          module_id: string
          name: string
          owner_id: string | null
          project_id: string
          related_features: Json | null
          status: string
          storage_path: string
          tags: string[] | null
          template_version: number
          type: string
          updated_at: string
          version: number
          visibility: string | null
        }
        Insert: {
          content_preview?: string | null
          created_at?: string
          created_by: string
          document_data?: Json | null
          id?: string
          last_viewed_at?: string | null
          metadata?: Json
          module_id: string
          name: string
          owner_id?: string | null
          project_id: string
          related_features?: Json | null
          status?: string
          storage_path: string
          tags?: string[] | null
          template_version?: number
          type: string
          updated_at?: string
          version?: number
          visibility?: string | null
        }
        Update: {
          content_preview?: string | null
          created_at?: string
          created_by?: string
          document_data?: Json | null
          id?: string
          last_viewed_at?: string | null
          metadata?: Json
          module_id?: string
          name?: string
          owner_id?: string | null
          project_id?: string
          related_features?: Json | null
          status?: string
          storage_path?: string
          tags?: string[] | null
          template_version?: number
          type?: string
          updated_at?: string
          version?: number
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_item_tags: {
        Row: {
          created_at: string | null
          created_by: string | null
          feature_type: string
          id: string
          item_id: string
          tag_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          feature_type: string
          id?: string
          item_id: string
          tag_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          feature_type?: string
          id?: string
          item_id?: string
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "project_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_cost_structure: {
        Row: {
          amount: number | null
          assumptions: string | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          frequency: string | null
          growth_rate: number | null
          id: string
          name: string
          project_id: string | null
          projections: Json | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          assumptions?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          frequency?: string | null
          growth_rate?: number | null
          id?: string
          name: string
          project_id?: string | null
          projections?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          assumptions?: string | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          frequency?: string | null
          growth_rate?: number | null
          id?: string
          name?: string
          project_id?: string | null
          projections?: Json | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_cost_structure_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_pricing_strategies: {
        Row: {
          considerations: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          strategy_type: string | null
          target_price_range: Json | null
          updated_at: string | null
          target_market: string | null
        }
        Insert: {
          considerations?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          project_id?: string | null
          strategy_type?: string | null
          target_price_range?: Json | null
          target_market?: string | null
          updated_at?: string | null
        }
        Update: {
          considerations?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
          strategy_type?: string | null
          target_price_range?: Json | null
          target_market?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_pricing_strategies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_projections: {
        Row: {
          assumptions: string | null
          break_even: Json | null
          created_at: string | null
          created_by: string | null
          data: Json
          description: string | null
          id: string
          project_id: string | null
          scenario: string | null
          start_date: string | null
          timeframe: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assumptions?: string | null
          break_even?: Json | null
          created_at?: string | null
          created_by?: string | null
          data: Json
          description?: string | null
          id?: string
          project_id?: string | null
          scenario?: string | null
          start_date?: string | null
          timeframe?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assumptions?: string | null
          break_even?: Json | null
          created_at?: string | null
          created_by?: string | null
          data?: Json
          description?: string | null
          id?: string
          project_id?: string | null
          scenario?: string | null
          start_date?: string | null
          timeframe?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_projections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_revenue_streams: {
        Row: {
          assumptions: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          frequency: string | null
          growth_rate: number | null
          id: string
          name: string
          pricing_model: string | null
          project_id: string | null
          projections: Json | null
          type: string | null
          unit_price: number | null
          updated_at: string | null
          volume: number | null
        }
        Insert: {
          assumptions?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          frequency?: string | null
          growth_rate?: number | null
          id?: string
          name: string
          pricing_model?: string | null
          project_id?: string | null
          projections?: Json | null
          type?: string | null
          unit_price?: number | null
          updated_at?: string | null
          volume?: number | null
        }
        Update: {
          assumptions?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          frequency?: string | null
          growth_rate?: number | null
          id?: string
          name?: string
          pricing_model?: string | null
          project_id?: string | null
          projections?: Json | null
          type?: string | null
          unit_price?: number | null
          updated_at?: string | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_revenue_streams_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      grp_categories: {
        Row: {
          category_type: string | null
          created_at: string | null
          created_by: string | null
          id: string
          order_index: number | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          category_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          order_index?: number | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          order_index?: number | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grp_categories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      grp_items: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          order_index: number | null
          percentage: number | null
          project_id: string | null
          section_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          percentage?: number | null
          project_id?: string | null
          section_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          percentage?: number | null
          project_id?: string | null
          section_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grp_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grp_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "grp_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      grp_sections: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          order_index: number | null
          project_id: string | null
          section_type: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          order_index?: number | null
          project_id?: string | null
          section_type: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          order_index?: number | null
          project_id?: string | null
          section_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "grp_sections_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "grp_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grp_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      market_competitors: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          market_share: string | null
          name: string
          notes: string | null
          price: string | null
          project_id: string | null
          strengths: string[] | null
          updated_at: string | null
          weaknesses: string[] | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          market_share?: string | null
          name: string
          notes?: string | null
          price?: string | null
          project_id?: string | null
          strengths?: string[] | null
          updated_at?: string | null
          weaknesses?: string[] | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          market_share?: string | null
          name?: string
          notes?: string | null
          price?: string | null
          project_id?: string | null
          strengths?: string[] | null
          updated_at?: string | null
          weaknesses?: string[] | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_competitors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      market_interviews: {
        Row: {
          company: string | null
          created_at: string | null
          created_by: string | null
          id: string
          interview_date: string | null
          key_insights: string[] | null
          name: string
          notes: string | null
          project_id: string | null
          sentiment: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          interview_date?: string | null
          key_insights?: string[] | null
          name: string
          notes?: string | null
          project_id?: string | null
          sentiment?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          interview_date?: string | null
          key_insights?: string[] | null
          name?: string
          notes?: string | null
          project_id?: string | null
          sentiment?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_interviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      market_personas: {
        Row: {
          created_at: string | null
          created_by: string | null
          demographics: string | null
          goals: string[] | null
          id: string
          name: string
          pain_points: string[] | null
          project_id: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          demographics?: string | null
          goals?: string[] | null
          id?: string
          name: string
          pain_points?: string[] | null
          project_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          demographics?: string | null
          goals?: string[] | null
          id?: string
          name?: string
          pain_points?: string[] | null
          project_id?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_personas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      market_trends: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          direction: string | null
          id: string
          name: string
          project_id: string | null
          sources: string[] | null
          tags: string[] | null
          trend_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          direction?: string | null
          id?: string
          name: string
          project_id?: string | null
          sources?: string[] | null
          tags?: string[] | null
          trend_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          direction?: string | null
          id?: string
          name?: string
          project_id?: string | null
          sources?: string[] | null
          tags?: string[] | null
          trend_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_trends_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      module_step_templates: {
        Row: {
          created_at: string
          description: string
          expert_tips: Json | null
          id: string
          module_type: Database["public"]["Enums"]["module_type"]
          order_index: number
          placeholder: string | null
          step_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          expert_tips?: Json | null
          id?: string
          module_type: Database["public"]["Enums"]["module_type"]
          order_index: number
          placeholder?: string | null
          step_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          expert_tips?: Json | null
          id?: string
          module_type?: Database["public"]["Enums"]["module_type"]
          order_index?: number
          placeholder?: string | null
          step_id?: string
          title?: string
        }
        Relationships: []
      }
      module_steps: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          module_id: string | null
          order_index: number
          status: Database["public"]["Enums"]["step_status"] | null
          step_type: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          module_id?: string | null
          order_index: number
          status?: Database["public"]["Enums"]["step_status"] | null
          step_type: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          module_id?: string | null
          order_index?: number
          status?: Database["public"]["Enums"]["step_status"] | null
          step_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_steps_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string | null
          created_by: string | null
          current_step_id: string | null
          id: string
          last_activity_at: string | null
          metadata: Json | null
          project_id: string | null
          status: Database["public"]["Enums"]["module_status"] | null
          title: string
          type: Database["public"]["Enums"]["module_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          current_step_id?: string | null
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["module_status"] | null
          title: string
          type: Database["public"]["Enums"]["module_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          current_step_id?: string | null
          id?: string
          last_activity_at?: string | null
          metadata?: Json | null
          project_id?: string | null
          status?: Database["public"]["Enums"]["module_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["module_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      product_features: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          effort: number | null
          id: string
          impact: number | null
          name: string
          notes: string | null
          priority: string | null
          project_id: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effort?: number | null
          id?: string
          impact?: number | null
          name: string
          notes?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effort?: number | null
          id?: string
          impact?: number | null
          name?: string
          notes?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_features_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      product_journey_actions: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          order_index: number | null
          project_id: string | null
          stage_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          order_index?: number | null
          project_id?: string | null
          stage_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          order_index?: number | null
          project_id?: string | null
          stage_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_journey_actions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_journey_actions_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "product_journey_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_journey_pain_points: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          issue: string
          priority: string | null
          project_id: string | null
          solution: string | null
          stage_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          issue: string
          priority?: string | null
          project_id?: string | null
          solution?: string | null
          stage_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          issue?: string
          priority?: string | null
          project_id?: string | null
          solution?: string | null
          stage_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_journey_pain_points_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_journey_pain_points_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "product_journey_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      product_journey_stages: {
        Row: {
          completed: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          order_index: number | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          order_index?: number | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          order_index?: number | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_journey_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      product_wireframes: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          order_index: number | null
          project_id: string | null
          screen_type: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          order_index?: number | null
          project_id?: string | null
          screen_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          order_index?: number | null
          project_id?: string | null
          screen_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_wireframes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          feature_type: string
          id: string
          item_id: string | null
          item_type: string | null
          project_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          feature_type: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          project_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          feature_type?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          project_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          feature_type: string
          id: string
          item_id: string | null
          parent_id: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          feature_type: string
          id?: string
          item_id?: string | null
          parent_id?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          feature_type?: string
          id?: string
          item_id?: string | null
          parent_id?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notifications: {
        Row: {
          created_at: string | null
          feature_type: string | null
          id: string
          is_read: boolean | null
          item_id: string | null
          message: string | null
          project_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          feature_type?: string | null
          id?: string
          is_read?: boolean | null
          item_id?: string | null
          message?: string | null
          project_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          feature_type?: string | null
          id?: string
          is_read?: boolean | null
          item_id?: string | null
          message?: string | null
          project_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tags: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tags_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          industry: string | null
          is_archived: boolean | null
          metadata: Json | null
          owner_id: string
          stage: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_archived?: boolean | null
          metadata?: Json | null
          owner_id: string
          stage?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_archived?: boolean | null
          metadata?: Json | null
          owner_id?: string
          stage?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      related_items: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          project_id: string | null
          relationship_type: string | null
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          relationship_type?: string | null
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
          relationship_type?: string | null
          source_id?: string
          source_type?: string
          target_id?: string
          target_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "related_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      research_cache: {
        Row: {
          created_at: string
          data: Json
          expiry: number
          id: string
          key: string
          type: string
        }
        Insert: {
          created_at?: string
          data: Json
          expiry?: number
          id?: string
          key: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json
          expiry?: number
          id?: string
          key?: string
          type?: string
        }
        Relationships: []
      }
      search_index: {
        Row: {
          content: string | null
          created_at: string | null
          feature_type: string
          id: string
          item_id: string
          item_type: string | null
          project_id: string | null
          search_vector: unknown | null
          tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          feature_type: string
          id?: string
          item_id: string
          item_type?: string | null
          project_id?: string | null
          search_vector?: unknown | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          feature_type?: string
          id?: string
          item_id?: string
          item_type?: string | null
          project_id?: string | null
          search_vector?: unknown | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_index_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      step_responses: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_latest: boolean | null
          step_id: string | null
          version: number
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_latest?: boolean | null
          step_id?: string | null
          version?: number
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_latest?: boolean | null
          step_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "step_responses_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "module_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          availability: string | null
          contact_info: Json | null
          created_at: string | null
          created_by: string | null
          expertise: string[] | null
          id: string
          name: string
          project_id: string | null
          responsibilities: string[] | null
          role: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability?: string | null
          contact_info?: Json | null
          created_at?: string | null
          created_by?: string | null
          expertise?: string[] | null
          id?: string
          name: string
          project_id?: string | null
          responsibilities?: string[] | null
          role: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability?: string | null
          contact_info?: Json | null
          created_at?: string | null
          created_by?: string | null
          expertise?: string[] | null
          id?: string
          name?: string
          project_id?: string | null
          responsibilities?: string[] | null
          role?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_responsibility_matrix: {
        Row: {
          area: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          project_id: string | null
          raci_matrix: Json | null
          updated_at: string | null
        }
        Insert: {
          area: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          raci_matrix?: Json | null
          updated_at?: string | null
        }
        Update: {
          area?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string | null
          raci_matrix?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_responsibility_matrix_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_tasks: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          notes: string | null
          priority: string | null
          project_id: string | null
          status: string | null
          team_member_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          team_member_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          project_id?: string | null
          status?: string | null
          team_member_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_tasks_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_ab_tests: {
        Row: {
          confidence: number | null
          conversion_a: number | null
          conversion_b: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          metric: string
          notes: string | null
          project_id: string | null
          sample_size: number | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          variant_a: string
          variant_b: string
          winner: string | null
        }
        Insert: {
          confidence?: number | null
          conversion_a?: number | null
          conversion_b?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metric: string
          notes?: string | null
          project_id?: string | null
          sample_size?: number | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          variant_a: string
          variant_b: string
          winner?: string | null
        }
        Update: {
          confidence?: number | null
          conversion_a?: number | null
          conversion_b?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metric?: string
          notes?: string | null
          project_id?: string | null
          sample_size?: number | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          variant_a?: string
          variant_b?: string
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_ab_tests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_experiments: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          hypothesis: string | null
          id: string
          learnings: string | null
          metrics: Json | null
          project_id: string | null
          results: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          hypothesis?: string | null
          id?: string
          learnings?: string | null
          metrics?: Json | null
          project_id?: string | null
          results?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          hypothesis?: string | null
          id?: string
          learnings?: string | null
          metrics?: Json | null
          project_id?: string | null
          results?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_experiments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_hypotheses: {
        Row: {
          assumptions: string[] | null
          confidence: number | null
          created_at: string | null
          created_by: string | null
          evidence: string[] | null
          id: string
          project_id: string | null
          statement: string
          status: string | null
          updated_at: string | null
          validation_method: string | null
        }
        Insert: {
          assumptions?: string[] | null
          confidence?: number | null
          created_at?: string | null
          created_by?: string | null
          evidence?: string[] | null
          id?: string
          project_id?: string | null
          statement: string
          status?: string | null
          updated_at?: string | null
          validation_method?: string | null
        }
        Update: {
          assumptions?: string[] | null
          confidence?: number | null
          created_at?: string | null
          created_by?: string | null
          evidence?: string[] | null
          id?: string
          project_id?: string | null
          statement?: string
          status?: string | null
          updated_at?: string | null
          validation_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_hypotheses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      validation_user_feedback: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          date: string | null
          id: string
          impact: string | null
          project_id: string | null
          response: string | null
          sentiment: string | null
          source: string
          status: string | null
          tags: string[] | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          id?: string
          impact?: string | null
          project_id?: string | null
          response?: string | null
          sentiment?: string | null
          source: string
          status?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          id?: string
          impact?: string | null
          project_id?: string | null
          response?: string | null
          sentiment?: string | null
          source?: string
          status?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "validation_user_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ai_analysis_type: "content" | "context" | "research"
      module_status: "draft" | "in_progress" | "completed" | "archived"
      module_type:
        | "vision-problem"
        | "market-analysis"
        | "business-model"
        | "go-to-market"
        | "financial-projections"
        | "risk-assessment"
        | "implementation-timeline"
        | "pitch-deck"
      step_status: "not_started" | "in_progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
