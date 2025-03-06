import { useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { baseAtom } from './project-store';
import { useSupabase } from '@/context/supabase-context';
import { Database } from '../types/database';

type Tables = Database['public']['Tables'];

export function useProjectSync(projectId: string) {
  const [state, setState] = useAtom(baseAtom);
  const { supabase } = useSupabase();

  // Load initial data
  const loadProjectData = useCallback(async () => {
    if (!projectId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch project data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Fetch GRP data
      const [
        { data: grpCategories, error: grpCategoriesError },
        { data: grpSections, error: grpSectionsError },
        { data: grpItems, error: grpItemsError },
      ] = await Promise.all([
        supabase.from('grp_categories').select('*').eq('project_id', projectId),
        supabase.from('grp_sections').select('*').eq('project_id', projectId),
        supabase.from('grp_items').select('*').eq('project_id', projectId),
      ]);

      if (grpCategoriesError) throw grpCategoriesError;
      if (grpSectionsError) throw grpSectionsError;
      if (grpItemsError) throw grpItemsError;

      // Fetch documents
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', projectId);

      if (documentsError) throw documentsError;

      // Fetch team data
      const [
        { data: teamMembers, error: teamMembersError },
        { data: teamTasks, error: teamTasksError },
      ] = await Promise.all([
        supabase.from('team_members').select('*').eq('project_id', projectId),
        supabase.from('team_tasks').select('*').eq('project_id', projectId),
      ]);

      if (teamMembersError) throw teamMembersError;
      if (teamTasksError) throw teamTasksError;

      // Fetch notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('project_notifications')
        .select('*')
        .eq('project_id', projectId);

      if (notificationsError) throw notificationsError;

      // Fetch related items
      const { data: relatedItems, error: relatedItemsError } = await supabase
        .from('related_items')
        .select('*')
        .eq('project_id', projectId);

      if (relatedItemsError) throw relatedItemsError;

      // Update store with fetched data
      setState((prev) => ({
        ...prev,
        currentData: {
          ...prev.currentData,
          project,
          // Business Model Canvas
          canvasSections: prev.currentData.canvasSections,
          canvasItems: prev.currentData.canvasItems,
          // GRP Model
          grpCategories: grpCategories || [],
          grpSections: grpSections || [],
          grpItems: grpItems || [],
          // Market Analysis
          marketPersonas: prev.currentData.marketPersonas,
          marketInterviews: prev.currentData.marketInterviews,
          marketCompetitors: prev.currentData.marketCompetitors,
          marketTrends: prev.currentData.marketTrends,
          // Product Design
          productWireframes: prev.currentData.productWireframes,
          productFeatures: prev.currentData.productFeatures,
          productJourneyStages: prev.currentData.productJourneyStages,
          productJourneyActions: prev.currentData.productJourneyActions,
          productJourneyPainPoints: prev.currentData.productJourneyPainPoints,
          // Financial
          financialRevenueStreams: prev.currentData.financialRevenueStreams,
          financialCostStructure: prev.currentData.financialCostStructure,
          financialPricingStrategies: prev.currentData.financialPricingStrategies,
          financialProjections: prev.currentData.financialProjections,
          // Validation
          validationExperiments: prev.currentData.validationExperiments,
          validationABTests: prev.currentData.validationABTests,
          validationUserFeedback: prev.currentData.validationUserFeedback,
          validationHypotheses: prev.currentData.validationHypotheses,
          // Team
          teamMembers: teamMembers || [],
          teamTasks: teamTasks || [],
          teamResponsibilityMatrix: prev.currentData.teamResponsibilityMatrix,
          // Documents
          documents: documents || [],
          documentCollaborators: prev.currentData.documentCollaborators,
          // Cross-feature
          notifications: notifications || [],
          relatedItems: relatedItems || [],
          projectTags: prev.currentData.projectTags,
          featureItemTags: prev.currentData.featureItemTags,
        },
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }));
    }
  }, [projectId, setState, supabase]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!projectId) return;

    const projectChannel = supabase
      .channel(`project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `id=eq.${projectId}`,
        },
        (payload) => {
          setState((prev) => ({
            ...prev,
            currentData: {
              ...prev.currentData,
              project: payload.new as Tables['projects']['Row'],
            },
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grp_categories',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          const { data } = await supabase
            .from('grp_categories')
            .select('*')
            .eq('project_id', projectId);
          setState((prev) => ({
            ...prev,
            currentData: {
              ...prev.currentData,
              grpCategories: data || [],
            },
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grp_sections',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          const { data } = await supabase
            .from('grp_sections')
            .select('*')
            .eq('project_id', projectId);
          setState((prev) => ({
            ...prev,
            currentData: {
              ...prev.currentData,
              grpSections: data || [],
            },
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grp_items',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          const { data } = await supabase
            .from('grp_items')
            .select('*')
            .eq('project_id', projectId);
          setState((prev) => ({
            ...prev,
            currentData: {
              ...prev.currentData,
              grpItems: data || [],
            },
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          const { data } = await supabase
            .from('documents')
            .select('*')
            .eq('project_id', projectId);
          setState((prev) => ({
            ...prev,
            currentData: {
              ...prev.currentData,
              documents: data || [],
            },
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'modules',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          const { data } = await supabase
            .from('modules')
            .select('*')
            .eq('project_id', projectId);
          setState((prev) => ({
            ...prev,
            currentData: {
              ...prev.currentData,
              modules: data || [],
            },
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'module_steps',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          const { data } = await supabase
            .from('module_steps')
            .select('*')
            .eq('project_id', projectId);
          setState((prev) => ({
            ...prev,
            currentData: {
              ...prev.currentData,
              moduleSteps: data || [],
            },
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_members',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          const { data } = await supabase
            .from('team_members')
            .select('*')
            .eq('project_id', projectId);
          setState((prev) => ({
            ...prev,
            currentData: {
              ...prev.currentData,
              teamMembers: data || [],
            },
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_tasks',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          const { data } = await supabase
            .from('team_tasks')
            .select('*')
            .eq('project_id', projectId);
          setState((prev) => ({
            ...prev,
            currentData: {
              ...prev.currentData,
              teamTasks: data || [],
            },
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_notifications',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          const { data } = await supabase
            .from('project_notifications')
            .select('*')
            .eq('project_id', projectId);
          setState((prev) => ({
            ...prev,
            currentData: {
              ...prev.currentData,
              notifications: data || [],
            },
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'related_items',
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          const { data } = await supabase
            .from('related_items')
            .select('*')
            .eq('project_id', projectId);
          setState((prev) => ({
            ...prev,
            currentData: {
              ...prev.currentData,
              relatedItems: data || [],
            },
          }));
        }
      )
      .subscribe();

    // Load initial data
    loadProjectData();

    return () => {
      supabase.removeChannel(projectChannel);
    };
  }, [projectId, setState, supabase, loadProjectData]);

  return {
    loadProjectData,
  };
} 