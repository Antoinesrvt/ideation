import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProject } from './useProject';
import { ProjectDetails } from '@/types';
import { generateId } from '@/lib/utils';

/**
 * Generic hook to manage feature data within a project
 * @param projectId - The ID of the current project
 * @param featureName - The name of the feature in the ProjectDetails type
 * @param options - Additional options for feature data management
 */
export function useFeatureData<T, ItemType extends { id: string }>(
  projectId: string | undefined,
  featureName: keyof ProjectDetails,
  options?: {
    // When feature data is an object with arrays, specify which array to manipulate
    arrayProperty?: string;
    // Default values to use when feature data doesn't exist
    defaultData?: Partial<T>;
    // Related data to fetch and include in the hook result
    relatedData?: Array<{
      name: string;
      feature: keyof ProjectDetails;
      property?: string;
      filter?: (item: any) => boolean;
      transform?: (data: any) => any;
    }>;
  }
) {
  const queryClient = useQueryClient();
  const { project, updateFeatureData, getRelatedFeatureData } = useProject(projectId);

  // Helper to get safe data even if the feature data doesn't exist yet
  const getSafeData = (): T => {
    if (!project.data || !project.data[featureName]) {
      return (options?.defaultData || {}) as T;
    }
    return project.data[featureName] as T;
  };

  // Get all related data requested in options
  const getRelatedData = () => {
    if (!options?.relatedData) return {};

    const result: Record<string, any> = {};
    
    options.relatedData.forEach(rel => {
      result[rel.name] = getRelatedFeatureData(
        rel.feature,
        {
          property: rel.property,
          filter: rel.filter,
          transform: rel.transform,
        }
      );
    });
    
    return result;
  };

  // Add an item to an array within the feature data
  const addItem = useMutation({
    mutationFn: async ({ item, arrayProperty }: { 
      item: Omit<ItemType, 'id'>; 
      arrayProperty?: string; 
    }): Promise<ItemType> => {
      const currentData = getSafeData();
      // Use type assertion to ensure TypeScript understands this is a valid ItemType
      const newItem = {
        ...item, 
        id: generateId(),
        createdAt: new Date().toISOString()
      } as unknown as ItemType;

      // Target array property to update
      const targetArray = arrayProperty || options?.arrayProperty;
      
      // Handle both array and object data structures
      let updatedData: any;
      
      if (Array.isArray(currentData)) {
        // Direct array data
        updatedData = [...currentData, newItem];
      } else if (targetArray && (currentData as any)[targetArray]) {
        // Object with specified array property
        updatedData = { 
          ...currentData,
          [targetArray]: [
            ...((currentData as any)[targetArray] || []), 
            newItem
          ]
        };
      } else {
        // Object with unspecified array - try to find one
        updatedData = { ...currentData };
        
        let foundArray = false;
        for (const key in updatedData) {
          if (Array.isArray(updatedData[key])) {
            updatedData[key] = [...updatedData[key], newItem];
            foundArray = true;
            break;
          }
        }
        
        // If no array was found, add the item to the top level (assumes object accepts direct items)
        if (!foundArray) {
          updatedData = { ...updatedData, [newItem.id]: newItem };
        }
      }
      
      if (!projectId) return newItem;
      
      await updateFeatureData({ 
        id: projectId, 
        feature: featureName, 
        data: updatedData 
      });
      
      return newItem;
    }
  });

  // Update an item in the feature data
  const updateItem = useMutation({
    mutationFn: async ({ id, data, arrayProperty }: { 
      id: string; 
      data: Partial<ItemType>; 
      arrayProperty?: string;
    }): Promise<ItemType> => {
      const currentData = getSafeData();
      const targetArray = arrayProperty || options?.arrayProperty;
      
      // Use type assertion to handle the type conversion safely
      const updatedItem = { 
        id, 
        ...data, 
        updatedAt: new Date().toISOString() 
      } as unknown as ItemType;
      
      let updatedData: any;
      
      if (Array.isArray(currentData)) {
        // Direct array update
        updatedData = currentData.map(item => 
          (item as any).id === id ? { ...(item as any), ...updatedItem } : item
        );
      } else if (targetArray && (currentData as any)[targetArray]) {
        // Update in specified array property
        updatedData = { 
          ...currentData,
          [targetArray]: ((currentData as any)[targetArray] || []).map((item: any) => 
            item.id === id ? { ...item, ...updatedItem } : item
          )
        };
      } else {
        // Try to find the item in any array property
        updatedData = { ...currentData };
        let updated = false;
        
        // Check all array properties
        for (const key in updatedData) {
          if (Array.isArray(updatedData[key])) {
            updatedData[key] = updatedData[key].map((item: any) => {
              if (item.id === id) {
                updated = true;
                return { ...item, ...updatedItem };
              }
              return item;
            });
          }
        }
        
        // If not found in arrays, check direct object properties
        if (!updated && updatedData[id]) {
          updatedData[id] = { ...updatedData[id], ...updatedItem };
        }
      }
      
      if (!projectId) return updatedItem;
      
      await updateFeatureData({ 
        id: projectId, 
        feature: featureName, 
        data: updatedData 
      });
      
      return updatedItem;
    }
  });

  // Delete an item from the feature data
  const deleteItem = useMutation({
    mutationFn: async ({ id, arrayProperty }: { 
      id: string; 
      arrayProperty?: string; 
    }): Promise<{ id: string }> => {
      const currentData = getSafeData();
      const targetArray = arrayProperty || options?.arrayProperty;
      
      let updatedData: any;
      
      if (Array.isArray(currentData)) {
        // Filter out item from array
        updatedData = currentData.filter((item: any) => item.id !== id);
      } else if (targetArray && (currentData as any)[targetArray]) {
        // Filter out item from specified array property
        updatedData = { 
          ...currentData,
          [targetArray]: ((currentData as any)[targetArray] || []).filter((item: any) => item.id !== id)
        };
      } else {
        // Try to find and remove from any array property
        updatedData = { ...currentData };
        
        // Check all array properties
        for (const key in updatedData) {
          if (Array.isArray(updatedData[key])) {
            updatedData[key] = updatedData[key].filter((item: any) => item.id !== id);
          }
        }
        
        // Also check for direct object property
        if (updatedData[id]) {
          const { [id]: removed, ...rest } = updatedData;
          updatedData = rest;
        }
      }
      
      if (!projectId) return { id };
      
      await updateFeatureData({ 
        id: projectId, 
        feature: featureName, 
        data: updatedData 
      });
      
      return { id };
    }
  });

  // Build and return the hook result
  return {
    // Core data
    data: getSafeData(),
    isLoading: project.isLoading,
    error: project.error,
    
    // Related data from other features
    relatedData: getRelatedData(),
    
    // CRUD operations with improved signatures
    addItem: (item: Omit<ItemType, 'id'>, arrayProperty?: string) => 
      addItem.mutate({ item, arrayProperty }),
      
    updateItem: (id: string, data: Partial<ItemType>, arrayProperty?: string) => 
      updateItem.mutate({ id, data, arrayProperty }),
      
    deleteItem: (id: string, arrayProperty?: string) => 
      deleteItem.mutate({ id, arrayProperty }),
  };
} 