import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ProductDesignService, ProductDesignData } from '@/lib/services/features/product-design-service';
import { useProjectStore } from '@/store';
import type { 
  ProductWireframe,
  ProductFeature,
  ProductJourneyStage,
  ProductJourneyAction,
  ProductJourneyPainPoint,
  ChangeType
} from '@/store/types';

// Create service instance
const productDesignService = new ProductDesignService(createClient());
const supabase = createClient();

export interface UseProductDesignReturn {
  data: ProductDesignData;
  isLoading: boolean;
  error: Error | null;

  // Wireframes
  addWireframe: (wireframe: Omit<ProductWireframe, 'id' | 'created_at' | 'updated_at'>) => Promise<ProductWireframe | null>;
  updateWireframe: (params: { id: string; data: Partial<Omit<ProductWireframe, 'id' | 'created_at' | 'updated_at'>> }) => Promise<ProductWireframe | null>;
  deleteWireframe: (id: string) => Promise<boolean>;

  // Features
  addFeature: (feature: Omit<ProductFeature, 'id' | 'created_at' | 'updated_at'>) => Promise<ProductFeature | null>;
  updateFeature: (params: { id: string; data: Partial<Omit<ProductFeature, 'id' | 'created_at' | 'updated_at'>> }) => Promise<ProductFeature | null>;
  deleteFeature: (id: string) => Promise<boolean>;

  // Journey Stages
  addJourneyStage: (stage: Omit<ProductJourneyStage, 'id' | 'created_at' | 'updated_at'>) => Promise<ProductJourneyStage | null>;
  updateJourneyStage: (params: { id: string; data: Partial<Omit<ProductJourneyStage, 'id' | 'created_at' | 'updated_at'>> }) => Promise<ProductJourneyStage | null>;
  deleteJourneyStage: (id: string) => Promise<boolean>;

  // Journey Actions
  addJourneyAction: (action: Omit<ProductJourneyAction, 'id' | 'created_at' | 'updated_at'>) => Promise<ProductJourneyAction | null>;
  updateJourneyAction: (params: { id: string; data: Partial<Omit<ProductJourneyAction, 'id' | 'created_at' | 'updated_at'>> }) => Promise<ProductJourneyAction | null>;
  deleteJourneyAction: (id: string) => Promise<boolean>;

  // Journey Pain Points
  addJourneyPainPoint: (painPoint: Omit<ProductJourneyPainPoint, 'id' | 'created_at' | 'updated_at'>) => Promise<ProductJourneyPainPoint | null>;
  updateJourneyPainPoint: (params: { id: string; data: Partial<Omit<ProductJourneyPainPoint, 'id' | 'created_at' | 'updated_at'>> }) => Promise<ProductJourneyPainPoint | null>;
  deleteJourneyPainPoint: (id: string) => Promise<boolean>;
  
  // Diff helpers
  getWireframeChangeType: (id: string) => ChangeType;
  getFeatureChangeType: (id: string) => ChangeType;
  getJourneyStageChangeType: (id: string) => ChangeType;
  getJourneyActionChangeType: (id: string) => ChangeType;
  getJourneyPainPointChangeType: (id: string) => ChangeType;
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

export function useProductDesign(projectId: string | undefined): UseProductDesignReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Query keys for different data types
  const queryKeys = {
    all: ['productDesign', projectId] as const,
    wireframes: ['productDesign', projectId, 'wireframes'] as const,
    features: ['productDesign', projectId, 'features'] as const,
    journeyStages: ['productDesign', projectId, 'journeyStages'] as const,
    journeyActions: ['productDesign', projectId, 'journeyActions'] as const,
    journeyPainPoints: ['productDesign', projectId, 'journeyPainPoints'] as const,
  };

  // Get data from the store based on comparison mode
  const storeData = useMemo(() => {
    const source = store.comparisonMode && store.stagedData ? store.stagedData : store.currentData;
    return {
      productWireframes: source.productWireframes || [],
      productFeatures: source.productFeatures || [],
      productJourneyStages: source.productJourneyStages || [],
      productJourneyActions: source.productJourneyActions || [],
      productJourneyPainPoints: source.productJourneyPainPoints || []
    };
  }, [store.currentData, store.stagedData, store.comparisonMode]);

  // Transform store data to the expected format
  const data: ProductDesignData = useMemo(() => ({
    wireframes: storeData.productWireframes,
    features: storeData.productFeatures,
    journey: {
      stages: storeData.productJourneyStages,
      actions: storeData.productJourneyActions,
      painPoints: storeData.productJourneyPainPoints
    }
  }), [storeData]);

  // === Wireframes Operations ===
  const addWireframe = useCallback(async (wireframe: Omit<ProductWireframe, 'id' | 'created_at' | 'updated_at'>): Promise<ProductWireframe | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeWireframe: ProductWireframe = {
      ...wireframe,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalWireframes = [...store.currentData.productWireframes];
    
    try {
      // 1. Update store optimistically
      store.addProductWireframe(completeWireframe);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        productDesignService.addWireframe(projectId, wireframe)
      );
      
      // 3. Update store with real ID
      store.updateProductWireframe(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.wireframes });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding wireframe:', err);
      
      // 5. Revert optimistic update on error
      store.setProductWireframes(originalWireframes);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateWireframe = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<ProductWireframe, 'id' | 'created_at' | 'updated_at'>> }): Promise<ProductWireframe | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalWireframe = store.currentData.productWireframes.find(w => w.id === id);
    if (!originalWireframe) return null;
    
    try {
      // 1. Update store optimistically
      store.updateProductWireframe(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        productDesignService.updateWireframe(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.wireframes });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating wireframe:', err);
      
      // 4. Revert optimistic update on error
      if (originalWireframe) {
        store.updateProductWireframe(id, originalWireframe);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteWireframe = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalWireframes = [...store.currentData.productWireframes];
    const wireframeToDelete = originalWireframes.find(w => w.id === id);
    if (!wireframeToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteProductWireframe(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        productDesignService.deleteWireframe(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.wireframes });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting wireframe:', err);
      
      // 4. Revert optimistic update on error
      store.setProductWireframes(originalWireframes);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === Features Operations ===
  const addFeature = useCallback(async (feature: Omit<ProductFeature, 'id' | 'created_at' | 'updated_at'>): Promise<ProductFeature | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeFeature: ProductFeature = {
      ...feature,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalFeatures = [...store.currentData.productFeatures];
    
    try {
      // 1. Update store optimistically
      store.addProductFeature(completeFeature);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        productDesignService.addFeature(projectId, feature)
      );
      
      // 3. Update store with real ID
      store.updateProductFeature(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.features });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding feature:', err);
      
      // 5. Revert optimistic update on error
      store.setProductFeatures(originalFeatures);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateFeature = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<ProductFeature, 'id' | 'created_at' | 'updated_at'>> }): Promise<ProductFeature | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalFeature = store.currentData.productFeatures.find(f => f.id === id);
    if (!originalFeature) return null;
    
    try {
      // 1. Update store optimistically
      store.updateProductFeature(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        productDesignService.updateFeature(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.features });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating feature:', err);
      
      // 4. Revert optimistic update on error
      if (originalFeature) {
        store.updateProductFeature(id, originalFeature);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteFeature = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalFeatures = [...store.currentData.productFeatures];
    const featureToDelete = originalFeatures.find(f => f.id === id);
    if (!featureToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteProductFeature(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        productDesignService.deleteFeature(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.features });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting feature:', err);
      
      // 4. Revert optimistic update on error
      store.setProductFeatures(originalFeatures);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === Journey Stages Operations ===
  const addJourneyStage = useCallback(async (stage: Omit<ProductJourneyStage, 'id' | 'created_at' | 'updated_at'>): Promise<ProductJourneyStage | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeStage: ProductJourneyStage = {
      ...stage,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalStages = [...store.currentData.productJourneyStages];
    
    try {
      // 1. Update store optimistically
      store.addProductJourneyStage(completeStage);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        productDesignService.addJourneyStage(projectId, stage)
      );
      
      // 3. Update store with real ID
      store.updateProductJourneyStage(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.journeyStages });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding journey stage:', err);
      
      // 5. Revert optimistic update on error
      store.setProductJourneyStages(originalStages);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateJourneyStage = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<ProductJourneyStage, 'id' | 'created_at' | 'updated_at'>> }): Promise<ProductJourneyStage | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalStage = store.currentData.productJourneyStages.find(s => s.id === id);
    if (!originalStage) return null;
    
    try {
      // 1. Update store optimistically
      store.updateProductJourneyStage(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        productDesignService.updateJourneyStage(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.journeyStages });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating journey stage:', err);
      
      // 4. Revert optimistic update on error
      if (originalStage) {
        store.updateProductJourneyStage(id, originalStage);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteJourneyStage = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalStages = [...store.currentData.productJourneyStages];
    const stageToDelete = originalStages.find(s => s.id === id);
    if (!stageToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteProductJourneyStage(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        productDesignService.deleteJourneyStage(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.journeyStages });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting journey stage:', err);
      
      // 4. Revert optimistic update on error
      store.setProductJourneyStages(originalStages);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === Journey Actions Operations ===
  const addJourneyAction = useCallback(async (action: Omit<ProductJourneyAction, 'id' | 'created_at' | 'updated_at'>): Promise<ProductJourneyAction | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completeAction: ProductJourneyAction = {
      ...action,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalActions = [...store.currentData.productJourneyActions];
    
    try {
      // 1. Update store optimistically
      store.addProductJourneyAction(completeAction);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        productDesignService.addJourneyAction(projectId, action)
      );
      
      // 3. Update store with real ID
      store.updateProductJourneyAction(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.journeyActions });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding journey action:', err);
      
      // 5. Revert optimistic update on error
      store.setProductJourneyActions(originalActions);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateJourneyAction = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<ProductJourneyAction, 'id' | 'created_at' | 'updated_at'>> }): Promise<ProductJourneyAction | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalAction = store.currentData.productJourneyActions.find(a => a.id === id);
    if (!originalAction) return null;
    
    try {
      // 1. Update store optimistically
      store.updateProductJourneyAction(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        productDesignService.updateJourneyAction(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.journeyActions });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating journey action:', err);
      
      // 4. Revert optimistic update on error
      if (originalAction) {
        store.updateProductJourneyAction(id, originalAction);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteJourneyAction = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalActions = [...store.currentData.productJourneyActions];
    const actionToDelete = originalActions.find(a => a.id === id);
    if (!actionToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteProductJourneyAction(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        productDesignService.deleteJourneyAction(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.journeyActions });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting journey action:', err);
      
      // 4. Revert optimistic update on error
      store.setProductJourneyActions(originalActions);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === Journey Pain Points Operations ===
  const addJourneyPainPoint = useCallback(async (painPoint: Omit<ProductJourneyPainPoint, 'id' | 'created_at' | 'updated_at'>): Promise<ProductJourneyPainPoint | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const completePainPoint: ProductJourneyPainPoint = {
      ...painPoint,
      id: tempId,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Track original store state for possible rollback
    const originalPainPoints = [...store.currentData.productJourneyPainPoints];
    
    try {
      // 1. Update store optimistically
      store.addProductJourneyPainPoint(completePainPoint);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        productDesignService.addJourneyPainPoint(projectId, painPoint)
      );
      
      // 3. Update store with real ID
      store.updateProductJourneyPainPoint(tempId, { 
        id: result.id,
        created_at: result.created_at,
        updated_at: result.updated_at
      });
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.journeyPainPoints });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding journey pain point:', err);
      
      // 5. Revert optimistic update on error
      store.setProductJourneyPainPoints(originalPainPoints);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateJourneyPainPoint = useCallback(async ({ id, data: updates }: { id: string; data: Partial<Omit<ProductJourneyPainPoint, 'id' | 'created_at' | 'updated_at'>> }): Promise<ProductJourneyPainPoint | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalPainPoint = store.currentData.productJourneyPainPoints.find(p => p.id === id);
    if (!originalPainPoint) return null;
    
    try {
      // 1. Update store optimistically
      store.updateProductJourneyPainPoint(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        productDesignService.updateJourneyPainPoint(id, updates)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.journeyPainPoints });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating journey pain point:', err);
      
      // 4. Revert optimistic update on error
      if (originalPainPoint) {
        store.updateProductJourneyPainPoint(id, originalPainPoint);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteJourneyPainPoint = useCallback(async (id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalPainPoints = [...store.currentData.productJourneyPainPoints];
    const painPointToDelete = originalPainPoints.find(p => p.id === id);
    if (!painPointToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteProductJourneyPainPoint(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        productDesignService.deleteJourneyPainPoint(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.journeyPainPoints });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting journey pain point:', err);
      
      // 4. Revert optimistic update on error
      store.setProductJourneyPainPoints(originalPainPoints);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // Diff helpers
  const getWireframeChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('productWireframes', id), [store]);

  const getFeatureChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('productFeatures', id), [store]);

  const getJourneyStageChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('productJourneyStages', id), [store]);

  const getJourneyActionChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('productJourneyActions', id), [store]);

  const getJourneyPainPointChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('productJourneyPainPoints', id), [store]);

  return {
    data,
    isLoading: store.isLoading || submitting,
    error,

    // Wireframes
    addWireframe,
    updateWireframe,
    deleteWireframe,

    // Features
    addFeature,
    updateFeature,
    deleteFeature,

    // Journey Stages
    addJourneyStage,
    updateJourneyStage,
    deleteJourneyStage,

    // Journey Actions
    addJourneyAction,
    updateJourneyAction,
    deleteJourneyAction,

    // Journey Pain Points
    addJourneyPainPoint,
    updateJourneyPainPoint,
    deleteJourneyPainPoint,

    // Diff helpers
    getWireframeChangeType,
    getFeatureChangeType,
    getJourneyStageChangeType,
    getJourneyActionChangeType,
    getJourneyPainPointChangeType,
    isDiffMode: store.comparisonMode
  };
}