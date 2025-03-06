import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { TeamService, TeamData } from '@/lib/services/features/team-service';
import type { 
  TeamMember,
  TeamTask,
  TeamResponsibilityMatrix
} from '@/store/types';

// Create service instance
const teamService = new TeamService(createClient());

export interface UseTeamReturn {
  data: TeamData;
  isLoading: boolean;
  error: Error | null;

  // Team Members
  addMember: (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => void;
  updateMember: (params: { id: string; data: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteMember: (id: string) => void;

  // Team Tasks
  addTask: (task: Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>) => void;
  updateTask: (params: { id: string; data: Partial<Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteTask: (id: string) => void;

  // Team Responsibility Matrix
  addResponsibility: (responsibility: Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>) => void;
  updateResponsibility: (params: { id: string; data: Partial<Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteResponsibility: (id: string) => void;
}

export function useTeam(projectId: string | undefined): UseTeamReturn {
  const queryClient = useQueryClient();

  // Query keys for different data types
  const queryKeys = {
    all: ['team', projectId] as const,
    members: ['team', projectId, 'members'] as const,
    tasks: ['team', projectId, 'tasks'] as const,
    responsibilities: ['team', projectId, 'responsibilities'] as const,
  };

  // Main query to fetch all team data
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.all,
    queryFn: () => {
      if (!projectId) throw new Error('Project ID is required');
      return teamService.getAllTeamData(projectId);
    },
    enabled: !!projectId
  });

  // === Team Members Mutations ===
  const addMemberMutation = useMutation({
    mutationFn: (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      return teamService.addMember(projectId, member);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const updateMemberMutation = useMutation({
    mutationFn: (params: { id: string; data: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>> }) => {
      return teamService.updateMember(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => {
      return teamService.deleteMember(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  // === Team Tasks Mutations ===
  const addTaskMutation = useMutation({
    mutationFn: (task: Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      return teamService.addTask(projectId, task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: (params: { id: string; data: Partial<Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>> }) => {
      return teamService.updateTask(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => {
      return teamService.deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  // === Team Responsibility Matrix Mutations ===
  const addResponsibilityMutation = useMutation({
    mutationFn: (responsibility: Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      return teamService.addResponsibility(projectId, responsibility);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const updateResponsibilityMutation = useMutation({
    mutationFn: (params: { id: string; data: Partial<Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>> }) => {
      return teamService.updateResponsibility(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteResponsibilityMutation = useMutation({
    mutationFn: (id: string) => {
      return teamService.deleteResponsibility(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  return {
    data: data || {
      members: [],
      tasks: [],
      responsibilities: []
    },
    isLoading,
    error: error as Error | null,

    // Team Members
    addMember: addMemberMutation.mutate,
    updateMember: updateMemberMutation.mutate,
    deleteMember: deleteMemberMutation.mutate,

    // Team Tasks
    addTask: addTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,

    // Team Responsibility Matrix
    addResponsibility: addResponsibilityMutation.mutate,
    updateResponsibility: updateResponsibilityMutation.mutate,
    deleteResponsibility: deleteResponsibilityMutation.mutate,
  };
} 