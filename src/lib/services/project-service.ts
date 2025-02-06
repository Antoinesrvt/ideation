import { Database } from '@/types/database'
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import { ModuleType } from '@/types/project'
import { MODULE_CONFIG } from '@/config/modules'
import { DbModuleResponse } from '@/types/module'
import { Module, ModuleUpdateData } from '@/types/module'


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
      .select(`
        *,
        modules (*)
      `)
      .eq('id', projectId)
      .single()

    if (projectError) throw projectError
    if (!project) throw new Error('Project not found')

    return project
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

    const { data: created, error } = await this.supabase
      .from('modules')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    if (!created) throw new Error('Failed to create module')

    return created
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


      // Perform the update
      const { data, error } = await this.supabase
        .from('modules')
        .update(updates)
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

      return data[0]
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
    response: DbModuleResponse
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
        last_updated: response.last_updated || new Date().toISOString()
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

  async getModuleWithResponses(moduleId: string): Promise<Module> {
    const { data: module, error: moduleError } = await this.supabase
      .from('modules')
      .select(`
        *,
        responses:module_responses (*)
      `)
      .eq('id', moduleId)
      .single()

    if (moduleError) throw moduleError
    if (!module) throw new Error('Module not found')

    return module
  }

  async ensureModuleExists(projectId: string, moduleType: string): Promise<Module> {
    console.log('🔍 Checking for existing module:', { projectId, moduleType })
    
    // First try to find existing module
    const { data: existing, error: findError } = await this.supabase
      .from('modules')
      .select()
      .eq('project_id', projectId)
      .eq('type', moduleType)
      .single()

    if (findError && findError.code !== 'PGRST116') { // Ignore not found error
      throw findError
    }

    if (existing) {
      console.log('✅ Found existing module:', existing)
      return existing
    }

    console.log('🆕 Creating new module...')
    // Create new module if none exists
    const { data: created, error: createError } = await this.supabase
      .from('modules')
      .insert({
        project_id: projectId,
        type: moduleType,
        title: moduleType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        completed: false,
        current_step_id: null,
        completed_step_ids: [],
        metadata: {}
      })
      .select()
      .single()

    if (createError) {
      console.error('❌ Error creating module:', createError)
      throw createError
    }
    if (!created) throw new Error('Failed to create module')

    console.log('✅ Created new module:', created)
    return created
  }
} 