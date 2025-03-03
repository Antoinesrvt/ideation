import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { GRPModel, GRPItem } from '@/types';

/**
 * Hook for GRP model operations
 */
export function useGRP() {
  const queryClient = useQueryClient();
  const { expandedCell, setExpandedCell } = useAppStore();
  
  // Toggle cell expansion
  const toggleCell = (cellId: string) => {
    setExpandedCell(expandedCell === cellId ? null : cellId);
  };
  
  // Add a new item to a GRP section
  const addItem = useMutation({
    mutationFn: ({ 
      section, 
      subsection, 
      item 
    }: { 
      section: keyof GRPModel; 
      subsection: string; 
      item: GRPItem 
    }) => {
      // This would typically be an API call
      // For now, we'll just return the new item
      return Promise.resolve(item);
    },
    onSuccess: (item, { section, subsection }) => {
      // Update the cache
      queryClient.setQueryData(['project'], (oldData: any) => {
        if (!oldData) return oldData;
        
        const grpModel = oldData.grpModel || {
          generation: { porteurs: [], propositionValeur: [], fabricationValeur: [] },
          remuneration: { sourcesRevenus: [], volumeRevenus: [], performance: [] },
          partage: { partiesPrenantes: [], conventions: [], ecosysteme: [] }
        };
        
        const sectionData = grpModel[section] || {};
        const subsectionData = sectionData[subsection] || [];
        
        return {
          ...oldData,
          grpModel: {
            ...grpModel,
            [section]: {
              ...sectionData,
              [subsection]: [...subsectionData, item]
            }
          }
        };
      });
    },
  });
  
  // Update an existing GRP item
  const updateItem = useMutation({
    mutationFn: ({ 
      section, 
      subsection, 
      itemId, 
      updates 
    }: { 
      section: keyof GRPModel; 
      subsection: string; 
      itemId: string; 
      updates: Partial<GRPItem> 
    }) => {
      // This would typically be an API call
      return Promise.resolve(updates);
    },
    onSuccess: (updates, { section, subsection, itemId }) => {
      // Update the cache
      queryClient.setQueryData(['project'], (oldData: any) => {
        if (!oldData || !oldData.grpModel) return oldData;
        
        const grpModel = oldData.grpModel;
        const sectionData = grpModel[section] || {};
        const subsectionData = sectionData[subsection] || [];
        
        return {
          ...oldData,
          grpModel: {
            ...grpModel,
            [section]: {
              ...sectionData,
              [subsection]: subsectionData.map((item: GRPItem) => 
                item.id === itemId ? { ...item, ...updates } : item
              )
            }
          }
        };
      });
    },
  });
  
  // Remove a GRP item
  const removeItem = useMutation({
    mutationFn: ({ 
      section, 
      subsection, 
      itemId 
    }: { 
      section: keyof GRPModel; 
      subsection: string; 
      itemId: string 
    }) => {
      // This would typically be an API call
      return Promise.resolve(itemId);
    },
    onSuccess: (itemId, { section, subsection }) => {
      // Update the cache
      queryClient.setQueryData(['project'], (oldData: any) => {
        if (!oldData || !oldData.grpModel) return oldData;
        
        const grpModel = oldData.grpModel;
        const sectionData = grpModel[section] || {};
        const subsectionData = sectionData[subsection] || [];
        
        return {
          ...oldData,
          grpModel: {
            ...grpModel,
            [section]: {
              ...sectionData,
              [subsection]: subsectionData.filter((item: GRPItem) => item.id !== itemId)
            }
          }
        };
      });
    },
  });
  
  return {
    expandedCell,
    toggleCell,
    addItem: addItem.mutate,
    updateItem: updateItem.mutate,
    removeItem: removeItem.mutate,
  };
}