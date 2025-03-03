import { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { ProjectDetails, CanvasItem, GRPItem, Feature, CustomerPersona, Competitor, MarketTrend } from '@/types';

// Define the search result interface
interface SearchResult {
  id: string;
  title: string;
  section: string;
  sectionId: string;
  content: string;
}

/**
 * Hook for searching across project data
 * @param query The search query string
 * @returns Array of search results
 */
export function useSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const currentProject = useAppStore((state) => state.currentProject);
  
  useEffect(() => {
    if (!query || !currentProject) {
      setResults([]);
      return;
    }
    
    const searchTerm = query.toLowerCase();
    const searchResults: SearchResult[] = [];
    
    // Combine search results from all sections
    if (currentProject.canvas) {
      searchResults.push(...searchCanvas(currentProject.canvas, searchTerm));
    }
    
    if (currentProject.grpModel) {
      searchResults.push(...searchGRPModel(currentProject.grpModel, searchTerm));
    }
    
    if (currentProject.marketAnalysis) {
      searchResults.push(...searchMarketAnalysis(currentProject.marketAnalysis, searchTerm));
    }
    
    if (currentProject.userFlow) {
      searchResults.push(...searchUserFlow(currentProject.userFlow, searchTerm));
    }
    
    setResults(searchResults);
  }, [query, currentProject]);
  
  return results;
}

/**
 * Search within the Business Model Canvas
 */
function searchCanvas(
  canvas: ProjectDetails['canvas'], 
  searchTerm: string
): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!canvas) return results;
  
  // Convert canvas to entries we can iterate over
  Object.entries(canvas).forEach(([key, items]) => {
    if (Array.isArray(items)) {
      items.forEach((item: CanvasItem) => {
        if (item.text && item.text.toLowerCase().includes(searchTerm)) {
          results.push({
            id: `canvas-${key}-${item.id}`,
            title: item.text,
            section: 'Business Model Canvas',
            sectionId: 'canvas',
            content: item.text
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
  searchTerm: string
): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!grpModel) return results;
  
  // Search in generation
  if (grpModel.generation) {
    searchGRPSection(grpModel.generation, 'generation', searchTerm, results);
  }
  
  // Search in remuneration
  if (grpModel.remuneration) {
    searchGRPSection(grpModel.remuneration, 'remuneration', searchTerm, results);
  }
  
  // Search in partage
  if (grpModel.partage) {
    searchGRPSection(grpModel.partage, 'partage', searchTerm, results);
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
  results: SearchResult[]
) {
  Object.entries(section).forEach(([subsectionKey, items]) => {
    items.forEach((item) => {
      const titleMatch = item.title && item.title.toLowerCase().includes(searchTerm);
      const descriptionMatch = item.description && item.description.toLowerCase().includes(searchTerm);
      
      if (titleMatch || descriptionMatch) {
        results.push({
          id: `grp-${sectionName}-${subsectionKey}-${item.id}`,
          title: item.title || 'Untitled',
          section: `GRP Model - ${sectionName}`,
          sectionId: 'grp',
          content: item.description || ''
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
  searchTerm: string
): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!marketAnalysis) return results;
  
  // Search in personas
  if (marketAnalysis.customerInsights?.personas) {
    marketAnalysis.customerInsights.personas.forEach((persona: CustomerPersona) => {
      const nameMatch = persona.name && persona.name.toLowerCase().includes(searchTerm);
      const roleMatch = persona.role && persona.role.toLowerCase().includes(searchTerm);
      const demographicsMatch = persona.demographics && persona.demographics.toLowerCase().includes(searchTerm);
      
      if (nameMatch || roleMatch || demographicsMatch) {
        results.push({
          id: `market-persona-${persona.id}`,
          title: persona.name || 'Unnamed Persona',
          section: 'Market Analysis - Personas',
          sectionId: 'market',
          content: persona.role || ''
        });
      }
    });
  }
  
  // Search in competitors
  if (marketAnalysis.competitors) {
    marketAnalysis.competitors.forEach((competitor: Competitor) => {
      if (competitor.name && competitor.name.toLowerCase().includes(searchTerm)) {
        results.push({
          id: `market-competitor-${competitor.id}`,
          title: competitor.name,
          section: 'Market Analysis - Competitors',
          sectionId: 'market',
          content: `Strengths: ${competitor.strengths.join(', ')}, Weaknesses: ${competitor.weaknesses.join(', ')}`
        });
      }
    });
  }
  
  // Search in trends
  if (marketAnalysis.trends) {
    marketAnalysis.trends.forEach((trend: MarketTrend) => {
      if ((trend.name && trend.name.toLowerCase().includes(searchTerm)) || 
          (trend.description && trend.description.toLowerCase().includes(searchTerm))) {
        results.push({
          id: `market-trend-${trend.id}`,
          title: trend.name,
          section: 'Market Analysis - Trends',
          sectionId: 'market',
          content: trend.description
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
  searchTerm: string
): SearchResult[] {
  const results: SearchResult[] = [];
  
  if (!userFlow) return results;
  
  // Search in features
  if (userFlow.features) {
    userFlow.features.forEach((feature: Feature) => {
      const nameMatch = feature.name && feature.name.toLowerCase().includes(searchTerm);
      const descriptionMatch = feature.description && feature.description.toLowerCase().includes(searchTerm);
      
      if (nameMatch || descriptionMatch) {
        results.push({
          id: `userflow-feature-${feature.id}`,
          title: feature.name,
          section: 'User Flow - Features',
          sectionId: 'userflow',
          content: feature.description
        });
      }
    });
  }
  
  // Search in wireframes
  if (userFlow.wireframes) {
    userFlow.wireframes.forEach((wireframe) => {
      if (wireframe.name && wireframe.name.toLowerCase().includes(searchTerm)) {
        results.push({
          id: `userflow-wireframe-${wireframe.id}`,
          title: wireframe.name,
          section: 'User Flow - Wireframes',
          sectionId: 'userflow',
          content: `Created: ${wireframe.createdAt}`
        });
      }
    });
  }
  
  // Search in journey stages
  if (userFlow.journey?.stages) {
    userFlow.journey.stages.forEach((stage) => {
      if ((stage.name && stage.name.toLowerCase().includes(searchTerm)) || 
          (stage.description && stage.description.toLowerCase().includes(searchTerm))) {
        results.push({
          id: `userflow-journey-${stage.id}`,
          title: stage.name,
          section: 'User Flow - Journey',
          sectionId: 'userflow',
          content: stage.description
        });
      }
    });
  }
  
  return results;
}