import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/services/api/document.service';

/**
 * Hook for document operations
 */
export function useDocuments(projectId?: string) {
  const queryClient = useQueryClient();
  
  // Get all documents for a project
  const documents = useQuery({
    queryKey: ['documents', projectId],
    queryFn: () => projectId ? documentService.getDocuments(projectId) : [],
    enabled: !!projectId,
  });
  
  // Generate a document
  const generateDocument = useMutation({
    mutationFn: ({ 
      projectId, 
      type 
    }: { 
      projectId: string; 
      type: 'business-plan' | 'pitch-deck' | 'financial-projections' 
    }) => documentService.generateDocument(projectId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
    },
  });
  
  // Delete a document
  const deleteDocument = useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
    },
  });
  
  return {
    documents: {
      data: documents.data || [],
      isLoading: documents.isLoading,
      error: documents.error,
    },
    generateDocument: generateDocument.mutate,
    deleteDocument: deleteDocument.mutate,
  };
}