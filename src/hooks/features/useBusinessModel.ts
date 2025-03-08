import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { BusinessModelCanvas, CanvasSectionKey } from '@/lib/services/features/business-model-service';
import { businessModelService } from '@/lib/services';
import { useProjectStore } from '@/store';
import type { CanvasItem, CanvasSection, ChangeType } from '@/store/types';

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

// Constants for retry logic
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export interface UseBusinessModelReturn {
  data: BusinessModelCanvas;
  isLoading: boolean;
  error: Error | null;

  // Core operations
  addItem: (section: CanvasSectionKey, item: NewCanvasItem) => Promise<CanvasItem | null>;
  updateItem: (section: CanvasSectionKey, id: string, data: Partial<NewCanvasItem>) => Promise<CanvasItem | null>;
  deleteItem: (section: CanvasSectionKey, id: string) => Promise<boolean>;
  moveItem: (id: string, fromSection: CanvasSectionKey, toSection: CanvasSectionKey) => Promise<CanvasItem | null>;

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

export function useBusinessModel(projectId: string | undefined): UseBusinessModelReturn {
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create stable, memoized query keys to prevent unnecessary refetching
  const queryKeys = useMemo(() => ({
    all: ['businessModel', projectId] as const,
    sections: ['businessModel', projectId, 'sections'] as const,
    items: ['businessModel', projectId, 'items'] as const,
  }), [projectId]);

  // Use React Query to fetch sections
  const { 
    data: sectionsData, 
    isLoading: sectionsLoading, 
    error: sectionsError 
  } = useQuery({
    queryKey: queryKeys.sections,
    queryFn: () => businessModelService.getSections(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use React Query to fetch all canvas data at once
  const { 
    data: canvasData, 
    isLoading: canvasLoading, 
    error: canvasError 
  } = useQuery({
    queryKey: queryKeys.all,
    queryFn: () => businessModelService.getAllCanvasData(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update store when query data changes, but only if data has actually changed
  useEffect(() => {
    if (sectionsData && !arraysEqual(sectionsData, store.currentData.canvasSections)) {
      store.setCanvasSections(sectionsData);
    }
  }, [sectionsData, store]);

  useEffect(() => {
    if (canvasData) {
      // Extract all canvas items from all sections
      const allItems = [
        ...canvasData.keyPartners,
        ...canvasData.keyActivities,
        ...canvasData.keyResources,
        ...canvasData.valuePropositions,
        ...canvasData.customerRelationships,
        ...canvasData.channels,
        ...canvasData.customerSegments,
        ...canvasData.costStructure,
        ...canvasData.revenueStreams
      ];
      
      // Update only if different
      if (!arraysEqual(allItems, store.currentData.canvasItems)) {
        store.setCanvasItems(allItems);
      }
    }
  }, [canvasData, store]);

  // Get data from the store based on comparison mode
  const storeData = useMemo(() => {
    const source = store.comparisonMode && store.stagedData ? store.stagedData : store.currentData;
    return {
      canvasSections: source.canvasSections || [],
      canvasItems: (source.canvasItems || []) as unknown as ExtendedCanvasItem[]
    };
  }, [store.currentData, store.stagedData, store.comparisonMode]);

  // If in comparison mode, use store data, otherwise use React Query data
  const sections = useMemo(() => {
    return store.comparisonMode ? storeData.canvasSections : (sectionsData || []);
  }, [store.comparisonMode, storeData.canvasSections, sectionsData]);

  // Get items from either the store (comparison mode) or extracted from canvas data
  const items = useMemo(() => {
    if (store.comparisonMode) {
      return storeData.canvasItems;
    } else if (canvasData) {
      // Extract all canvas items from all sections
      return [
        ...canvasData.keyPartners,
        ...canvasData.keyActivities,
        ...canvasData.keyResources,
        ...canvasData.valuePropositions,
        ...canvasData.customerRelationships,
        ...canvasData.channels,
        ...canvasData.customerSegments,
        ...canvasData.costStructure,
        ...canvasData.revenueStreams
      ];
    }
    return [];
  }, [store.comparisonMode, storeData.canvasItems, canvasData]);

  // Transform data into the expected BusinessModelCanvas format
  const transformedData = useMemo((): BusinessModelCanvas => {
    const canvasItems = items as ExtendedCanvasItem[];
    return {
      keyPartners: canvasItems.filter(item => item.section_id && sections.find(s => s.id === item.section_id)?.section_type === 'keyPartners') || [],
      keyActivities: canvasItems.filter(item => item.section_id && sections.find(s => s.id === item.section_id)?.section_type === 'keyActivities') || [],
      keyResources: canvasItems.filter(item => item.section_id && sections.find(s => s.id === item.section_id)?.section_type === 'keyResources') || [],
      valuePropositions: canvasItems.filter(item => item.section_id && sections.find(s => s.id === item.section_id)?.section_type === 'valuePropositions') || [],
      customerRelationships: canvasItems.filter(item => item.section_id && sections.find(s => s.id === item.section_id)?.section_type === 'customerRelationships') || [],
      channels: canvasItems.filter(item => item.section_id && sections.find(s => s.id === item.section_id)?.section_type === 'channels') || [],
      customerSegments: canvasItems.filter(item => item.section_id && sections.find(s => s.id === item.section_id)?.section_type === 'customerSegments') || [],
      costStructure: canvasItems.filter(item => item.section_id && sections.find(s => s.id === item.section_id)?.section_type === 'costStructure') || [],
      revenueStreams: canvasItems.filter(item => item.section_id && sections.find(s => s.id === item.section_id)?.section_type === 'revenueStreams') || []
    };
  }, [items, sections]);

  // Compute loading and error states
  const isLoading = sectionsLoading || canvasLoading;
  const queryError = sectionsError || canvasError;

  // === Core Operations ===
  const addItem = useCallback(async (section: CanvasSectionKey, item: NewCanvasItem): Promise<CanvasItem | null> => {
    if (!projectId) return null;
    
    // Generate temp ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    
    // Create complete item with temp ID
    const tempItem: ExtendedCanvasItem = {
      id: tempId,
      project_id: projectId,
      section_id: '', // This would be filled if you have a sections table
      text: item.text,
      color: item.color,
      tags: item.tags,
      checked: item.checked,
      order_index: item.order_index || 0,
      created_by: item.created_by,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      section: section // Add section for UI
    };
    
    // Track original store state for possible rollback
    const originalItems = [...store.currentData.canvasItems];
    
    try {
      // 1. Update store optimistically
      store.addCanvasItem(tempItem as unknown as CanvasItem);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        businessModelService.addItem(projectId, section, item)
      );
      
      // 3. Remove temp item and add the real one 
      store.deleteCanvasItem(tempId);
      
      // Add section to the returned item
      const itemWithSection: ExtendedCanvasItem = {
        ...(result),
        section: section
      };
      store.addCanvasItem(itemWithSection);
      
      // 4. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error adding canvas item:', err);
      
      // 5. Revert optimistic update on error
      store.setCanvasItems(originalItems);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const updateItem = useCallback(async (section: CanvasSectionKey, id: string, data: Partial<NewCanvasItem>): Promise<CanvasItem | null> => {
    if (!projectId) return null;
    
    // Store original item for rollback
    const originalItem = store.currentData.canvasItems.find(i => i.id === id);
    if (!originalItem) return null;
    
    try {
      // 1. Update store optimistically
      store.updateCanvasItem(id, data);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        businessModelService.updateItem(id, data)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating canvas item:', err);
      
      // 4. Revert optimistic update on error
      if (originalItem) {
        store.updateCanvasItem(id, originalItem);
      }
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const deleteItem = useCallback(async (section: CanvasSectionKey, id: string): Promise<boolean> => {
    if (!projectId) return false;
    
    // Store original items for rollback
    const originalItems = [...store.currentData.canvasItems];
    const itemToDelete = originalItems.find(item => item.id === id);
    
    if (!itemToDelete) return false;
    
    try {
      // 1. Update store optimistically
      store.deleteCanvasItem(id);
      
      setSubmitting(true);
      
      // 2. Delete from Supabase with retry logic
      await executeWithRetry(() => 
        businessModelService.deleteItem(id)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting canvas item:', err);
      
      // 4. Revert optimistic update on error
      store.setCanvasItems(originalItems);
      
      setError(err as Error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  const moveItem = useCallback(async (id: string, fromSection: CanvasSectionKey, toSection: CanvasSectionKey): Promise<CanvasItem | null> => {
    if (!projectId) return null;
    
    // Store original items for rollback
    const originalItems = [...store.currentData.canvasItems];
    const itemToMove = originalItems.find(item => item.id === id);
    
    if (!itemToMove) return null;
    
    try {
      // 1. Update store optimistically
      // We need to cast this since our store doesn't know about the section property
      const updates = { 
        section: toSection 
      } as unknown as Partial<CanvasItem>;
      
      store.updateCanvasItem(id, updates);
      
      setSubmitting(true);
      
      // 2. Update Supabase with retry logic
      const result = await executeWithRetry(() => 
        businessModelService.moveItem(id, fromSection, toSection)
      );
      
      // 3. Invalidate queries to keep React Query cache in sync
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error moving canvas item:', err);
      
      // 4. Revert optimistic update on error
      store.setCanvasItems(originalItems);
      
      setError(err as Error);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [projectId, store, queryClient, queryKeys]);

  // === Helper Functions ===
  const getAllItems = useCallback((): ExtendedCanvasItem[] => {
    return storeData.canvasItems;
  }, [storeData.canvasItems]);

  const getCanvasMetrics = useCallback(() => {
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
  }, [getAllItems]);

  // Diff helpers
  const getItemChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('canvasItems', id), [store]);
  
  const getSectionChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('canvasSections', id), [store]);

  // If in comparison mode, use store data, otherwise use React Query data
  const data: BusinessModelCanvas = useMemo(() => {
    if (store.comparisonMode) {
      // In comparison mode, use the transformed store data
      return transformedData;
    } else {
      // In normal mode, use React Query data
      return canvasData || {
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
    }
  }, [store.comparisonMode, transformedData, canvasData]);

  return {
    data,
    isLoading,
    error,

    // Core operations
    addItem,
    updateItem,
    deleteItem,
    moveItem,

    // Diff helpers
    getItemChangeType,
    getSectionChangeType,
    isDiffMode: store.comparisonMode,

    // Analytics
    getAllItems,
    getCanvasMetrics
  };
} 