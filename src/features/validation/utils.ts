import type { ValidationData } from '@/lib/services/features/validation-service';
import type {
  EnhancedValidationData,
  EnhancedValidationExperiment,
  EnhancedValidationABTest,
  EnhancedValidationUserFeedback,
  ExperimentResults,
  ABTestResults,
  FeedbackAnalysis,
  ValidationMetrics,
  ValidationRelationship,
  ValidationInsight,
  ValidationDecision,
  ValidationMilestone
} from './types';

/**
 * Transforms raw validation data into enhanced format with proper typing
 * for use in the validation journey components
 */
export function transformValidationData(data: ValidationData): EnhancedValidationData {
  return {
    experiments: transformExperiments(data.experiments),
    abTests: transformABTests(data.abTests),
    userFeedback: transformUserFeedback(data.userFeedback),
    hypotheses: data.hypotheses,
    // Add relationships data when available
    relationships: [],
    insights: [],
    decisions: [],
    milestones: []
  };
}

/**
 * Transforms experiment data to include properly typed results
 */
function transformExperiments(experiments: ValidationData['experiments']): EnhancedValidationExperiment[] {
  return experiments.map(experiment => {
    let results: ExperimentResults | null = null;
    
    // Parse results if they exist
    if (experiment.results) {
      try {
        if (typeof experiment.results === 'string') {
          // Try to parse JSON string
          const parsedResults = JSON.parse(experiment.results);
          results = {
            success: parsedResults.success || false,
            sampleSize: parsedResults.sampleSize || 0,
            conversionRate: parsedResults.conversionRate || 0,
            pValue: parsedResults.pValue || 0,
            notes: parsedResults.notes || ''
          };
        } else if (typeof experiment.results === 'object' && experiment.results !== null) {
          // Use object directly
          const resultsObj = experiment.results as any;
          results = {
            success: resultsObj.success || false,
            sampleSize: resultsObj.sampleSize || 0,
            conversionRate: resultsObj.conversionRate || 0,
            pValue: resultsObj.pValue || 0,
            notes: resultsObj.notes || ''
          };
        }
      } catch (e) {
        console.error('Error parsing experiment results:', e);
      }
    }
    
    // Parse metrics if they exist
    let metrics = null;
    if (experiment.metrics) {
      try {
        if (typeof experiment.metrics === 'string') {
          metrics = JSON.parse(experiment.metrics);
        } else if (Array.isArray(experiment.metrics)) {
          metrics = experiment.metrics;
        }
      } catch (e) {
        console.error('Error parsing experiment metrics:', e);
      }
    }
    
    return {
      ...experiment,
      results,
      metrics,
      learnings: experiment.learnings
    };
  });
}

/**
 * Transforms A/B test data to include properly typed results
 */
function transformABTests(abTests: ValidationData['abTests']): EnhancedValidationABTest[] {
  return abTests.map(test => {
    let results: ABTestResults | null = null;
    
    // Create results from individual fields
    if (test.status === 'completed') {
      results = {
        sampleSize: test.sample_size || 0,
        conversionA: test.conversion_a || 0,
        conversionB: test.conversion_b || 0,
        confidence: test.confidence || 0,
        winner: (test.winner as 'A' | 'B' | 'inconclusive') || 'inconclusive',
        improvement: calculateImprovement(test.conversion_a || 0, test.conversion_b || 0)
      };
    }
    
    return {
      ...test,
      results,
      // We'll set a null experimentId since it doesn't exist in the schema yet
      // This will be populated from relationships in a full implementation
      experimentId: null
    };
  });
}

/**
 * Transforms user feedback data to include properly typed analysis
 */
function transformUserFeedback(feedback: ValidationData['userFeedback']): EnhancedValidationUserFeedback[] {
  return feedback.map(item => {
    let analysis: FeedbackAnalysis | null = null;
    
    // Create analysis from individual fields
    if (item.sentiment || item.impact || item.tags || item.response) {
      analysis = {
        sentiment: (item.sentiment as 'positive' | 'neutral' | 'negative') || 'neutral',
        impact: (item.impact as 'high' | 'medium' | 'low') || 'medium',
        tags: Array.isArray(item.tags) ? item.tags : [],
        response: item.response || '',
        responseTime: 0 // Default value as this might not be in the original data
      };
    }
    
    return {
      ...item,
      analysis,
      entityId: null, // These fields might be added in a future migration
      entityType: null,
      sentimentScore: 0 // Default value as this might not be in the original data
    };
  });
}

/**
 * Calculates the overall validation progress percentage
 */
export function calculateValidationProgress(data: ValidationData): number {
  if (!data) return 0;
  
  const totalHypotheses = data.hypotheses.length;
  if (totalHypotheses === 0) return 0;
  
  const validatedHypotheses = data.hypotheses.filter(
    h => h.status === 'validated' || h.status === 'invalidated'
  ).length;
  
  return Math.round((validatedHypotheses / totalHypotheses) * 100);
}

/**
 * Calculates the confidence level for a hypothesis based on its validation activities
 */
export function calculateHypothesisConfidence(
  hypothesisId: string,
  data: EnhancedValidationData
): number {
  // Find linked experiments
  const linkedExperiments = data.experiments.filter(e => e.hypothesis === hypothesisId);
  
  // Find linked A/B tests through experiments
  const linkedTests = data.abTests.filter(t => 
    linkedExperiments.some(e => t.experimentId === e.id)
  );
  
  // Find linked feedback
  const linkedFeedback = data.userFeedback.filter(f => f.entityId === hypothesisId);
  
  // Calculate base confidence
  let baseConfidence = 0;
  
  // Add confidence from completed experiments
  const completedExperiments = linkedExperiments.filter(e => e.status === 'completed');
  if (completedExperiments.length > 0) {
    const successfulExperiments = completedExperiments.filter(e => e.results?.success);
    const experimentConfidence = (successfulExperiments.length / completedExperiments.length) * 40;
    baseConfidence += experimentConfidence;
  }
  
  // Add confidence from completed A/B tests
  const completedTests = linkedTests.filter(t => t.status === 'completed');
  if (completedTests.length > 0) {
    const successfulTests = completedTests.filter(t => t.results?.winner === 'B');
    const testConfidence = (successfulTests.length / completedTests.length) * 30;
    baseConfidence += testConfidence;
  }
  
  // Add confidence from feedback
  if (linkedFeedback.length > 0) {
    const positiveCount = linkedFeedback.filter(f => f.analysis?.sentiment === 'positive').length;
    const feedbackConfidence = (positiveCount / linkedFeedback.length) * 30;
    baseConfidence += feedbackConfidence;
  }
  
  // Adjust confidence based on total evidence
  const totalEvidence = completedExperiments.length + completedTests.length + linkedFeedback.length;
  const evidenceMultiplier = Math.min(1, totalEvidence / 5); // Max out at 5 pieces of evidence
  
  return Math.round(baseConfidence * evidenceMultiplier);
}

/**
 * Helper function to calculate improvement percentage between two conversion rates
 */
function calculateImprovement(conversionA: number, conversionB: number): number {
  if (conversionA === 0) return conversionB > 0 ? 100 : 0;
  return Math.round(((conversionB - conversionA) / conversionA) * 100);
}

function calculateResponseTime(createdAt: string | null, updatedAt: string | null): number {
  if (!createdAt || !updatedAt) return 0;
  const created = new Date(createdAt);
  const updated = new Date(updatedAt);
  return (updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // Convert to days
}

export function calculateValidationMetrics(data: EnhancedValidationData) {
  const now = new Date();
  
  return {
    hypotheses: {
      total: data.hypotheses.length,
      validated: data.hypotheses.filter(h => h.status === 'validated').length,
      invalidated: data.hypotheses.filter(h => h.status === 'invalidated').length,
      validationRate: data.hypotheses.length > 0 
        ? (data.hypotheses.filter(h => h.status === 'validated').length / data.hypotheses.length) * 100 
        : 0,
    },
    
    experiments: {
      total: data.experiments.length,
      completed: data.experiments.filter(e => e.status === 'completed').length,
      inProgress: data.experiments.filter(e => e.status === 'in-progress').length,
      successRate: data.experiments.filter(e => e.status === 'completed').length > 0
        ? (data.experiments.filter(e => e.results?.success).length / data.experiments.filter(e => e.status === 'completed').length) * 100
        : 0,
      avgDuration: calculateAverageDuration(data.experiments),
    },
    
    abTests: {
      total: data.abTests.length,
      completed: data.abTests.filter(t => t.status === 'completed').length,
      running: data.abTests.filter(t => t.status === 'running').length,
      avgImprovement: data.abTests.filter(t => t.results).length > 0
        ? data.abTests
            .filter(t => t.results)
            .reduce((acc, t) => acc + (t.results?.improvement || 0), 0) / data.abTests.filter(t => t.results).length
        : 0,
      avgConfidence: data.abTests.filter(t => t.results).length > 0
        ? data.abTests
            .filter(t => t.results)
            .reduce((acc, t) => acc + (t.results?.confidence || 0), 0) / data.abTests.filter(t => t.results).length
        : 0,
    },
    
    userFeedback: {
      total: data.userFeedback.length,
      positive: data.userFeedback.filter(f => f.analysis?.sentiment === 'positive').length,
      negative: data.userFeedback.filter(f => f.analysis?.sentiment === 'negative').length,
      neutral: data.userFeedback.filter(f => f.analysis?.sentiment === 'neutral').length,
      sentimentScore: data.userFeedback.length > 0
        ? data.userFeedback.reduce((acc, f) => acc + (f.sentimentScore || 0), 0) / data.userFeedback.length
        : 0,
      ...(data.userFeedback.filter(f => f.analysis?.responseTime).length > 0 && {
        avgResponseTime: data.userFeedback
          .filter(f => f.analysis?.responseTime)
          .reduce((acc, f) => acc + (f.analysis?.responseTime || 0), 0) / data.userFeedback.filter(f => f.analysis?.responseTime).length
      }),
      ...(data.userFeedback.length > 0 && {
        implementationRate: (data.userFeedback.filter(f => f.status === 'implemented').length / data.userFeedback.length) * 100
      }),
    },
  };
}

function calculateAverageDuration(experiments: EnhancedValidationExperiment[]): number {
  const completedWithDates = experiments.filter(e => 
    e.status === 'completed' && e.start_date && e.end_date
  );
  
  if (completedWithDates.length === 0) return 0;
  
  const totalDuration = completedWithDates.reduce((acc, e) => {
    if (!e.start_date || !e.end_date) return acc;
    const start = new Date(e.start_date);
    const end = new Date(e.end_date);
    return acc + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24); // Convert to days
  }, 0);
  
  return totalDuration / completedWithDates.length;
}

/**
 * Maps database relationship records to our enhanced ValidationRelationship type
 */
export function mapDatabaseRelationships(relationships: any[]): ValidationRelationship[] {
  if (!relationships || !Array.isArray(relationships)) return [];
  
  return relationships.map(r => ({
    id: r.id,
    sourceId: r.source_id,
    sourceType: r.source_type,
    targetId: r.target_id,
    targetType: r.target_type,
    relationshipType: r.relationship_type,
    strength: 1, // Default value
    notes: '',   // Default value
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
}

/**
 * Maps database insight records to our enhanced ValidationInsight type
 */
export function mapDatabaseInsights(insights: any[]): ValidationInsight[] {
  if (!insights || !Array.isArray(insights)) return [];
  
  return insights.map(i => ({
    id: i.id,
    title: i.title,
    description: i.description,
    sourceIds: [i.source_id],
    sourceTypes: [i.source_type],
    confidence: 0.7, // Default value
    impact: i.business_impact,
    tags: [],        // Default value
    status: i.status,
    createdAt: i.created_at,
    updatedAt: i.updated_at
  }));
}

/**
 * Maps database decision records to our enhanced ValidationDecision type
 */
export function mapDatabaseDecisions(decisions: any[]): ValidationDecision[] {
  if (!decisions || !Array.isArray(decisions)) return [];
  
  return decisions.map(d => ({
    id: d.id,
    title: d.title,
    description: d.description,
    insightIds: [],  // Default value
    decision: d.decision_type,
    impact: 'medium', // Default value
    confidence: 0.7,  // Default value
    nextSteps: [],    // Default value
    status: 'pending', // Default value
    createdAt: d.created_at,
    updatedAt: d.updated_at
  }));
}

/**
 * Maps database milestone records to our enhanced ValidationMilestone type
 */
export function mapDatabaseMilestones(milestones: any[]): ValidationMilestone[] {
  if (!milestones || !Array.isArray(milestones)) return [];
  
  return milestones.map(m => ({
    id: m.id,
    title: m.title,
    description: m.description,
    date: new Date().toISOString(), // Default to current date
    type: 'hypothesis',             // Default value
    entityId: '',                   // Default value
    status: m.status,
    createdAt: m.created_at,
    updatedAt: m.updated_at
  }));
} 