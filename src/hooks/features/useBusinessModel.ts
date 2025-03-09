import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { BusinessModelCanvas, CanvasSectionKey } from '@/lib/services/features/business-model-service';
import { businessModelService } from '@/lib/services';
import { useProjectStore } from '@/store';
import type { CanvasItem, CanvasSection, ChangeType, Insert, Update } from '@/store/types';
import { Database } from '@/types/database';
import { useOptimisticCreate, useOptimisticUpdate, useOptimisticDelete } from '../utils/optimistic-helpers';


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
  addItem: (section: CanvasSectionKey, item: Insert<'canvas_items'>) => Promise<CanvasItem | null>;
  updateItem: (section: CanvasSectionKey, id: string, data: Update<'canvas_items'>) => Promise<CanvasItem | null>;
  deleteItem: (section: CanvasSectionKey, id: string) => Promise<boolean>;

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
    queryFn: () => businessModelService.getCanvasSections(projectId!),
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
    queryFn: () => businessModelService.getAllBusinessModelData(projectId!),
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
      const allItems = canvasData.items || [];
      
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
      // Extract all canvas items from canvas data
      return canvasData.items || [];
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

  // Create optimistic helpers base
  const addItemOptimistic = useOptimisticCreate<'canvas_items'>({
    projectId,
    tableName: 'canvas_items',
    store,
    service: businessModelService,
    queryClient,
    queryKey: [...queryKeys.items],
    setSubmitting
  });

  const updateItemOptimistic = useOptimisticUpdate<'canvas_items'>({
    tableName: 'canvas_items',
    store,
    service: businessModelService,
    queryClient,
    queryKey: [...queryKeys.items],
    setSubmitting
  });

  const deleteItemOptimistic = useOptimisticDelete({
    tableName: 'canvas_items',
    store,
    service: businessModelService,
    queryClient,
    queryKey: [...queryKeys.items],
    setSubmitting
  });

  // === Core Operations with Section Context ===
  const addItem = useCallback(async (section: CanvasSectionKey, item: Insert<'canvas_items'>): Promise<CanvasItem | null> => {
    if (!projectId) return null;
    
    // Get the section ID for the given section type
    const sectionObj = sections.find(s => s.section_type === section);
    if (!sectionObj) {
      console.error(`Section ${section} not found`);
      return null;
    }
    
    // Add section_id to the item
    const itemWithSection = {
      ...item,
      section_id: sectionObj.id
    } as Insert<'canvas_items'>;
    
    // Use the optimistic helper for the actual operation
    return addItemOptimistic(itemWithSection);
  }, [projectId, sections, addItemOptimistic]);

  const updateItem = useCallback(async (section: CanvasSectionKey, id: string, data: Update<'canvas_items'>): Promise<CanvasItem | null> => {
    // We don't need the section parameter for update operations
    // But we keep it for API consistency
    return updateItemOptimistic(id, data);
  }, [updateItemOptimistic]);

  const deleteItem = useCallback(async (section: CanvasSectionKey, id: string): Promise<boolean> => {
    // We don't need the section parameter for delete operations
    // But we keep it for API consistency
    return deleteItemOptimistic(id);
  }, [deleteItemOptimistic]);

  // === Diff Helpers ===
  const getItemChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('canvasItems', id), [store]);

  const getSectionChangeType = useCallback((id: string): ChangeType => 
    store.getItemChangeType('canvasSections', id), [store]);

  // === Analytics ===
  const getAllItems = useCallback((): ExtendedCanvasItem[] => {
    // Map all items to include their section name for UI needs
    return items.map(item => {
      const sectionObj = sections.find(s => s.id === item.section_id);
      return {
        ...item,
        section: sectionObj?.section_type || 'unknown'
      } as ExtendedCanvasItem;
    });
  }, [items, sections]);

  const getCanvasMetrics = useCallback(() => {
    if (!transformedData) return null;

    const allItems = [
      ...transformedData.keyPartners,
      ...transformedData.keyActivities,
      ...transformedData.keyResources,
      ...transformedData.valuePropositions,
      ...transformedData.customerRelationships,
      ...transformedData.channels,
      ...transformedData.customerSegments,
      ...transformedData.costStructure,
      ...transformedData.revenueStreams
    ];

    const itemsPerSection: Record<string, number> = {
      keyPartners: transformedData.keyPartners.length,
      keyActivities: transformedData.keyActivities.length,
      keyResources: transformedData.keyResources.length,
      valuePropositions: transformedData.valuePropositions.length,
      customerRelationships: transformedData.customerRelationships.length,
      channels: transformedData.channels.length,
      customerSegments: transformedData.customerSegments.length,
      costStructure: transformedData.costStructure.length,
      revenueStreams: transformedData.revenueStreams.length,
    };

    const sectionEntries = Object.entries(itemsPerSection);
    const mostPopulatedSection = sectionEntries.reduce((max, [section, count]) => 
      count > itemsPerSection[max] ? section : max, sectionEntries[0][0]);
    
    const leastPopulatedSection = sectionEntries.reduce((min, [section, count]) => 
      count < itemsPerSection[min] ? section : min, sectionEntries[0][0]);

    const totalItems = allItems.length;
    
    // Consider a canvas "complete" if it has at least 1 item in each section
    const nonEmptySections = Object.values(itemsPerSection).filter(count => count > 0).length;
    const completionPercentage = Math.round((nonEmptySections / Object.keys(itemsPerSection).length) * 100);

    return {
      totalItems,
      itemsPerSection,
      mostPopulatedSection,
      leastPopulatedSection,
      completionPercentage
    };
  }, [transformedData]);

  return {
    data: transformedData,
    isLoading,
    error: error || queryError,

    // Core operations
    addItem,
    updateItem,
    deleteItem,

    // Diff helpers
    getItemChangeType,
    getSectionChangeType,
    isDiffMode: store.comparisonMode,

    // Analytics
    getAllItems,
    getCanvasMetrics
  };
} 