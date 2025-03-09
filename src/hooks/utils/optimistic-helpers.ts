import { v4 as uuidv4 } from 'uuid';
import { useCallback } from 'react';
import { ProjectStore, Insert, Update } from '@/store/types';
import { Database } from '@/types/database';

/**
 * Helper to generate a temporary ID for optimistic updates
 */
export const generateTempId = (): string => {
  return `temp_${uuidv4()}`;
};

/**
 * Type for the useOptimisticAction hook
 */
interface UseOptimisticActionProps {
  projectId: string | undefined;
  tableName: string;
  store: ProjectStore;
  service: any;
  queryClient: any;
  queryKey: unknown[];
  setSubmitting?: (value: boolean) => void;
  methods?: {
    add?: string;
    update?: string;
    delete?: string;
  };
}

/**
 * Hook to handle optimistic create actions
 */
export function useOptimisticCreate<T extends keyof Database['public']['Tables']>({
  projectId,
  tableName,
  store,
  service,
  queryClient,
  queryKey,
  setSubmitting,
  methods = { add: 'add' }
}: UseOptimisticActionProps) {
  return useCallback(async (
    item: Insert<T>
  ) => {
    if (!projectId) return null;
    
    // Create temp ID with prefix for easy identification
    const tempId = generateTempId();
    
    try {
      // 1. Add optimistic update to store
      store.addOptimisticItem(
        tempId,
        tableName, 
        { ...item, id: tempId } as object,
        'create'
      );
      
      // 2. Set loading state if provided
      if (setSubmitting) setSubmitting(true);
      
      // 3. Make actual API call using the specified method name
      const addMethodName = methods.add || 'add';
      
      if (typeof service[addMethodName] !== 'function') {
        throw new Error(`Method ${addMethodName} not found on service for table ${tableName}`);
      }
      
      const result = await service[addMethodName](projectId, item);
      
      // 4. Replace optimistic item with real one
      store.replaceOptimisticItem(tempId, result as object);
      
      // 5. Invalidate queries to keep React Query cache in sync
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey });
      }
      
      return result;
    } catch (error) {
      // 6. Remove failed optimistic update
      store.removeOptimisticItem(tempId);
      console.error(`Failed to add ${tableName}:`, error);
      return null;
    } finally {
      // 7. Reset loading state
      if (setSubmitting) setSubmitting(false);
    }
  }, [projectId, tableName, store, service, queryClient, queryKey, setSubmitting, methods]);
}

/**
 * Hook to handle optimistic update actions
 */
export function useOptimisticUpdate<T extends keyof Database['public']['Tables']>({
  tableName,
  store,
  service,
  queryClient,
  queryKey,
  setSubmitting,
  methods = { update: 'update' }
}: Omit<UseOptimisticActionProps, 'projectId'>) {
  return useCallback(async (
    id: string,
    updates: Update<T>
  ) => {
    if (!id) return null;
    
    // Store original item for potential rollback
    const featureKey = getFeatureKeyFromTable(tableName);
    if (!featureKey) return null;
    
    const items = store.currentData[featureKey] as unknown[];
    if (!Array.isArray(items)) return null;
    
    const originalItem = items.find(item => (item as any).id === id);
    if (!originalItem) return null;
    
    // Create temp ID for tracking this update operation
    const tempId = generateTempId();
    
    try {
      // 1. Add optimistic update to store
      store.addOptimisticItem(
        tempId,
        tableName,
        { ...updates, originalId: id } as object,
        'update'
      );
      
      // 2. Set loading state if provided
      if (setSubmitting) setSubmitting(true);
      
      // 3. Make actual API call using the specified method name
      const updateMethodName = methods.update || 'update';
      
      if (typeof service[updateMethodName] !== 'function') {
        throw new Error(`Method ${updateMethodName} not found on service for table ${tableName}`);
      }
      
      const result = await service[updateMethodName](id, updates);
      
      // 4. Replace optimistic item with real one
      store.replaceOptimisticItem(tempId, result as object);
      
      // 5. Invalidate queries to keep React Query cache in sync
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey });
      }
      
      return result;
    } catch (error) {
      // 6. Remove failed optimistic update
      store.removeOptimisticItem(tempId);
      console.error(`Failed to update ${tableName}:`, error);
      return null;
    } finally {
      // 7. Reset loading state
      if (setSubmitting) setSubmitting(false);
    }
  }, [tableName, store, service, queryClient, queryKey, setSubmitting, methods]);
}

/**
 * Hook to handle optimistic delete actions
 */
export function useOptimisticDelete({
  tableName,
  store,
  service,
  queryClient,
  queryKey,
  setSubmitting,
  methods = { delete: 'delete' }
}: Omit<UseOptimisticActionProps, 'projectId'>) {
  return useCallback(async (id: string) => {
    if (!id) return false;
    
    // Store original item for potential rollback
    const featureKey = getFeatureKeyFromTable(tableName);
    if (!featureKey) return false;
    
    const items = store.currentData[featureKey] as unknown[];
    if (!Array.isArray(items)) return false;
    
    const originalItem = items.find(item => (item as any).id === id);
    if (!originalItem) return false;
    
    // Create temp ID for tracking this delete operation
    const tempId = generateTempId();
    
    try {
      // 1. Add optimistic update to store
      store.addOptimisticItem(
        tempId,
        tableName,
        { id } as object, // Just need the ID for deletion
        'delete'
      );
      
      // 2. Set loading state if provided
      if (setSubmitting) setSubmitting(true);
      
      // 3. Make actual API call using the specified method name
      const deleteMethodName = methods.delete || 'delete';
      
      if (typeof service[deleteMethodName] !== 'function') {
        throw new Error(`Method ${deleteMethodName} not found on service for table ${tableName}`);
      }
      
      await service[deleteMethodName](id);
      
      // 4. Remove optimistic item since operation succeeded
      store.removeOptimisticItem(tempId);
      
      // 5. Invalidate queries to keep React Query cache in sync
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey });
      }
      
      return true;
    } catch (error) {
      // 6. Remove failed optimistic update and restore item
      store.removeOptimisticItem(tempId);
      console.error(`Failed to delete ${tableName}:`, error);
      return false;
    } finally {
      // 7. Reset loading state
      if (setSubmitting) setSubmitting(false);
    }
  }, [tableName, store, service, queryClient, queryKey, setSubmitting, methods]);
}

// Helper function to get feature key from table name - internal reference
const getFeatureKeyFromTable = (tableName: string): keyof ProjectStore['currentData'] | null => {
  // Map table names to their corresponding feature key in the store
  const tableToFeatureMap: Record<string, keyof ProjectStore['currentData']> = {
    'canvas_sections': 'canvasSections',
    'canvas_items': 'canvasItems',
    'grp_categories': 'grpCategories',
    'grp_sections': 'grpSections',
    'grp_items': 'grpItems',
    'market_personas': 'marketPersonas',
    'market_interviews': 'marketInterviews',
    'market_competitors': 'marketCompetitors',
    'market_trends': 'marketTrends',
    'product_wireframes': 'productWireframes',
    'product_features': 'productFeatures',
    'product_journey_stages': 'productJourneyStages',
    'product_journey_actions': 'productJourneyActions',
    'product_journey_pain_points': 'productJourneyPainPoints',
    'financial_revenue_streams': 'financialRevenueStreams',
    'financial_cost_structure': 'financialCostStructure',
    'financial_pricing_strategies': 'financialPricingStrategies',
    'financial_projections': 'financialProjections',
    'validation_experiments': 'validationExperiments',
    'validation_ab_tests': 'validationABTests',
    'validation_user_feedback': 'validationUserFeedback',
    'validation_hypotheses': 'validationHypotheses',
    'team_members': 'teamMembers',
    'team_tasks': 'teamTasks',
    'team_responsibility_matrix': 'teamResponsibilityMatrix',
    'documents': 'documents',
    'document_collaborators': 'documentCollaborators',
    'project_notifications': 'notifications',
    'related_items': 'relatedItems',
    'project_tags': 'projectTags',
    'feature_item_tags': 'featureItemTags',
  };

  return tableToFeatureMap[tableName] || null;
}; 