import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { ProductDesignData } from '@/lib/services/features/product-design-service';
import { productDesignService } from '@/lib/services';
import { useProjectStore } from '@/store';
import type { 
  ProductWireframe,
  ProductFeature,
  ProductJourneyStage,
  ProductJourneyAction,
  ProductJourneyPainPoint,
  ChangeType,
  Insert,
  Update
} from '@/store/types';
import { useOptimisticCreate, useOptimisticUpdate, useOptimisticDelete } from '../utils/optimistic-helpers';

// Constants for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

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

export interface UseProductDesignReturn {
  data: ProductDesignData;
  isLoading: boolean;
  error: Error | null;

  // Wireframes
  addWireframe: (wireframe: Insert<'product_wireframes'>) => Promise<ProductWireframe | null>;
  updateWireframe: (params: { id: string; data: Update<'product_wireframes'> }) => Promise<ProductWireframe | null>;
  deleteWireframe: (id: string) => Promise<boolean>;

  // Features
  addFeature: (feature: Insert<'product_features'>) => Promise<ProductFeature | null>;
  updateFeature: (params: { id: string; data: Update<'product_features'> }) => Promise<ProductFeature | null>;
  deleteFeature: (id: string) => Promise<boolean>;

  // Journey Stages
  addJourneyStage: (stage: Insert<'product_journey_stages'>) => Promise<ProductJourneyStage | null>;
  updateJourneyStage: (params: { id: string; data: Update<'product_journey_stages'> }) => Promise<ProductJourneyStage | null>;
  deleteJourneyStage: (id: string) => Promise<boolean>;

  // Journey Actions
  addJourneyAction: (action: Insert<'product_journey_actions'>) => Promise<ProductJourneyAction | null>;
  updateJourneyAction: (params: { id: string; data: Update<'product_journey_actions'> }) => Promise<ProductJourneyAction | null>;
  deleteJourneyAction: (id: string) => Promise<boolean>;

  // Journey Pain Points
  addJourneyPainPoint: (painPoint: Insert<'product_journey_pain_points'>) => Promise<ProductJourneyPainPoint | null>;
  updateJourneyPainPoint: (params: { id: string; data: Update<'product_journey_pain_points'> }) => Promise<ProductJourneyPainPoint | null>;
  deleteJourneyPainPoint: (id: string) => Promise<boolean>;
  
  // Diff helpers
  getWireframeChangeType: (id: string) => ChangeType;
  getFeatureChangeType: (id: string) => ChangeType;
  getJourneyStageChangeType: (id: string) => ChangeType;
  getJourneyActionChangeType: (id: string) => ChangeType;
  getJourneyPainPointChangeType: (id: string) => ChangeType;
  isDiffMode: boolean;
}

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
  
  // Create stable, memoized query keys to prevent unnecessary refetching
  const queryKeys = useMemo(() => ({
    all: ['productDesign', projectId] as const,
    wireframes: ['productDesign', projectId, 'wireframes'] as const,
    features: ['productDesign', projectId, 'features'] as const,
    journeyStages: ['productDesign', projectId, 'journeyStages'] as const,
    journeyActions: ['productDesign', projectId, 'journeyActions'] as const,
    journeyPainPoints: ['productDesign', projectId, 'journeyPainPoints'] as const,
  }), [projectId]);

  // Use React Query to fetch data
  const { 
    data: wireframesData, 
    isLoading: wireframesLoading, 
    error: wireframesError 
  } = useQuery({
    queryKey: queryKeys.wireframes,
    queryFn: () => productDesignService.getWireframes(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: featuresData, 
    isLoading: featuresLoading, 
    error: featuresError 
  } = useQuery({
    queryKey: queryKeys.features,
    queryFn: () => productDesignService.getFeatures(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: journeyStagesData, 
    isLoading: journeyStagesLoading, 
    error: journeyStagesError 
  } = useQuery({
    queryKey: queryKeys.journeyStages,
    queryFn: () => productDesignService.getJourneyStages(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: journeyActionsData, 
    isLoading: journeyActionsLoading, 
    error: journeyActionsError 
  } = useQuery({
    queryKey: queryKeys.journeyActions,
    queryFn: () => productDesignService.getJourneyActions(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { 
    data: journeyPainPointsData, 
    isLoading: journeyPainPointsLoading, 
    error: journeyPainPointsError 
  } = useQuery({
    queryKey: queryKeys.journeyPainPoints,
    queryFn: () => productDesignService.getJourneyPainPoints(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update store when query data changes, but only if the data is different
  useEffect(() => {
    if (wireframesData && !arraysEqual(wireframesData, store.currentData.productWireframes)) {
      store.setProductWireframes(wireframesData);
    }
  }, [wireframesData, store]);

  useEffect(() => {
    if (featuresData && !arraysEqual(featuresData, store.currentData.productFeatures)) {
      store.setProductFeatures(featuresData);
    }
  }, [featuresData, store]);

  useEffect(() => {
    if (journeyStagesData && !arraysEqual(journeyStagesData, store.currentData.productJourneyStages)) {
      store.setProductJourneyStages(journeyStagesData);
    }
  }, [journeyStagesData, store]);

  useEffect(() => {
    if (journeyActionsData && !arraysEqual(journeyActionsData, store.currentData.productJourneyActions)) {
      store.setProductJourneyActions(journeyActionsData);
    }
  }, [journeyActionsData, store]);

  useEffect(() => {
    if (journeyPainPointsData && !arraysEqual(journeyPainPointsData, store.currentData.productJourneyPainPoints)) {
      store.setProductJourneyPainPoints(journeyPainPointsData);
    }
  }, [journeyPainPointsData, store]);

  // For comparison mode, we still want to use store data
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

  // If in comparison mode, use store data, otherwise use React Query data
  const data: ProductDesignData = useMemo(() => {
    if (store.comparisonMode) {
      // In comparison mode, use store data
      return {
        wireframes: storeData.productWireframes,
        features: storeData.productFeatures,
        journey: {
          stages: storeData.productJourneyStages,
          actions: storeData.productJourneyActions,
          painPoints: storeData.productJourneyPainPoints
        }
      };
    } else {
      // In normal mode, use React Query data
      return {
        wireframes: wireframesData || [],
        features: featuresData || [],
        journey: {
          stages: journeyStagesData || [],
          actions: journeyActionsData || [],
          painPoints: journeyPainPointsData || []
        }
      };
    }
  }, [
    store.comparisonMode, 
    storeData, 
    wireframesData, 
    featuresData, 
    journeyStagesData, 
    journeyActionsData, 
    journeyPainPointsData
  ]);

  // Compute loading and error states for React Query
  const isLoading = wireframesLoading || 
                   featuresLoading || 
                   journeyStagesLoading || 
                   journeyActionsLoading || 
                   journeyPainPointsLoading;
  
  const queryError = wireframesError || 
                    featuresError || 
                    journeyStagesError || 
                    journeyActionsError || 
                    journeyPainPointsError;

  // === Wireframe Operations ===
  // Use our optimistic helper hooks
  const addWireframeOptimistic = useOptimisticCreate<'product_wireframes'>({
    projectId,
    tableName: 'product_wireframes',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.wireframes],
    setSubmitting,
    methods: {
      add: 'addWireframe'
    }
  });

  const updateWireframeOptimistic = useOptimisticUpdate<'product_wireframes'>({
    tableName: 'product_wireframes',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.wireframes],
    setSubmitting,
    methods: {
      update: 'updateWireframe'
    }
  });

  const deleteWireframeOptimistic = useOptimisticDelete({
    tableName: 'product_wireframes',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.wireframes],
    setSubmitting,
    methods: {
      delete: 'deleteWireframe'
    }
  });

  // === Feature Operations ===
  // Use our optimistic helper hooks
  const addFeatureOptimistic = useOptimisticCreate<'product_features'>({
    projectId,
    tableName: 'product_features',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.features],
    setSubmitting,
    methods: {
      add: 'addFeature'
    }
  });

  const updateFeatureOptimistic = useOptimisticUpdate<'product_features'>({
    tableName: 'product_features',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.features],
    setSubmitting,
    methods: {
      update: 'updateFeature'
    }
  });

  const deleteFeatureOptimistic = useOptimisticDelete({
    tableName: 'product_features',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.features],
    setSubmitting,
    methods: {
      delete: 'deleteFeature'
    }
  });

  // === Journey Stage Operations ===
  // Use our optimistic helper hooks
  const addJourneyStageOptimistic = useOptimisticCreate<'product_journey_stages'>({
    projectId,
    tableName: 'product_journey_stages',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.journeyStages],
    setSubmitting,
    methods: {
      add: 'addJourneyStage'
    }
  });

  const updateJourneyStageOptimistic = useOptimisticUpdate<'product_journey_stages'>({
    tableName: 'product_journey_stages',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.journeyStages],
    setSubmitting,
    methods: {
      update: 'updateJourneyStage'
    }
  });

  const deleteJourneyStageOptimistic = useOptimisticDelete({
    tableName: 'product_journey_stages',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.journeyStages],
    setSubmitting,
    methods: {
      delete: 'deleteJourneyStage'
    }
  });

  // === Journey Action Operations ===
  // Use our optimistic helper hooks
  const addJourneyActionOptimistic = useOptimisticCreate<'product_journey_actions'>({
    projectId,
    tableName: 'product_journey_actions',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.journeyActions],
    setSubmitting,
    methods: {
      add: 'addJourneyAction'
    }
  });

  const updateJourneyActionOptimistic = useOptimisticUpdate<'product_journey_actions'>({
    tableName: 'product_journey_actions',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.journeyActions],
    setSubmitting,
    methods: {
      update: 'updateJourneyAction'
    }
  });

  const deleteJourneyActionOptimistic = useOptimisticDelete({
    tableName: 'product_journey_actions',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.journeyActions],
    setSubmitting,
    methods: {
      delete: 'deleteJourneyAction'
    }
  });

  // === Journey Pain Point Operations ===
  // Use our optimistic helper hooks
  const addJourneyPainPointOptimistic = useOptimisticCreate<'product_journey_pain_points'>({
    projectId,
    tableName: 'product_journey_pain_points',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.journeyPainPoints],
    setSubmitting,
    methods: {
      add: 'addJourneyPainPoint'
    }
  });

  const updateJourneyPainPointOptimistic = useOptimisticUpdate<'product_journey_pain_points'>({
    tableName: 'product_journey_pain_points',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.journeyPainPoints],
    setSubmitting,
    methods: {
      update: 'updateJourneyPainPoint'
    }
  });

  const deleteJourneyPainPointOptimistic = useOptimisticDelete({
    tableName: 'product_journey_pain_points',
    store,
    service: productDesignService,
    queryClient,
    queryKey: [...queryKeys.journeyPainPoints],
    setSubmitting,
    methods: {
      delete: 'deleteJourneyPainPoint'
    }
  });

  // Exposed API methods
  const addWireframe = useCallback(async (wireframe: Insert<'product_wireframes'>): Promise<ProductWireframe | null> => {
    return addWireframeOptimistic(wireframe);
  }, [addWireframeOptimistic]);

  const updateWireframe = useCallback(async (params: { id: string; data: Update<'product_wireframes'> }): Promise<ProductWireframe | null> => {
    return updateWireframeOptimistic(params.id, params.data);
  }, [updateWireframeOptimistic]);

  const deleteWireframe = useCallback(async (id: string): Promise<boolean> => {
    return deleteWireframeOptimistic(id);
  }, [deleteWireframeOptimistic]);

  const addFeature = useCallback(async (feature: Insert<'product_features'>): Promise<ProductFeature | null> => {
    return addFeatureOptimistic(feature);
  }, [addFeatureOptimistic]);

  const updateFeature = useCallback(async (params: { id: string; data: Update<'product_features'> }): Promise<ProductFeature | null> => {
    return updateFeatureOptimistic(params.id, params.data);
  }, [updateFeatureOptimistic]);

  const deleteFeature = useCallback(async (id: string): Promise<boolean> => {
    return deleteFeatureOptimistic(id);
  }, [deleteFeatureOptimistic]);

  const addJourneyStage = useCallback(async (stage: Insert<'product_journey_stages'>): Promise<ProductJourneyStage | null> => {
    return addJourneyStageOptimistic(stage);
  }, [addJourneyStageOptimistic]);

  const updateJourneyStage = useCallback(async (params: { id: string; data: Update<'product_journey_stages'> }): Promise<ProductJourneyStage | null> => {
    return updateJourneyStageOptimistic(params.id, params.data);
  }, [updateJourneyStageOptimistic]);

  const deleteJourneyStage = useCallback(async (id: string): Promise<boolean> => {
    return deleteJourneyStageOptimistic(id);
  }, [deleteJourneyStageOptimistic]);

  const addJourneyAction = useCallback(async (action: Insert<'product_journey_actions'>): Promise<ProductJourneyAction | null> => {
    return addJourneyActionOptimistic(action);
  }, [addJourneyActionOptimistic]);

  const updateJourneyAction = useCallback(async (params: { id: string; data: Update<'product_journey_actions'> }): Promise<ProductJourneyAction | null> => {
    return updateJourneyActionOptimistic(params.id, params.data);
  }, [updateJourneyActionOptimistic]);

  const deleteJourneyAction = useCallback(async (id: string): Promise<boolean> => {
    return deleteJourneyActionOptimistic(id);
  }, [deleteJourneyActionOptimistic]);

  const addJourneyPainPoint = useCallback(async (painPoint: Insert<'product_journey_pain_points'>): Promise<ProductJourneyPainPoint | null> => {
    return addJourneyPainPointOptimistic(painPoint);
  }, [addJourneyPainPointOptimistic]);

  const updateJourneyPainPoint = useCallback(async (params: { id: string; data: Update<'product_journey_pain_points'> }): Promise<ProductJourneyPainPoint | null> => {
    return updateJourneyPainPointOptimistic(params.id, params.data);
  }, [updateJourneyPainPointOptimistic]);

  const deleteJourneyPainPoint = useCallback(async (id: string): Promise<boolean> => {
    return deleteJourneyPainPointOptimistic(id);
  }, [deleteJourneyPainPointOptimistic]);

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
    isLoading,
    error: queryError,

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