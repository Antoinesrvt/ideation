import { Database } from '@/types/database'
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import { ModuleType } from '@/types/project'
import { MODULE_CONFIG } from '@/config/modules'
import { ModuleResponse, prepareModuleResponse } from '@/types/module'
import { Module, ModuleUpdateData } from '@/types/module'
import { transformDatabaseModule, transformModuleForDatabase, transformModuleUpdates } from '@/lib/transformers/module'

export type Tables = Database['public']['Tables']
export type ProjectRow = Tables['projects']['Row']
export type ModuleRow = Tables['modules']['Row']
export type ModuleResponseRow = Tables['module_responses']['Row']
export type StepRow = Tables['steps']['Row']
export type AIInteractionRow = Tables['ai_interactions']['Row']

export type ProjectWithModules = ProjectRow & {
  modules: (ModuleRow & {
    responses?: ModuleResponseRow[]
  })[]
}

export class ProjectService {
  constructor(private supabase: SupabaseClient<Database>) {}

  private handleError(error: PostgrestError, context: string = '') {
    console.error('Database error:', {
      error,
      context,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      timestamp: new Date().toISOString()
    })
    throw new Error(`Database error: ${error.message}`)
  }

  async getProjects() {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) this.handleError(error, 'getProjects')
    return (data ?? []) as ProjectRow[]
  }

  async getProject(projectId: string): Promise<ProjectRow & { modules: Module[] }> {
    const { data: project, error: projectError } = await this.supabase
      .from('projects')
      .select('*, modules(*)')
      .eq('id', projectId)
      .single()

    if (projectError) throw projectError
    if (!project) throw new Error('Project not found')

    // Transform modules
    const modules = (project.modules as Tables['modules']['Row'][]).map(transformDatabaseModule)

    return {
      ...project,
      modules
    }
  }

  async createProject(
    data: Tables['projects']['Insert']
  ): Promise<ProjectRow> {
    const { data: project, error } = await this.supabase
      .from('projects')
      .insert(data)
      .select()
      .single()

    if (error) this.handleError(error)
    if (!project) throw new Error('Failed to create project')
    return project
  }

  async updateProject(projectId: string, updates: Partial<ProjectRow>): Promise<ProjectRow> {
    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to update project')

    return data
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) this.handleError(error)
  }

  async createModule(data: Omit<Module, 'id' | 'created_at' | 'updated_at'>): Promise<Module> {
    const dbData = transformModuleForDatabase(data)

    const { data: created, error } = await this.supabase
      .from('modules')
      .insert(dbData)
      .select()
      .single()

    if (error) throw error
    if (!created) throw new Error('Failed to create module')

    return transformDatabaseModule(created)
  }

  async updateModule(moduleId: string, updates: ModuleUpdateData): Promise<Module> {
    try {
      // First verify the module exists
      const { data: existing, error: checkError } = await this.supabase
        .from('modules')
        .select('id')
        .eq('id', moduleId)
        .maybeSingle()

      if (checkError) throw checkError
      if (!existing) throw new Error(`Module with id ${moduleId} not found`)

      // Transform updates using the specific update transformer
      const dbUpdates = transformModuleUpdates(updates)

      // Perform the update
      const { data, error } = await this.supabase
        .from('modules')
        .update(dbUpdates)
        .eq('id', moduleId)
        .select()

      if (error) {
        console.error('Error updating module:', {
          moduleId,
          updates,
          error,
          timestamp: new Date().toISOString()
        })
        throw error
      }

      if (!data || data.length === 0) {
        throw new Error('Failed to update module: No data returned')
      }

      // Transform the response back to our frontend type
      return transformDatabaseModule(data[0])
    } catch (error) {
      console.error('Error in updateModule:', error)
      throw error instanceof Error 
        ? error 
        : new Error('An unknown error occurred while updating the module')
    }
  }

  async createStep(
    data: Tables['steps']['Insert']
  ): Promise<StepRow> {
    const { data: step, error } = await this.supabase
      .from('steps')
      .insert(data)
      .select()
      .single()

    if (error) this.handleError(error)
    if (!step) throw new Error('Failed to create step')
    return step
  }

  async updateStep(
    id: string,
    data: Tables['steps']['Update']
  ): Promise<StepRow> {
    const { data: step, error } = await this.supabase
      .from('steps')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) this.handleError(error)
    if (!step) throw new Error(`Step not found: ${id}`)
    return step
  }

  async logAIInteraction(
    data: Tables['ai_interactions']['Insert']
  ): Promise<AIInteractionRow> {
    const { data: interaction, error } = await this.supabase
      .from('ai_interactions')
      .insert(data)
      .select()
      .single()

    if (error) this.handleError(error)
    if (!interaction) throw new Error('Failed to log AI interaction')
    return interaction
  }

  async getModuleResponses(moduleId: string): Promise<ModuleResponseRow[]> {
    const { data, error } = await this.supabase
      .from('module_responses')
      .select('*')
      .eq('module_id', moduleId)

    if (error) this.handleError(error, `getModuleResponses(${moduleId})`)
    return data || []
  }

  async saveModuleResponse(
    moduleId: string,
    stepId: string,
    response: ModuleResponse
  ): Promise<ModuleResponseRow> {
    try {
      // Verify the module exists
      const { data: module, error: moduleError } = await this.supabase
        .from('modules')
        .select('id')
        .eq('id', moduleId)
        .maybeSingle()

      if (moduleError) throw moduleError
      if (!module) throw new Error(`Module with id ${moduleId} not found`)

      // Prepare the response data
      const responseData = {
        module_id: moduleId,
        step_id: stepId,
        content: response.content,
        last_updated: response.lastUpdated || new Date().toISOString()
      }

      // Check if a response already exists
      const { data: existing, error: checkError } = await this.supabase
        .from('module_responses')
        .select('id')
        .eq('module_id', moduleId)
        .eq('step_id', stepId)
        .maybeSingle()

      if (checkError) throw checkError

      let result
      if (existing) {
        // Update existing response
        const { data, error } = await this.supabase
          .from('module_responses')
          .update(responseData)
          .eq('id', existing.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Insert new response
        const { data, error } = await this.supabase
          .from('module_responses')
          .insert(responseData)
          .select()
          .single()

        if (error) throw error
        result = data
      }

      if (!result) {
        throw new Error('Failed to save module response: No data returned')
      }

      return result
    } catch (error) {
      console.error('Error in saveModuleResponse:', error)
      throw error instanceof Error 
        ? error 
        : new Error('An unknown error occurred while saving the module response')
    }
  }

  async ensureModuleExists(projectId: string, moduleType: string): Promise<Module> {
    // First try to find existing module
    const { data: existing } = await this.supabase
      .from('modules')
      .select()
      .eq('project_id', projectId)
      .eq('type', moduleType)
      .single()

    if (existing) {
      return transformDatabaseModule(existing)
    }

    // Create new module if none exists
    const { data: created, error } = await this.supabase
      .from('modules')
      .insert({
        project_id: projectId,
        type: moduleType,
        title: moduleType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        completed: false
      })
      .select()
      .single()

    if (error) throw error
    if (!created) throw new Error('Failed to create module')

    return transformDatabaseModule(created)
  }
} 