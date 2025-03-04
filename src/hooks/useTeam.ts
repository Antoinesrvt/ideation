import { useFeatureData } from './use-feature-data';
import { TeamData, TeamMember, Task } from '@/features/team/components/TeamManagement';
import { useCallback } from 'react';

/**
 * Hook for managing team data in a project
 * @param projectId - The ID of the current project
 */
export function useTeam(projectId: string | undefined) {
  // Use the enhanced useFeatureData hook with proper typing
  const featureData = useFeatureData<TeamData, { id: string } & Record<string, any>>(
    projectId,
    'team',
    {
      defaultData: {
        members: [],
        roles: [],
        tasks: [],
        raci: []
      }
    }
  );

  // Team Members operations
  const addTeamMember = useCallback((member: Omit<TeamMember, 'id'>) => {
    return featureData.addItem(member, 'members');
  }, [featureData]);

  const updateTeamMember = useCallback((id: string, data: Partial<TeamMember>) => {
    return featureData.updateItem(id, data, 'members');
  }, [featureData]);

  const deleteTeamMember = useCallback((id: string) => {
    return featureData.deleteItem(id, 'members');
  }, [featureData]);

  // Roles operations
  const addRole = useCallback((role: Omit<any, 'id'>) => {
    return featureData.addItem(role, 'roles');
  }, [featureData]);

  const updateRole = useCallback((id: string, data: Partial<any>) => {
    return featureData.updateItem(id, data, 'roles');
  }, [featureData]);

  const deleteRole = useCallback((id: string) => {
    return featureData.deleteItem(id, 'roles');
  }, [featureData]);

  // Tasks operations
  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    return featureData.addItem(task, 'tasks');
  }, [featureData]);

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    return featureData.updateItem(id, data, 'tasks');
  }, [featureData]);

  const deleteTask = useCallback((id: string) => {
    return featureData.deleteItem(id, 'tasks');
  }, [featureData]);

  // RACI Matrix operations
  const addRaciItem = useCallback((item: Omit<any, 'id'>) => {
    return featureData.addItem(item, 'raci');
  }, [featureData]);

  const updateRaciItem = useCallback((id: string, data: Partial<any>) => {
    return featureData.updateItem(id, data, 'raci');
  }, [featureData]);

  const deleteRaciItem = useCallback((id: string) => {
    return featureData.deleteItem(id, 'raci');
  }, [featureData]);

  // Advanced operations
  const getTeamMemberTasks = useCallback((memberId: string) => {
    const { tasks = [] } = featureData.data || { tasks: [] };
    return tasks.filter((task: Task) => task.assignedTo.includes(memberId));
  }, [featureData.data]);

  const getTasksByStatus = useCallback(() => {
    const { tasks = [] } = featureData.data || { tasks: [] };
    const result: Record<string, Task[]> = {
      not_started: [],
      in_progress: [],
      completed: [],
      blocked: []
    };

    tasks.forEach((task: Task) => {
      if (task.status in result) {
        result[task.status].push(task);
      } else {
        result.not_started.push(task);
      }
    });

    return result;
  }, [featureData.data]);

  const getTeamProgress = useCallback(() => {
    const { tasks = [] } = featureData.data || { tasks: [] };
    
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter((task: Task) => task.status === 'completed').length;
    return (completedTasks / tasks.length) * 100;
  }, [featureData.data]);

  const getResponsibilityMatrix = useCallback(() => {
    const { members = [], tasks = [], raci = [] } = featureData.data || { 
      members: [], 
      tasks: [], 
      raci: [] 
    };
    
    // Create a matrix of member IDs × tasks with RACI values
    const matrix: Record<string, Record<string, string>> = {};
    
    members.forEach((member: TeamMember) => {
      matrix[member.id] = {};
      
      tasks.forEach((task: Task) => {
        // Default to empty
        matrix[member.id][task.id] = '';
        
        // Check if task is assigned directly to member
        if (task.assignedTo.includes(member.id)) {
          matrix[member.id][task.id] = 'responsible';
        }
      });
    });
    
    // Apply RACI assignments
    raci.forEach((item: any) => {
      item.assignments.forEach((assignment: any) => {
        if (matrix[assignment.memberId] && matrix[assignment.memberId][item.activity]) {
          matrix[assignment.memberId][item.activity] = assignment.type;
        }
      });
    });
    
    return matrix;
  }, [featureData.data]);

  return {
    // Raw data
    team: featureData.data,
    isLoading: featureData.isLoading,
    error: featureData.error,
    
    // Team members
    members: featureData.data?.members || [],
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    
    // Roles
    roles: featureData.data?.roles || [],
    addRole,
    updateRole,
    deleteRole,
    
    // Tasks
    tasks: featureData.data?.tasks || [],
    addTask,
    updateTask,
    deleteTask,
    
    // RACI Matrix
    raci: featureData.data?.raci || [],
    addRaciItem,
    updateRaciItem,
    deleteRaciItem,
    
    // Advanced operations
    getTeamMemberTasks,
    getTasksByStatus,
    getTeamProgress,
    getResponsibilityMatrix
  };
} 