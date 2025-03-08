import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { TeamService, TeamData } from '@/lib/services/features/team-service';
import { useProjectStore } from '@/store';
import type { 
  TeamMember,
  TeamTask,
  TeamResponsibilityMatrix,
  ChangeType
} from '@/store/types';
import { teamService } from '@/lib/services';

export interface UseTeamReturn {
  data: TeamData;
  isLoading: boolean;
  error: Error | null;

  // Team Members
  addMember: (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>) => Promise<TeamMember | null>;
  updateMember: (params: { id: string; data: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>> }) => Promise<TeamMember | null>;
  deleteMember: (id: string) => Promise<boolean>;

  // Team Tasks
  addTask: (task: Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>) => Promise<TeamTask | null>;
  updateTask: (params: { id: string; data: Partial<Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>> }) => Promise<TeamTask | null>;
  deleteTask: (id: string) => Promise<boolean>;

  // Team Responsibility Matrix
  addResponsibility: (responsibility: Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>) => Promise<TeamResponsibilityMatrix | null>;
  updateResponsibility: (params: { id: string; data: Partial<Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>> }) => Promise<TeamResponsibilityMatrix | null>;
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
      store.setTeamMembers(membersData);
    }
  }, [membersData, store]);

  useEffect(() => {
    if (tasksData) {
      store.setTeamTasks(tasksData);
    }
  }, [tasksData, store]);

  useEffect(() => {
    if (matrixData) {
      store.setTeamResponsibilityMatrix(matrixData);
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
    if (store.comparisonMode) {
      return {
        members: storeData.teamMembers,
        tasks: storeData.teamTasks,
        responsibilities: storeData.teamResponsibilityMatrix
      };
    } else {
      return {
        members: membersData || [],
        tasks: tasksData || [],
        responsibilities: matrixData || []
      };
    }
  }, [
    store.comparisonMode, 
    storeData,
    membersData,
    tasksData,
    matrixData
  ]);

  // Compute loading and error states
  const isLoading = membersLoading || tasksLoading || matrixLoading;
  const queryError = membersError || tasksError || matrixError;

  // === Team Members Operations ===
  const addMember = useCallback(async (member: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeMember: TeamMember = {
      ...member,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalMembers = [...store.currentData.teamMembers];
    
    try {
      // 1. Update store optimistically
      store.addTeamMember(completeMember);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        teamService.addMember(projectId, member)
      );
      
      // 3. Update store with real ID
      store.updateTeamMember(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.members });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding team member:', err);
      
      // 5. Revert optimistic update on error
      store.setTeamMembers(originalMembers);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateMember = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>> }): Promise<TeamMember | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalMember = store.currentData.teamMembers.find(m => m.id === id);
    if (!originalMember) return null;
    
    try {
      // 1. Update store optimistically
      store.updateTeamMember(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        teamService.updateMember(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.members });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating team member:', err);
      
      // 4. Revert optimistic update on error
      if (originalMember) {
        store.updateTeamMember(id, originalMember);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteMember = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalMembers = [...store.currentData.teamMembers];
    const memberToDelete = originalMembers.find(m => m.id === id);
    if (!memberToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteTeamMember(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        teamService.deleteMember(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.members });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting team member:', err);
      
      // 4. Revert optimistic update on error
      store.setTeamMembers(originalMembers);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === Team Tasks Operations ===
  const addTask = useCallback(async (task: Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>): Promise<TeamTask | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeTask: TeamTask = {
      ...task,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalTasks = [...store.currentData.teamTasks];
    
    try {
      // 1. Update store optimistically
      store.addTeamTask(completeTask);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        teamService.addTask(projectId, task)
      );
      
      // 3. Update store with real ID
      store.updateTeamTask(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding team task:', err);
      
      // 5. Revert optimistic update on error
      store.setTeamTasks(originalTasks);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateTask = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>> }): Promise<TeamTask | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalTask = store.currentData.teamTasks.find(t => t.id === id);
    if (!originalTask) return null;
    
    try {
      // 1. Update store optimistically
      store.updateTeamTask(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        teamService.updateTask(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating team task:', err);
      
      // 4. Revert optimistic update on error
      if (originalTask) {
        store.updateTeamTask(id, originalTask);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalTasks = [...store.currentData.teamTasks];
    const taskToDelete = originalTasks.find(t => t.id === id);
    if (!taskToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteTeamTask(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        teamService.deleteTask(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting team task:', err);
      
      // 4. Revert optimistic update on error
      store.setTeamTasks(originalTasks);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === Team Responsibility Matrix Operations ===
  const addResponsibility = useCallback(async (responsibility: Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>): Promise<TeamResponsibilityMatrix | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeResponsibility: TeamResponsibilityMatrix = {
      ...responsibility,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalResponsibilities = [...store.currentData.teamResponsibilityMatrix];
    
    try {
      // 1. Update store optimistically
      store.addTeamResponsibilityMatrix(completeResponsibility);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        teamService.addResponsibility(projectId, responsibility)
      );
      
      // 3. Update store with real ID
      store.updateTeamResponsibilityMatrix(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.matrix });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding team responsibility:', err);
      
      // 5. Revert optimistic update on error
      store.setTeamResponsibilityMatrix(originalResponsibilities);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateResponsibility = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<TeamResponsibilityMatrix, 'id' | 'created_at' | 'updated_at'>> }): Promise<TeamResponsibilityMatrix | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalResponsibility = store.currentData.teamResponsibilityMatrix.find(r => r.id === id);
    if (!originalResponsibility) return null;
    
    try {
      // Process RACI matrix data if present
      const processedUpdates = { ...updates };
      
      // 1. Update store optimistically
      store.updateTeamResponsibilityMatrix(id, processedUpdates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        teamService.updateResponsibility(id, processedUpdates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.matrix });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating team responsibility:', err);
      
      // 4. Revert optimistic update on error
      if (originalResponsibility) {
        store.updateTeamResponsibilityMatrix(id, originalResponsibility);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteResponsibility = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalResponsibilities = [...store.currentData.teamResponsibilityMatrix];
    const responsibilityToDelete = originalResponsibilities.find(r => r.id === id);
    if (!responsibilityToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteTeamResponsibilityMatrix(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        teamService.deleteResponsibility(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.matrix });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting team responsibility:', err);
      
      // 4. Revert optimistic update on error
      store.setTeamResponsibilityMatrix(originalResponsibilities);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

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