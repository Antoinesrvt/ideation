import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { GRPService, GRPModel, GRPCategory } from '@/lib/services/features/grp-service';
import { useProjectStore, ChangeType } from '@/store';
import type { GrpItem, GrpCategory as StoreGrpCategory, GrpSection } from '@/store/types';

// Create service instance
const grpService = new GRPService(createClient());

// Type for new GRP items before they are added to the database
type NewGRPItem = {
  title: string;
  description: string | null;
  percentage: number | null;
  order_index: number | null;
  created_by: string | null;
};

// Extended GRP item type with category and section info for our UI
interface ExtendedGrpItem extends GrpItem {
  categoryType: string;
  sectionName: string;
}

export interface UseGRPReturn {
  data: GRPModel;
  isLoading: boolean;
  error: Error | null;

  // Core operations
  addItem: (category: GRPCategory, section: string, item: NewGRPItem) => void;
  updateItem: (category: GRPCategory, section: string, id: string, data: Partial<NewGRPItem>) => void;
  deleteItem: (category: GRPCategory, section: string, id: string) => void;

  // Diff helpers
  getItemChangeType: (id: string) => ChangeType;
  getCategoryChangeType: (id: string) => ChangeType;
  getSectionChangeType: (id: string) => ChangeType;
  isDiffMode: boolean;

  // Analytics
  getAllItems: () => ExtendedGrpItem[];
  getGRPMetrics: () => {
    totalItems: number;
    itemsWithPercentage: number;
    itemsWithoutPercentage: number;
    categoryCounts: Record<string, number>;
    mostPopulatedCategory: string;
    leastPopulatedCategory: string;
    completionPercentage: number;
  } | null;
}

// Helper type for service responses
interface GrpItemResponse {
  id: string;
  category_id: string;
  section_id: string;
  title: string;
  description: string | null;
  percentage: number | null;
  order_index: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useGRP(projectId: string | undefined): UseGRPReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const { comparisonMode } = store;

  // Query keys
  const queryKeys = {
    all: ['grp', projectId] as const,
    categories: ['grp', projectId, 'categories'] as const,
    sections: (categoryId: string) => ['grp', projectId, 'sections', categoryId] as const,
    items: (sectionId: string) => ['grp', projectId, 'items', sectionId] as const,
  };

  // Main query to fetch all GRP data
  const { data: queryData, isLoading, error } = useQuery({
    queryKey: queryKeys.all,
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const result = await grpService.getAllGRPData(projectId);
      
      // Update store with fetched data
      if (result) {
        // Process categories and sections
        const categories: StoreGrpCategory[] = [];
        const sections: GrpSection[] = [];
        const items: ExtendedGrpItem[] = [];
        
        // Extract and transform data from the result to fit our store structure
        Object.entries(result).forEach(([categoryType, categoryData]) => {
          // Create a category in our store format
          const category: StoreGrpCategory = {
            id: `${categoryType}`,
            project_id: projectId,
            category_type: categoryType,
            //description: null,
            order_index: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: null,
          };
          
          categories.push(category);
          
          // Process sections for this category
          Object.entries(categoryData).forEach(([sectionName, sectionItems]) => {
            // Create a section in our store format
            const section: GrpSection = {
              id: `${categoryType}-${sectionName}`,
              category_id: category.id,
              project_id: projectId,
              name: sectionName,
              section_type: sectionName,
              created_by: null,
              order_index: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            sections.push(section);
            
            // Process items
            if (Array.isArray(sectionItems)) {
              sectionItems.forEach((item: GrpItemResponse) => {
                // Create an extended item with category and section info
                const extendedItem: ExtendedGrpItem = {
                  ...item,
                  project_id: projectId,
                  categoryType,
                  sectionName
                };
                
                items.push(extendedItem);
              });
            }
          });
        });
        
        // Update store with processed data
        store.setGrpCategories(categories);
        store.setGrpSections(sections);
        store.setGrpItems(items as unknown as GrpItem[]);
      }
      
      return result;
    },
    enabled: !!projectId
  });

  // Get data from store (current or staged based on comparison mode)
  const storeData = comparisonMode && store.stagedData
    ? {
        grpCategories: store.stagedData.grpCategories,
        grpSections: store.stagedData.grpSections,
        grpItems: store.stagedData.grpItems as unknown as ExtendedGrpItem[]
      }
    : {
        grpCategories: store.currentData.grpCategories,
        grpSections: store.currentData.grpSections,
        grpItems: store.currentData.grpItems as unknown as ExtendedGrpItem[]
      };

  // Transform store data into the expected GRPModel format
  const transformStoreDataToGRPModel = (): GRPModel => {
    const model: GRPModel = {
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
    };
    
    // Create mapping of category types to their sections
    const categoryMap: Record<string, string[]> = {
      generation: ['porteurs', 'propositionValeur', 'fabricationValeur'],
      remuneration: ['sourcesRevenus', 'volumeRevenus', 'performance'],
      partage: ['partiesPrenantes', 'conventions', 'ecosysteme']
    };
    
    // Organize items by category and section
    storeData.grpItems.forEach(item => {
      const { categoryType, sectionName } = item;
      
      if (categoryType in model && sectionName in model[categoryType as keyof GRPModel]) {
        (model[categoryType as keyof GRPModel][sectionName as keyof typeof model[keyof GRPModel]] as GrpItem[]).push(item);
      }
    });
    
    return model;
  };

  // === Mutations ===
  const addItemMutation = useMutation({
    mutationFn: async (params: { category: GRPCategory; section: string; item: NewGRPItem }) => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Find section id from our store
      const sectionId = storeData.grpSections.find(s => 
        s.name === params.section && s.category_id === params.category
      )?.id;
      
      if (!sectionId) {
        throw new Error(`Section ${params.section} not found in category ${params.category}`);
      }
      
      // Create a temporary item for optimistic updates
      const tempItem: ExtendedGrpItem = {
        id: `temp-${Date.now()}`,
        section_id: sectionId,
        // category_id: params.category,
        project_id: projectId,
        title: params.item.title,
        description: params.item.description,
        percentage: params.item.percentage,
        order_index: params.item.order_index || 0,
        created_by: params.item.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        categoryType: params.category,
        sectionName: params.section
      };
      
      // Optimistic update in the store
      store.addGrpItem(tempItem as unknown as GrpItem);
      
      // Then update Supabase
      const result = await grpService.addItem(projectId, params.category, params.section, params.item);
      
      // Update store with real ID from Supabase
      if (result) {
        store.deleteGrpItem(tempItem.id);
        
        // Add the item with the real ID
        const realItem: ExtendedGrpItem = {
          ...(result),
          categoryType: params.category,
          sectionName: params.section
        };
        
        store.addGrpItem(realItem as unknown as GrpItem);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error, variables) => {
      // Revert optimistic update on error
      console.error('Failed to add item:', error);
      
      // Get the temp ID that would have been created
      const tempId = `temp-${Date.now() - 100}`; // Approximate the ID that was created
      store.deleteGrpItem(tempId);
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<NewGRPItem> }) => {
      // Optimistic update in store
      store.updateGrpItem(params.id, params.data);
      
      // Then update Supabase
      return grpService.updateItem(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error, variables) => {
      // Revert optimistic update on error
      console.error('Failed to update item:', error);
      
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get the item before deleting for potential rollback
      const itemToDelete = storeData.grpItems.find(item => item.id === id);
      
      // Optimistic update in store
      if (itemToDelete) {
        store.deleteGrpItem(id);
      }
      
      // Then update Supabase
      return grpService.deleteItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error, variables) => {
      // Revert optimistic update on error
      console.error('Failed to delete item:', error);
      
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  // === Helper Functions ===
  const getAllItems = (): ExtendedGrpItem[] => {
    return storeData.grpItems;
  };

  const getGRPMetrics = () => {
    const items = getAllItems();
    if (items.length === 0) return null;
    
    const categoryCounts: Record<string, number> = {};
    
    items.forEach(item => {
      const categoryType = item.categoryType;
      if (!categoryCounts[categoryType]) {
        categoryCounts[categoryType] = 0;
      }
      categoryCounts[categoryType]++;
    });
    
    const categories = Object.keys(categoryCounts);
    const mostPopulatedCategory = categories.reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, categories[0]);
    const leastPopulatedCategory = categories.reduce((a, b) => 
      categoryCounts[a] < categoryCounts[b] ? a : b, categories[0]);
    
    const totalItems = items.length;
    const itemsWithPercentage = items.filter(item => item.percentage !== null).length;
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
  };

  // Diff helpers
  const getItemChangeType = (id: string): ChangeType => 
    store.getItemChangeType('grpItems', id);
  
  const getCategoryChangeType = (id: string): ChangeType => 
    store.getItemChangeType('grpCategories', id);
  
  const getSectionChangeType = (id: string): ChangeType => 
    store.getItemChangeType('grpSections', id);

  // Prepare data for return
  const transformedData = transformStoreDataToGRPModel();
  const finalData: GRPModel = transformedData || queryData || {
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
  };
  
  return {
    data: finalData,
    isLoading,
    error: error as Error | null,

    // Core operations
    addItem: (category, section, item) => addItemMutation.mutate({ category, section, item }),
    updateItem: (category, section, id, data) => updateItemMutation.mutate({ id, data }),
    deleteItem: (category, section, id) => deleteItemMutation.mutate(id),

    // Diff helpers
    getItemChangeType,
    getCategoryChangeType,
    getSectionChangeType,
    isDiffMode: comparisonMode,

    // Analytics
    getAllItems,
    getGRPMetrics
  };
}