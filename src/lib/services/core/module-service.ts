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
import { PostgrestSingleResponse, PostgrestResponse, PostgrestError } from '@supabase/supabase-js'
import { MODULES_CONFIG } from '@/config/modules'

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
    return this.handleDatabaseOperation<DbModule & { steps: (ModuleStep & { responses: DbStepResponse[] })[] }>(
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

        if (result.error) throw result.error
        if (!result.data) throw new Error('Module not found')
        return result.data
      },
      'getModule'
    )
  }

  /**
   * Get module by type for a specific project
   */
  async getModuleByType(projectId: string, moduleType: ModuleType): Promise<(DbModule & { steps: (ModuleStep & { responses: DbStepResponse[] })[] }) | null> {
    try {
      const { data, error } = await this.supabase
        .from('modules')
        .select(`
          *,
          steps:module_steps(
            *,
            responses:step_responses(*)
          )
        `)
        .eq('project_id', projectId)
        .eq('type', moduleType)
        .maybeSingle()

      if (error) {
        console.error('Error fetching module:', error)
        return null
      }

      return data
    } catch (err) {
      console.error('Error in getModuleByType:', err)
      return null
    }
  }

  /**
   * Get all modules for a project
   */
  async getModulesByProject(projectId: string): Promise<DbModule[]> {
    try {
      const { data, error } = await this.supabase
        .from('modules')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching modules:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Error in getModulesByProject:', err)
      return []
    }
  }

  /**
   * Get or create a module by type
   */
  async getOrCreateModule(projectId: string, moduleType: ModuleType, userId: string): Promise<DbModule & { steps: ModuleStep[] }> {
    return this.handleDatabaseOperation<DbModule & { steps: ModuleStep[] }>(
      async () => {
        // Try to get existing module
        const { data: existingModule, error: fetchError } = await this.supabase
          .from('modules')
          .select(`
            *,
            steps:module_steps(*)
          `)
          .eq('project_id', projectId)
          .eq('type', moduleType)
          .single()

        // If we found an existing module, return it
        if (!fetchError && existingModule) {
          return { data: existingModule, error: null }
        }

        // If module doesn't exist, create it
        const moduleConfig = MODULES_CONFIG.find(m => m.id === moduleType)
        if (!moduleConfig) {
          throw new Error(`Module config not found: ${moduleType}`)
        }

        // Create module
        const { data: moduleData, error: moduleError } = await this.supabase
          .from('modules')
          .insert({
            project_id: projectId,
            type: moduleType,
            title: moduleConfig.title,
            created_by: userId,
            status: 'draft',
            metadata: {}
          })
          .select()
          .single()

        if (moduleError || !moduleData) {
          throw moduleError || new Error('Failed to create module')
        }

        // Create steps based on config
        const steps = await Promise.all(
          moduleConfig.steps.map((stepConfig, index) => 
            this.stepService.createStep({
              module_id: moduleData.id,
              step_type: stepConfig.id,
              order_index: index,
              status: 'not_started',
              metadata: {}
            })
          )
        )

        // Return in the format expected by handleDatabaseOperation
        return {
          data: {
            ...moduleData,
            steps
          },
          error: null
        }
      },
      'getOrCreateModule'
    )
  }

  /**
   * Create a new module with steps based on config
   */
  async createModule(data: ModuleInsertData): Promise<DbModule & { steps: ModuleStep[] }> {
    return this.handleDatabaseOperation(
      async () => {
        // Get module config
        const moduleConfig = MODULES_CONFIG.find(m => m.id === data.type)
        if (!moduleConfig) throw new Error(`Module config not found: ${data.type}`)

        // Create module
        const { data: moduleData, error: moduleError } = await this.supabase
          .from('modules')
          .insert({
            ...data,
            title: moduleConfig.title,
            status: 'draft',
            metadata: data.metadata || {}
          })
          .select()
          .single()

        if (moduleError || !moduleData) throw moduleError || new Error('Failed to create module')

        // Create steps based on config
        const steps = await Promise.all(
          moduleConfig.steps.map((stepConfig, index) => 
            this.stepService.createStep({
              module_id: moduleData.id,
              step_type: stepConfig.id,
              order_index: index,
              status: 'not_started',
              metadata: {}
            })
          )
        )

        return {
          ...moduleData,
          steps
        }
      },
      'createModule'
    )
  }

  /**
   * Update a module
   */
  async updateModule(moduleId: string, data: ModuleUpdateData): Promise<DbModule> {
    return this.handleDatabaseOperation<DbModule>(
      async () => this.supabase
        .from('modules')
        .update({
          ...data,
            last_activity_at: new Date().toISOString()
          })
          .eq('id', moduleId)
          .select(`
            *,
            steps:module_steps(
              *,
              responses:step_responses(*)
            )
          `)
          .single()

        if (result.error) throw result.error
        if (!result.data) throw new Error('Failed to update module')
        return result.data
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
    await this.handleDatabaseOperation(
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