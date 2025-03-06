import { useFeatureData } from './use-feature-data';
import { useCallback } from 'react';
import { Database } from '@/types/database';

// Database types for product design tables
type ProductWireframe = Database['public']['Tables']['product_wireframes']['Row'];
type ProductFeature = Database['public']['Tables']['product_features']['Row'];
type ProductJourneyStage = Database['public']['Tables']['product_journey_stages']['Row'];
type ProductJourneyAction = Database['public']['Tables']['product_journey_actions']['Row'];
type ProductJourneyPainPoint = Database['public']['Tables']['product_journey_pain_points']['Row'];

// Combined type for all product design data
type ProductDesignData = {
  wireframes: ProductWireframe[];
  features: ProductFeature[];
  journeyStages: ProductJourneyStage[];
  journeyActions: ProductJourneyAction[];
  journeyPainPoints: ProductJourneyPainPoint[];
};

// Base type for any product design item
type BaseItem = {
  id: string;
  project_id: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ProductDesignItem = BaseItem & (
  | Omit<ProductWireframe, keyof BaseItem>
  | Omit<ProductFeature, keyof BaseItem>
  | Omit<ProductJourneyStage, keyof BaseItem>
  | Omit<ProductJourneyAction, keyof BaseItem>
  | Omit<ProductJourneyPainPoint, keyof BaseItem>
);

/**
 * Hook for managing product design data including wireframes, features, and user journey
 * @param projectId - The ID of the current project
 */
export function useProductDesign(projectId: string | undefined) {
  const featureData = useFeatureData<ProductDesignData, ProductDesignItem>(
    projectId,
    'userFlow',
    {
      defaultData: {
        wireframes: [],
        features: [],
        journeyStages: [],
        journeyActions: [],
        journeyPainPoints: []
      }
    }
  );

  // ===== Wireframes =====
  const addWireframe = useCallback(async (wireframe: Omit<ProductWireframe, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...wireframe,
      project_id: projectId,
      created_by: null,
      created_at: null,
      updated_at: null
    } as ProductDesignItem, 'wireframes');
  }, [featureData, projectId]);

  const updateWireframe = useCallback((id: string, data: Partial<Omit<ProductWireframe, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => {
    return featureData.updateItem(id, data as Partial<ProductDesignItem>, 'wireframes');
  }, [featureData]);

  const deleteWireframe = useCallback((id: string) => {
    return featureData.deleteItem(id, 'wireframes');
  }, [featureData]);

  // ===== Features =====
  const addFeature = useCallback(async (feature: Omit<ProductFeature, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...feature,
      project_id: projectId,
      created_by: null,
      created_at: null,
      updated_at: null
    } as ProductDesignItem, 'features');
  }, [featureData, projectId]);

  const updateFeature = useCallback((id: string, data: Partial<Omit<ProductFeature, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => {
    return featureData.updateItem(id, data as Partial<ProductDesignItem>, 'features');
  }, [featureData]);

  const deleteFeature = useCallback((id: string) => {
    return featureData.deleteItem(id, 'features');
  }, [featureData]);

  // ===== Journey Stages =====
  const addJourneyStage = useCallback(async (stage: Omit<ProductJourneyStage, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...stage,
      project_id: projectId,
      created_by: null,
      created_at: null,
      updated_at: null
    } as ProductDesignItem, 'journeyStages');
  }, [featureData, projectId]);

  const updateJourneyStage = useCallback((id: string, data: Partial<Omit<ProductJourneyStage, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => {
    return featureData.updateItem(id, data as Partial<ProductDesignItem>, 'journeyStages');
  }, [featureData]);

  const deleteJourneyStage = useCallback((id: string) => {
    return featureData.deleteItem(id, 'journeyStages');
  }, [featureData]);

  // ===== Journey Actions =====
  const addJourneyAction = useCallback(async (action: Omit<ProductJourneyAction, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...action,
      project_id: projectId,
      created_by: null,
      created_at: null,
      updated_at: null
    } as ProductDesignItem, 'journeyActions');
  }, [featureData, projectId]);

  const updateJourneyAction = useCallback((id: string, data: Partial<Omit<ProductJourneyAction, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => {
    return featureData.updateItem(id, data as Partial<ProductDesignItem>, 'journeyActions');
  }, [featureData]);

  const deleteJourneyAction = useCallback((id: string) => {
    return featureData.deleteItem(id, 'journeyActions');
  }, [featureData]);

  // ===== Journey Pain Points =====
  const addJourneyPainPoint = useCallback(async (painPoint: Omit<ProductJourneyPainPoint, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    if (!projectId) throw new Error('Project ID is required');
    return featureData.addItem({
      ...painPoint,
      project_id: projectId,
      created_by: null,
      created_at: null,
      updated_at: null
    } as ProductDesignItem, 'journeyPainPoints');
  }, [featureData, projectId]);

  const updateJourneyPainPoint = useCallback((id: string, data: Partial<Omit<ProductJourneyPainPoint, 'id' | 'created_at' | 'updated_at' | 'created_by'>>) => {
    return featureData.updateItem(id, data as Partial<ProductDesignItem>, 'journeyPainPoints');
  }, [featureData]);

  const deleteJourneyPainPoint = useCallback((id: string) => {
    return featureData.deleteItem(id, 'journeyPainPoints');
  }, [featureData]);

  // Advanced operations
  const getFeaturesByStatus = useCallback(() => {
    const { features } = featureData.data || { features: [] };
    return features.reduce((acc, feature) => {
      const status = feature.status || 'planned';
      acc[status] = (acc[status] || []).concat(feature);
      return acc;
    }, {} as Record<string, ProductFeature[]>);
  }, [featureData.data]);

  const getJourneyStageActions = useCallback((stageId: string) => {
    const { journeyActions } = featureData.data || { journeyActions: [] };
    return journeyActions.filter(action => action.stage_id === stageId);
  }, [featureData.data]);

  const getJourneyStagePainPoints = useCallback((stageId: string) => {
    const { journeyPainPoints } = featureData.data || { journeyPainPoints: [] };
    return journeyPainPoints.filter(painPoint => painPoint.stage_id === stageId);
  }, [featureData.data]);

  return {
    // Raw data
    data: featureData.data,
    isLoading: featureData.isLoading,
    error: featureData.error,
    
    // Wireframes
    wireframes: featureData.data?.wireframes || [],
    addWireframe,
    updateWireframe,
    deleteWireframe,
    
    // Features
    features: featureData.data?.features || [],
    addFeature,
    updateFeature,
    deleteFeature,
    getFeaturesByStatus,
    
    // Journey Stages
    journeyStages: featureData.data?.journeyStages || [],
    addJourneyStage,
    updateJourneyStage,
    deleteJourneyStage,
    
    // Journey Actions
    journeyActions: featureData.data?.journeyActions || [],
    addJourneyAction,
    updateJourneyAction,
    deleteJourneyAction,
    getJourneyStageActions,
    
    // Journey Pain Points
    journeyPainPoints: featureData.data?.journeyPainPoints || [],
    addJourneyPainPoint,
    updateJourneyPainPoint,
    deleteJourneyPainPoint,
    getJourneyStagePainPoints
  };
}