import { BaseSupabaseService } from './base-supabase-service'
import { ModuleService } from './module-service'
import { 
  ProjectRow, 
  ProjectWithModules,
  ProjectMember,
  ProjectInsertData,
  ProjectUpdateData,
  MemberRole
} from '@/types/project'
import { ModuleInsertData, ModuleUpdateData } from '@/types/module'
import { PostgrestSingleResponse, PostgrestResponse, PostgrestError } from '@supabase/supabase-js'

export class ProjectService extends BaseSupabaseService {
  private moduleService: ModuleService

  constructor(supabase: any) {
    super(supabase)
    this.moduleService = new ModuleService(supabase)
  }

  protected handleError(error: PostgrestError | Error, context: string = ''): never {
    console.error('Project service error:', error, context)
    throw error
  }

  /**
   * Get all projects for current user (including those where they are a member)
   */
  async getProjects(): Promise<ProjectRow[]> {
    return this.handleDatabaseOperation<ProjectRow[]>(
      async () => {
        const { data: { user } } = await this.supabase.auth.getUser()
        if (!user) throw new Error('No authenticated user')

        const result = await this.supabase
          .from('projects')
          .select('*')
          .or(`created_by.eq.${user.id},id.in.(${
            this.supabase
              .from('project_members')
              .select('project_id')
              .eq('user_id', user.id)
              .toString()
          })`)
          .order('updated_at', { ascending: false })

        return result as PostgrestResponse<ProjectRow>
      },
      'getProjects'
    )
  }

  /**
   * Get a single project with its modules and members
   */
  async getProject(projectId: string): Promise<ProjectWithModules> {
    return this.handleDatabaseOperation<ProjectWithModules>(
      async () => {
        const result = await this.supabase
          .from('projects')
          .select(`
            *,
            modules:modules(
              *,
              steps:module_steps(
                *,
                responses:step_responses(*)
              )
            ),
            members:project_members(
              *,
              profile:profiles(full_name, avatar_url)
            )
          `)
          .eq('id', projectId)
          .single()

        return result as PostgrestSingleResponse<ProjectWithModules>
      },
      'getProject'
    )
  }

  /**
   * Create a new project
   */
  async createProject(data: ProjectInsertData): Promise<ProjectRow> {
    return this.handleDatabaseOperation<ProjectRow>(
      async () => {
        const { data: { user } } = await this.supabase.auth.getUser()
        if (!user) throw new Error('No authenticated user')

        const result = await this.supabase
          .from('projects')
          .insert({
            ...data,
            created_by: user.id,
            metadata: data.metadata || {}
          })
          .select()
          .single()

        return result as PostgrestSingleResponse<ProjectRow>
      },
      'createProject'
    )
  }

  /**
   * Update a project
   */
  async updateProject(projectId: string, data: ProjectUpdateData): Promise<ProjectRow> {
    return this.handleDatabaseOperation<ProjectRow>(
      async () => {
        const result = await this.supabase
          .from('projects')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', projectId)
          .select()
          .single()

        return result as PostgrestSingleResponse<ProjectRow>
      },
      'updateProject'
    )
  }

  /**
   * Delete a project and all related data
   */
  async deleteProject(projectId: string): Promise<void> {
    await this.handleDatabaseOperation<void>(
      async () => {
        const result = await this.supabase
          .from('projects')
          .delete()
          .eq('id', projectId)
        return { data: null, error: result.error }
      },
      'deleteProject'
    )
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: string): Promise<ProjectMember[]> {
    return this.handleDatabaseOperation<ProjectMember[]>(
      async () => {
        const result = await this.supabase
          .from('project_members')
          .select(`
            *,
            profile:profiles(full_name, avatar_url)
          `)
          .eq('project_id', projectId)

        return result as PostgrestResponse<ProjectMember>
      },
      'getProjectMembers'
    )
  }

  /**
   * Add project member
   */
  async addProjectMember(projectId: string, userId: string, role: MemberRole): Promise<ProjectMember> {
    return this.handleDatabaseOperation<ProjectMember>(
      async () => {
        const result = await this.supabase
          .from('project_members')
          .insert({
            project_id: projectId,
            user_id: userId,
            role
          })
          .select(`
            *,
            profile:profiles(full_name, avatar_url)
          `)
          .single()

        return result as PostgrestSingleResponse<ProjectMember>
      },
      'addProjectMember'
    )
  }

  /**
   * Update project member role
   */
  async updateProjectMemberRole(
    projectId: string,
    userId: string,
    role: MemberRole
  ): Promise<ProjectMember> {
    return this.handleDatabaseOperation<ProjectMember>(
      async () => {
        const result = await this.supabase
          .from('project_members')
          .update({ role })
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .select(`
            *,
            profile:profiles(full_name, avatar_url)
          `)
          .single()

        return result as PostgrestSingleResponse<ProjectMember>
      },
      'updateProjectMemberRole'
    )
  }

  /**
   * Remove project member
   */
  async removeProjectMember(projectId: string, userId: string): Promise<void> {
    await this.handleDatabaseOperation<void>(
      async () => {
        const result = await this.supabase
          .from('project_members')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', userId)

        return { data: null, error: result.error }
      },
      'removeProjectMember'
    )
  }

  // Module-related methods that use ModuleService
  async getProjectModules(projectId: string) {
    return this.moduleService.getModulesByProject(projectId)
  }

  async createProjectModule(data: ModuleInsertData) {
    return this.moduleService.createModule(data)
  }

  async updateProjectModule(moduleId: string, data: ModuleUpdateData) {
    return this.moduleService.updateModule(moduleId, data)
  }
} 