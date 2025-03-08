import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { apiDocumentService } from '@/lib/services';
import { useProjectStore } from '@/store';
import type { Document, ChangeType } from '@/store/types';

// Constants for retry logic
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

/**
 * Hook for document operations
 */
export function useDocuments(projectId?: string) {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Query keys for data fetching
  const queryKeys = useMemo(() => ({
    all: ['documents', projectId] as const,
    documents: ['documents', projectId, 'list'] as const
  }), [projectId]);

  // Use React Query to fetch documents
  const { 
    data: documentsData, 
    isLoading: documentsLoading, 
    error: documentsError 
  } = useQuery({
    queryKey: queryKeys.documents,
    queryFn: () => apiDocumentService.getDocuments(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Helper function to check array equality
  function arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    
    // Check if arrays have same items (not concerned with order for this use case)
    const sortedA = [...a].sort((x, y) => 
      (x.id && y.id) ? x.id.localeCompare(y.id) : 0
    );
    const sortedB = [...b].sort((x, y) => 
      (x.id && y.id) ? x.id.localeCompare(y.id) : 0
    );
    
    // Simple comparison of stringified arrays (works for our case of objects with IDs)
    return JSON.stringify(sortedA) === JSON.stringify(sortedB);
  }

  // Update store when query data changes, but only if data has actually changed
  useEffect(() => {
    if (documentsData && !arraysEqual(documentsData, store.currentData.documents)) {
      store.setDocuments(documentsData);
    }
  }, [documentsData, store]);

  // Get data from the store based on comparison mode
  const storeData = useMemo(() => {
    const source = store.comparisonMode && store.stagedData ? store.stagedData : store.currentData;
    return {
      documents: source.documents || []
    };
  }, [store.currentData, store.stagedData, store.comparisonMode]);

  // If in comparison mode, use store data, otherwise use React Query data
  const documents = useMemo(() => {
    return store.comparisonMode ? storeData.documents : (documentsData || []);
  }, [store.comparisonMode, storeData.documents, documentsData]);

  // Loading and error states
  const isLoading = documentsLoading;
  const queryError = documentsError;

  // Generate a document
  const generateDocument = useCallback(async (type: 'business-plan' | 'pitch-deck' | 'financial-projections'): Promise<Document | null> => {
    if (!projectId) return null;
    
    const tempId = `temp-${Date.now()}`;
    const tempDocument: Document = {
      id: tempId,
      project_id: projectId,
      name: `${type} (generating...)`,
      type: 'pdf',
      storage_path: '',
      status: 'pending',
      module_id: '',
      created_by: '',
      metadata: {},
      template_version: 1,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      content_preview: null,
      document_data: null,
      last_viewed_at: null,
      owner_id: null,
      related_features: null,
      tags: null,
      visibility: null
    };
    
    const originalDocuments = [...storeData.documents];
    
    try {
      // 1. Update store optimistically
      store.addDocument(tempDocument);
      
      setSubmitting(true);
      
      // Generate document with retry logic
      const result = await executeWithRetry(() => 
        apiDocumentService.generateDocument(projectId, type)
      );
      
      // 2. Update store with real data
      store.updateDocument(tempId, result);
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error generating document:', err);
      
      // 4. Revert optimistic update on error
      store.setDocuments(originalDocuments);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, storeData.documents, queryClient, queryKeys.all]);

  // Delete document
  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    const originalDocuments = [...storeData.documents];
    const documentToDelete = originalDocuments.find(d => d.id === id);
    if (!documentToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteDocument(id);
      
      setSubmitting(true);
      
      // 2. Delete from server with retry logic
      await executeWithRetry(() => 
        apiDocumentService.deleteDocument(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting document:', err);
      
      // 4. Revert optimistic update on error
      store.setDocuments(originalDocuments);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, storeData.documents, queryClient, queryKeys.all]);

  // Get change type
  const getDocumentChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('documents', id), [store]);

  // Return document-related data and operations
  return {
    documents: {
      data: documents,
      isLoading: isLoading,
      error: queryError || error,
    },
    generateDocument,
    deleteDocument,
    getDocumentChangeType,
    isDiffMode: store.comparisonMode
  };
}