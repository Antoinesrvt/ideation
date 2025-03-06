import { useFeatureData } from './use-feature-data';
import { useCallback } from 'react';
import { Database } from '@/types/database';

// Database types for GRP tables
type GRPCategory = Database['public']['Tables']['grp_categories']['Row'];
type GRPSection = Database['public']['Tables']['grp_sections']['Row'];
type GRPItem = Database['public']['Tables']['grp_items']['Row'];

// Combined type for all GRP data
type GRPModel = {
  generation: {
    porteurs: GRPItem[];
    propositionValeur: GRPItem[];
    fabricationValeur: GRPItem[];
  };
  remuneration: {
    sourcesRevenus: GRPItem[];
    volumeRevenus: GRPItem[];
    performance: GRPItem[];
  };
  partage: {
    partiesPrenantes: GRPItem[];
    conventions: GRPItem[];
    ecosysteme: GRPItem[];
  };
};

// Type for new GRP items before they are added to the database
type NewGRPItem = {
  title: string;
  description: string | null;
  percentage: number | null;
  order_index: number | null;
  project_id: string | null;
  section_id: string | null;
};

/**
 * Hook for managing GRP model data in a project
 * @param projectId - The ID of the current project
 */
export function useGRP(projectId: string | undefined) {
  const featureData = useFeatureData<GRPModel, GRPItem>(
    projectId,
    'grpModel',
    {
      defaultData: {
        generation: {
          porteurs: [],
          propositionValeur: [],
          fabricationValeur: []
        },
        remuneration: {
          sourcesRevenus: [],
          volumeRevenus: [],
          performance: []
        },
        partage: {
          partiesPrenantes: [],
          conventions: [],
          ecosysteme: []
        }
      }
    }
  );

  // Add an item to a specific section of the GRP model
  const addItem = useCallback(async (
    category: keyof GRPModel,
    section: string,
    item: Omit<NewGRPItem, 'section_id' | 'project_id'>
  ) => {
    if (!projectId) throw new Error('Project ID is required');
    
    // Convert section name to section_type format
    const sectionType = section.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    const newItem = {
      ...item,
      project_id: projectId,
      section_id: null, // Will be set by the database trigger
      created_at: null,
      updated_at: null,
      created_by: null
    };
    
    return featureData.addItem(newItem, `${category}.${section}`);
  }, [featureData, projectId]);

  // Update an item in a specific section of the GRP model
  const updateItem = useCallback((
    category: keyof GRPModel,
    section: string,
    id: string,
    data: Partial<Omit<GRPItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'section_id'>>
  ) => {
    return featureData.updateItem(id, data, `${category}.${section}`);
  }, [featureData]);

  // Delete an item from a specific section of the GRP model
  const deleteItem = useCallback((
    category: keyof GRPModel,
    section: string,
    id: string
  ) => {
    return featureData.deleteItem(id, `${category}.${section}`);
  }, [featureData]);

  // Get all items across the entire GRP model
  const getAllItems = useCallback(() => {
    if (!featureData.data) return [];
    
    const allItems: GRPItem[] = [];
    const grpModel = featureData.data;
    
    Object.values(grpModel).forEach(category => {
      Object.values(category).forEach(items => {
        if (Array.isArray(items)) {
          allItems.push(...items);
        }
      });
    });
    
    return allItems;
  }, [featureData.data]);

  // Get metrics for the GRP model
  const getGRPMetrics = useCallback(() => {
    if (!featureData.data) return null;
    
    const grpModel = featureData.data;
    const categoryCounts: Record<string, number> = {};
    let totalItems = 0;
    
    Object.keys(grpModel).forEach(category => {
      const categoryItems = Object.values(grpModel[category as keyof GRPModel]).flat();
      categoryCounts[category] = categoryItems.length;
      totalItems += categoryItems.length;
    });
    
    const categories = Object.keys(categoryCounts);
    const mostPopulatedCategory = categories.reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, categories[0]);
    const leastPopulatedCategory = categories.reduce((a, b) => 
      categoryCounts[a] < categoryCounts[b] ? a : b, categories[0]);
    
    const itemsWithPercentage = getAllItems().filter(item => item.percentage !== null).length;
    const itemsWithoutPercentage = totalItems - itemsWithPercentage;
    
    return {
      totalItems,
      itemsWithPercentage,
      itemsWithoutPercentage,
      categoryCounts,
      mostPopulatedCategory,
      leastPopulatedCategory,
      completionPercentage: totalItems > 0 
        ? (itemsWithPercentage / totalItems) * 100 
        : 0
    };
  }, [featureData.data, getAllItems]);

  return {
    data: featureData.data,
    isLoading: featureData.isLoading,
    error: featureData.error,
    addItem,
    updateItem,
    deleteItem,
    getAllItems,
    getGRPMetrics
  };
}