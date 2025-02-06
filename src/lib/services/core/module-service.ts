import { BaseSupabaseService } from './base-supabase-service'
import { StepService } from './step-service'
import { 
  DbModule, 
  ModuleStatus,
  ModuleInsertData,
  ModuleUpdateData,
  ModuleStep,
  DbStepResponse
} from '@/types/module'
import { ModuleType } from '@/types/project'
import { PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js'

export class ModuleService extends BaseSupabaseService {
  private stepService: StepService

  constructor(supabase: any) {
    super(supabase)
    this.stepService = new StepService(supabase)
  }

  /**
   * Get a single module with its steps and responses
   */
  async getModule(moduleId: string): Promise<DbModule & { steps: (ModuleStep & { responses: DbStepResponse[] })[] }> {
    return this.handleDatabaseOperation(
      async () => {
        const result = await this.supabase
          .from('modules')
          .select(`
            *,
            steps:module_steps(
              *,
              responses:step_responses(*)
            )
          `)
          .eq('id', moduleId)
          .single()
        return result as PostgrestSingleResponse<DbModule & { 
          steps: (ModuleStep & { responses: DbStepResponse[] })[] 
        }>
      },
      'getModule'
    )
  }

  /**
   * Get all modules for a project
   */
  async getModulesByProject(projectId: string): Promise<DbModule[]> {
    return this.handleDatabaseOperation<DbModule[]>(
      async () => {
        const result = await this.supabase
          .from('modules')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true })
        return result as PostgrestResponse<DbModule>
      },
      'getModulesByProject'
    )
  }

  /**
   * Create a new module
   */
  async createModule(data: ModuleInsertData): Promise<DbModule> {
    return this.handleDatabaseOperation<DbModule>(
      async () => {
        // Create module
        const result = await this.supabase
          .from('modules')
          .insert({
            ...data,
            status: 'draft',
            metadata: data.metadata || {}
          })
          .select()
          .single()

        return result as PostgrestSingleResponse<DbModule>
      },
      'createModule'
    )
  }

  /**
   * Update a module
   */
  async updateModule(moduleId: string, data: ModuleUpdateData): Promise<DbModule> {
    return this.handleDatabaseOperation<DbModule>(
      async () => {
        const result = await this.supabase
          .from('modules')
          .update({
            ...data,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', moduleId)
          .select()
          .single()

        return result as PostgrestSingleResponse<DbModule>
      },
      'updateModule'
    )
  }

  /**
   * Update module status
   */
  async updateModuleStatus(moduleId: string, status: ModuleStatus): Promise<DbModule> {
    return this.updateModule(moduleId, { status })
  }

  /**
   * Delete a module and all related data
   */
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

  // Step-related methods that use StepService
  async getModuleSteps(moduleId: string) {
    return this.stepService.getSteps(moduleId)
  }

  async getModuleStep(stepId: string) {
    return this.stepService.getStep(stepId)
  }

  async createModuleStep(data: ModuleStep) {
    return this.stepService.createStep(data)
  }

  async updateModuleStep(stepId: string, data: Partial<ModuleStep>) {
    return this.stepService.updateStep(stepId, data)
  }

  async saveStepResponse(stepId: string, content: string) {
    return this.stepService.saveStepResponse(stepId, content)
  }
} 