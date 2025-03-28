'use client';

import React, { useState, useEffect } from 'react';
import ToolComponent from '../ToolComponent';
import { ProductDesign } from '@/features/product_design/components/ProductDesign';
import { LoadingState, ErrorState } from '@/features/common/components/LoadingAndErrorState';
import { PanelType, PanelConfig } from '@/features/common/components/CyclingSidebar';
import { Package, FileText, Bot, CheckSquare, BarChart, StickyNote, Lightbulb, Layout, MapPin, Map } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

// Import panel components from common directory
import { DocumentsPanel } from '@/features/common/components/DocumentsPanel';
import { AIAssistantPanel } from '@/features/common/components/AIAssistantPanel';
import { ValidationPanel } from '@/features/common/components/ValidationPanel';
import { MetricsPanel } from '@/features/common/components/MetricsPanel';
import { NotesPanel } from '@/features/common/components/NotesPanel';

// Define sections based on the product tabs
const PRODUCT_SECTIONS = [
  { id: 'problems', label: 'Problem-Solution Fit' },
  { id: 'wireframes', label: 'Wireframes' },
  { id: 'features', label: 'Feature Map' },
  { id: 'journey', label: 'User Journey' },
  { id: 'mvp', label: 'MVP Scope' }
];

interface ProductToolProps {
  toolId: string;
  title: string;
  icon?: React.ReactNode;
  color?: string;
  onBackToDashboard: () => void;
  projectId: string;
  onContentChange?: (hasChanges: boolean) => void;
}

const ProductTool: React.FC<ProductToolProps> = ({
  toolId,
  title,
  icon = <Package className="h-5 w-5" />,
  color = '#22C55E',
  onBackToDashboard,
  projectId,
  onContentChange
}) => {
  // Hold the current section just for navigation
  const [currentSection, setCurrentSection] = useState<string>('wireframes');
  // Track whether there are unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Get queryClient for mutations
  const queryClient = useQueryClient();

  // Update parent component when changes occur
  useEffect(() => {
    if (onContentChange) {
      onContentChange(hasUnsavedChanges);
    }
  }, [hasUnsavedChanges, onContentChange]);

  // Handle section selection from header tabs
  const handleSectionSelect = (sectionId: string) => {
    console.log(`ProductTool: Section selected from header: ${sectionId}`);
    setCurrentSection(sectionId);
  };

  // Handle data changes
  const handleDataChange = (hasChanges: boolean) => {
    setHasUnsavedChanges(hasChanges);
  };

  // Handle data save completion
  const handleSaveComplete = () => {
    setHasUnsavedChanges(false);
    queryClient.invalidateQueries({
      queryKey: ['productDesign', projectId]
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
    const iconMap: Record<string, React.ReactNode> = {
      'problems': <Lightbulb className="h-4 w-4" />,
      'wireframes': <Layout className="h-4 w-4" />,
      'features': <MapPin className="h-4 w-4" />,
      'journey': <Map className="h-4 w-4" />,
      'mvp': <Package className="h-4 w-4" />
    };

    const sectionName = PRODUCT_SECTIONS.find(s => s.id === currentSection)?.label || 'Product Design';
    
    return {
      id: currentSection,
      name: sectionName,
      icon: iconMap[currentSection] || <Package className="h-4 w-4" />,
      color: 'text-green-500'
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

  return (
    <ToolComponent
      toolId={toolId}
      title={title}
      icon={icon}
      color={color}
      onBackToOverview={onBackToDashboard}
      onBackToStage={onBackToDashboard}
      sections={PRODUCT_SECTIONS}
      activeSection={currentSection}
      onSectionSelect={handleSectionSelect}
      stageId="product"
      sidebarConfig={{
        projectId,
        sectionId: currentSection,
        renderPanelContent,
        customPanels: panelConfigs
      }}
    >
      <ProductDesign />
    </ToolComponent>
  );
};

export default ProductTool;