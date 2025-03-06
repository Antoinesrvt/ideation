import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  ValidationExperiment,
  ValidationABTest,
  ValidationUserFeedback,
  ValidationHypothesis
} from '@/store/types';

export interface ValidationData {
  experiments: ValidationExperiment[];
  abTests: ValidationABTest[];
  userFeedback: ValidationUserFeedback[];
  hypotheses: ValidationHypothesis[];
}

export class ValidationService {
  constructor(private supabase: SupabaseClient) {}

  protected handleError(error: PostgrestError | Error, context: string = ''): never {
    const errorMessage = error instanceof PostgrestError 
      ? `Database error: ${error.details} (${error.code})`
      : error.message;
    
    console.error(`Validation Service Error (${context}):`, errorMessage);
    throw new Error(errorMessage);
  }

  // === Experiments ===
  async getExperiments(projectId: string): Promise<ValidationExperiment[]> {
    const { data, error } = await this.supabase
      .from('validation_experiments')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getExperiments');
    return data || [];
  }

  async addExperiment(projectId: string, data: Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>): Promise<ValidationExperiment> {
    const { data: experiment, error } = await this.supabase
      .from('validation_experiments')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addExperiment');
    return experiment;
  }

  async updateExperiment(id: string, data: Partial<Omit<ValidationExperiment, 'id' | 'created_at' | 'updated_at'>>): Promise<ValidationExperiment> {
    const { data: experiment, error } = await this.supabase
      .from('validation_experiments')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateExperiment');
    return experiment;
  }

  async deleteExperiment(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('validation_experiments')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteExperiment');
  }

  // === AB Tests ===
  async getABTests(projectId: string): Promise<ValidationABTest[]> {
    const { data, error } = await this.supabase
      .from('validation_ab_tests')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getABTests');
    return data || [];
  }

  async addABTest(projectId: string, data: Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>): Promise<ValidationABTest> {
    const { data: test, error } = await this.supabase
      .from('validation_ab_tests')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addABTest');
    return test;
  }

  async updateABTest(id: string, data: Partial<Omit<ValidationABTest, 'id' | 'created_at' | 'updated_at'>>): Promise<ValidationABTest> {
    const { data: test, error } = await this.supabase
      .from('validation_ab_tests')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateABTest');
    return test;
  }

  async deleteABTest(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('validation_ab_tests')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteABTest');
  }

  // === User Feedback ===
  async getUserFeedback(projectId: string): Promise<ValidationUserFeedback[]> {
    const { data, error } = await this.supabase
      .from('validation_user_feedback')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getUserFeedback');
    return data || [];
  }

  async addUserFeedback(projectId: string, data: Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>): Promise<ValidationUserFeedback> {
    const { data: feedback, error } = await this.supabase
      .from('validation_user_feedback')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addUserFeedback');
    return feedback;
  }

  async updateUserFeedback(id: string, data: Partial<Omit<ValidationUserFeedback, 'id' | 'created_at' | 'updated_at'>>): Promise<ValidationUserFeedback> {
    const { data: feedback, error } = await this.supabase
      .from('validation_user_feedback')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateUserFeedback');
    return feedback;
  }

  async deleteUserFeedback(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('validation_user_feedback')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteUserFeedback');
  }

  // === Hypotheses ===
  async getHypotheses(projectId: string): Promise<ValidationHypothesis[]> {
    const { data, error } = await this.supabase
      .from('validation_hypotheses')
      .select('*')
      .eq('project_id', projectId);

    if (error) this.handleError(error, 'getHypotheses');
    return data || [];
  }

  async addHypothesis(projectId: string, data: Omit<ValidationHypothesis, 'id' | 'created_at' | 'updated_at'>): Promise<ValidationHypothesis> {
    const { data: hypothesis, error } = await this.supabase
      .from('validation_hypotheses')
      .insert({ ...data, project_id: projectId })
      .select()
      .single();

    if (error) this.handleError(error, 'addHypothesis');
    return hypothesis;
  }

  async updateHypothesis(id: string, data: Partial<Omit<ValidationHypothesis, 'id' | 'created_at' | 'updated_at'>>): Promise<ValidationHypothesis> {
    const { data: hypothesis, error } = await this.supabase
      .from('validation_hypotheses')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) this.handleError(error, 'updateHypothesis');
    return hypothesis;
  }

  async deleteHypothesis(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('validation_hypotheses')
      .delete()
      .eq('id', id);

    if (error) this.handleError(error, 'deleteHypothesis');
  }

  // === Batch Operations ===
  async getAllValidationData(projectId: string): Promise<ValidationData> {
    const [experiments, abTests, userFeedback, hypotheses] = await Promise.all([
      this.getExperiments(projectId),
      this.getABTests(projectId),
      this.getUserFeedback(projectId),
      this.getHypotheses(projectId)
    ]);

    return {
      experiments,
      abTests,
      userFeedback,
      hypotheses
    };
  }
} 