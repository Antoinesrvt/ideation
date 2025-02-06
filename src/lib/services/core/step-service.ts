import { BaseSupabaseService } from './base-supabase-service'
import { 
  DbModuleStep, 
  DbStepResponse, 
  ModuleStepInsertData, 
  ModuleStepUpdateData,
  StepStatus 
} from '@/types/module'
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js'

export class StepService extends BaseSupabaseService {
  /**
   * Get all steps for a module
   */
  async getSteps(moduleId: string): Promise<DbModuleStep[]> {
    return this.handleDatabaseOperation(
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
    return this.handleDatabaseOperation(
      async () => {
        const result = await this.supabase
          .from('module_steps')
          .select(`
            *,
            responses:step_responses(*)
          `)
          .eq('id', stepId)
          .single()
        return result as PostgrestSingleResponse<DbModuleStep & { 
          responses: DbStepResponse[] 
        }>
      },
      'getStep'
    )
  }

  /**
   * Create a new step
   */
  async createStep(data: ModuleStepInsertData): Promise<DbModuleStep> {
    return this.handleDatabaseOperation(
      async () => {
        const result = await this.supabase
          .from('module_steps')
          .insert({
            ...data,
            status: 'not_started',
            metadata: data.metadata || {}
          })
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
    return this.handleDatabaseOperation(
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
    const data: ModuleStepUpdateData = {
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
      completed_by: status === 'completed' ? await this.getCurrentUserId() : null
    }
    return this.updateStep(stepId, data)
  }

  /**
   * Delete a step and all related data
   */
  async deleteStep(stepId: string): Promise<void> {
    await this.handleDatabaseOperation(
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
   * Get all responses for a step
   */
  async getStepResponses(stepId: string): Promise<DbStepResponse[]> {
    return this.handleDatabaseOperation(
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
   * Save a new response for a step
   */
  async saveStepResponse(stepId: string, content: string): Promise<DbStepResponse> {
    return this.handleDatabaseOperation(
      async () => {
        // Get current user ID
        const userId = await this.getCurrentUserId()

        // Get current version number
        const { data: currentResponses } = await this.supabase
          .from('step_responses')
          .select('version')
          .eq('step_id', stepId)
          .order('version', { ascending: false })
          .limit(1)

        const nextVersion = currentResponses?.[0]?.version 
          ? currentResponses[0].version + 1 
          : 1

        // Mark all previous responses as not latest
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
            created_by: userId
          })
          .select()
          .single()

        return result as PostgrestSingleResponse<DbStepResponse>
      },
      'saveStepResponse'
    )
  }

  /**
   * Get current user ID
   */
  private async getCurrentUserId(): Promise<string> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error || !user) throw new Error('No authenticated user')
    return user.id
  }
} 