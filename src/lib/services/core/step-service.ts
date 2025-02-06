import { BaseSupabaseService } from './base-supabase-service'
import { DbModuleStep, DbStepResponse, StepStatus, ModuleStepInsertData, ModuleStepUpdateData } from '@/types/module'
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js'

export class StepService extends BaseSupabaseService {
  /**
   * Get all steps for a module
   */
  async getSteps(moduleId: string): Promise<DbModuleStep[]> {
    return this.handleDatabaseOperation<DbModuleStep[]>(
      async () => {
        const result = await this.supabase
          .from('module_steps')
          .select('*')
          .eq('module_id', moduleId)
          .order('order_index', { ascending: true })
        return result as PostgrestResponse<DbModuleStep>
      },
      'getSteps'
    )
  }

  /**
   * Get a single step with its responses
   */
  async getStep(stepId: string): Promise<DbModuleStep & { responses: DbStepResponse[] }> {
    return this.handleDatabaseOperation<DbModuleStep & { responses: DbStepResponse[] }>(
      async () => {
        const result = await this.supabase
          .from('module_steps')
          .select(`
            *,
            responses:step_responses(*)
          `)
          .eq('id', stepId)
          .single()
        return result as PostgrestSingleResponse<DbModuleStep & { responses: DbStepResponse[] }>
      },
      'getStep'
    )
  }

  /**
   * Create a new step
   */
  async createStep(data: ModuleStepInsertData): Promise<DbModuleStep> {
    return this.handleDatabaseOperation<DbModuleStep>(
      async () => {
        const result = await this.supabase
          .from('module_steps')
          .insert(data)
          .select()
          .single()
        return result as PostgrestSingleResponse<DbModuleStep>
      },
      'createStep'
    )
  }

  /**
   * Update a step
   */
  async updateStep(stepId: string, data: ModuleStepUpdateData): Promise<DbModuleStep> {
    return this.handleDatabaseOperation<DbModuleStep>(
      async () => {
        const result = await this.supabase
          .from('module_steps')
          .update(data)
          .eq('id', stepId)
          .select()
          .single()
        return result as PostgrestSingleResponse<DbModuleStep>
      },
      'updateStep'
    )
  }

  /**
   * Update step status
   */
  async updateStepStatus(stepId: string, status: StepStatus): Promise<DbModuleStep> {
    return this.updateStep(stepId, { 
      status,
      ...(status === 'completed' ? {
        completed_at: new Date().toISOString(),
        completed_by: await this.getCurrentUserId()
      } : {})
    })
  }

  /**
   * Delete a step
   */
  async deleteStep(stepId: string): Promise<void> {
    await this.handleDatabaseOperation<void>(
      async () => {
        const result = await this.supabase
          .from('module_steps')
          .delete()
          .eq('id', stepId)
        return { data: null, error: result.error }
      },
      'deleteStep'
    )
  }

  /**
   * Get step responses
   */
  async getStepResponses(stepId: string): Promise<DbStepResponse[]> {
    return this.handleDatabaseOperation<DbStepResponse[]>(
      async () => {
        const result = await this.supabase
          .from('step_responses')
          .select('*')
          .eq('step_id', stepId)
          .order('version', { ascending: false })
        return result as PostgrestResponse<DbStepResponse>
      },
      'getStepResponses'
    )
  }

  /**
   * Save step response
   */
  async saveStepResponse(stepId: string, content: string): Promise<DbStepResponse> {
    return this.handleDatabaseOperation<DbStepResponse>(
      async () => {
        // Get current version if exists
        const { data: currentResponses } = await this.supabase
          .from('step_responses')
          .select('version')
          .eq('step_id', stepId)
          .order('version', { ascending: false })
          .limit(1)

        const nextVersion = currentResponses?.[0]?.version 
          ? currentResponses[0].version + 1 
          : 1

        // Mark previous responses as not latest
        if (nextVersion > 1) {
          await this.supabase
            .from('step_responses')
            .update({ is_latest: false })
            .eq('step_id', stepId)
        }

        // Insert new response
        const result = await this.supabase
          .from('step_responses')
          .insert({
            step_id: stepId,
            content,
            version: nextVersion,
            is_latest: true,
            created_by: await this.getCurrentUserId()
          })
          .select()
          .single()

        return result as PostgrestSingleResponse<DbStepResponse>
      },
      'saveStepResponse'
    )
  }

  /**
   * Get current user ID helper
   */
  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')
    return user.id
  }
} 