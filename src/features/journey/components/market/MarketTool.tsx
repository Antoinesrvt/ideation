'use client';

import React, { useState, useEffect } from 'react';
import ToolComponent from '../ToolComponent';
import { MarketAnalysis } from '@/features/market/components/MarketAnalysis';
import { MarketSection } from '@/features/market/components/MarketSectionNavigation';
import { MarketInsights } from '@/features/market/components/MarketInsights';
import { useMarketAnalysis } from '@/hooks/features/useMarketAnalysis';
import { LoadingState, ErrorState } from '@/features/common/components/LoadingAndErrorState';
import { MarketAnalysisUIData } from '@/features/market/types';
import { PanelType, PanelConfig } from '@/features/common/components/CyclingSidebar';
import { BarChart2, FileText, Bot, CheckSquare, BarChart, StickyNote } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

// Import panel components from common directory
import { DocumentsPanel } from '@/features/common/components/DocumentsPanel';
import { AIAssistantPanel } from '@/features/common/components/AIAssistantPanel';
import { ValidationPanel } from '@/features/common/components/ValidationPanel';
import { MetricsPanel } from '@/features/common/components/MetricsPanel';
import { NotesPanel } from '@/features/common/components/NotesPanel';
import { InterviewPanel } from '@/features/market/components/interview/InterviewPanel';
import { InterviewTemplateModal } from '@/features/market/components/interview/InterviewTemplateModal';
import { InterviewViewModal } from '@/features/market/components/interview/InterviewViewModal';

// Define section navigation options
const MARKET_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'business', label: 'Your Business' },
  { id: 'trends', label: 'Trends' },
  { id: 'customers', label: 'Customers' },
  { id: 'competitors', label: 'Competitors' },
  { id: 'partners', label: 'Partners' },
];

interface MarketToolProps {
  stageId?: string; // Making this optional for compatibility
  toolId: string;
  title: string;
  icon?: React.ReactNode;
  color?: string;
  onBackToDashboard: () => void;
  onBackToOverview?: () => void; // Optional for backward compatibility
  onBackToStage?: () => void; // Optional for backward compatibility
  projectId: string;
  onContentChange?: (hasChanges: boolean) => void;
}

const MarketTool: React.FC<MarketToolProps> = ({
  stageId = 'validate-idea', // Default to first stage for backward compatibility
  toolId,
  title,
  icon = <BarChart2 className="h-5 w-5" />,
  color = '#0EA5E9',
  onBackToDashboard,
  onBackToOverview = onBackToDashboard, // Default to dashboard if not provided
  onBackToStage = onBackToDashboard, // Default to dashboard if not provided
  projectId,
  onContentChange
}) => {
  // Hold the current section just for navigation
  const [currentSection, setCurrentSection] = useState<MarketSection>('overview');
  // Track whether there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Modal states
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | undefined>(undefined);
  
  // View interview modal state
  const [isViewInterviewModalOpen, setIsViewInterviewModalOpen] = useState(false);
  const [viewingInterviewId, setViewingInterviewId] = useState<string | undefined>(undefined);
  
  // Get market data for the sidebar and queryClient for mutation
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { 
    data: marketRawData,
    isLoading,
    error
  } = useMarketAnalysis(projectId);
  

  // Update parent component when changes occur
  useEffect(() => {
    if (onContentChange) {
      onContentChange(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onContentChange]);

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

  // Handle data changes
  const handleDataChange = (hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  };

  // Handle data save completion
  const handleSaveComplete = () => {
    setHasUnsavedChanges(false);
    queryClient.invalidateQueries({
      queryKey: ['marketAnalysis', projectId]
    }); // Refresh the data
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
      'business': <FileText className="h-4 w-4" />,
      'trends': <BarChart className="h-4 w-4" />,
      'customers': <FileText className="h-4 w-4" />,
      'competitors': <FileText className="h-4 w-4" />,
      'partners': <FileText className="h-4 w-4" />
    };

    const sectionName = currentSection === 'overview' 
      ? 'Market Analysis' 
      : MARKET_SECTIONS.find(s => s.id === currentSection)?.label || 'Market Analysis';
    
    return {
      id: currentSection,
      name: sectionName,
      icon: iconMap[currentSection] || <FileText className="h-4 w-4" />,
      color: 'text-blue-500'
    };
  }, [currentSection]);

  // Handlers for interview operations
  const handleCreateTemplate = React.useCallback(() => {
    console.log('Create new interview template');
    setEditingTemplateId(undefined);
    setIsTemplateModalOpen(true);
  }, []);

  const handleViewTemplate = React.useCallback((templateId: string) => {
    console.log('View template', templateId);
    // In a real implementation, this would open a template viewer
    toast({
      title: "View Template",
      description: `Viewing template with ID: ${templateId}`,
    });
  }, [toast]);

  const handleEditTemplate = React.useCallback((templateId: string) => {
    console.log('Edit template', templateId);
    setEditingTemplateId(templateId);
    setIsTemplateModalOpen(true);
  }, []);

  const handleStartInterview = React.useCallback((templateId: string) => {
    // Use window.location to navigate to the new interview conductor page
    window.location.href = `/project/interview/${projectId}/${templateId}`;
  }, [projectId]);

  const handleViewInterview = React.useCallback((interviewId: string) => {
    console.log('View interview', interviewId);
    setViewingInterviewId(interviewId);
    setIsViewInterviewModalOpen(true);
  }, []);
  
  // Handle modal close events
  const handleTemplateModalClose = React.useCallback(() => {
    setIsTemplateModalOpen(false);
    setEditingTemplateId(undefined);
    // Refresh data after template operations
    queryClient.invalidateQueries({
      queryKey: ['interviewTemplates', projectId]
    });
  }, [projectId, queryClient]);
  
  const handleViewInterviewModalClose = React.useCallback(() => {
    setIsViewInterviewModalOpen(false);
    setViewingInterviewId(undefined);
  }, []);
  
  // Actions for handling interview operations from the view modal
  const handleEditInterviewFromModal = React.useCallback(() => {
    if (!viewingInterviewId) return;
    
    // Close the view modal
    setIsViewInterviewModalOpen(false);
    
    // Find the template ID for this interview using the correct query key
    const interviews = queryClient.getQueryData(['interviewData', projectId, 'interviews']) as any[] || [];
    const interview = interviews.find(
      (interview) => interview.id === viewingInterviewId
    );
    
    if (interview?.template_id) {
      // Navigate to the interview conductor page with the interview ID in the query parameter
      window.location.href = `/project/interview/${projectId}/${interview.template_id}?interviewId=${viewingInterviewId}`;
    } else {
      // If we couldn't find the template ID, show an error
      toast({
        title: "Error",
        description: "Couldn't find template for this interview or the interview is missing a template ID",
        variant: "destructive"
      });
    }
    
    // Clear the viewing ID
    setViewingInterviewId(undefined);
  }, [viewingInterviewId, projectId, queryClient, toast]);
  
  const handleConductInterviewFromModal = React.useCallback(() => {
    if (!viewingInterviewId) return;
    
    // Close the view modal
    setIsViewInterviewModalOpen(false);
    
    // Find the template ID for this interview using the correct query key
    const interviews = queryClient.getQueryData(['interviewData', projectId, 'interviews']) as any[] || [];
    const interview = interviews.find(
      (interview) => interview.id === viewingInterviewId
    );
    
    if (interview?.template_id) {
      // Navigate to the interview conductor page with the interview ID in the query parameter
      window.location.href = `/project/interview/${projectId}/${interview.template_id}?interviewId=${viewingInterviewId}`;
    } else {
      // If we couldn't find the template ID, show an error
      toast({
        title: "Error",
        description: "Couldn't find template for this interview or the interview is missing a template ID",
        variant: "destructive"
      });
    }
    
    // Clear the viewing ID
    setViewingInterviewId(undefined);
  }, [viewingInterviewId, projectId, queryClient, toast]);
  
  const handleAnalyzeInterviewFromModal = React.useCallback(() => {
    if (!viewingInterviewId) return;
    
    // Close the view modal
    setIsViewInterviewModalOpen(false);
    
    // Find the template ID for this interview using the correct query key
    const interviews = queryClient.getQueryData(['interviewData', projectId, 'interviews']) as any[] || [];
    const interview = interviews.find(
      (interview) => interview.id === viewingInterviewId
    );
    
    if (interview) {
      // In a real implementation, this would open an analysis UI
      // For now, update the interview to set it as 'analyzed' status
      
      // First, capture the ID before clearing the viewing ID
      const interviewToAnalyze = viewingInterviewId;
      
      // Clear the viewing ID
      setViewingInterviewId(undefined);
      
      toast({
        title: "Analyze Interview",
        description: "Interview analysis functionality would open here",
      });
    } else {
      toast({
        title: "Error",
        description: "Couldn't find interview data",
        variant: "destructive"
      });
      
      // Clear the viewing ID
      setViewingInterviewId(undefined);
    }
  }, [viewingInterviewId, projectId, queryClient, toast]);
  
  // Render panel content based on active panel
  const renderPanelContent = (panelId: PanelType) => {
    // If we're in the customers section and showing documents, include interviews
    if (currentSection === 'customers' && panelId === 'documents') {
      return (
        <div className="p-4">
          <InterviewPanel 
            projectId={projectId}
            onCreateTemplate={handleCreateTemplate}
            onViewTemplate={handleViewTemplate}
            onEditTemplate={handleEditTemplate}
            onStartInterview={handleStartInterview}
            onViewInterview={handleViewInterview}
          />
        </div>
      );
    }
    
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
      title={title}
      icon={icon}
      color={color}
      onBackToOverview={onBackToOverview}
      onBackToStage={onBackToStage}
      sections={MARKET_SECTIONS}
      activeSection={currentSection}
      onSectionSelect={handleSectionSelect}
      sidebarConfig={{
        projectId,
        sectionId: currentSection,
        renderPanelContent,
        customPanels: panelConfigs
      }}
    >
      <MarketAnalysis
        projectId={projectId}
        currentSection={currentSection}
        onSectionClick={handleSectionChange}
      />
      
      {/* Interview Template Modal */}
      {isTemplateModalOpen && (
        <InterviewTemplateModal
          isOpen={isTemplateModalOpen}
          onClose={handleTemplateModalClose}
          projectId={projectId}
          templateId={editingTemplateId}
        />
      )}
      
      {/* Interview View Modal */}
      {isViewInterviewModalOpen && viewingInterviewId && (
        <InterviewViewModal
          isOpen={isViewInterviewModalOpen}
          onClose={handleViewInterviewModalClose}
          interviewId={viewingInterviewId}
          projectId={projectId}
          onEdit={handleEditInterviewFromModal}
          onConduct={handleConductInterviewFromModal}
          onAnalyze={handleAnalyzeInterviewFromModal}
        />
      )}
    </ToolComponent>
  );
};

export default MarketTool; 