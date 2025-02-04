import { Database } from '@/types/database'
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

export type Tables = Database['public']['Tables']
export type ProjectRow = Tables['projects']['Row']
export type ModuleRow = Tables['modules']['Row']
export type StepRow = Tables['steps']['Row']
export type AIInteractionRow = Tables['ai_interactions']['Row']

export type ProjectWithModules = ProjectRow & {
  modules: ModuleRow[]
}

export class ProjectService {
  constructor(private supabase: SupabaseClient<Database>) {}

  private handleError(error: PostgrestError) {
    console.error('Database error:', error)
    throw new Error(`Database error: ${error.message}`)
  }

  async getProjects() {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*, modules(*)')
      .order('created_at', { ascending: false })

    if (error) this.handleError(error)
    return (data ?? []) as ProjectWithModules[]
  }

  async getProject(id: string) {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*, modules(*)')
      .eq('id', id)
      .single()

    if (error) this.handleError(error)
    if (!data) throw new Error(`Project not found: ${id}`)
    return data as ProjectWithModules
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
      .select()
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
} 