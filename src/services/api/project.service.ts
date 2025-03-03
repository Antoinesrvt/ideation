import { Project, ProjectDetails } from '@/types';
import { apiClient } from './client';

/**
 * Service for project-related API operations
 */
export class ProjectService {
  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    return apiClient.get<Project[]>('/projects');
  }

  /**
   * Get a project by ID
   */
  async getProject(id: string): Promise<ProjectDetails> {
    return apiClient.get<ProjectDetails>(`/projects/${id}`);
  }

  /**
   * Create a new project
   */
  async createProject(project: Partial<Project>): Promise<Project> {
    return apiClient.post<Project>('/projects', project);
  }

  /**
   * Update a project
   */
  async updateProject(id: string, project: Partial<ProjectDetails>): Promise<ProjectDetails> {
    return apiClient.put<ProjectDetails>(`/projects/${id}`, project);
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    return apiClient.delete<void>(`/projects/${id}`);
  }
}

// Create a singleton instance
export const projectService = new ProjectService();