'use client';

import React from 'react';
import ToolComponent from '../ToolComponent';
import { MarketAnalysis } from '@/features/market/components/MarketAnalysis';
import { MarketSection } from '@/features/market/components/MarketSectionNavigation';
import { MarketInsights } from '@/features/market/components/MarketInsights';
import { useMarketAnalysis } from '@/hooks/features/useMarketAnalysis';
import { LoadingState, ErrorState } from '@/features/common/components/LoadingAndErrorState';
import { MarketAnalysisUIData } from '@/features/market/types';
import { PanelType, PanelConfig } from '@/features/common/components/CyclingSidebar';
import { FileText, Bot, CheckSquare, BarChart, StickyNote } from 'lucide-react';

// Import panel components from common directory
import { DocumentsPanel } from '@/features/common/components/DocumentsPanel';
import { AIAssistantPanel } from '@/features/common/components/AIAssistantPanel';
import { ValidationPanel } from '@/features/common/components/ValidationPanel';
import { MetricsPanel } from '@/features/common/components/MetricsPanel';
import { NotesPanel } from '@/features/common/components/NotesPanel';

// Define section navigation options
const MARKET_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'market', label: 'Definition' },
  { id: 'trends', label: 'Trends' },
  { id: 'customers', label: 'Customers' },
  { id: 'competitors', label: 'Competitors' },
  { id: 'partners', label: 'Partners' },
];

interface MarketToolProps {
  stageId: string;
  toolId: string;
  onBackToOverview: () => void;
  onBackToStage: () => void;
  projectId: string;
}

const MarketTool: React.FC<MarketToolProps> = ({
  stageId,
  toolId,
  onBackToOverview,
  onBackToStage,
  projectId
}) => {
  // Hold the current section just for navigation
  const [currentSection, setCurrentSection] = React.useState<MarketSection>('overview');
  
  // Get market data for the sidebar
  const { 
    data: marketRawData,
    isLoading,
    error
  } = useMarketAnalysis(projectId);
  
  // Format data for the sidebar component
  const marketData = React.useMemo((): MarketAnalysisUIData => {
    if (!marketRawData) {
      // Return a default empty data structure
      return {
        personas: [],
        interviews: [],
        competitors: [],
        trends: [],
        partners: [],
        overview: undefined
      };
    }
    
    return {
      personas: marketRawData.personas || [],
      interviews: marketRawData.interviews || [],
      competitors: marketRawData.competitors || [],
      trends: marketRawData.trends || [],
      partners: marketRawData.partners || [],
      overview: marketRawData.overview ? {
        marketDefinition: marketRawData.overview.marketDefinition || {
          industry: '',
          geography: '',
          maturity: 'emerging'
        },
        marketSize: marketRawData.overview.marketSize || {
          tam: 0,
          sam: 0,
          som: 0,
          tamMethod: 'top-down',
          samPercentage: 0,
          somPercentage: 0
        },
        segments: marketRawData.overview.segments || []
      } : undefined
    };
  }, [marketRawData]);

  // Generate title based on current section
  const getTitle = () => {
    // Always return the main tool name for consistency in breadcrumb
    return 'Market Analysis';
  };

  // Get formatted section name for breadcrumb
  const getSectionName = (): string | undefined => {
    if (currentSection === 'overview') return undefined;
    
    switch (currentSection) {
      case 'market':
        return 'Market Definition';
      case 'trends':
        return 'Market Trends';
      case 'customers':
        return 'Customers';
      case 'competitors':
        return 'Competitors';
      case 'partners':
        return 'Partners';
      default:
        return currentSection;
    }
  };

  // Handle section change
  const handleSectionChange = (section: MarketSection) => {
    console.log(`MarketTool: Section changed to ${section}`); // Debug log
    setCurrentSection(section);
  };
  
  // Handle section selection from header tabs
  const handleSectionSelect = (sectionId: string) => {
    console.log(`MarketTool: Section selected from header: ${sectionId}`); // Debug log
    // Convert string to MarketSection type
    setCurrentSection(sectionId as MarketSection);
  };
  
  // Handle going back to overview
  const handleSectionBack = () => {
    setCurrentSection('overview');
  };

  // Define sidebar panel configurations
  const panelConfigs: PanelConfig[] = [
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="h-4 w-4" />,
      color: 'text-blue-500'
    },
    {
      id: 'ai',
      label: 'AI Assistant',
      icon: <Bot className="h-4 w-4" />,
      color: 'text-purple-500'
    },
    {
      id: 'validation',
      label: 'Validation',
      icon: <CheckSquare className="h-4 w-4" />,
      color: 'text-green-500'
    },
    {
      id: 'metrics',
      label: 'Metrics',
      icon: <BarChart className="h-4 w-4" />,
      color: 'text-amber-500'
    },
    {
      id: 'notes',
      label: 'Notes',
      icon: <StickyNote className="h-4 w-4" />,
      color: 'text-red-500'
    }
  ];

  // Get section info for the active section
  const sectionInfo = React.useMemo(() => {
    const iconMap: Record<MarketSection, React.ReactNode> = {
      'overview': <FileText className="h-4 w-4" />,
      'market': <FileText className="h-4 w-4" />,
      'trends': <BarChart className="h-4 w-4" />,
      'customers': <FileText className="h-4 w-4" />,
      'competitors': <FileText className="h-4 w-4" />,
      'partners': <FileText className="h-4 w-4" />
    };

    const sectionName = getSectionName() || 'Market Analysis';
    
    return {
      id: currentSection,
      name: sectionName,
      icon: iconMap[currentSection] || <FileText className="h-4 w-4" />,
      color: 'text-blue-500'
    };
  }, [currentSection]);

  // Render panel content based on active panel
  const renderPanelContent = (panelId: PanelType) => {
    switch (panelId) {
      case 'documents':
        return (
          <DocumentsPanel
            currentSection={currentSection}
            projectId={projectId}
            sectionInfo={sectionInfo}
            documents={[]} // Use actual documents data here
          />
        );
      case 'ai':
        return (
          <AIAssistantPanel
            currentSection={currentSection}
            projectId={projectId}
          />
        );
      case 'validation':
        return (
          <ValidationPanel
            currentSection={currentSection}
            projectId={projectId}
            sectionInfo={sectionInfo}
            hypotheses={[]} // Use actual hypotheses data here
          />
        );
      case 'metrics':
        return (
          <MetricsPanel
            currentSection={currentSection}
            projectId={projectId}
            sectionInfo={sectionInfo}
            metrics={[]} // Use actual metrics data here
          />
        );
      case 'notes':
        return (
          <NotesPanel
            currentSection={currentSection}
            projectId={projectId}
            sectionInfo={sectionInfo}
          />
        );
      default:
        return null;
    }
  };

  // If we're loading or have an error, show appropriate state
  if (isLoading) return <LoadingState message="Loading market analysis data..." />;
  if (error) return <ErrorState error={error.message} />;

  return (
    <ToolComponent
      stageId={stageId}
      toolId={toolId}
      onBackToOverview={onBackToOverview}
      onBackToStage={onBackToStage}
      title={getTitle()}
      currentSection={getSectionName()}
      onSectionBack={handleSectionBack}
      sections={MARKET_SECTIONS}
      activeSection={currentSection}
      onSectionSelect={handleSectionSelect}
      sidebarConfig={{
        projectId: projectId,
        sectionId: currentSection,
        renderPanelContent: renderPanelContent,
        customPanels: panelConfigs
      }}
    >
      <MarketAnalysis
        projectId={projectId}
        currentSection={currentSection}
        onSectionClick={handleSectionChange}
      />
    </ToolComponent>
  );
};

export default MarketTool; 