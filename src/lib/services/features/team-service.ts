import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  TeamMember,
  TeamTask,
  TeamResponsibilityMatrix
} from '@/store/types';

export interface TeamData {
  members: TeamMember[];
  tasks: TeamTask[];
  responsibilities: TeamResponsibilityMatrix[];
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

  async addMember(projectId: string, data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember> {
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

  async updateMember(id: string, data: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>>): Promise<TeamMember> {
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

  async addTask(projectId: string, data: Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>): Promise<TeamTask> {
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

  async updateTask(id: string, data: Partial<Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>>): Promise<TeamTask> {
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

  async addResponsibility(projectId: string, data: Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>): Promise<TeamResponsibilityMatrix> {
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

  async updateResponsibility(id: string, data: Partial<Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>>): Promise<TeamResponsibilityMatrix> {
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

  // === Batch Operations ===
  async getAllTeamData(projectId: string): Promise<TeamData> {
    try {
      const [members, tasks, responsibilities] = await Promise.all([
        this.getMembers(projectId),
        this.getTasks(projectId),
        this.getResponsibilities(projectId)
      ]);

      return {
        members,
        tasks,
        responsibilities
      };
    } catch (error) {
      this.handleError(error as Error, 'getAllTeamData');
    }
  }
} 