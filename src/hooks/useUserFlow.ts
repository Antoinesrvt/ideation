import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserFlow, Wireframe, Feature, JourneyStage } from '@/types';

/**
 * Hook for user flow operations
 */
export function useUserFlow() {
  const queryClient = useQueryClient();
  
  // Add a new wireframe
  const addWireframe = useMutation({
    mutationFn: (wireframe: Wireframe) => {
      // This would typically be an API call
      return Promise.resolve(wireframe);
    },
    onSuccess: (wireframe) => {
      // Update the cache
      queryClient.setQueryData(['project'], (oldData: any) => {
        if (!oldData) return oldData;
        
        const userFlow = oldData.userFlow || {
          wireframes: [],
          features: [],
          journey: { stages: [] }
        };
        
        return {
          ...oldData,
          userFlow: {
            ...userFlow,
            wireframes: [...userFlow.wireframes, wireframe]
          }
        };
      });
    },
  });
  
  // Add a new feature
  const addFeature = useMutation({
    mutationFn: (feature: Feature) => {
      // This would typically be an API call
      return Promise.resolve(feature);
    },
    onSuccess: (feature) => {
      // Update the cache
      queryClient.setQueryData(['project'], (oldData: any) => {
        if (!oldData) return oldData;
        
        const userFlow = oldData.userFlow || {
          wireframes: [],
          features: [],
          journey: { stages: [] }
        };
        
        return {
          ...oldData,
          userFlow: {
            ...userFlow,
            features: [...userFlow.features, feature]
          }
        };
      });
    },
  });
  
  // Add a new journey stage
  const addJourneyStage = useMutation({
    mutationFn: (stage: JourneyStage) => {
      // This would typically be an API call
      return Promise.resolve(stage);
    },
    onSuccess: (stage) => {
      // Update the cache
      queryClient.setQueryData(['project'], (oldData: any) => {
        if (!oldData) return oldData;
        
        const userFlow = oldData.userFlow || {
          wireframes: [],
          features: [],
          journey: { stages: [] }
        };
        
        return {
          ...oldData,
          userFlow: {
            ...userFlow,
            journey: {
              ...userFlow.journey,
              stages: [...userFlow.journey.stages, stage]
            }
          }
        };
      });
    },
  });
  
  return {
    addWireframe: addWireframe.mutate,
    addFeature: addFeature.mutate,
    addJourneyStage: addJourneyStage.mutate,
  };
}