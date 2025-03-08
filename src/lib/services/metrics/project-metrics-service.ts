import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { 
  ProjectMetrics, 
  ProjectPhase,
  ProjectInsight,
  ProjectRisk,
  RecommendedAction
} from '@/types/project';

export class ProjectMetricsService {
  private supabase: SupabaseClient;
  
  constructor(
    private projectId: string,
    supabaseClient?: SupabaseClient
  ) {
    this.supabase = supabaseClient || createClient();
  }
  
  /**
   * Calculate all project metrics
   */
  async calculateMetrics(): Promise<ProjectMetrics> {
    try {
      // Fetch all necessary data
      const projectData = await this.fetchProjectData();
      
      // Calculate section completion percentages
      const sectionCompletion = this.calculateSectionCompletion(projectData);
      
      // Calculate overall health score
      const healthScore = this.calculateHealthScore(sectionCompletion);
      
      // Determine project phase
      const phase = this.determineProjectPhase(projectData, sectionCompletion);
      
      // Generate insights
      const insights = this.generateInsights(projectData);
      
      // Identify risks
      const risks = this.identifyRisks(projectData, sectionCompletion);
      
      // Generate recommended actions
      const recommendedActions = this.generateRecommendedActions(
        projectData, 
        sectionCompletion,
        risks
      );
      
      // Create metrics object
      const metrics: ProjectMetrics = {
        lastCalculated: new Date().toISOString(),
        sectionCompletion,
        healthScore,
        phase,
        insights,
        risks,
        recommendedActions
      };
      
      // Save to project metadata
      await this.saveMetricsToMetadata(metrics);
      
      return metrics;
    } catch (error) {
      console.error('Failed to calculate project metrics:', error);
      throw error;
    }
  }
  
  /**
   * Fetch all project data needed for metrics calculation
   */
  private async fetchProjectData(): Promise<any> {
    // Fetch project base data
    const { data: project, error: projectError } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', this.projectId)
      .single();
      
    if (projectError) throw projectError;
    
    // Fetch canvas data
    const { data: canvasItems, error: canvasError } = await this.supabase
      .from('canvas_items')
      .select('*')
      .eq('project_id', this.projectId);
      
    if (canvasError) throw canvasError;
    
    // Fetch GRP data
    const { data: grpItems, error: grpError } = await this.supabase
      .from('grp_items')
      .select('*')
      .eq('project_id', this.projectId);
      
    if (grpError) throw grpError;
    
    // Fetch market analysis data
    const { data: marketPersonas, error: personasError } = await this.supabase
      .from('market_personas')
      .select('*')
      .eq('project_id', this.projectId);
      
    if (personasError) throw personasError;
    
    const { data: marketCompetitors, error: competitorsError } = await this.supabase
      .from('market_competitors')
      .select('*')
      .eq('project_id', this.projectId);
      
    if (competitorsError) throw competitorsError;
    
    // Fetch product design data
    const { data: productFeatures, error: featuresError } = await this.supabase
      .from('product_features')
      .select('*')
      .eq('project_id', this.projectId);
      
    if (featuresError) throw featuresError;
    
    // Fetch validation data
    const { data: validationExperiments, error: experimentsError } = await this.supabase
      .from('validation_experiments')
      .select('*')
      .eq('project_id', this.projectId);
      
    if (experimentsError) throw experimentsError;
    
    // Combine all data into one object
    return {
      project,
      canvas: { items: canvasItems || [] },
      grp: { items: grpItems || [] },
      marketAnalysis: { 
        personas: marketPersonas || [],
        competitors: marketCompetitors || []
      },
      productDesign: { 
        features: productFeatures || []
      },
      validation: { 
        experiments: validationExperiments || []
      }
    };
  }
  
  /**
   * Calculate completion percentages for each section
   */
  private calculateSectionCompletion(projectData: any): Record<string, number> {
    const completion: Record<string, number> = {
      canvas: 0,
      grp: 0,
      market: 0,
      'product-design': 0,
      validation: 0,
      financials: 0,
      team: 0,
      documents: 0,
      overall: 0
    };
    
    // Calculate canvas completion (based on number of items)
    if (projectData.canvas?.items.length) {
      // Basic heuristic: 20 items is considered "complete"
      const canvasProgress = Math.min(projectData.canvas.items.length / 20 * 100, 100);
      completion.canvas = Math.round(canvasProgress);
    }
    
    // Calculate GRP model completion
    if (projectData.grp?.items.length) {
      // Basic heuristic: 15 items is considered "complete"
      const grpProgress = Math.min(projectData.grp.items.length / 15 * 100, 100);
      completion.grp = Math.round(grpProgress);
    }
    
    // Calculate market analysis completion
    const marketTotalItems = 
      (projectData.marketAnalysis?.personas?.length || 0) + 
      (projectData.marketAnalysis?.competitors?.length || 0);
    if (marketTotalItems > 0) {
      // Basic heuristic: 10 items is considered "complete"
      const marketProgress = Math.min(marketTotalItems / 10 * 100, 100);
      completion.market = Math.round(marketProgress);
    }
    
    // Calculate product design completion
    if (projectData.productDesign?.features?.length) {
      // Basic heuristic: 8 features is considered "complete"
      const productProgress = Math.min(projectData.productDesign.features.length / 8 * 100, 100);
      completion['product-design'] = Math.round(productProgress);
    }
    
    // Calculate validation completion
    if (projectData.validation?.experiments?.length) {
      // Complete is based on having experiments and hypotheses
      const validationProgress = Math.min(projectData.validation.experiments.length / 5 * 100, 100);
      completion.validation = Math.round(validationProgress);
    }
    
    // Calculate overall completion (weighted average)
    const weights = {
      canvas: 0.2,
      grp: 0.1,
      market: 0.2,
      'product-design': 0.15,
      validation: 0.2,
      financials: 0.1,
      team: 0.05,
      documents: 0
    };
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    Object.entries(weights).forEach(([section, weight]) => {
      if (completion[section] > 0) {
        weightedSum += completion[section] * weight;
        totalWeight += weight;
      }
    });
    
    completion.overall = totalWeight > 0 
      ? Math.round(weightedSum / totalWeight) 
      : 0;
    
    return completion;
  }
  
  /**
   * Calculate overall project health score
   */
  private calculateHealthScore(
    sectionCompletion: Record<string, number>
  ): number {
    // Basic implementation: overall completion is the health score
    // Could be enhanced with other factors like risk count, etc.
    return sectionCompletion.overall;
  }
  
  /**
   * Determine project phase based on completion and validation
   */
  private determineProjectPhase(
    projectData: any, 
    sectionCompletion: Record<string, number>
  ): ProjectPhase {
    const overall = sectionCompletion.overall;
    const validationProgress = sectionCompletion.validation;
    const marketProgress = sectionCompletion.market;
    
    if (overall < 25) return 'concept';
    if (overall < 50) return 'development';
    if (overall < 75 || validationProgress < 50) return 'validation';
    if (overall < 90 || marketProgress < 70) return 'refinement';
    return 'launch-ready';
  }
  
  /**
   * Generate insights based on project data
   */
  private generateInsights(projectData: any): ProjectInsight[] {
    const insights: ProjectInsight[] = [];
    
    // Canvas insights
    const valueProps = projectData.canvas?.items.filter((item: any) => 
      item.section_id === 'valuePropositions' || item.section === 'valuePropositions'
    );
    
    if (valueProps?.length > 0) {
      insights.push({
        id: 'value-props',
        title: 'Value Propositions',
        value: valueProps.length,
        description: `You've defined ${valueProps.length} value proposition${valueProps.length !== 1 ? 's' : ''}`,
        icon: 'award',
        color: 'amber',
        section: 'canvas'
      });
    }
    
    // Market insights
    if (projectData.marketAnalysis?.competitors?.length) {
      insights.push({
        id: 'competitors',
        title: 'Competitors',
        value: projectData.marketAnalysis.competitors.length,
        description: `You're tracking ${projectData.marketAnalysis.competitors.length} competitor${projectData.marketAnalysis.competitors.length !== 1 ? 's' : ''}`,
        icon: 'target',
        color: 'green',
        section: 'market'
      });
    }
    
    // Product design insights
    const mustHaveFeatures = projectData.productDesign?.features?.filter(
      (f: any) => f.priority === 'must'
    ).length || 0;
    
    if (mustHaveFeatures > 0) {
      insights.push({
        id: 'must-features',
        title: 'Must-Have Features',
        value: mustHaveFeatures,
        description: `You've defined ${mustHaveFeatures} critical feature${mustHaveFeatures !== 1 ? 's' : ''}`,
        icon: 'clipboard',
        color: 'purple',
        section: 'product-design'
      });
    }
    
    // Validation insights
    const completedExperiments = projectData.validation?.experiments?.filter(
      (e: any) => e.status === 'completed'
    ).length || 0;
    
    if (completedExperiments > 0) {
      insights.push({
        id: 'experiments',
        title: 'Completed Experiments',
        value: completedExperiments,
        description: `You've completed ${completedExperiments} validation experiment${completedExperiments !== 1 ? 's' : ''}`,
        icon: 'beaker',
        color: 'indigo',
        section: 'validation'
      });
    }
    
    // Return a slice to avoid too many items
    return insights.slice(0, 4);
  }
  
  /**
   * Identify potential project risks
   */
  private identifyRisks(
    projectData: any, 
    sectionCompletion: Record<string, number>
  ): ProjectRisk[] {
    const risks: ProjectRisk[] = [];
    
    // No market validation indicates risk
    if (sectionCompletion.validation < 20 && sectionCompletion.overall > 40) {
      risks.push({
        id: 'validation-risk',
        title: 'Limited Validation',
        description: 'Your business model assumptions need testing',
        severity: 'high',
        action: 'validation'
      });
    }
    
    // No competitors analysis might mean insufficient market research
    if ((!projectData.marketAnalysis?.competitors || projectData.marketAnalysis.competitors.length === 0) && 
        sectionCompletion.overall > 30) {
      risks.push({
        id: 'competitors-risk',
        title: 'Missing Competitor Analysis',
        description: 'Understanding the competitive landscape is crucial',
        severity: 'medium',
        action: 'market'
      });
    }
    
    // If user flows are missing but we're far along
    if (sectionCompletion['product-design'] < 20 && sectionCompletion.overall > 50) {
      risks.push({
        id: 'userflow-risk',
        title: 'Underdeveloped Product Design',
        description: 'You need to define how users will interact with your product',
        severity: 'medium',
        action: 'product-design'
      });
    }
    
    // Return risks, limited to most important ones
    return risks.slice(0, 3);
  }
  
  /**
   * Generate recommended actions based on project state
   */
  private generateRecommendedActions(
    projectData: any,
    sectionCompletion: Record<string, number>,
    risks: ProjectRisk[]
  ): RecommendedAction[] {
    const actions: RecommendedAction[] = [];
    
    // Convert high-severity risks to recommended actions
    risks.filter(risk => risk.severity === 'high' && risk.action)
      .forEach(risk => {
        actions.push({
          id: `${risk.action}-action`,
          title: `Address ${risk.title}`,
          description: risk.description,
          priority: 1,
          section: risk.action || ''
        });
      });
    
    // Add section-based recommendations
    if (sectionCompletion.canvas < 70) {
      actions.push({
        id: 'canvas-action',
        title: 'Complete your business model canvas',
        description: 'Define your key value propositions and customer segments',
        priority: sectionCompletion.canvas < 30 ? 1 : 2,
        section: 'canvas'
      });
    }
    
    if (sectionCompletion.market < 60) {
      actions.push({
        id: 'market-action',
        title: 'Develop your market analysis',
        description: 'Research competitors and identify customer personas',
        priority: sectionCompletion.canvas > 50 ? 1 : 2,
        section: 'market'
      });
    }
    
    // If validation is missing or low, prioritize it highly if other areas are progressed
    if (sectionCompletion.validation < 40 && sectionCompletion.canvas > 50) {
      actions.push({
        id: 'validation-action',
        title: 'Test your core assumptions',
        description: 'Set up experiments to validate your business model',
        priority: 1,
        section: 'validation'
      });
    }
    
    // Sort by priority and return top recommendations
    return actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }
  
  /**
   * Save metrics to project metadata
   */
  private async saveMetricsToMetadata(metrics: ProjectMetrics): Promise<void> {
    // Get current project
    const { data: project, error: getError } = await this.supabase
      .from('projects')
      .select('metadata')
      .eq('id', this.projectId)
      .single();
      
    if (getError) throw getError;
    
    // Update metadata
    const metadata = project.metadata || {};
    metadata.metrics = metrics;
    
    // Save updated metadata
    const { error: updateError } = await this.supabase
      .from('projects')
      .update({ metadata })
      .eq('id', this.projectId);
      
    if (updateError) throw updateError;
  }
} 