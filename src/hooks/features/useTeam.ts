import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { TeamService, TeamData } from '@/lib/services/features/team-service';
import { useProjectStore } from '@/store';
import type { 
  TeamMember,
  TeamTask,
  TeamResponsibilityMatrix,
  ChangeType, 
  Insert,
  Update
} from '@/store/types';
import { teamService } from '@/lib/services';
import { useOptimisticCreate, useOptimisticUpdate, useOptimisticDelete } from '../utils/optimistic-helpers';

export interface UseTeamReturn {
  data: TeamData;
  isLoading: boolean;
  error: Error | null;

  // Team Members
  addMember: (member: Insert<'team_members'>) => Promise<TeamMember | null>;
  updateMember: (params: { id: string; data: Update<'team_members'> }) => Promise<TeamMember | null>;
  deleteMember: (id: string) => Promise<boolean>;

  // Team Tasks
  addTask: (task: Insert<'team_tasks'>) => Promise<TeamTask | null>;
  updateTask: (params: { id: string; data: Update<'team_tasks'> }) => Promise<TeamTask | null>;
  deleteTask: (id: string) => Promise<boolean>;

  // Team Responsibility Matrix
  addResponsibility: (responsibility: Insert<'team_responsibility_matrix'>) => Promise<TeamResponsibilityMatrix | null>;
  updateResponsibility: (params: { id: string; data: Update<'team_responsibility_matrix'> }) => Promise<TeamResponsibilityMatrix | null>;
  deleteResponsibility: (id: string) => Promise<boolean>;
  
  // Diff helpers
  getMemberChangeType: (id: string) => ChangeType;
  getTaskChangeType: (id: string) => ChangeType;
  getResponsibilityChangeType: (id: string) => ChangeType;
  isDiffMode: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Executes a function with retry logic
 */
async function executeWithRetry<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES, delay = RETRY_DELAY): Promise<T> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) throw error;
      // Exponential backoff
      await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw new Error('Max retries exceeded');
}

// Helper function outside of React component (no hooks)
function compareArrays<T extends { id: string }>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) return true;
  
  // Sort both arrays by ID for consistent comparison
  const sorted1 = [...arr1].sort((a, b) => a.id.localeCompare(b.id));
  const sorted2 = [...arr2].sort((a, b) => a.id.localeCompare(b.id));
  
  // Compare the stringified versions
  return JSON.stringify(sorted1) !== JSON.stringify(sorted2);
}

export function useTeam(projectId: string | undefined): UseTeamReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create stable, memoized query keys
  const queryKeys = useMemo(() => ({
    all: ['team', projectId] as const,
    members: ['team', projectId, 'members'] as const,
    tasks: ['team', projectId, 'tasks'] as const,
    matrix: ['team', projectId, 'matrix'] as const,
  }), [projectId]);

  // Use React Query to fetch data
  const { 
    data: membersData, 
    isLoading: membersLoading, 
    error: membersError 
  } = useQuery({
    queryKey: queryKeys.members,
    queryFn: () => teamService.getMembers(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: tasksData, 
    isLoading: tasksLoading, 
    error: tasksError 
  } = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: () => teamService.getTasks(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: matrixData, 
    isLoading: matrixLoading, 
    error: matrixError 
  } = useQuery({
    queryKey: queryKeys.matrix,
    queryFn: () => teamService.getResponsibilities(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update store when data changes
  useEffect(() => {
    if (membersData) {
      // Only update store if the data is different to prevent infinite loops
      const currentMembers = store.currentData.teamMembers || [];
      if (compareArrays(currentMembers, membersData)) {
        store.setTeamMembers(membersData);
      }
    }
  }, [membersData, store]);

  useEffect(() => {
    if (tasksData) {
      // Only update store if the data is different to prevent infinite loops
      const currentTasks = store.currentData.teamTasks || [];
      if (compareArrays(currentTasks, tasksData)) {
        store.setTeamTasks(tasksData);
      }
    }
  }, [tasksData, store]);

  useEffect(() => {
    if (matrixData) {
      // Only update store if the data is different to prevent infinite loops
      const currentMatrix = store.currentData.teamResponsibilityMatrix || [];
      if (compareArrays(currentMatrix, matrixData)) {
        store.setTeamResponsibilityMatrix(matrixData);
      }
    }
  }, [matrixData, store]);

  // Get data from the store for comparison mode
  const storeData = useMemo(() => {
    const source = store.comparisonMode && store.stagedData ? store.stagedData : store.currentData;
    return {
      teamMembers: source.teamMembers || [],
      teamTasks: source.teamTasks || [],
      teamResponsibilityMatrix: source.teamResponsibilityMatrix || []
    };
  }, [store.currentData, store.stagedData, store.comparisonMode]);

  // Use either store data or query data based on comparison mode
  const data: TeamData = useMemo(() => {
    // When in comparison mode, use store data
    if (store.comparisonMode) {
      return {
        members: storeData.teamMembers,
        tasks: storeData.teamTasks,
        responsibilities: storeData.teamResponsibilityMatrix
      };
    } 
    // Otherwise use the data directly from queries, not from the store
    // This breaks the circular dependency
    else {
      return {
        members: membersData || [],
        tasks: tasksData || [],
        responsibilities: matrixData || []
      };
    }
  }, [
    store.comparisonMode, 
    // Only include storeData when in comparison mode
    ...(store.comparisonMode ? [storeData] : []),
    // Always include the query results
    membersData,
    tasksData,
    matrixData
  ]);

  // Compute loading and error states
  const isLoading = membersLoading || tasksLoading || matrixLoading;
  const queryError = membersError || tasksError || matrixError;

  // === Team Members Operations ===
  // Use our optimistic helper hooks
  const addMemberOptimistic = useOptimisticCreate<'team_members'>({
    projectId,
    tableName: 'team_members',
    store,
    service: teamService,
    queryClient,
    queryKey: [...queryKeys.members],
    setSubmitting,
    methods: {
      add: 'addMember'
    }
  });

  const updateMemberOptimistic = useOptimisticUpdate<'team_members'>({
    tableName: 'team_members',
    store,
    service: teamService,
    queryClient,
    queryKey: [...queryKeys.members],
    setSubmitting,
    methods: {
      update: 'updateMember'
    }
  });

  const deleteMemberOptimistic = useOptimisticDelete({
    tableName: 'team_members',
    store,
    service: teamService,
    queryClient,
    queryKey: [...queryKeys.members],
    setSubmitting,
    methods: {
      delete: 'deleteMember'
    }
  });

  // Exposed member operations with proper typing
  const addMember = useCallback(async (member: Insert<'team_members'>): Promise<TeamMember | null> => {
    return addMemberOptimistic(member);
  }, [addMemberOptimistic]);

  const updateMember = useCallback(async (params: { id: string; data: Update<'team_members'> }): Promise<TeamMember | null> => {
    return updateMemberOptimistic(params.id, params.data);
  }, [updateMemberOptimistic]);

  const deleteMember = useCallback(async (id: string): Promise<boolean> => {
    return deleteMemberOptimistic(id);
  }, [deleteMemberOptimistic]);

  // === Team Tasks Operations ===
  // Use our optimistic helper hooks
  const addTaskOptimistic = useOptimisticCreate<'team_tasks'>({
    projectId,
    tableName: 'team_tasks',
    store,
    service: teamService,
    queryClient,
    queryKey: [...queryKeys.tasks],
    setSubmitting,
    methods: {
      add: 'addTask'
    }
  });

  const updateTaskOptimistic = useOptimisticUpdate<'team_tasks'>({
    tableName: 'team_tasks',
    store,
    service: teamService,
    queryClient,
    queryKey: [...queryKeys.tasks],
    setSubmitting,
    methods: {
      update: 'updateTask'
    }
  });

  const deleteTaskOptimistic = useOptimisticDelete({
    tableName: 'team_tasks',
    store,
    service: teamService,
    queryClient,
    queryKey: [...queryKeys.tasks],
    setSubmitting,
    methods: {
      delete: 'deleteTask'
    }
  });

  // Exposed task operations with proper typing
  const addTask = useCallback(async (task: Insert<'team_tasks'>): Promise<TeamTask | null> => {
    return addTaskOptimistic(task);
  }, [addTaskOptimistic]);

  const updateTask = useCallback(async (params: { id: string; data: Update<'team_tasks'> }): Promise<TeamTask | null> => {
    return updateTaskOptimistic(params.id, params.data);
  }, [updateTaskOptimistic]);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    return deleteTaskOptimistic(id);
  }, [deleteTaskOptimistic]);

  // === Team Responsibility Matrix Operations ===
  // Use our optimistic helper hooks
  const addResponsibilityOptimistic = useOptimisticCreate<'team_responsibility_matrix'>({
    projectId,
    tableName: 'team_responsibility_matrix',
    store,
    service: teamService,
    queryClient,
    queryKey: [...queryKeys.matrix],
    setSubmitting,
    methods: {
      add: 'addResponsibility'
    }
  });

  const updateResponsibilityOptimistic = useOptimisticUpdate<'team_responsibility_matrix'>({
    tableName: 'team_responsibility_matrix',
    store,
    service: teamService,
    queryClient,
    queryKey: [...queryKeys.matrix],
    setSubmitting,
    methods: {
      update: 'updateResponsibility'
    }
  });

  const deleteResponsibilityOptimistic = useOptimisticDelete({
    tableName: 'team_responsibility_matrix',
    store,
    service: teamService,
    queryClient,
    queryKey: [...queryKeys.matrix],
    setSubmitting,
    methods: {
      delete: 'deleteResponsibility'
    }
  });

  // Exposed responsibility operations with proper typing
  const addResponsibility = useCallback(async (responsibility: Insert<'team_responsibility_matrix'>): Promise<TeamResponsibilityMatrix | null> => {
    return addResponsibilityOptimistic(responsibility);
  }, [addResponsibilityOptimistic]);

  const updateResponsibility = useCallback(async (params: { id: string; data: Update<'team_responsibility_matrix'> }): Promise<TeamResponsibilityMatrix | null> => {
    return updateResponsibilityOptimistic(params.id, params.data);
  }, [updateResponsibilityOptimistic]);

  const deleteResponsibility = useCallback(async (id: string): Promise<boolean> => {
    return deleteResponsibilityOptimistic(id);
  }, [deleteResponsibilityOptimistic]);

  // Diff helpers
  const getMemberChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('teamMembers', id), [store]);

  const getTaskChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('teamTasks', id), [store]);

  const getResponsibilityChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('teamResponsibilityMatrix', id), [store]);

  return {
    data,
    isLoading,
    error: queryError,

    // Team Members
    addMember,
    updateMember,
    deleteMember,

    // Team Tasks
    addTask,
    updateTask,
    deleteTask,

    // Team Responsibility Matrix
    addResponsibility,
    updateResponsibility,
    deleteResponsibility,

    // Diff helpers
    getMemberChangeType,
    getTaskChangeType,
    getResponsibilityChangeType,
    isDiffMode: store.comparisonMode
  };
} 