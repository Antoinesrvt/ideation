import { BaseSupabaseService } from './base-supabase-service'
import { ModuleService } from './module-service'
import { 
  ProjectRow, 
  ProjectWithModules,
  ProjectMember,
  ProjectInsertData,
  ProjectUpdateData,
  MemberRole,
  ModuleType
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
        const { data: { user }, error: authError } = await this.supabase.auth.getUser()
        if (authError) throw authError
        if (!user) throw new Error('No authenticated user')

        // First get all projects where user is creator
        const { data: createdProjects, error: createdError } = await this.supabase
          .from('projects')
          .select('*')
          .eq('created_by', user.id)

        if (createdError) throw createdError

        // Then get all projects where user is a member
        const { data: memberProjects, error: memberError } = await this.supabase
          .from('projects')
          .select('*, project_members(*)')
          .eq('project_members.user_id', user.id)

        if (memberError) throw memberError

        // Combine and deduplicate projects
        const allProjects = [...(createdProjects || []), ...(memberProjects || [])]
        const uniqueProjects = Array.from(new Map(allProjects.map(p => [p.id, p])).values())

        // Sort by updated_at and return as PostgrestResponse
        return {
          data: uniqueProjects.sort((a, b) => 
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          ),
          error: null
        } as PostgrestResponse<ProjectRow>
      },
      'getProjects'
    )
  }

  /**
   * Get a single project with basic information
   */
  async getProject(projectId: string): Promise<ProjectRow> {
    return this.handleDatabaseOperation<ProjectRow>(
      async () => {
        const result = await this.supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()

        return result as PostgrestSingleResponse<ProjectRow>
      },
      'getProject'
    )
  }

  /**
   * Get project with its modules (basic info only)
   */
  async getProjectWithModules(projectId: string) {
    return this.handleDatabaseOperation(
      async () => {
        const result = await this.supabase
          .from('projects')
          .select(`
            *,
            modules:modules(
              id,
              title,
              type,
              status,
              created_at,
              updated_at
            )
          `)
          .eq('id', projectId)
          .single()

        return result
      },
      'getProjectWithModules'
    )
  }

  /**
   * Get project members with their profiles
   */
  async getProjectMembersWithProfiles(projectId: string) {
    return this.handleDatabaseOperation(
      async () => {
        const result = await this.supabase
          .from('project_members')
          .select(`
            *,
            profile:profiles(
              full_name,
              avatar_url
            )
          `)
          .eq('project_id', projectId)

        return result
      },
      'getProjectMembersWithProfiles'
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

  // Module listing only - detailed operations should go through ModuleService
  async getProjectModules(projectId: string) {
    return this.moduleService.getModulesByProject(projectId)
  }

  async getOrCreateModule(projectId: string, moduleType: ModuleType, userId: string) {
    return this.moduleService.getOrCreateModule(projectId, moduleType, userId)
  }

  async createProjectModule(data: ModuleInsertData) {
    return this.moduleService.createModule(data)
  }

  async updateProjectModule(moduleId: string, data: ModuleUpdateData) {
    return this.moduleService.updateModule(moduleId, data)
  }
} 