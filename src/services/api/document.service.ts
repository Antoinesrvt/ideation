import { Document } from '@/types';
import { apiClient } from './client';

/**
 * Service for document-related API operations
 */
export class DocumentService {
  /**
   * Generate a document
   */
  async generateDocument(
    projectId: string,
    type: 'business-plan' | 'pitch-deck' | 'financial-projections'
  ): Promise<Document> {
    return apiClient.post<Document>('/documents/generate', {
      projectId,
      type,
    });
  }

  /**
   * Get all documents for a project
   */
  async getDocuments(projectId: string): Promise<Document[]> {
    return apiClient.get<Document[]>('/documents', { projectId });
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    return apiClient.delete<void>(`/documents/${id}`);
  }
}

// Create a singleton instance
export const documentService = new DocumentService();