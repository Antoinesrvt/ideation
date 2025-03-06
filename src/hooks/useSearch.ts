import { useState, useEffect, useCallback } from 'react';
import { useProject } from './useProject';
import { 
  ProjectDetails, 
  CanvasItem, 
  GRPItem, 
  Feature, 
  CustomerPersona, 
  Competitor, 
  MarketTrend,
  Experiment,
  ABTest,
  UserFeedback,
  Hypothesis,
  ValidationData
} from '@/types';

// Define the search result interface
export interface SearchResult {
  id: string;
  title: string;
  section: string;
  sectionId: string;
  content: string;
  type?: string;
  tags?: string[];
  date?: string;
  status?: string;
  priority?: string;
}

export type SearchOptions = {
  sections?: string[];  // Filter by specific sections
  includeContent?: boolean; // Whether to search in content
  includeTitle?: boolean;  // Whether to search in titles
  caseSensitive?: boolean; // Whether search should be case sensitive
  exactMatch?: boolean;    // Whether to match exactly or partially
  maxResults?: number;     // Maximum number of results to return
  sortBy?: 'relevance' | 'date' | 'section'; // How to sort results
};

/**
 * Enhanced hook for searching across project data
 * @param projectId The ID of the project to search
 * @param defaultOptions Default search options
 * @returns Search function and results
 */
export function useSearch(projectId?: string, defaultOptions?: SearchOptions) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const { project } = useProject(projectId);
  
  // Search function that can be called with options
  const search = useCallback((query: string, options?: SearchOptions) => {
    if (!query || !project.data) {
      setResults([]);
      setLastQuery('');
      return [];
    }

    setIsSearching(true);
    setLastQuery(query);
    
    const searchOptions = {
      ...{
        includeContent: true,
        includeTitle: true,
        caseSensitive: false,
        exactMatch: false,
        maxResults: 100,
        sortBy: 'relevance'
      } as SearchOptions,
      ...defaultOptions,
      ...options
    };
    
    const searchTerm = searchOptions.caseSensitive ? query : query.toLowerCase();
    let searchResults: SearchResult[] = [];
    
    // Helper to check if we should search within a section
    const shouldSearchSection = (sectionId: string) => {
      return !searchOptions.sections || searchOptions.sections.includes(sectionId);
    };
    
    // Helper to check if a string matches the search term
    const matches = (text?: string): boolean => {
      if (!text) return false;
      
      const compareText = searchOptions.caseSensitive ? text : text.toLowerCase();
      
      if (searchOptions.exactMatch) {
        return compareText === searchTerm;
      } else {
        return compareText.includes(searchTerm);
      }
    };

    // Combine search results from all sections
    // --- Business Model Canvas ---
    if (shouldSearchSection('canvas') && project.data.canvas) {
      searchResults.push(...searchCanvas(project.data.canvas, searchTerm, matches));
    }
    
    // --- GRP Model ---
    if (shouldSearchSection('grp') && project.data.grpModel) {
      searchResults.push(...searchGRPModel(project.data.grpModel, searchTerm, matches));
    }
    
    // --- Market Analysis ---
    if (shouldSearchSection('market') && project.data.marketAnalysis) {
      searchResults.push(...searchMarketAnalysis(project.data.marketAnalysis, searchTerm, matches));
    }
    
    // --- User Flow ---
    if (shouldSearchSection('userflow') && project.data.userFlow) {
      searchResults.push(...searchUserFlow(project.data.userFlow, searchTerm, matches));
    }
    
    // --- Validation ---
    if (shouldSearchSection('validation') && project.data.validation) {
      searchResults.push(...searchValidation(project.data.validation, searchTerm, matches));
    }
    
    // --- Financial Projections ---
    if (shouldSearchSection('financialProjections') && project.data.financialProjections) {
      searchResults.push(...searchFinancials(project.data.financialProjections, searchTerm, matches));
    }
    
    // --- Team Management ---
    if (shouldSearchSection('team') && project.data.team) {
      searchResults.push(...searchTeam(project.data.team, searchTerm, matches));
    }
    
    // --- Documents ---
    if (shouldSearchSection('documents') && project.data.documents) {
      searchResults.push(...searchDocuments(project.data.documents, searchTerm, matches));
    }
    
    // Sort results based on specified sort option
    if (searchOptions.sortBy === 'date') {
      searchResults = searchResults.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    } else if (searchOptions.sortBy === 'section') {
      searchResults = searchResults.sort((a, b) => a.section.localeCompare(b.section));
    } else {
      // Default 'relevance' sort - shorter titles that fully match are given priority
      searchResults = searchResults.sort((a, b) => {
        const aTitleMatch = a.title.toLowerCase().includes(query.toLowerCase());
        const bTitleMatch = b.title.toLowerCase().includes(query.toLowerCase());
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        
        // If both match or don't match, prefer shorter titles
        return a.title.length - b.title.length;
      });
    }
    
    // Limit number of results if specified
    const limitedResults = searchOptions.maxResults 
      ? searchResults.slice(0, searchOptions.maxResults)
      : searchResults;
    
    setResults(limitedResults);
    setIsSearching(false);
    
    return limitedResults;
  }, [project.data, defaultOptions]);

  return {
    search,
    results,
    isSearching,
    lastQuery,
    clearResults: () => setResults([])
  };
}

/**
 * Search within the Business Model Canvas
 */
function searchCanvas(
  canvas: ProjectDetails['canvas'], 
  searchTerm: string,
  matches: (text?: string) => boolean
): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!canvas) return results;
  
  // Convert canvas to entries we can iterate over
  Object.entries(canvas).forEach(([key, items]) => {
    if (Array.isArray(items)) {
      items.forEach((item: CanvasItem) => {
        if (matches(item.text)) {
          results.push({
              id: `canvas-${key}-${item.id}`,
              title: item.text,
              section: 'Business Model Canvas',
              sectionId: 'canvas',
            content: item.text,
            status: item.checked ? 'completed' : 'pending'
          });
        }
      });
    }
  });
  
  return results;
}

/**
 * Search within the GRP Model
 */
function searchGRPModel(
  grpModel: ProjectDetails['grpModel'],
  searchTerm: string,
  matches: (text?: string) => boolean
): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!grpModel) return results;
  
  // Search in generation
  if (grpModel.generation) {
    searchGRPSection(grpModel.generation, 'generation', searchTerm, results, matches);
  }
  
  // Search in remuneration
  if (grpModel.remuneration) {
    searchGRPSection(grpModel.remuneration, 'remuneration', searchTerm, results, matches);
  }
  
  // Search in partage
  if (grpModel.partage) {
    searchGRPSection(grpModel.partage, 'partage', searchTerm, results, matches);
  }
  
  return results;
}

/**
 * Helper function to search within a GRP section
 */
function searchGRPSection(
  section: Record<string, GRPItem[]>,
  sectionName: string,
  searchTerm: string,
  results: SearchResult[],
  matches: (text?: string) => boolean
) {
  Object.entries(section).forEach(([subsectionKey, items]) => {
    items.forEach((item) => {
      const titleMatch = matches(item.title);
      const descriptionMatch = matches(item.description);
      
      if (titleMatch || descriptionMatch) {
        results.push({
          id: `grp-${sectionName}-${subsectionKey}-${item.id}`,
                title: item.title || 'Untitled',
          section: `GRP Model - ${sectionName}`,
                sectionId: 'grp',
          content: item.description || '',
          status: item.percentage ? `${item.percentage}%` : undefined
              });
            }
        });
      });
    }
    
/**
 * Search within the Market Analysis
 */
function searchMarketAnalysis(
  marketAnalysis: ProjectDetails['marketAnalysis'],
  searchTerm: string,
  matches: (text?: string) => boolean
): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!marketAnalysis) return results;
  
      // Search in personas
  if (marketAnalysis.customerInsights?.personas) {
    marketAnalysis.customerInsights.personas.forEach((persona: CustomerPersona) => {
      const nameMatch = matches(persona.name);
      const roleMatch = matches(persona.role);
      const demographicsMatch = matches(persona.demographics);
      const goalsMatch = persona.goals?.some(goal => matches(goal));
      const painPointsMatch = persona.painPoints?.some(point => matches(point));
      
      if (nameMatch || roleMatch || demographicsMatch || goalsMatch || painPointsMatch) {
        results.push({
            id: `market-persona-${persona.id}`,
            title: persona.name || 'Unnamed Persona',
            section: 'Market Analysis - Personas',
            sectionId: 'market',
          content: persona.role || '',
          type: 'persona'
          });
        }
      });
  }
      
      // Search in competitors
  if (marketAnalysis.competitors) {
    marketAnalysis.competitors.forEach((competitor: Competitor) => {
      const nameMatch = matches(competitor.name);
      const strengthsMatch = competitor.strengths?.some(s => matches(s));
      const weaknessesMatch = competitor.weaknesses?.some(w => matches(w));
      const priceMatch = matches(competitor.price);
      
      if (nameMatch || strengthsMatch || weaknessesMatch || priceMatch) {
        results.push({
            id: `market-competitor-${competitor.id}`,
            title: competitor.name,
            section: 'Market Analysis - Competitors',
            sectionId: 'market',
          content: `Price: ${competitor.price}, Strengths: ${competitor.strengths.join(', ')}, Weaknesses: ${competitor.weaknesses.join(', ')}`,
          type: 'competitor'
        });
      }
    });
  }
  
  // Search in trends
  if (marketAnalysis.trends) {
    marketAnalysis.trends.forEach((trend: MarketTrend) => {
      const nameMatch = matches(trend.name);
      const descriptionMatch = matches(trend.description);
      const tagsMatch = trend.tags?.some(tag => matches(tag));
      
      if (nameMatch || descriptionMatch || tagsMatch) {
        results.push({
          id: `market-trend-${trend.id}`,
          title: trend.name,
          section: 'Market Analysis - Trends',
          sectionId: 'market',
          content: trend.description,
          type: trend.type,
          tags: trend.tags
        });
      }
    });
  }
  
  // Search in customer interviews
  if (marketAnalysis.customerInsights?.interviews) {
    marketAnalysis.customerInsights.interviews.forEach((interview) => {
      const nameMatch = matches(interview.name);
      const companyMatch = matches(interview.company);
      const notesMatch = matches(interview.notes);
      
      if (nameMatch || companyMatch || notesMatch) {
        results.push({
          id: `market-interview-${interview.id}`,
          title: interview.name,
          section: 'Market Analysis - Interviews',
          sectionId: 'market',
          content: interview.notes,
          date: interview.date,
          status: interview.sentiment
        });
      }
    });
  }
  
  return results;
}

/**
 * Search within the User Flow
 */
function searchUserFlow(
  userFlow: ProjectDetails['userFlow'],
  searchTerm: string,
  matches: (text?: string) => boolean
): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!userFlow) return results;
  
  // Search in features
  if (userFlow.features) {
    userFlow.features.forEach((feature: Feature) => {
      const nameMatch = matches(feature.name);
      const descriptionMatch = matches(feature.description);
      const tagsMatch = feature.tags?.some(tag => matches(tag));
      
      if (nameMatch || descriptionMatch || tagsMatch) {
        results.push({
          id: `userflow-feature-${feature.id}`,
          title: feature.name,
          section: 'User Flow - Features',
          sectionId: 'product-design',
          content: feature.description,
          priority: feature.priority,
          status: feature.status,
          tags: feature.tags
        });
      }
    });
  }
  
  // Search in wireframes
  if (userFlow.wireframes) {
    userFlow.wireframes.forEach((wireframe) => {
      if (matches(wireframe.name)) {
        results.push({
          id: `userflow-wireframe-${wireframe.id}`,
          title: wireframe.name,
          section: 'User Flow - Wireframes',
          sectionId: 'product-design',
          content: `Created: ${wireframe.createdAt}`,
          date: wireframe.createdAt
        });
      }
    });
  }
  
  // Search in journey stages
  if (userFlow.journey?.stages) {
    userFlow.journey.stages.forEach((stage) => {
      const nameMatch = matches(stage.name);
      const descriptionMatch = matches(stage.description);
      const actionsMatch = stage.actions?.some(action => matches(action));
      const painPointsMatch = stage.painPoints?.some(pp => 
        matches(pp.issue) || matches(pp.solution)
      );
      
      if (nameMatch || descriptionMatch || actionsMatch || painPointsMatch) {
        results.push({
          id: `userflow-journey-${stage.id}`,
          title: stage.name,
          section: 'User Flow - Customer Journey',
          sectionId: 'product-design',
          content: stage.description,
          status: stage.completed ? 'completed' : 'in-progress'
        });
      }
    });
  }
  
  return results;
}

/**
 * Search within the Validation feature data
 */
function searchValidation(
  validation: ValidationData,
  searchTerm: string,
  matches: (text?: string) => boolean
): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!validation) return results;
  
  // Search in experiments
  if (validation.experiments) {
    validation.experiments.forEach((exp: Experiment) => {
      const titleMatch = matches(exp.title);
      const descriptionMatch = matches(exp.description);
      const hypothesisMatch = matches(exp.hypothesis);
      const resultsMatch = matches(exp.results);
      const learningsMatch = matches(exp.learnings);
      const metricsMatch = exp.metrics?.some(m => matches(m.key) || matches(m.target) || matches(m.actual));
      
      if (titleMatch || descriptionMatch || hypothesisMatch || resultsMatch || learningsMatch || metricsMatch) {
        results.push({
          id: `validation-experiment-${exp.id}`,
          title: exp.title,
          section: 'Validation - Experiments',
          sectionId: 'validation',
          content: exp.description,
          status: exp.status,
          date: exp.startDate,
          type: 'experiment'
        });
      }
    });
  }
  
  // Search in A/B tests
  if (validation.abTests) {
    validation.abTests.forEach((test: ABTest) => {
      const titleMatch = matches(test.title);
      const descriptionMatch = matches(test.description);
      const variantAMatch = matches(test.variantA);
      const variantBMatch = matches(test.variantB);
      const metricMatch = matches(test.metric);
      const notesMatch = matches(test.notes);
      
      if (titleMatch || descriptionMatch || variantAMatch || variantBMatch || metricMatch || notesMatch) {
        results.push({
          id: `validation-abtest-${test.id}`,
          title: test.title,
          section: 'Validation - A/B Tests',
          sectionId: 'validation',
          content: test.description,
          status: test.status,
          date: test.startDate,
          type: 'ab-test'
        });
      }
    });
  }
  
  // Search in user feedback
  if (validation.userFeedback) {
    validation.userFeedback.forEach((feedback: UserFeedback) => {
      const sourceMatch = matches(feedback.source);
      const contentMatch = matches(feedback.content);
      const responseMatch = matches(feedback.response);
      const tagsMatch = feedback.tags?.some(tag => matches(tag));
      const typeMatch = matches(feedback.type);
      
      if (sourceMatch || contentMatch || responseMatch || tagsMatch || typeMatch) {
        results.push({
          id: `validation-feedback-${feedback.id}`,
          title: feedback.source,
          section: 'Validation - User Feedback',
          sectionId: 'validation',
          content: feedback.content,
          date: feedback.date,
          status: feedback.status,
          tags: feedback.tags,
          type: feedback.type
        });
      }
    });
  }
  
  // Search in hypotheses
  if (validation.hypotheses) {
    validation.hypotheses.forEach((hypothesis: Hypothesis) => {
      const statementMatch = matches(hypothesis.statement);
      const assumptionsMatch = hypothesis.assumptions?.some(a => matches(a));
      const validationMethodMatch = matches(hypothesis.validationMethod);
      const evidenceMatch = hypothesis.evidence?.some(e => matches(e));
      
      if (statementMatch || assumptionsMatch || validationMethodMatch || evidenceMatch) {
        results.push({
          id: `validation-hypothesis-${hypothesis.id}`,
          title: hypothesis.statement,
          section: 'Validation - Hypotheses',
          sectionId: 'validation',
          content: hypothesis.assumptions?.join(', ') || '',
          status: hypothesis.status,
          date: hypothesis.updatedAt,
          type: 'hypothesis'
        });
      }
    });
  }
  
  return results;
}

/**
 * Search within the Financial Projections data
 */
function searchFinancials(
  financials: any,
  searchTerm: string,
  matches: (text?: string) => boolean
): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!financials) return results;
  
  // Search in revenue forecasts
  if (financials.revenue?.forecasts) {
    financials.revenue.forecasts.forEach((forecast: any) => {
      if (matches(forecast.name) || matches(forecast.description)) {
        results.push({
          id: `financials-forecast-${forecast.id}`,
          title: forecast.name || 'Revenue Forecast',
          section: 'Financial Projections - Revenue',
          sectionId: 'financials',
          content: forecast.description || `Amount: ${forecast.amount}`,
          type: 'revenue-forecast'
        });
      }
    });
  }
  
  // Search in revenue assumptions
  if (financials.revenue?.assumptions) {
    financials.revenue.assumptions.forEach((assumption: any) => {
      if (matches(assumption.name) || matches(assumption.description)) {
        results.push({
          id: `financials-assumption-${assumption.id}`,
          title: assumption.name || 'Revenue Assumption',
          section: 'Financial Projections - Assumptions',
          sectionId: 'financials',
          content: assumption.description || '',
          type: 'assumption'
        });
      }
    });
  }
  
  // Search in costs
  if (financials.costs) {
    // Fixed costs
    if (financials.costs.fixedCosts) {
      financials.costs.fixedCosts.forEach((cost: any) => {
        if (matches(cost.name) || matches(cost.description) || matches(cost.category)) {
          results.push({
            id: `financials-fixed-cost-${cost.id}`,
            title: cost.name || 'Fixed Cost',
            section: 'Financial Projections - Fixed Costs',
            sectionId: 'financials',
            content: cost.description || `Amount: ${cost.amount}`,
            type: 'fixed-cost'
          });
        }
      });
    }
    
    // Variable costs
    if (financials.costs.variableCosts) {
      financials.costs.variableCosts.forEach((cost: any) => {
        if (matches(cost.name) || matches(cost.description) || matches(cost.category)) {
          results.push({
            id: `financials-variable-cost-${cost.id}`,
            title: cost.name || 'Variable Cost',
            section: 'Financial Projections - Variable Costs',
            sectionId: 'financials',
            content: cost.description || `Amount: ${cost.amount}`,
            type: 'variable-cost'
          });
        }
      });
    }
  }
  
  // Search in pricing strategies
  if (financials.pricing?.strategies) {
    financials.pricing.strategies.forEach((strategy: any) => {
      if (matches(strategy.name) || matches(strategy.description)) {
        results.push({
          id: `financials-pricing-${strategy.id}`,
          title: strategy.name || 'Pricing Strategy',
          section: 'Financial Projections - Pricing',
          sectionId: 'financials',
          content: strategy.description || '',
          type: 'pricing-strategy'
        });
      }
    });
  }
  
  return results;
}

/**
 * Search within the Team Management data
 */
function searchTeam(
  team: any,
  searchTerm: string,
  matches: (text?: string) => boolean
): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!team) return results;
  
  // Search in team members
  if (team.members) {
    team.members.forEach((member: any) => {
      if (matches(member.name) || matches(member.role) || matches(member.bio) || matches(member.email)) {
        results.push({
          id: `team-member-${member.id}`,
          title: member.name || 'Team Member',
          section: 'Team Management - Members',
          sectionId: 'team',
          content: member.bio || member.role || '',
          type: 'member'
        });
      }
    });
  }
  
  // Search in roles
  if (team.roles) {
    team.roles.forEach((role: any) => {
      if (matches(role.title) || matches(role.description) || matches(role.responsibilities)) {
        results.push({
          id: `team-role-${role.id}`,
          title: role.title || 'Role',
          section: 'Team Management - Roles',
          sectionId: 'team',
          content: role.description || role.responsibilities || '',
          type: 'role'
        });
      }
    });
  }
  
  // Search in tasks
  if (team.tasks) {
    team.tasks.forEach((task: any) => {
      if (matches(task.title) || matches(task.description)) {
        results.push({
          id: `team-task-${task.id}`,
          title: task.title || 'Task',
          section: 'Team Management - Tasks',
          sectionId: 'team',
          content: task.description || '',
          status: task.status,
          priority: task.priority,
          type: 'task'
        });
      }
    });
  }
  
  return results;
}

/**
 * Search within Documents
 */
function searchDocuments(
  documents: ProjectDetails['documents'],
  searchTerm: string,
  matches: (text?: string) => boolean
): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!documents) return results;
  
  documents.forEach((doc) => {
    if (matches(doc.name) || matches(doc.type)) {
      results.push({
        id: `document-${doc.id}`,
        title: doc.name,
        section: 'Documents',
        sectionId: 'documents',
        content: `Type: ${doc.type}`,
        date: doc.createdAt,
        type: doc.type
      });
    }
  });
  
  return results;
}