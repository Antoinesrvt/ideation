import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  TeamMember,
  TeamTask,
  TeamResponsibilityMatrix,
  Insert,
  Update,
  RoleTemplate,
  ProjectRole
} from '@/store/types';


export interface TeamData {
  members: TeamMember[];
  tasks: TeamTask[];
  responsibilities: TeamResponsibilityMatrix[];
  roleTemplates?: RoleTemplate[];
  projectRoles: ProjectRole[];
}

export class TeamService {
  constructor(private supabase: SupabaseClient) {}

  protected handleError(error: PostgrestError | Error, context: string = ''): never {
    const errorMessage = error instanceof PostgrestError 
      ? `Database error: ${error.details} (${error.code})`
      : error.message;
    
    console.error(`Team Service Error (${context}):`, errorMessage);
    throw new Error(errorMessage);
  }

  // === Team Members ===
  async getMembers(projectId: string): Promise<TeamMember[]> {
    try {
      const { data, error } = await this.supabase
        .from('team_members')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'getMembers');
      return data || [];
    } catch (error) {
      this.handleError(error as Error, 'getMembers');
    }
  }

  async addMember(projectId: string, data: Insert<'team_members'>): Promise<TeamMember> {
    try {
      const { data: member, error } = await this.supabase
        .from('team_members')
        .insert({ ...data, project_id: projectId })
        .select()
        .single();

      if (error) this.handleError(error, 'addMember');
      return member;
    } catch (error) {
      this.handleError(error as Error, 'addMember');
    }
  }

  async updateMember(id: string, data: Update<'team_members'>): Promise<TeamMember> {
    try {
      const { data: member, error } = await this.supabase
        .from('team_members')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error, 'updateMember');
      return member;
    } catch (error) {
      this.handleError(error as Error, 'updateMember');
    }
  }

  async deleteMember(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) this.handleError(error, 'deleteMember');
    } catch (error) {
      this.handleError(error as Error, 'deleteMember');
    }
  }

  // === Team Tasks ===
  async getTasks(projectId: string): Promise<TeamTask[]> {
    try {
      const { data, error } = await this.supabase
        .from('team_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'getTasks');
      return data || [];
    } catch (error) {
      this.handleError(error as Error, 'getTasks');
    }
  }

  async addTask(projectId: string, data: Insert<'team_tasks'>): Promise<TeamTask> {
    try {
      const { data: task, error } = await this.supabase
        .from('team_tasks')
        .insert({ ...data, project_id: projectId })
        .select()
        .single();

      if (error) this.handleError(error, 'addTask');
      return task;
    } catch (error) {
      this.handleError(error as Error, 'addTask');
    }
  }

  async updateTask(id: string, data: Update<'team_tasks'>): Promise<TeamTask> {
    try {
      const { data: task, error } = await this.supabase
        .from('team_tasks')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error, 'updateTask');
      return task;
    } catch (error) {
      this.handleError(error as Error, 'updateTask');
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('team_tasks')
        .delete()
        .eq('id', id);

      if (error) this.handleError(error, 'deleteTask');
    } catch (error) {
      this.handleError(error as Error, 'deleteTask');
    }
  }

  // === Team Responsibility Matrix ===
  async getResponsibilities(projectId: string): Promise<TeamResponsibilityMatrix[]> {
    try {
      const { data, error } = await this.supabase
        .from('team_responsibility_matrix')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'getResponsibilities');
      return data || [];
    } catch (error) {
      this.handleError(error as Error, 'getResponsibilities');
    }
  }

  async addResponsibility(projectId: string, data: Insert<'team_responsibility_matrix'>): Promise<TeamResponsibilityMatrix> {
    try {
      const { data: responsibility, error } = await this.supabase
        .from('team_responsibility_matrix')
        .insert({ ...data, project_id: projectId })
        .select()
        .single();

      if (error) this.handleError(error, 'addResponsibility');
      return responsibility;
    } catch (error) {
      this.handleError(error as Error, 'addResponsibility');
    }
  }

  async updateResponsibility(id: string, data: Update<'team_responsibility_matrix'>): Promise<TeamResponsibilityMatrix> {
    try {
      const { data: responsibility, error } = await this.supabase
        .from('team_responsibility_matrix')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error, 'updateResponsibility');
      return responsibility;
    } catch (error) {
      this.handleError(error as Error, 'updateResponsibility');
    }
  }

  async deleteResponsibility(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('team_responsibility_matrix')
        .delete()
        .eq('id', id);

      if (error) this.handleError(error, 'deleteResponsibility');
    } catch (error) {
      this.handleError(error as Error, 'deleteResponsibility');
    }
  }

  // === Role Templates ===
  async getRoleTemplates(): Promise<RoleTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from('role_templates')
        .select('*')
        .order('title', { ascending: true });

      if (error) this.handleError(error, 'getRoleTemplates');
      return data || [];
    } catch (error) {
      this.handleError(error as Error, 'getRoleTemplates');
    }
  }

  async addRoleTemplate(data: Insert<'role_templates'>): Promise<RoleTemplate> {
    try {
      const { data: newTemplate, error } = await this.supabase
        .from('role_templates')
        .insert(data)
        .select('*')
        .single();

      if (error) this.handleError(error, 'addRoleTemplate');
      return newTemplate;
    } catch (error) {
      this.handleError(error as Error, 'addRoleTemplate');
    }
  }

  async updateRoleTemplate(id: string, data: Update<'role_templates'>): Promise<RoleTemplate> {
    try {
      const { data: updatedTemplate, error } = await this.supabase
        .from('role_templates')
        .update(data)
        .eq('id', id)
        .select('*')
        .single();

      if (error) this.handleError(error, 'updateRoleTemplate');
      return updatedTemplate;
    } catch (error) {
      this.handleError(error as Error, 'updateRoleTemplate');
    }
  }

  async deleteRoleTemplate(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('role_templates')
        .delete()
        .eq('id', id);

      if (error) this.handleError(error, 'deleteRoleTemplate');
    } catch (error) {
      this.handleError(error as Error, 'deleteRoleTemplate');
    }
  }

  // === Project Roles ===
  async getProjectRoles(projectId: string): Promise<ProjectRole[]> {
    try {
      const { data, error } = await this.supabase
        .from('project_roles')
        .select('*')
        .eq('project_id', projectId)
        .order('title', { ascending: true });

      if (error) this.handleError(error, 'getProjectRoles');
      return data || [];
    } catch (error) {
      this.handleError(error as Error, 'getProjectRoles');
    }
  }

  async addProjectRole(projectId: string, data: Insert<'project_roles'>): Promise<ProjectRole> {
    try {
      // Ensure project_id is set
      const roleData = {
        ...data,
        project_id: projectId
      };

      const { data: newRole, error } = await this.supabase
        .from('project_roles')
        .insert(roleData)
        .select('*')
        .single();

      if (error) this.handleError(error, 'addProjectRole');
      return newRole;
    } catch (error) {
      this.handleError(error as Error, 'addProjectRole');
    }
  }

  async updateProjectRole(id: string, data: Update<'project_roles'>): Promise<ProjectRole> {
    try {
      const { data: updatedRole, error } = await this.supabase
        .from('project_roles')
        .update(data)
        .eq('id', id)
        .select('*')
        .single();

      if (error) this.handleError(error, 'updateProjectRole');
      return updatedRole;
    } catch (error) {
      this.handleError(error as Error, 'updateProjectRole');
    }
  }

  async deleteProjectRole(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('project_roles')
        .delete()
        .eq('id', id);

      if (error) this.handleError(error, 'deleteProjectRole');
    } catch (error) {
      this.handleError(error as Error, 'deleteProjectRole');
    }
  }

  // === Create Project Role from Template ===
  async createRoleFromTemplate(projectId: string, templateId: string, customizations?: Partial<Omit<ProjectRole, 'id' | 'project_id' | 'template_id'>>): Promise<ProjectRole> {
    try {
      // First, get the template
      const { data: template, error: templateError } = await this.supabase
        .from('role_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) this.handleError(templateError, 'createRoleFromTemplate - fetch template');

      // Create the project role
      const roleData = {
        project_id: projectId,
        template_id: templateId,
        title: customizations?.title || template.title,
        description: customizations?.description || template.description,
        responsibilities: customizations?.responsibilities || template.responsibilities,
        required_skills: customizations?.required_skills || template.required_skills
      };

      const { data: newRole, error } = await this.supabase
        .from('project_roles')
        .insert(roleData)
        .select('*')
        .single();

      if (error) this.handleError(error, 'createRoleFromTemplate - create role');
      return newRole;
    } catch (error) {
      this.handleError(error as Error, 'createRoleFromTemplate');
    }
  }

  // === Batch Operations ===
  async getAllTeamData(projectId: string): Promise<TeamData> {
    try {
      const [members, tasks, responsibilities, projectRoles, roleTemplates] = await Promise.all([
        this.getMembers(projectId),
        this.getTasks(projectId),
        this.getResponsibilities(projectId),
        this.getProjectRoles(projectId),
        this.getRoleTemplates()
      ]);

      return {
        members,
        tasks,
        responsibilities,
        projectRoles,
        roleTemplates
      };
    } catch (error) {
      this.handleError(error as Error, 'getAllTeamData');
    }
  }
} 