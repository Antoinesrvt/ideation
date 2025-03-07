import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/services/api/document.service';
import { useProjectStore } from '@/store';
import type { Document, ChangeType } from '@/store/types';

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
  
  // Query keys
  const queryKeys = {
    all: ['documents', projectId] as const,
  };
  
  // Get data from the store based on comparison mode
  const storeData = useMemo(() => {
    const source = store.comparisonMode && store.stagedData ? store.stagedData : store.currentData;
    return {
      documents: source.documents || []
    };
  }, [store.currentData, store.stagedData, store.comparisonMode]);
  
  // Generate a document
  const generateDocument = useCallback(async ({ 
    projectId, 
    type 
  }: { 
    projectId: string; 
    type: 'business-plan' | 'pitch-deck' | 'financial-projections' 
  }) => {
    if (!projectId) {
      setError(new Error('Project ID is required'));
      return null;
    }
    
    try {
      setSubmitting(true);
      
      // Generate document with retry logic
      const result = await executeWithRetry(() => 
        documentService.generateDocument(projectId, type)
      );
      
      // Update store with the new document
      if (result) {
        store.addDocument(result);
      }
      
      // Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error generating document:', err);
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, queryClient, store, queryKeys]);
  
  // Delete a document
  const deleteDocument = useCallback(async (id: string) => {
    if (!id) {
      setError(new Error('Document ID is required'));
      return false;
    }
    
    // Store original documents for rollback
    const originalDocuments = [...store.currentData.documents];
    const documentToDelete = originalDocuments.find(d => d.id === id);
    
    if (!documentToDelete) {
      setError(new Error('Document not found'));
      return false;
    }
    
    try {
      // 1. Update store optimistically
      store.deleteDocument(id);
      
      setSubmitting(true);
      
      // 2. Delete from server with retry logic
      await executeWithRetry(() => 
        documentService.deleteDocument(id)
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
  }, [queryClient, store, queryKeys]);
  
  // Diff helper
  const getDocumentChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('documents', id), [store]);
  
  return {
    documents: {
      data: storeData.documents || [],
      isLoading: submitting || store.isLoading,
      error: error,
    },
    generateDocument,
    deleteDocument,
    // Diff helper
    getDocumentChangeType,
    isDiffMode: store.comparisonMode
  };
}