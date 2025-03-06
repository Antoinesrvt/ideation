import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { BusinessModelService, BusinessModelCanvas, CanvasSectionKey } from '@/lib/services/features/business-model-service';
import { useProjectStore, ChangeType } from '@/store';
import type { CanvasItem, CanvasSection } from '@/store/types';

// Create service instance
const businessModelService = new BusinessModelService(createClient());

// Type for new canvas items before they are added to the database
type NewCanvasItem = {
  text: string;
  color: string | null;
  tags: string[] | null;
  checked: boolean | null;
  order_index: number | null;
  created_by: string | null;
};

// Extended CanvasItem with section property for the UI needs
interface ExtendedCanvasItem extends CanvasItem {
  section: string;
}

// Service response type
interface CanvasItemResponse {
  id: string;
  project_id: string;
  section_id: string;
  text: string;
  color: string | null;
  tags: string[] | null;
  checked: boolean | null;
  order_index: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UseBusinessModelReturn {
  data: BusinessModelCanvas;
  isLoading: boolean;
  error: Error | null;

  // Core operations
  addItem: (section: CanvasSectionKey, item: NewCanvasItem) => void;
  updateItem: (section: CanvasSectionKey, id: string, data: Partial<NewCanvasItem>) => void;
  deleteItem: (section: CanvasSectionKey, id: string) => void;
  moveItem: (id: string, fromSection: CanvasSectionKey, toSection: CanvasSectionKey) => void;

  // Diff helpers
  getItemChangeType: (id: string) => ChangeType;
  getSectionChangeType: (id: string) => ChangeType;
  isDiffMode: boolean;

  // Analytics
  getAllItems: () => ExtendedCanvasItem[];
  getCanvasMetrics: () => {
    totalItems: number;
    itemsPerSection: Record<string, number>;
    mostPopulatedSection: string;
    leastPopulatedSection: string;
    completionPercentage: number;
  } | null;
}

export function useBusinessModel(projectId: string | undefined): UseBusinessModelReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const { comparisonMode } = store;

  // Query keys
  const queryKeys = {
    all: ['businessModel', projectId] as const,
    sections: ['businessModel', projectId, 'sections'] as const,
    items: (sectionId: string) => ['businessModel', projectId, 'items', sectionId] as const,
  };

  // Main query to fetch all canvas data
  const { data: queryData, isLoading, error } = useQuery({
    queryKey: queryKeys.all,
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const result = await businessModelService.getAllCanvasData(projectId);
      
      // Update store with fetched data
      if (result) {
        const sectionData: CanvasSection[] = []; // This would come from the API if you had a sections table
        
        // Convert to extended canvas items with section property
        const itemsData: ExtendedCanvasItem[] = [];
        Object.entries(result).forEach(([section, items]) => {
          items.forEach((item: CanvasItemResponse) => {
            itemsData.push({
              ...item,
              section: section as CanvasSectionKey
            });
          });
        });
        
        store.setCanvasSections(sectionData);
        store.setCanvasItems(itemsData as unknown as CanvasItem[]);
      }
      
      return result;
    },
    enabled: !!projectId
  });

  // Get data from store (current or staged based on comparison mode)
  const storeData = comparisonMode && store.stagedData
    ? {
        canvasSections: store.stagedData.canvasSections,
        canvasItems: store.stagedData.canvasItems as unknown as ExtendedCanvasItem[]
      }
    : {
        canvasSections: store.currentData.canvasSections,
        canvasItems: store.currentData.canvasItems as unknown as ExtendedCanvasItem[]
      };

  // Transform store data into the expected BusinessModelCanvas format
  const transformedData: BusinessModelCanvas = {
    keyPartners: storeData.canvasItems.filter(item => item.section === 'keyPartners'),
    keyActivities: storeData.canvasItems.filter(item => item.section === 'keyActivities'),
    keyResources: storeData.canvasItems.filter(item => item.section === 'keyResources'),
    valuePropositions: storeData.canvasItems.filter(item => item.section === 'valuePropositions'),
    customerRelationships: storeData.canvasItems.filter(item => item.section === 'customerRelationships'),
    channels: storeData.canvasItems.filter(item => item.section === 'channels'),
    customerSegments: storeData.canvasItems.filter(item => item.section === 'customerSegments'),
    costStructure: storeData.canvasItems.filter(item => item.section === 'costStructure'),
    revenueStreams: storeData.canvasItems.filter(item => item.section === 'revenueStreams')
  };

  // === Mutations ===
  const addItemMutation = useMutation({
    mutationFn: async (params: { section: CanvasSectionKey; item: NewCanvasItem }) => {
      if (!projectId) throw new Error('Project ID is required');
      
      // Create a temporary item for optimistic updates
      const tempItem: ExtendedCanvasItem = {
        id: `temp-${Date.now()}`,
        project_id: projectId,
        section_id: '', // This would be filled if you have a sections table
        text: params.item.text,
        color: params.item.color,
        tags: params.item.tags,
        checked: params.item.checked,
        order_index: params.item.order_index || 0,
        created_by: params.item.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        section: params.section // Add section for UI
      };
      
      // Optimistic update in the store
      store.addCanvasItem(tempItem as unknown as CanvasItem);
      
      // Then update Supabase
      const result = await businessModelService.addItem(projectId, params.section, params.item);
      
      // Update store with real ID from Supabase
      if (result) {
        store.deleteCanvasItem(tempItem.id);
        // Add section to the returned item
        const itemWithSection: ExtendedCanvasItem = {
          ...(result),
          section: params.section
        };
        store.addCanvasItem(itemWithSection);
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
      store.deleteCanvasItem(tempId);
    }
  });

  const updateItemMutation = useMutation({
    mutationFn: async (params: { id: string; data: Partial<NewCanvasItem> }) => {
      // Optimistic update in store
      store.updateCanvasItem(params.id, params.data);
      
      // Then update Supabase
      return businessModelService.updateItem(params.id, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error, variables) => {
      // Revert optimistic update on error
      console.error('Failed to update item:', error);
      
      // We would need the original item to revert properly
      // Refresh data to get correct state
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get the item before deleting for potential rollback
      const itemToDelete = storeData.canvasItems.find(item => item.id === id);
      
      // Optimistic update in store
      if (itemToDelete) {
        store.deleteCanvasItem(id);
      }
      
      // Then update Supabase
      return businessModelService.deleteItem(id);
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

  const moveItemMutation = useMutation({
    mutationFn: async (params: { id: string; fromSection: CanvasSectionKey; toSection: CanvasSectionKey }) => {
      // Optimistic update in store
      const itemToMove = storeData.canvasItems.find(item => item.id === params.id);
      
      if (itemToMove) {
        // We need to cast this since our store doesn't know about the section property
        const updates = { 
          section: params.toSection 
        } as unknown as Partial<CanvasItem>;
        
        store.updateCanvasItem(params.id, updates);
      }
      
      // Then update Supabase
      return businessModelService.moveItem(params.id, params.fromSection, params.toSection);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error, variables) => {
      // Revert optimistic update on error
      console.error('Failed to move item:', error);
      
      // Revert to original section
      if (variables) {
        // We need to cast this since our store doesn't know about the section property
        const updates = { 
          section: variables.fromSection 
        } as unknown as Partial<CanvasItem>;
        
        store.updateCanvasItem(variables.id, updates);
      }
    }
  });

  // === Helper Functions ===
  const getAllItems = (): ExtendedCanvasItem[] => {
    return storeData.canvasItems;
  };

  const getCanvasMetrics = () => {
    const items = getAllItems();
    if (items.length === 0) return null;
    
    const itemsPerSection: Record<string, number> = {};
    
    items.forEach(item => {
      const section = item.section;
      if (!itemsPerSection[section]) {
        itemsPerSection[section] = 0;
      }
      itemsPerSection[section]++;
    });
    
    const sections = Object.keys(itemsPerSection);
    const mostPopulatedSection = sections.reduce((a, b) => 
      itemsPerSection[a] > itemsPerSection[b] ? a : b, sections[0]);
    const leastPopulatedSection = sections.reduce((a, b) => 
      itemsPerSection[a] < itemsPerSection[b] ? a : b, sections[0]);
    
    const totalItems = items.length;
    const itemsWithDescription = items.filter(item => item.checked).length;
    
    return {
      totalItems,
      itemsPerSection,
      mostPopulatedSection,
      leastPopulatedSection,
      completionPercentage: totalItems > 0 
        ? (itemsWithDescription / totalItems) * 100 
        : 0
    };
  };

  // Diff helpers
  const getItemChangeType = (id: string): ChangeType => 
    store.getItemChangeType('canvasItems', id);
  
  const getSectionChangeType = (id: string): ChangeType => 
    store.getItemChangeType('canvasSections', id);

  // Prepare data for return - use transformed store data if available, otherwise use query data
  const finalData: BusinessModelCanvas = transformedData || queryData || {
    keyPartners: [],
    keyActivities: [],
    keyResources: [],
    valuePropositions: [],
    customerRelationships: [],
    channels: [],
    customerSegments: [],
    costStructure: [],
    revenueStreams: []
  };

  return {
    data: finalData,
    isLoading,
    error: error as Error | null,

    // Core operations
    addItem: (section, item) => addItemMutation.mutate({ section, item }),
    updateItem: (section, id, data) => updateItemMutation.mutate({ id, data }),
    deleteItem: (section, id) => deleteItemMutation.mutate(id),
    moveItem: (id, fromSection, toSection) => moveItemMutation.mutate({ id, fromSection, toSection }),

    // Diff helpers
    getItemChangeType,
    getSectionChangeType,
    isDiffMode: comparisonMode,

    // Analytics
    getAllItems,
    getCanvasMetrics
  };
} 