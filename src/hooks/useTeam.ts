import { useFeatureData } from './use-feature-data';
import { useCallback } from 'react';
import { Database } from '@/types/database';

// Database types for team tables
type TeamMember = Database['public']['Tables']['team_members']['Row'];
type TeamTask = Database['public']['Tables']['team_tasks']['Row'];
type TeamResponsibilityMatrix = Database['public']['Tables']['team_responsibility_matrix']['Row'];

// Combined type for all team data
type TeamData = {
  members: TeamMember[];
  tasks: TeamTask[];
  responsibilities: TeamResponsibilityMatrix[];
};

// Base type for any team item
type BaseItem = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  project_id: string | null;
  created_by: string | null;
};

// Type for any team item
type TeamItem = BaseItem & (
  | Omit<TeamMember, keyof BaseItem>
  | Omit<TeamTask, keyof BaseItem>
  | Omit<TeamResponsibilityMatrix, keyof BaseItem>
);

/**
 * Hook for managing team data in a project
 * @param projectId - The ID of the current project
 */
export function useTeam(projectId: string | undefined) {
  const featureData = useFeatureData<TeamData, TeamItem>(
    projectId,
    'team',
    {
      defaultData: {
        members: [],
        tasks: [],
        responsibilities: []
      }
    }
  );

  // ===== Team Members =====
  const addTeamMember = useCallback(async (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...member,
      project_id: projectId,
      created_at: null,
      updated_at: null
    } as TeamItem, 'members');
  }, [featureData, projectId]);

  const updateTeamMember = useCallback((id: string, data: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data as Partial<TeamItem>, 'members');
  }, [featureData]);

  const deleteTeamMember = useCallback((id: string) => {
    return featureData.deleteItem(id, 'members');
  }, [featureData]);

  // ===== Team Tasks =====
  const addTeamTask = useCallback(async (task: Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...task,
      project_id: projectId,
      created_at: null,
      updated_at: null
    } as TeamItem, 'tasks');
  }, [featureData, projectId]);

  const updateTeamTask = useCallback((id: string, data: Partial<Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data as Partial<TeamItem>, 'tasks');
  }, [featureData]);

  const deleteTeamTask = useCallback((id: string) => {
    return featureData.deleteItem(id, 'tasks');
  }, [featureData]);

  // ===== Team Responsibility Matrix =====
  const addTeamResponsibility = useCallback(async (responsibility: Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...responsibility,
      project_id: projectId,
      created_at: null,
      updated_at: null
    } as TeamItem, 'responsibilities');
  }, [featureData, projectId]);

  const updateTeamResponsibility = useCallback((id: string, data: Partial<Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>>) => {
    return featureData.updateItem(id, data as Partial<TeamItem>, 'responsibilities');
  }, [featureData]);

  const deleteTeamResponsibility = useCallback((id: string) => {
    return featureData.deleteItem(id, 'responsibilities');
  }, [featureData]);

  // Advanced operations
  const getTeamStats = useCallback(() => {
    const { members, tasks } = featureData.data || { members: [], tasks: [] };
    
    const totalMembers = members.length;
    const totalTasks = tasks.length;
    const tasksPerMember = totalMembers > 0 ? totalTasks / totalMembers : 0;
    
    const tasksByStatus = tasks.reduce((acc, task) => {
      const status = task.status || 'not-started';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalMembers,
      totalTasks,
      tasksPerMember,
      tasksByStatus
    };
  }, [featureData.data]);

  const getTeamMemberTasks = useCallback((memberId: string) => {
    const { tasks } = featureData.data || { tasks: [] };
    return tasks.filter(task => task.team_member_id === memberId);
  }, [featureData.data]);

  return {
    // Raw data
    data: featureData.data,
    isLoading: featureData.isLoading,
    error: featureData.error,
    
    // Team Members
    members: featureData.data?.members || [],
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    
    // Team Tasks
    tasks: featureData.data?.tasks || [],
    addTeamTask,
    updateTeamTask,
    deleteTeamTask,
    
    // Team Responsibility Matrix
    responsibilities: featureData.data?.responsibilities || [],
    addTeamResponsibility,
    updateTeamResponsibility,
    deleteTeamResponsibility,
    
    // Advanced operations
    getTeamStats,
    getTeamMemberTasks,
  };
} 