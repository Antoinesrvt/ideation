import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { ProductDesignService, ProductDesignData } from '@/lib/services/features/product-design-service';
import { useProjectStore, ChangeType } from '@/store';
import type { 
  ProductWireframe,
  ProductFeature,
  ProductJourneyStage,
  ProductJourneyAction,
  ProductJourneyPainPoint
} from '@/store/types';

// Create service instance
const productDesignService = new ProductDesignService(createClient());

export interface UseProductDesignReturn {
  data: ProductDesignData;
  isLoading: boolean;
  error: Error | null;

  // Wireframes
  addWireframe: (wireframe: Omit<ProductWireframe, 'id' | 'created_at' | 'updated_at'>) => void;
  updateWireframe: (params: { id: string; data: Partial<Omit<ProductWireframe, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteWireframe: (id: string) => void;

  // Features
  addFeature: (feature: Omit<ProductFeature, 'id' | 'created_at' | 'updated_at'>) => void;
  updateFeature: (params: { id: string; data: Partial<Omit<ProductFeature, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteFeature: (id: string) => void;

  // Journey Stages
  addJourneyStage: (stage: Omit<ProductJourneyStage, 'id' | 'created_at' | 'updated_at'>) => void;
  updateJourneyStage: (params: { id: string; data: Partial<Omit<ProductJourneyStage, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteJourneyStage: (id: string) => void;

  // Journey Actions
  addJourneyAction: (action: Omit<ProductJourneyAction, 'id' | 'created_at' | 'updated_at'>) => void;
  updateJourneyAction: (params: { id: string; data: Partial<Omit<ProductJourneyAction, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteJourneyAction: (id: string) => void;

  // Journey Pain Points
  addJourneyPainPoint: (painPoint: Omit<ProductJourneyPainPoint, 'id' | 'created_at' | 'updated_at'>) => void;
  updateJourneyPainPoint: (params: { id: string; data: Partial<Omit<ProductJourneyPainPoint, 'id' | 'created_at' | 'updated_at'>> }) => void;
  deleteJourneyPainPoint: (id: string) => void;
  
  // Diff helpers
  getWireframeChangeType: (id: string) => ChangeType;
  getFeatureChangeType: (id: string) => ChangeType;
  getJourneyStageChangeType: (id: string) => ChangeType;
  getJourneyActionChangeType: (id: string) => ChangeType;
  getJourneyPainPointChangeType: (id: string) => ChangeType;
  isDiffMode: boolean;
}

// Helper types for API responses
interface ProductItemResponse {
  id: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export function useProductDesign(projectId: string | undefined): UseProductDesignReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const { comparisonMode } = store;
  
  // Query keys for different data types
  const queryKeys = {
    all: ['productDesign', projectId] as const,
    wireframes: ['productDesign', projectId, 'wireframes'] as const,
    features: ['productDesign', projectId, 'features'] as const,
    journeyStages: ['productDesign', projectId, 'journeyStages'] as const,
    journeyActions: ['productDesign', projectId, 'journeyActions'] as const,
    journeyPainPoints: ['productDesign', projectId, 'journeyPainPoints'] as const,
  };

  // Main query to fetch all product design data
  const { data: queryData, isLoading, error } = useQuery({
    queryKey: queryKeys.all,
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const result = await productDesignService.getAllProductDesignData(projectId);
      
      // Update store with fetched data
      if (result) {
        store.setProductWireframes(result.wireframes);
        store.setProductFeatures(result.features);
        store.setProductJourneyStages(result.journey.stages);
        store.setProductJourneyActions(result.journey.actions);
        store.setProductJourneyPainPoints(result.journey.painPoints);
      }
      
      return result;
    },
    enabled: !!projectId
  });

  // Get data from store (current or staged based on comparison mode)
  const storeData = comparisonMode && store.stagedData
    ? {
        productWireframes: store.stagedData.productWireframes,
        productFeatures: store.stagedData.productFeatures,
        productJourneyStages: store.stagedData.productJourneyStages,
        productJourneyActions: store.stagedData.productJourneyActions,
        productJourneyPainPoints: store.stagedData.productJourneyPainPoints
      }
    : {
        productWireframes: store.currentData.productWireframes,
        productFeatures: store.currentData.productFeatures,
        productJourneyStages: store.currentData.productJourneyStages,
        productJourneyActions: store.currentData.productJourneyActions,
        productJourneyPainPoints: store.currentData.productJourneyPainPoints
      };

  // Transform store data to the expected format
  const transformedData: ProductDesignData = {
    wireframes: storeData.productWireframes,
    features: storeData.productFeatures,
    journey: {
      stages: storeData.productJourneyStages,
      actions: storeData.productJourneyActions,
      painPoints: storeData.productJourneyPainPoints
    }
  };

  // === Wireframes Mutations ===
  const addWireframeMutation = useMutation({
    mutationFn: async (wireframe: Omit<ProductWireframe, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Create a temporary item for optimistic updates
      const tempWireframe: ProductWireframe = {
        id: `temp-${Date.now()}`,
        // project_id: projectId,
        ...wireframe,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Optimistic update in the store
      store.addProductWireframe(tempWireframe);
      
      // Then update Supabase
      const result = await productDesignService.addWireframe(projectId, wireframe);
      
      // Update store with real ID from Supabase
      if (result) {
        store.deleteProductWireframe(tempWireframe.id);
        store.addProductWireframe(result);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to add wireframe:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const updateWireframeMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<Omit<ProductWireframe, 'id' | 'created_at' | 'updated_at'>> }) => {
      // Optimistic update in store
      store.updateProductWireframe(params.id, params.data);
      
      // Then update Supabase
      return productDesignService.updateWireframe(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update wireframe:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteWireframeMutation = useMutation({
    mutationFn: async (id: string) => {
      // Optimistic update in store
      store.deleteProductWireframe(id);
      
      // Then update Supabase
      return productDesignService.deleteWireframe(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete wireframe:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  // === Features Mutations ===
  const addFeatureMutation = useMutation({
    mutationFn: async (feature: Omit<ProductFeature, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Create a temporary item for optimistic updates
      const tempFeature: ProductFeature = {
        id: `temp-${Date.now()}`,
        // project_id: projectId,
        ...feature,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Optimistic update in the store
      store.addProductFeature(tempFeature);
      
      // Then update Supabase
      const result = await productDesignService.addFeature(projectId, feature);
      
      // Update store with real ID from Supabase
      if (result) {
        store.deleteProductFeature(tempFeature.id);
        store.addProductFeature(result);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to add feature:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const updateFeatureMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<Omit<ProductFeature, 'id' | 'created_at' | 'updated_at'>> }) => {
      // Optimistic update in store
      store.updateProductFeature(params.id, params.data);
      
      // Then update Supabase
      return productDesignService.updateFeature(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update feature:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: async (id: string) => {
      // Optimistic update in store
      store.deleteProductFeature(id);
      
      // Then update Supabase
      return productDesignService.deleteFeature(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete feature:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  // === Journey Stages Mutations ===
  const addJourneyStageMutation = useMutation({
    mutationFn: async (stage: Omit<ProductJourneyStage, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Create a temporary item for optimistic updates
      const tempStage: ProductJourneyStage = {
        id: `temp-${Date.now()}`,
        // project_id: projectId,
        ...stage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Optimistic update in the store
      store.addProductJourneyStage(tempStage);
      
      // Then update Supabase
      const result = await productDesignService.addJourneyStage(projectId, stage);
      
      // Update store with real ID from Supabase
      if (result) {
        store.deleteProductJourneyStage(tempStage.id);
        store.addProductJourneyStage(result);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to add journey stage:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const updateJourneyStageMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<Omit<ProductJourneyStage, 'id' | 'created_at' | 'updated_at'>> }) => {
      // Optimistic update in store
      store.updateProductJourneyStage(params.id, params.data);
      
      // Then update Supabase
      return productDesignService.updateJourneyStage(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update journey stage:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteJourneyStageMutation = useMutation({
    mutationFn: async (id: string) => {
      // Optimistic update in store
      store.deleteProductJourneyStage(id);
      
      // Then update Supabase
      return productDesignService.deleteJourneyStage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete journey stage:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  // === Journey Actions Mutations ===
  const addJourneyActionMutation = useMutation({
    mutationFn: async (action: Omit<ProductJourneyAction, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Create a temporary item for optimistic updates
      const tempAction: ProductJourneyAction = {
        id: `temp-${Date.now()}`,
        // project_id: projectId,
        ...action,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Optimistic update in the store
      store.addProductJourneyAction(tempAction);
      
      // Then update Supabase
      const result = await productDesignService.addJourneyAction(projectId, action);
      
      // Update store with real ID from Supabase
      if (result) {
        store.deleteProductJourneyAction(tempAction.id);
        store.addProductJourneyAction(result);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to add journey action:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const updateJourneyActionMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<Omit<ProductJourneyAction, 'id' | 'created_at' | 'updated_at'>> }) => {
      // Optimistic update in store
      store.updateProductJourneyAction(params.id, params.data);
      
      // Then update Supabase
      return productDesignService.updateJourneyAction(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update journey action:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteJourneyActionMutation = useMutation({
    mutationFn: async (id: string) => {
      // Optimistic update in store
      store.deleteProductJourneyAction(id);
      
      // Then update Supabase
      return productDesignService.deleteJourneyAction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete journey action:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  // === Journey Pain Points Mutations ===
  const addJourneyPainPointMutation = useMutation({
    mutationFn: async (painPoint: Omit<ProductJourneyPainPoint, 'id' | 'created_at' | 'updated_at'>) => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Create a temporary item for optimistic updates
      const tempPainPoint: ProductJourneyPainPoint = {
        id: `temp-${Date.now()}`,
        // project_id: projectId,
        ...painPoint,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Optimistic update in the store
      store.addProductJourneyPainPoint(tempPainPoint);
      
      // Then update Supabase
      const result = await productDesignService.addJourneyPainPoint(projectId, painPoint);
      
      // Update store with real ID from Supabase
      if (result) {
        store.deleteProductJourneyPainPoint(tempPainPoint.id);
        store.addProductJourneyPainPoint(result);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to add journey pain point:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const updateJourneyPainPointMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<Omit<ProductJourneyPainPoint, 'id' | 'created_at' | 'updated_at'>> }) => {
      // Optimistic update in store
      store.updateProductJourneyPainPoint(params.id, params.data);
      
      // Then update Supabase
      return productDesignService.updateJourneyPainPoint(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to update journey pain point:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteJourneyPainPointMutation = useMutation({
    mutationFn: async (id: string) => {
      // Optimistic update in store
      store.deleteProductJourneyPainPoint(id);
      
      // Then update Supabase
      return productDesignService.deleteJourneyPainPoint(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => {
      console.error('Failed to delete journey pain point:', error);
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });
  
  // Diff helpers
  const getWireframeChangeType = (id: string): ChangeType => 
    store.getItemChangeType('productWireframes', id);
  
  const getFeatureChangeType = (id: string): ChangeType => 
    store.getItemChangeType('productFeatures', id);
  
  const getJourneyStageChangeType = (id: string): ChangeType => 
    store.getItemChangeType('productJourneyStages', id);
  
  const getJourneyActionChangeType = (id: string): ChangeType => 
    store.getItemChangeType('productJourneyActions', id);
  
  const getJourneyPainPointChangeType = (id: string): ChangeType => 
    store.getItemChangeType('productJourneyPainPoints', id);
  
  return {
    data: transformedData || queryData || {
      wireframes: [],
      features: [],
      journey: {
        stages: [],
        actions: [],
        painPoints: []
      }
    },
    isLoading,
    error: error as Error | null,

    // Wireframes
    addWireframe: addWireframeMutation.mutate,
    updateWireframe: updateWireframeMutation.mutate,
    deleteWireframe: deleteWireframeMutation.mutate,

    // Features
    addFeature: addFeatureMutation.mutate,
    updateFeature: updateFeatureMutation.mutate,
    deleteFeature: deleteFeatureMutation.mutate,

    // Journey Stages
    addJourneyStage: addJourneyStageMutation.mutate,
    updateJourneyStage: updateJourneyStageMutation.mutate,
    deleteJourneyStage: deleteJourneyStageMutation.mutate,

    // Journey Actions
    addJourneyAction: addJourneyActionMutation.mutate,
    updateJourneyAction: updateJourneyActionMutation.mutate,
    deleteJourneyAction: deleteJourneyActionMutation.mutate,

    // Journey Pain Points
    addJourneyPainPoint: addJourneyPainPointMutation.mutate,
    updateJourneyPainPoint: updateJourneyPainPointMutation.mutate,
    deleteJourneyPainPoint: deleteJourneyPainPointMutation.mutate,
    
    // Diff helpers
    getWireframeChangeType,
    getFeatureChangeType,
    getJourneyStageChangeType,
    getJourneyActionChangeType,
    getJourneyPainPointChangeType,
    isDiffMode: comparisonMode,
  };
}