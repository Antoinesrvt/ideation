import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { 
  ValidationExperiment,
  ValidationABTest,
  ValidationUserFeedback,
  ValidationHypothesis,
  ValidationRelationship,
  ValidationInsight,
  ValidationDecision,
  ValidationMilestone,
  Insert,
  Update
} from '@/store/types';
import type { Database } from '@/types/database';



export interface ValidationData {
  experiments: ValidationExperiment[];
  abTests: ValidationABTest[];
  userFeedback: ValidationUserFeedback[];
  hypotheses: ValidationHypothesis[];
  relationships?: ValidationRelationship[];
  insights?: ValidationInsight[];
  decisions?: ValidationDecision[];
  milestones?: ValidationMilestone[];
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

  // === Relationships ===
  async getRelationships(projectId: string): Promise<ValidationRelationship[]> {
    try {
      const { data, error } = await this.supabase
        .from("validation_relationships")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) this.handleError(error, "getRelationships");
      return data || [];
    } catch (error) {
      this.handleError(error as Error, "getRelationships");
    }
  }

  async addRelationship(
    projectId: string,
    data: Insert<"validation_relationships">
  ): Promise<ValidationRelationship> {
    try {
      const { data: relationship, error } = await this.supabase
        .from("validation_relationships")
        .insert({ ...data, project_id: projectId })
        .select()
        .single();

      if (error) this.handleError(error, "addRelationship");
      return relationship;
    } catch (error) {
      this.handleError(error as Error, "addRelationship");
    }
  }

  async updateRelationship(
    id: string,
    data: Update<"validation_relationships">
  ): Promise<ValidationRelationship> {
    try {
      const { data: relationship, error } = await this.supabase
        .from("validation_relationships")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) this.handleError(error, "updateRelationship");
      return relationship;
    } catch (error) {
      this.handleError(error as Error, "updateRelationship");
    }
  }

  async deleteRelationship(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("validation_relationships")
        .delete()
        .eq("id", id);

      if (error) this.handleError(error, "deleteRelationship");
    } catch (error) {
      this.handleError(error as Error, "deleteRelationship");
    }
  }

  // === Insights ===
  async getInsights(projectId: string): Promise<ValidationInsight[]> {
    try {
      const { data, error } = await this.supabase
        .from("validation_insights")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) this.handleError(error, "getInsights");
      return data || [];
    } catch (error) {
      this.handleError(error as Error, "getInsights");
    }
  }

  async addInsight(
    projectId: string,
    data: Insert<"validation_insights">
  ): Promise<ValidationInsight> {
    try {
      const { data: insight, error } = await this.supabase
        .from("validation_insights")
        .insert({ ...data, project_id: projectId })
        .select()
        .single();

      if (error) this.handleError(error, "addInsight");
      return insight;
    } catch (error) {
      this.handleError(error as Error, "addInsight");
    }
  }

  async updateInsight(
    id: string,
    data: Update<"validation_insights">
  ): Promise<ValidationInsight> {
    try {
      const { data: insight, error } = await this.supabase
        .from("validation_insights")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) this.handleError(error, "updateInsight");
      return insight;
    } catch (error) {
      this.handleError(error as Error, "updateInsight");
    }
  }

  async deleteInsight(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("validation_insights")
        .delete()
        .eq("id", id);

      if (error) this.handleError(error, "deleteInsight");
    } catch (error) {
      this.handleError(error as Error, "deleteInsight");
    }
  }

  // === Decisions ===
  async getDecisions(projectId: string): Promise<ValidationDecision[]> {
    try {
      const { data, error } = await this.supabase
        .from("validation_decisions")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) this.handleError(error, "getDecisions");
      return data || [];
    } catch (error) {
      this.handleError(error as Error, "getDecisions");
    }
  }

  async addDecision(
    projectId: string,
    data: Insert<"validation_decisions">
  ): Promise<ValidationDecision> {
    try {
      const { data: decision, error } = await this.supabase
        .from("validation_decisions")
        .insert({ ...data, project_id: projectId })
        .select()
        .single();

      if (error) this.handleError(error, "addDecision");
      return decision;
    } catch (error) {
      this.handleError(error as Error, "addDecision");
    }
  }

  async updateDecision(
    id: string,
    data: Update<"validation_decisions">
  ): Promise<ValidationDecision> {
    try {
      const { data: decision, error } = await this.supabase
        .from("validation_decisions")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) this.handleError(error, "updateDecision");
      return decision;
    } catch (error) {
      this.handleError(error as Error, "updateDecision");
    }
  }

  async deleteDecision(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("validation_decisions")
        .delete()
        .eq("id", id);

      if (error) this.handleError(error, "deleteDecision");
    } catch (error) {
      this.handleError(error as Error, "deleteDecision");
    }
  }

  // === Milestones ===
  async getMilestones(projectId: string): Promise<ValidationMilestone[]> {
    try {
      const { data, error } = await this.supabase
        .from("validation_milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) this.handleError(error, "getMilestones");
      return data || [];
    } catch (error) {
      this.handleError(error as Error, "getMilestones");
    }
  }

  async addMilestone(
    projectId: string,
    data: Insert<"validation_milestones">
  ): Promise<ValidationMilestone> {
    try {
      const { data: milestone, error } = await this.supabase
        .from("validation_milestones")
        .insert({ ...data, project_id: projectId })
        .select()
        .single();

      if (error) this.handleError(error, "addMilestone");
      return milestone;
    } catch (error) {
      this.handleError(error as Error, "addMilestone");
    }
  }

  async updateMilestone(
    id: string,
    data: Update<"validation_milestones">
  ): Promise<ValidationMilestone> {
    try {
      const { data: milestone, error } = await this.supabase
        .from("validation_milestones")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) this.handleError(error, "updateMilestone");
      return milestone;
    } catch (error) {
      this.handleError(error as Error, "updateMilestone");
    }
  }

  async deleteMilestone(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("validation_milestones")
        .delete()
        .eq("id", id);

      if (error) this.handleError(error, "deleteMilestone");
    } catch (error) {
      this.handleError(error as Error, "deleteMilestone");
    }
  }

  // === Insight-Decision Relationships ===
  async linkInsightToDecision(insightId: string, decisionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("validation_insight_decision")
        .insert({ insight_id: insightId, decision_id: decisionId })
        .select();

      if (error) this.handleError(error, "linkInsightToDecision");
    } catch (error) {
      this.handleError(error as Error, "linkInsightToDecision");
    }
  }

  async unlinkInsightFromDecision(insightId: string, decisionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("validation_insight_decision")
        .delete()
        .match({ insight_id: insightId, decision_id: decisionId });

      if (error) this.handleError(error, "unlinkInsightFromDecision");
    } catch (error) {
      this.handleError(error as Error, "unlinkInsightFromDecision");
    }
  }

  async getInsightsForDecision(decisionId: string): Promise<ValidationInsight[]> {
    try {
      const { data, error } = await this.supabase
        .from("validation_insight_decision")
        .select("insight_id")
        .eq("decision_id", decisionId);

      if (error) this.handleError(error, "getInsightsForDecision");
      
      if (!data || data.length === 0) return [];
      
      const insightIds = data.map(item => item.insight_id);
      
      const { data: insights, error: insightsError } = await this.supabase
        .from("validation_insights")
        .select("*")
        .in("id", insightIds);
        
      if (insightsError) this.handleError(insightsError, "getInsightsForDecision");
      
      return insights || [];
    } catch (error) {
      this.handleError(error as Error, "getInsightsForDecision");
    }
  }

  async getDecisionsForInsight(insightId: string): Promise<ValidationDecision[]> {
    try {
      const { data, error } = await this.supabase
        .from("validation_insight_decision")
        .select("decision_id")
        .eq("insight_id", insightId);

      if (error) this.handleError(error, "getDecisionsForInsight");
      
      if (!data || data.length === 0) return [];
      
      const decisionIds = data.map(item => item.decision_id);
      
      const { data: decisions, error: decisionsError } = await this.supabase
        .from("validation_decisions")
        .select("*")
        .in("id", decisionIds);
        
      if (decisionsError) this.handleError(decisionsError, "getDecisionsForInsight");
      
      return decisions || [];
    } catch (error) {
      this.handleError(error as Error, "getDecisionsForInsight");
    }
  }

  // === Batch Operations ===
  async getAllValidationData(projectId: string): Promise<ValidationData> {
    try {
      const [
        experiments, 
        abTests, 
        userFeedback, 
        hypotheses,
        relationships,
        insights,
        decisions,
        milestones
      ] = await Promise.all([
        this.getExperiments(projectId),
        this.getABTests(projectId),
        this.getUserFeedback(projectId),
        this.getHypotheses(projectId),
        this.getRelationships(projectId),
        this.getInsights(projectId),
        this.getDecisions(projectId),
        this.getMilestones(projectId),
      ]);

      return {
        experiments,
        abTests,
        userFeedback,
        hypotheses,
        relationships,
        insights,
        decisions,
        milestones,
      };
    } catch (error) {
      this.handleError(error as Error, "getAllValidationData");
    }
  }

  // === Entity Linking Methods ===
  
  /**
   * Links a hypothesis to a product entity
   */
  async linkHypothesisToEntity(params: { 
    hypothesisId: string; 
    entityType: 'problem' | 'solution' | 'feature' | 'journey_pain_point'; 
    entityId: string;
  }): Promise<boolean> {
    try {
      const { hypothesisId, entityType, entityId } = params;
      
      const { error } = await this.supabase
        .from('validation_hypotheses')
        .update({
          entity_type: entityType,
          entity_id: entityId
        })
        .eq('id', hypothesisId);
        
      if (error) this.handleError(error, "linkHypothesisToEntity");
      return true;
    } catch (error) {
      console.error('Error linking hypothesis to entity:', error);
      return false;
    }
  }

  /**
   * Links an experiment to product entities
   */
  async linkExperimentToEntities(params: { 
    experimentId: string; 
    problemId?: string;
    solutionId?: string;
    featureId?: string;
  }): Promise<boolean> {
    try {
      const { experimentId, problemId, solutionId, featureId } = params;
      
      const updates: any = {};
      if (problemId) updates.problem_id = problemId;
      if (solutionId) updates.solution_id = solutionId;
      if (featureId) updates.feature_id = featureId;
      
      if (Object.keys(updates).length === 0) return true; // Nothing to update
      
      const { error } = await this.supabase
        .from('validation_experiments')
        .update(updates)
        .eq('id', experimentId);
        
      if (error) this.handleError(error, "linkExperimentToEntities");
      return true;
    } catch (error) {
      console.error('Error linking experiment to entities:', error);
      return false;
    }
  }

  /**
   * Gets hypotheses for a specific entity
   */
  getHypothesesForEntity(hypotheses: ValidationHypothesis[], entityType: string, entityId: string): ValidationHypothesis[] {
    if (!hypotheses || !hypotheses.length) return [];
    return hypotheses.filter(h => 
      h.entity_type === entityType && h.entity_id === entityId
    );
  }
  
  /**
   * Gets experiments for a specific entity
   */
  getExperimentsForEntity(experiments: ValidationExperiment[], entityType: string, entityId: string): ValidationExperiment[] {
    if (!experiments || !experiments.length) return [];
    
    switch (entityType) {
      case 'problem':
        return experiments.filter(e => e.problem_id === entityId);
      case 'solution':
        return experiments.filter(e => e.solution_id === entityId);
      case 'feature':
        return experiments.filter(e => e.feature_id === entityId);
      default:
        return [];
    }
  }

  /**
   * Gets related entities through validation relationships
   */
  getRelatedEntities(
    relationships: ValidationRelationship[], 
    sourceType: string, 
    sourceId: string
  ): Array<{ type: string; id: string; relationshipType: string }> {
    if (!relationships || !relationships.length) return [];
    
    const outgoing = relationships
      .filter(r => r.source_type === sourceType && r.source_id === sourceId)
      .map(r => ({ type: r.target_type, id: r.target_id, relationshipType: r.relationship_type }));
      
    const incoming = relationships
      .filter(r => r.target_type === sourceType && r.target_id === sourceId)
      .map(r => ({ type: r.source_type, id: r.source_id, relationshipType: r.relationship_type }));
      
    return [...outgoing, ...incoming];
  }
} 