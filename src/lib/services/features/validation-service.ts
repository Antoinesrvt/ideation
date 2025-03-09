import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  ValidationExperiment,
  ValidationABTest,
  ValidationUserFeedback,
  ValidationHypothesis,
  Insert,
  Update
} from '@/store/types';
import type { Database } from '@/types/database';



export interface ValidationData {
  experiments: ValidationExperiment[];
  abTests: ValidationABTest[];
  userFeedback: ValidationUserFeedback[];
  hypotheses: ValidationHypothesis[];
}

export class ValidationService {
  constructor(private supabase: SupabaseClient) {}

  protected handleError(
    error: PostgrestError | Error,
    context: string = ""
  ): never {
    const errorMessage =
      error instanceof PostgrestError
        ? `Database error: ${error.details} (${error.code})`
        : error.message;

    console.error(`Validation Service Error (${context}):`, errorMessage);
    throw new Error(errorMessage);
  }

  // === Experiments ===
  async getExperiments(projectId: string): Promise<ValidationExperiment[]> {
    try {
      const { data, error } = await this.supabase
        .from("validation_experiments")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) this.handleError(error, "getExperiments");
      return data || [];
    } catch (error) {
      this.handleError(error as Error, "getExperiments");
    }
  }

  async addExperiment(
    projectId: string,
    data: Insert<"validation_experiments">
  ): Promise<ValidationExperiment> {
    try {
      const { data: experiment, error } = await this.supabase
        .from("validation_experiments")
        .insert({ ...data, project_id: projectId })
        .select()
        .single();

      if (error) this.handleError(error, "addExperiment");
      return experiment;
    } catch (error) {
      this.handleError(error as Error, "addExperiment");
    }
  }

  async updateExperiment(
    id: string,
    data: Update<"validation_experiments">
  ): Promise<ValidationExperiment> {
    try {
      const { data: experiment, error } = await this.supabase
        .from("validation_experiments")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) this.handleError(error, "updateExperiment");
      return experiment;
    } catch (error) {
      this.handleError(error as Error, "updateExperiment");
    }
  }

  async deleteExperiment(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("validation_experiments")
        .delete()
        .eq("id", id);

      if (error) this.handleError(error, "deleteExperiment");
    } catch (error) {
      this.handleError(error as Error, "deleteExperiment");
    }
  }

  // === A/B Tests ===
  async getABTests(projectId: string): Promise<ValidationABTest[]> {
    try {
      const { data, error } = await this.supabase
        .from("validation_ab_tests")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) this.handleError(error, "getABTests");
      return data || [];
    } catch (error) {
      this.handleError(error as Error, "getABTests");
    }
  }

  async addABTest(
    projectId: string,
    data: Insert<"validation_ab_tests">
  ): Promise<ValidationABTest> {
    try {
      const { data: abTest, error } = await this.supabase
        .from("validation_ab_tests")
        .insert({ ...data, project_id: projectId })
        .select()
        .single();

      if (error) this.handleError(error, "addABTest");
      return abTest;
    } catch (error) {
      this.handleError(error as Error, "addABTest");
    }
  }

  async updateABTest(
    id: string,
    data: Update<"validation_ab_tests">
  ): Promise<ValidationABTest> {
    try {
      const { data: abTest, error } = await this.supabase
        .from("validation_ab_tests")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) this.handleError(error, "updateABTest");
      return abTest;
    } catch (error) {
      this.handleError(error as Error, "updateABTest");
    }
  }

  async deleteABTest(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("validation_ab_tests")
        .delete()
        .eq("id", id);

      if (error) this.handleError(error, "deleteABTest");
    } catch (error) {
      this.handleError(error as Error, "deleteABTest");
    }
  }

  // === User Feedback ===
  async getUserFeedback(projectId: string): Promise<ValidationUserFeedback[]> {
    try {
      const { data, error } = await this.supabase
        .from("validation_user_feedback")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) this.handleError(error, "getUserFeedback");
      return data || [];
    } catch (error) {
      this.handleError(error as Error, "getUserFeedback");
    }
  }

  async addUserFeedback(
    projectId: string,
    data: Insert<"validation_user_feedback">
  ): Promise<ValidationUserFeedback> {
    try {
      const { data: feedback, error } = await this.supabase
        .from("validation_user_feedback")
        .insert({ ...data, project_id: projectId })
        .select()
        .single();

      if (error) this.handleError(error, "addUserFeedback");
      return feedback;
    } catch (error) {
      this.handleError(error as Error, "addUserFeedback");
    }
  }

  async updateUserFeedback(
    id: string,
    data: Update<"validation_user_feedback">
  ): Promise<ValidationUserFeedback> {
    try {
      const { data: feedback, error } = await this.supabase
        .from("validation_user_feedback")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) this.handleError(error, "updateUserFeedback");
      return feedback;
    } catch (error) {
      this.handleError(error as Error, "updateUserFeedback");
    }
  }

  async deleteUserFeedback(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("validation_user_feedback")
        .delete()
        .eq("id", id);

      if (error) this.handleError(error, "deleteUserFeedback");
    } catch (error) {
      this.handleError(error as Error, "deleteUserFeedback");
    }
  }

  // === Hypotheses ===
  async getHypotheses(projectId: string): Promise<ValidationHypothesis[]> {
    try {
      const { data, error } = await this.supabase
        .from("validation_hypotheses")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) this.handleError(error, "getHypotheses");
      return data || [];
    } catch (error) {
      this.handleError(error as Error, "getHypotheses");
    }
  }

  async addHypothesis(
    projectId: string,
    data: Insert<"validation_hypotheses">
  ): Promise<ValidationHypothesis> {
    try {
      const { data: hypothesis, error } = await this.supabase
        .from("validation_hypotheses")
        .insert({ ...data, project_id: projectId })
        .select()
        .single();

      if (error) this.handleError(error, "addHypothesis");
      return hypothesis;
    } catch (error) {
      this.handleError(error as Error, "addHypothesis");
    }
  }

  async updateHypothesis(
    id: string,
    data: Update<"validation_hypotheses">
  ): Promise<ValidationHypothesis> {
    try {
      const { data: hypothesis, error } = await this.supabase
        .from("validation_hypotheses")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) this.handleError(error, "updateHypothesis");
      return hypothesis;
    } catch (error) {
      this.handleError(error as Error, "updateHypothesis");
    }
  }

  async deleteHypothesis(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("validation_hypotheses")
        .delete()
        .eq("id", id);

      if (error) this.handleError(error, "deleteHypothesis");
    } catch (error) {
      this.handleError(error as Error, "deleteHypothesis");
    }
  }

  // === Batch Operations ===
  async getAllValidationData(projectId: string): Promise<ValidationData> {
    try {
      const [experiments, abTests, userFeedback, hypotheses] =
        await Promise.all([
          this.getExperiments(projectId),
          this.getABTests(projectId),
          this.getUserFeedback(projectId),
          this.getHypotheses(projectId),
        ]);

      return {
        experiments,
        abTests,
        userFeedback,
        hypotheses,
      };
    } catch (error) {
      this.handleError(error as Error, "getAllValidationData");
    }
  }
} 