import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/api/project.service';
import { Project, ProjectDetails } from '@/types';
import { get } from '@/lib/utils';

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
    mutationFn: (newProject: Partial<Project>) => projectService.createProject(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
  
  // Update a project
  const updateProject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProjectDetails> }) => 
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
      feature: keyof ProjectDetails; 
      data: any 
    }) => {
      return projectService.updateProject(id, { 
        [feature]: data 
      } as Partial<ProjectDetails>);
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
   * @param featureName The feature to get data from
   * @param options Additional options for filtering and transforming the data
   */
  const getRelatedFeatureData = <T = any>(
    featureName: keyof ProjectDetails, 
    options?: {
      property?: string;
      filter?: (item: any) => boolean;
      transform?: (data: any) => T;
      defaultValue?: any;
    }
  ): T => {
    const projectData = project.data as ProjectDetails;
    if (!projectData) return options?.defaultValue || ([] as unknown as T);
    
    // Get the feature data, potentially from a nested property path
    let featureData: any;
    if (options?.property) {
      // Use path to get nested data (e.g., 'marketAnalysis.customerInsights.personas')
      featureData = get(projectData, `${String(featureName)}.${options.property}`, options?.defaultValue || []);
    } else {
      // Get the entire feature data
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
  
  return {
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
    createProject: createProject.mutate,
    updateProject: updateProject.mutate,
    updateFeatureData: updateFeatureData.mutate,
    deleteProject: deleteProject.mutate,
    getRelatedFeatureData,
  };
}