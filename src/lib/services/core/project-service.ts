import { PostgrestError } from '@supabase/supabase-js';
import { BaseSupabaseService } from './base-supabase-service';
import type { Database } from '@/types/database';
import type { 
  ProjectRow,
  ProjectInsertData,
  ProjectUpdateData,
} from '@/types/project';

export class ProjectService extends BaseSupabaseService {
  protected handleError(error: PostgrestError | Error, context: string = ''): never {
    console.error(`Project Service Error in ${context}:`, error);
    throw error;
  }

  /**
   * Get all projects for the current user
   */
  async getProjects(): Promise<ProjectRow[]> {
    return this.handleDatabaseOperation(
      async () => {
        const userId = await this.getCurrentUserId();
        
        // First, get the project IDs that the user has access to as a team member
        const { data: teamMemberships } = await this.supabase
          .from('team_members')
          .select('project_id')
          .eq('user_id', userId);
        
        // Get the list of project IDs from team memberships - filter out any null values
        const teamProjectIds = teamMemberships && teamMemberships.length > 0
          ? teamMemberships
              .map(tm => tm.project_id)
              .filter((id): id is string => id !== null)
          : [];
        
        // Also get projects where the user is the owner
        const { data: ownedProjects } = await this.supabase
          .from('projects')
          .select('id')
          .eq('owner_id', userId);
        
        // Get the list of project IDs from owned projects
        const ownedProjectIds = ownedProjects && ownedProjects.length > 0
          ? ownedProjects.map(p => p.id).filter((id): id is string => id !== null)
          : [];
        
        // Combine both lists and remove duplicates
        const projectIds = Array.from(new Set([...teamProjectIds, ...ownedProjectIds]));
        
        if (projectIds.length === 0) {
          return { data: [], error: null };
        }
        
        // Then fetch those projects
        return this.supabase
          .from('projects')
          .select('*')
          .in('id', projectIds)
          .order('updated_at', { ascending: false });
      },
      'getProjects'
    );
  }

  /**
   * Get a single project by ID with all its data
   */
  async getProject(projectId: string): Promise<ProjectRow> {
    return this.handleDatabaseOperation(
      async () => {
        const userId = await this.getCurrentUserId();
        console.log('🔍 getProject called with projectId:', projectId);
        console.log('🔍 Current user ID:', userId);
        
        // First, check if the user has access to this project as a team member
        console.log('🔍 Checking team membership...');
        const { data: teamMember, error: teamError } = await this.supabase
          .from('team_members')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .maybeSingle();
        
        console.log('🔍 Team membership response:', JSON.stringify({
          error: teamError,
          data: teamMember,
          count: null,
          status: 200,
          statusText: ''
        }, null, 2));
        
        // If not a team member, check if the user is the project owner
        if (!teamMember) {
          console.log('❌ No team membership found');
          console.log('🔍 Checking project ownership...');
          
          const { data: project, error: projectOwnershipError } = await this.supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .eq('owner_id', userId)
            .maybeSingle();
            
          console.log('🔍 Project ownership check response:', JSON.stringify({
            error: projectOwnershipError,
            data: project,
            count: null,
            status: 200,
            statusText: ''
          }, null, 2));
          
          if (projectOwnershipError) {
            console.log('❌ Error checking project ownership:', projectOwnershipError);
            throw new Error('Error checking project access');
          }
          
          // If user is the owner, return the project
          if (project) {
            console.log('✅ User is the project owner, granting access');
            return { data: project, error: null };
          }
          
          // If user is neither a team member nor the owner, deny access
          console.log('❌ User is neither team member nor owner, access denied');
          throw new Error('Project not found or access denied');
        }
        
        // If user is a team member, fetch the project data
        console.log('✅ User is a team member, fetching project data');
        const { data: project, error: projectError } = await this.supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .maybeSingle();

        if (projectError) {
          console.log('❌ Error fetching project data:', projectError);
          throw new Error('Error fetching project data');
        }
        
        if (!project) {
          console.log('❌ Project not found with ID:', projectId);
          throw new Error('Project not found or access denied');
        }
        
        console.log('✅ Project data fetched successfully');
        return { data: project, error: null };
      },
      'getProject'
    );
  }

  /**
   * Create a new project
   */
  async createProject(data: ProjectInsertData): Promise<ProjectRow> {
    return this.handleDatabaseOperation(
      async () => {
        const userId = await this.getCurrentUserId();
        if (!userId) {
          throw new Error('No authenticated user found');
        }

        // Create the project with the current user as owner
        const projectData = {
          ...data,
          owner_id: userId,
          created_by: userId
        };

        const result = await this.supabase
          .from('projects')
          .insert(projectData)
          .select()
          .single();

        if (!result.data) {
          throw new Error('Failed to create project');
        }

        // Add the creator as an admin team member
        const teamMember = {
          project_id: result.data.id,
          user_id: userId,
          role: 'admin',
          created_by: userId,
          name: 'Project Admin'
        };

        await this.supabase
          .from('team_members')
          .insert(teamMember);

        return result;
      },
      'createProject'
    );
  }

  /**
   * Update a project
   */
  async updateProject(projectId: string, data: ProjectUpdateData): Promise<ProjectRow> {
    return this.handleDatabaseOperation(
      async () => {
        const userId = await this.getCurrentUserId();
        
        // First check if user is a team member
        const { data: teamMember } = await this.supabase
          .from('team_members')
          .select('role')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .maybeSingle();
        
        let hasAccess = !!teamMember;
        
        // If not a team member, check if user is the project owner
        if (!hasAccess) {
          const { data: project } = await this.supabase
            .from('projects')
            .select('owner_id')
            .eq('id', projectId)
            .eq('owner_id', userId)
            .maybeSingle();
          
          hasAccess = !!project;
        }
        
        if (!hasAccess) {
          throw new Error('Access denied');
        }

        // Then update the project
        const { data: updatedProject, error: updateError } = await this.supabase
          .from('projects')
          .update(data)
          .eq('id', projectId)
          .select()
          .maybeSingle();
        
        if (updateError || !updatedProject) {
          throw new Error('Failed to update project');
        }
        
        return { data: updatedProject, error: null };
      },
      'updateProject'
    );
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    await this.handleDatabaseOperation(
      async () => {
        const userId = await this.getCurrentUserId();
        
        // First check if user is an admin team member
        const { data: adminTeamMember } = await this.supabase
          .from('team_members')
          .select('role')
          .eq('project_id', projectId)
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();
        
        let hasAdminAccess = !!adminTeamMember;
        
        // If not an admin team member, check if user is the project owner
        if (!hasAdminAccess) {
          const { data: ownedProject } = await this.supabase
            .from('projects')
            .select('owner_id')
            .eq('id', projectId)
            .eq('owner_id', userId)
            .maybeSingle();
          
          hasAdminAccess = !!ownedProject;
        }
        
        if (!hasAdminAccess) {
          throw new Error('Access denied');
        }

        // Then delete the project
        const { error: deleteError } = await this.supabase
          .from('projects')
          .delete()
          .eq('id', projectId);
        
        if (deleteError) {
          throw new Error('Failed to delete project');
        }
        
        return { data: null, error: null };
      },
      'deleteProject'
    );
  }

  /**
   * Check if user has access to a project
   */
  async hasProjectAccess(projectId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      
      // First check if user is a team member
      const { data: teamMember } = await this.supabase
        .from('team_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (teamMember) {
        return true;
      }
      
      // If not a team member, check if user is the project owner
      const { data: project } = await this.supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .eq('owner_id', userId)
        .maybeSingle();
      
      return !!project;
    } catch (error) {
      console.error('Error checking project access:', error);
      return false;
    }
  }

  /**
   * Get current user ID
   */
  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) {
      throw new Error('No authenticated user found');
    }
    return user.id;
  }
} 