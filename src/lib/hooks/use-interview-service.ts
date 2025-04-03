import { useState, useCallback, useMemo } from 'react';
import { useSupabase } from '@/context/supabase-context';
import { InterviewService, InterviewData } from '../services/features/interview-service';
import type { 
  MarketInterview, 
  InterviewTemplate, 
  InterviewInsight, 
  InterviewQuestion, 
  Insert, 
  Update 
} from '@/store/types';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useProjectStore } from '@/store';
import {
  RuntimeTemplate,
  SerializedTemplate,
  Question,
  serializeTemplateQuestions,
  sanitizeQuestions
} from '@/lib/utils/interview-utils';

// Extend InterviewData to use RuntimeTemplate
interface ExtendedInterviewData extends Omit<InterviewData, 'templates'> {
  templates: RuntimeTemplate[];
}

export function useInterviewService(projectId?: string) {
  const { supabase } = useSupabase();
  const queryClient = useQueryClient();
  const store = useProjectStore();
  const [submitting, setSubmitting] = useState(false);
  
  // Create a singleton instance of the service
  const interviewService = useMemo(() => new InterviewService(supabase), [supabase]);
  
  // Create stable, memoized query keys
  const queryKeys = useMemo(() => ({
    all: ['interviewData', projectId] as const,
    templates: ['interviewData', projectId, 'templates'] as const,
    interviews: ['interviewData', projectId, 'interviews'] as const,
    insights: ['interviewData', projectId, 'insights'] as const,
    questions: ['interviewData', projectId, 'questions'] as const,
  }), [projectId]);

  // === Data Fetching with React Query ===
  // Check if tables might not exist (based on error message)
  const hasTableNotFoundError = useCallback((err: Error) => {
    const errorMessage = err.message.toLowerCase();
    return errorMessage.includes('relation') && (
      errorMessage.includes('does not exist') || 
      errorMessage.includes('not found')
    );
  }, []);
  
  // Use React Query for templates
  const { 
    data: templatesData, 
    isLoading: templatesLoading,
    error: templatesError,
    refetch: refetchTemplates
  } = useQuery({
    queryKey: queryKeys.templates,
    queryFn: () => interviewService.getTemplates(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if tables don't exist
      if (hasTableNotFoundError(error as Error)) {
        console.warn('Templates table may not exist yet. This is expected for new installations.');
        return false;
      }
      return failureCount < 3;
    }
  });
  
  // Use React Query for interviews
  const { 
    data: interviewsData, 
    isLoading: interviewsLoading,
    error: interviewsError,
    refetch: refetchInterviews
  } = useQuery({
    queryKey: queryKeys.interviews,
    queryFn: () => interviewService.getInterviews(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if tables don't exist
      if (hasTableNotFoundError(error as Error)) {
        console.warn('Interviews table may not exist yet. This is expected for new installations.');
        return false;
      }
      return failureCount < 3;
    }
  });
  
  // Use React Query for insights
  const { 
    data: insightsData, 
    isLoading: insightsLoading,
    error: insightsError,
    refetch: refetchInsights
  } = useQuery({
    queryKey: queryKeys.insights,
    queryFn: () => interviewService.getInsights(projectId!),
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if tables don't exist
      if (hasTableNotFoundError(error as Error)) {
        console.warn('Insights table may not exist yet. This is expected for new installations.');
        return false;
      }
      return failureCount < 3;
    }
  });
  
  // Compute aggregated loading and error states
  const isLoading = templatesLoading || interviewsLoading || insightsLoading || submitting;
  const error = templatesError || interviewsError || insightsError;

  // Combine all data into a single object
  const data: ExtendedInterviewData = useMemo(() => ({
    templates: templatesData || [],
    interviews: interviewsData || [],
    insights: insightsData || [],
    questions: [] // Questions are fetched individually per interview
  }), [templatesData, interviewsData, insightsData]);
  
  // === Combined fetch operation ===
  const fetchAllData = useCallback(async (pid: string) => {
    if (!pid) return;
    
    // Use Promise.all to run all fetches in parallel
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.templates }),
      queryClient.invalidateQueries({ queryKey: queryKeys.interviews }),
      queryClient.invalidateQueries({ queryKey: queryKeys.insights })
    ]);
    
    return data;
  }, [queryClient, queryKeys, data]);

  // === Templates ===
  const fetchTemplates = useCallback(async (pid: string) => {
    if (!pid) return [];
    await queryClient.invalidateQueries({ queryKey: queryKeys.templates });
    return templatesData || [];
  }, [queryClient, queryKeys, templatesData]);

  const createTemplate = useCallback(async (pid: string, templateData: Partial<RuntimeTemplate>) => {
    if (!pid) throw new Error('Project ID is required');
    setSubmitting(true);
    
    try {
      // Ensure required fields have default values if they're missing
      const data = {
        project_id: pid,
        name: templateData.name || 'Untitled Template',
        description: templateData.description || '',
        category: templateData.category || 'general',
        estimated_duration: templateData.estimated_duration || 30,
        created_at: templateData.created_at || new Date().toISOString(),
        updated_at: templateData.updated_at || new Date().toISOString(),
        // Sanitize questions if provided, otherwise use empty array
        questions: templateData.questions ? sanitizeQuestions(templateData.questions) : []
      };
      
      // Insert will handle serialization internally
      const newTemplate = await interviewService.addTemplate(pid, data as unknown as Insert<'interview_templates'>);
      
      // Update cache with the new template
      queryClient.setQueryData(queryKeys.templates, (old: RuntimeTemplate[] = []) => [...old, newTemplate]);
      
      return newTemplate;
    } catch (err) {
      console.error('Error creating template:', err);
      
      // Forward the error instead of returning null
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService, queryClient, queryKeys.templates]);

  const updateTemplate = useCallback(async (id: string, templateData: Partial<RuntimeTemplate>) => {
    if (!id) throw new Error('Template ID is required');
    setSubmitting(true);
    
    try {
      // Ensure required fields have default values if they're missing
      const data = {
        ...templateData,
        name: templateData.name || 'Untitled Template',
        description: templateData.description || '',
        category: templateData.category || 'general',
        estimated_duration: templateData.estimated_duration || 30,
        updated_at: new Date().toISOString(),
      };
      
      // If questions are provided, sanitize them
      if (templateData.questions) {
        data.questions = sanitizeQuestions(templateData.questions);
      }
      
      // Update will handle serialization internally
      const updatedTemplate = await interviewService.updateTemplate(id, data as unknown as Update<'interview_templates'>);
      
      // Update cache with the updated template
      queryClient.setQueryData(queryKeys.templates, (old: RuntimeTemplate[] = []) => 
        old.map(t => t.id === id ? updatedTemplate : t)
      );
      
      return updatedTemplate;
    } catch (err) {
      console.error('Error updating template:', err);
      
      // Forward the error instead of returning null
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService, queryClient, queryKeys.templates]);

  const deleteTemplate = useCallback(async (id: string) => {
    setSubmitting(true);
    
    try {
      await interviewService.deleteTemplate(id);
      
      // Update cache by removing the deleted template
      queryClient.setQueryData(queryKeys.templates, (old: RuntimeTemplate[] = []) => 
        old.filter(t => t.id !== id)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting template:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService, queryClient, queryKeys.templates]);

  // === Insights ===
  const fetchInsights = useCallback(async (pid: string) => {
    if (!pid) return [];
    await queryClient.invalidateQueries({ queryKey: queryKeys.insights });
    return insightsData || [];
  }, [queryClient, queryKeys, insightsData]);

  const fetchInsightsForInterview = useCallback(async (interviewId: string) => {
    setSubmitting(true);
    
    try {
      const insights = await interviewService.getInsightsForInterview(interviewId);
      return insights;
    } catch (err) {
      console.error('Error fetching interview insights:', err);
      return [];
    } finally {
      setSubmitting(false);
    }
  }, [interviewService]);

  const createInsight = useCallback(async (
    interviewId: string, 
    insightData: Insert<'interview_insights'>,
    pid: string = projectId || ''
  ) => {
    if (!pid) return null;
    setSubmitting(true);
    
    try {
      const newInsight = await interviewService.addInsight(interviewId, pid, insightData);
      
      // Update cache with the new insight
      queryClient.setQueryData(queryKeys.insights, (old: InterviewInsight[] = []) => [...old, newInsight]);
      
      return newInsight;
    } catch (err) {
      console.error('Error creating insight:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService, projectId, queryClient, queryKeys.insights]);

  const updateInsight = useCallback(async (id: string, insightData: Update<'interview_insights'>) => {
    setSubmitting(true);
    
    try {
      const updatedInsight = await interviewService.updateInsight(id, insightData);
      
      // Update cache with the updated insight
      queryClient.setQueryData(queryKeys.insights, (old: InterviewInsight[] = []) => 
        old.map(i => i.id === id ? updatedInsight : i)
      );
      
      return updatedInsight;
    } catch (err) {
      console.error('Error updating insight:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService, queryClient, queryKeys.insights]);

  const deleteInsight = useCallback(async (id: string) => {
    setSubmitting(true);
    
    try {
      await interviewService.deleteInsight(id);
      
      // Update cache by removing the deleted insight
      queryClient.setQueryData(queryKeys.insights, (old: InterviewInsight[] = []) => 
        old.filter(i => i.id !== id)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting insight:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService, queryClient, queryKeys.insights]);

  // === Questions ===
  // Use individual query functions for questions since they're per-interview
  const fetchQuestions = useCallback(async (interviewId: string) => {
    setSubmitting(true);
    
    try {
      const questions = await interviewService.getQuestions(interviewId);
      return questions;
    } catch (err) {
      console.error('Error fetching questions:', err);
      return [];
    } finally {
      setSubmitting(false);
    }
  }, [interviewService]);

  const createQuestion = useCallback(async (interviewId: string, questionData: Insert<'interview_questions'>) => {
    setSubmitting(true);
    
    try {
      const newQuestion = await interviewService.addQuestion(interviewId, questionData);
      return newQuestion;
    } catch (err) {
      console.error('Error creating question:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService]);

  const updateQuestion = useCallback(async (id: string, questionData: Update<'interview_questions'>) => {
    setSubmitting(true);
    
    try {
      const updatedQuestion = await interviewService.updateQuestion(id, questionData);
      return updatedQuestion;
    } catch (err) {
      console.error('Error updating question:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService]);

  const deleteQuestion = useCallback(async (id: string) => {
    setSubmitting(true);
    
    try {
      await interviewService.deleteQuestion(id);
      return true;
    } catch (err) {
      console.error('Error deleting question:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService]);

  // === Interviews ===
  const fetchInterviews = useCallback(async (pid: string) => {
    if (!pid) return [];
    await queryClient.invalidateQueries({ queryKey: queryKeys.interviews });
    return interviewsData || [];
  }, [queryClient, queryKeys, interviewsData]);

  const fetchInterview = useCallback(async (id: string) => {
    setSubmitting(true);
    
    try {
      const interview = await interviewService.getInterview(id);
      return interview;
    } catch (err) {
      console.error('Error fetching interview:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService]);

  const createInterview = useCallback(async (interviewData: Insert<'market_interviews'>) => {
    if (!projectId) return null;
    setSubmitting(true);
    
    try {
      const newInterview = await interviewService.addInterview(projectId, interviewData);
      
      // Update cache with the new interview
      queryClient.setQueryData(queryKeys.interviews, (old: MarketInterview[] = []) => [...old, newInterview]);
      
      return newInterview;
    } catch (err) {
      console.error('Error creating interview:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService, projectId, queryClient, queryKeys.interviews]);

  const updateInterview = useCallback(async (id: string, interviewData: Update<'market_interviews'>) => {
    setSubmitting(true);
    
    try {
      const updatedInterview = await interviewService.updateInterview(id, interviewData);
      
      // Update cache with the updated interview
      queryClient.setQueryData(queryKeys.interviews, (old: MarketInterview[] = []) => 
        old.map(i => i.id === id ? updatedInterview : i)
      );
      
      return updatedInterview;
    } catch (err) {
      console.error('Error updating interview:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService, queryClient, queryKeys.interviews]);

  const deleteInterview = useCallback(async (id: string) => {
    setSubmitting(true);
    
    try {
      await interviewService.deleteInterview(id);
      
      // Update cache by removing the deleted interview
      queryClient.setQueryData(queryKeys.interviews, (old: MarketInterview[] = []) => 
        old.filter(i => i.id !== id)
      );
      
      return true;
    } catch (err) {
      console.error('Error deleting interview:', err);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService, queryClient, queryKeys.interviews]);

  // === Recording and Transcript ===
  const uploadRecording = useCallback(async (interviewId: string, file: File) => {
    if (!projectId) return null;
    setSubmitting(true);
    
    try {
      const url = await interviewService.uploadRecording(projectId, interviewId, file);
      return url;
    } catch (err) {
      console.error('Error uploading recording:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService, projectId]);

  const updateTranscript = useCallback(async (interviewId: string, transcript: string) => {
    setSubmitting(true);
    
    try {
      const updatedInterview = await interviewService.updateTranscript(interviewId, transcript);
      
      // Update cache with the updated interview
      queryClient.setQueryData(queryKeys.interviews, (old: MarketInterview[] = []) => 
        old.map(i => i.id === interviewId ? updatedInterview : i)
      );
      
      return updatedInterview;
    } catch (err) {
      console.error('Error updating transcript:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService, queryClient, queryKeys.interviews]);

  const updateAnalysis = useCallback(async (
    interviewId: string, 
    analysis: any, 
    sentiment: 'positive' | 'negative' | 'neutral'
  ) => {
    setSubmitting(true);
    
    try {
      const updatedInterview = await interviewService.updateAnalysis(interviewId, analysis, sentiment);
      
      // Update cache with the updated interview
      queryClient.setQueryData(queryKeys.interviews, (old: MarketInterview[] = []) => 
        old.map(i => i.id === interviewId ? updatedInterview : i)
      );
      
      return updatedInterview;
    } catch (err) {
      console.error('Error updating analysis:', err);
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [interviewService, queryClient, queryKeys.interviews]);

  return {
    data,
    isLoading,
    error,
    // Data fetching
    fetchAllData,
    // Templates
    fetchTemplates,
    createTemplate, 
    updateTemplate,
    deleteTemplate,
    // Insights
    fetchInsights,
    fetchInsightsForInterview,
    createInsight,
    updateInsight,
    deleteInsight,
    // Questions
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    // Interviews
    fetchInterviews,
    fetchInterview,
    createInterview,
    updateInterview,
    deleteInterview,
    // Recording and Transcript
    uploadRecording,
    updateTranscript,
    updateAnalysis
  };
} 