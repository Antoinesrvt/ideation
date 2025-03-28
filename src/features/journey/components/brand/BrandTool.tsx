'use client';

import React, { useState, useEffect } from 'react';
import ToolComponent from '../ToolComponent';
import { BrandIdentity } from '@/features/brand/components/BrandIdentity';
import { LoadingState, ErrorState } from '@/features/common/components/LoadingAndErrorState';
import { PanelType, PanelConfig } from '@/features/common/components/CyclingSidebar';
import { Palette, FileText, Bot, CheckSquare, BarChart, StickyNote } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

// Import panel components from common directory
import { DocumentsPanel } from '@/features/common/components/DocumentsPanel';
import { AIAssistantPanel } from '@/features/common/components/AIAssistantPanel';
import { ValidationPanel } from '@/features/common/components/ValidationPanel';
import { MetricsPanel } from '@/features/common/components/MetricsPanel';
import { NotesPanel } from '@/features/common/components/NotesPanel';

// Define sections based on the brand tabs
const BRAND_SECTIONS = [
  { id: 'essentials', label: 'Essentials' },
  { id: 'visual', label: 'Visual Identity' },
  { id: 'voice', label: 'Voice & Tone' },
  { id: 'assets', label: 'Assets' },
  { id: 'guidelines', label: 'Guidelines' },
];

interface BrandToolProps {
  toolId: string;
  title: string;
  icon?: React.ReactNode;
  color?: string;
  onBackToDashboard: () => void;
  projectId: string;
  onContentChange?: (hasChanges: boolean) => void;
}

const BrandTool: React.FC<BrandToolProps> = ({
  toolId,
  title,
  icon = <Palette className="h-5 w-5" />,
  color = '#EC4899',
  onBackToDashboard,
  projectId,
  onContentChange
}) => {
  // Hold the current section just for navigation
  const [currentSection, setCurrentSection] = useState<string>('essentials');
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
    console.log(`BrandTool: Section selected from header: ${sectionId}`);
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
      queryKey: ['brand', projectId]
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
      'essentials': <Palette className="h-4 w-4" />,
      'visual': <Palette className="h-4 w-4" />,
      'voice': <Palette className="h-4 w-4" />,
      'assets': <FileText className="h-4 w-4" />,
      'guidelines': <FileText className="h-4 w-4" />
    };

    const sectionName = BRAND_SECTIONS.find(s => s.id === currentSection)?.label || 'Brand Identity';
    
    return {
      id: currentSection,
      name: sectionName,
      icon: iconMap[currentSection] || <Palette className="h-4 w-4" />,
      color: 'text-pink-500'
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
      sections={BRAND_SECTIONS}
      activeSection={currentSection}
      onSectionSelect={handleSectionSelect}
      stageId="brand"
      sidebarConfig={{
        projectId,
        sectionId: currentSection,
        renderPanelContent,
        customPanels: panelConfigs
      }}
    >
      <BrandIdentity />
    </ToolComponent>
  );
};

export default BrandTool; 