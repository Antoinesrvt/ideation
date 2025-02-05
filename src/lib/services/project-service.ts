import { Database } from '@/types/database'
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js'
import { ModuleType } from '@/types/project'
import { MODULE_CONFIG } from '@/config/modules'
import { ModuleResponse, prepareModuleResponse } from '@/types/module'

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

  async getProject(id: string) {
    console.log('Fetching project from database:', {
      id,
      timestamp: new Date().toISOString()
    })

    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        modules(
          *,
          responses:module_responses(*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching project:', {
        id,
        error,
        timestamp: new Date().toISOString()
      })
      this.handleError(error, `getProject(${id})`)
    }

    if (!data) {
      console.error('Project not found:', {
        id,
        timestamp: new Date().toISOString()
      })
      throw new Error(`Project not found: ${id}`)
    }

    console.log('Project data retrieved:', {
      id,
      hasModules: data.modules ? data.modules.length > 0 : false,
      timestamp: new Date().toISOString()
    })

    return {
      ...data,
      modules: data.modules || []
    } as ProjectWithModules
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

  async updateProject(
    id: string,
    data: Tables['projects']['Update']
  ): Promise<ProjectRow> {
    const { data: project, error } = await this.supabase
      .from('projects')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) this.handleError(error)
    if (!project) throw new Error(`Project not found: ${id}`)
    return project
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) this.handleError(error)
  }

  async createModule(
    data: Tables['modules']['Insert']
  ): Promise<ModuleRow> {
    const { data: module, error } = await this.supabase
      .from('modules')
      .insert(data)
      .select()
      .single()

    if (error) this.handleError(error)
    if (!module) throw new Error('Failed to create module')
    return module
  }

  async updateModule(
    id: string,
    data: Tables['modules']['Update']
  ): Promise<ModuleRow> {
    const { data: module, error } = await this.supabase
      .from('modules')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        responses:module_responses(*)
      `)
      .single()

    if (error) this.handleError(error)
    if (!module) throw new Error(`Module not found: ${id}`)
    return module
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
    console.log('Saving module response:', {
      moduleId,
      stepId,
      timestamp: new Date().toISOString()
    })

    const { data, error } = await this.supabase
      .from('module_responses')
      .upsert({
        module_id: moduleId,
        step_id: stepId,
        content: response.content,
        last_updated: response.lastUpdated
      }, {
        onConflict: 'module_id,step_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error in saveModuleResponse:', {
        error,
        moduleId,
        stepId,
        timestamp: new Date().toISOString()
      })
      this.handleError(error, `saveModuleResponse(${moduleId}, ${stepId})`)
    }

    if (!data) {
      throw new Error('Failed to save module response')
    }

    console.log('Module response saved successfully:', {
      moduleId,
      stepId,
      timestamp: new Date().toISOString()
    })

    return data
  }

  async ensureModuleExists(projectId: string, moduleType: ModuleType): Promise<ModuleRow> {
    console.log('Ensuring module exists:', {
      projectId,
      moduleType,
      timestamp: new Date().toISOString()
    })

    // First try to find existing module
    const { data: existingModules, error: findError } = await this.supabase
      .from('modules')
      .select(`
        *,
        responses:module_responses(*)
      `)
      .eq('project_id', projectId)
      .eq('type', moduleType)
      .limit(1)

    if (findError) {
      this.handleError(findError, `ensureModuleExists.find(${projectId}, ${moduleType})`)
    }

    // If module exists, return it
    if (existingModules && existingModules.length > 0) {
      return existingModules[0]
    }

    // Create new module
    const { data: newModule, error: createError } = await this.supabase
      .from('modules')
      .insert({
        project_id: projectId,
        type: moduleType,
        title: moduleType,
        completed: false,
        current_step_id: null,
        completed_step_ids: [],
        metadata: {} // Keep metadata for additional flexible data
      })
      .select(`
        *,
        responses:module_responses(*)
      `)
      .single()

    if (createError) {
      console.error('Error creating module:', {
        error: createError,
        projectId,
        moduleType,
        timestamp: new Date().toISOString()
      })
      this.handleError(createError, `ensureModuleExists.create(${projectId}, ${moduleType})`)
    }

    if (!newModule) {
      throw new Error('Failed to create module')
    }

    console.log('Created new module:', {
      moduleId: newModule.id,
      type: moduleType,
      timestamp: new Date().toISOString()
    })

    return newModule
  }
} 