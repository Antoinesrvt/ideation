import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectService } from '@/lib/services/core/project-service';
import { createClient } from '@/lib/supabase/client';
import type { ProjectRow, ProjectInsertData, ProjectUpdateData } from '@/types/project';
import { get } from '@/lib/utils';

// Create a singleton instance of the service
const supabase = createClient();
const projectService = new ProjectService(supabase);

/**
 * Enhanced hook for project operations with improved data relationships
 */
export function useProject(projectId?: string) {
  const queryClient = useQueryClient();
  
  // Get all projects
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects(),
  });
  
  // Get a single project
  const project = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectId ? projectService.getProject(projectId) : null,
    enabled: !!projectId,
  });
  
  // Create a project
  const createProject = useMutation({
    mutationFn: (data: ProjectInsertData) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
  
  // Update a project
  const updateProject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdateData }) => 
      projectService.updateProject(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
    },
  });

  // Update a specific feature's data within the project
  const updateFeatureData = useMutation({
    mutationFn: ({ 
      id, 
      feature, 
      data 
    }: { 
      id: string; 
      feature: keyof ProjectRow; 
      data: unknown;
    }) => {
      return projectService.updateProject(id, { 
        [feature]: data 
      } as ProjectUpdateData);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.id] });
    },
  });
  
  // Delete a project
  const deleteProject = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  /**
   * Helper function to get related data from other features with advanced options
   */
  const getRelatedFeatureData = <T = any>(
    featureName: keyof ProjectRow, 
    options?: {
      property?: string;
      filter?: (item: any) => boolean;
      transform?: (data: any) => T;
      defaultValue?: any;
    }
  ): T => {
    const projectData = project.data;
    if (!projectData) return options?.defaultValue || ([] as unknown as T);
    
    // Get the feature data, potentially from a nested property path
    let featureData: any;
    if (options?.property) {
      featureData = get(projectData, `${String(featureName)}.${options.property}`, options?.defaultValue || []);
    } else {
      featureData = projectData[featureName] || options?.defaultValue || [];
    }
    
    // Apply filter if provided
    if (options?.filter && Array.isArray(featureData)) {
      featureData = featureData.filter(options.filter);
    }
    
    // Apply transform if provided
    if (options?.transform) {
      return options.transform(featureData);
    }
    
    return featureData as T;
  };

  // Check if user has access to the project
  const checkAccess = useQuery({
    queryKey: ['project-access', projectId],
    queryFn: () => projectId ? projectService.hasProjectAccess(projectId) : false,
    enabled: !!projectId,
  });
  
  return {
    // Data queries
    projects: {
      data: projects.data || [],
      isLoading: projects.isLoading,
      error: projects.error,
    },
    project: {
      data: project.data,
      isLoading: project.isLoading,
      error: project.error,
    },
    access: {
      hasAccess: checkAccess.data,
      isLoading: checkAccess.isLoading,
      error: checkAccess.error,
    },
    
    // Mutations
    createProject: createProject.mutate,
    updateProject: updateProject.mutate,
    updateFeatureData: updateFeatureData.mutate,
    deleteProject: deleteProject.mutate,
    
    // Helpers
    getRelatedFeatureData,
  };
}