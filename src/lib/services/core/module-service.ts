import { BaseSupabaseService } from './base-supabase-service'
import { Database } from '@/types/database'
import { DbModule, DbModuleResponse, ModuleUpdateData } from '@/types/module'
import { ModuleType } from '@/types/project'
import { PostgrestSingleResponse, PostgrestMaybeSingleResponse, PostgrestResponse } from '@supabase/supabase-js'

type Tables = Database['public']['Tables']
type ModuleRow = Tables['modules']['Row']
type ModuleResponseRow = Tables['module_responses']['Row']

export class ModuleService extends BaseSupabaseService {
  async getModule(moduleId: string): Promise<ModuleRow & { responses: ModuleResponseRow[] }> {
    return this.handleDatabaseOperation<ModuleRow & { responses: ModuleResponseRow[] }>(
      async () => {
        const result = await this.supabase
          .from('modules')
          .select(`
            *,
            responses:module_responses(*)
          `)
          .eq('id', moduleId)
          .single()
        return result as PostgrestSingleResponse<ModuleRow & { responses: ModuleResponseRow[] }>
      },
      'getModule'
    )
  }

  async getModulesByProject(projectId: string): Promise<ModuleRow[]> {
    return this.handleDatabaseOperation<ModuleRow[]>(
      async () => {
        const result = await this.supabase
          .from('modules')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true })
        return result as PostgrestResponse<ModuleRow>
      },
      'getModulesByProject'
    )
  }

  async createModule(
    projectId: string,
    type: ModuleType,
    title: string,
    metadata: DbModule['metadata'] = {}
  ): Promise<ModuleRow> {
    return this.handleDatabaseOperation<ModuleRow>(
      async () => {
        const result = await this.supabase
          .from('modules')
          .insert({
            project_id: projectId,
            type,
            title,
            metadata,
            completed: false,
            current_step_id: null,
            completed_step_ids: []
          })
          .select()
          .single()
        return result as PostgrestSingleResponse<ModuleRow>
      },
      'createModule'
    )
  }

  async updateModule(
    moduleId: string,
    data: ModuleUpdateData
  ): Promise<ModuleRow> {
    return this.handleDatabaseOperation<ModuleRow>(
      async () => {
        const result = await this.supabase
          .from('modules')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', moduleId)
          .select()
          .single()
        return result as PostgrestSingleResponse<ModuleRow>
      },
      'updateModule'
    )
  }

  async saveModuleResponse(
    moduleId: string,
    stepId: string,
    content: string
  ): Promise<ModuleResponseRow> {
    return this.handleDatabaseOperation<ModuleResponseRow>(
      async () => {
        const result = await this.supabase
          .from('module_responses')
          .upsert(
            {
              module_id: moduleId,
              step_id: stepId,
              content,
              last_updated: new Date().toISOString()
            },
            {
              onConflict: 'module_id,step_id'
            }
          )
          .select()
          .single()
        return result as PostgrestSingleResponse<ModuleResponseRow>
      },
      'saveModuleResponse'
    )
  }

  async getModuleResponses(moduleId: string): Promise<ModuleResponseRow[]> {
    return this.handleDatabaseOperation<ModuleResponseRow[]>(
      async () => {
        const result = await this.supabase
          .from('module_responses')
          .select('*')
          .eq('module_id', moduleId)
          .order('created_at', { ascending: true })
        return result as PostgrestResponse<ModuleResponseRow>
      },
      'getModuleResponses'
    )
  }

  async deleteModule(moduleId: string): Promise<void> {
    await this.handleDatabaseOperation<void>(
      async () => {
        const result = await this.supabase
          .from('modules')
          .delete()
          .eq('id', moduleId)
        return { data: null, error: result.error }
      },
      'deleteModule'
    )
  }
} 