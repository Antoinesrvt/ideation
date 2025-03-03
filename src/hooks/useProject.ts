import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/api/project.service';
import { Project, ProjectDetails } from '@/types';

/**
 * Hook for project operations
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
  
  // Delete a project
  const deleteProject = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
  
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
    deleteProject: deleteProject.mutate,
  };
}