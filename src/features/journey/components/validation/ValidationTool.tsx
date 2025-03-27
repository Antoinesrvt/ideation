'use client';

import React, { useState } from 'react';
import ToolComponent from '../ToolComponent';
import { Validation } from '@/features/validation';
import { PanelType, PanelConfig } from '@/features/common/components/CyclingSidebar';
import { FileText, Bot, CheckSquare, BarChart, StickyNote } from 'lucide-react';

// Import panel components from common directory
import { DocumentsPanel } from '@/features/common/components/DocumentsPanel';
import { AIAssistantPanel } from '@/features/common/components/AIAssistantPanel';
import { ValidationPanel } from '@/features/common/components/ValidationPanel';
import { MetricsPanel } from '@/features/common/components/MetricsPanel';
import { NotesPanel } from '@/features/common/components/NotesPanel';

interface ValidationToolProps {
  stageId: string;
  toolId: string;
  onBackToOverview: () => void;
  onBackToStage: () => void;
  projectId: string;
}

const ValidationTool: React.FC<ValidationToolProps> = ({
  stageId,
  toolId,
  onBackToOverview,
  onBackToStage,
  projectId
}) => {
  // State for current section
  const [currentSection, setCurrentSection] = useState('overview');

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

  // Define section info
  const sectionInfo = {
    id: currentSection,
    name: 'Validation',
    icon: <CheckSquare className="h-4 w-4" />,
    color: 'text-green-500'
  };

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
      stageId={stageId}
      toolId={toolId}
      onBackToOverview={onBackToOverview}
      onBackToStage={onBackToStage}
      sidebarConfig={{
        projectId: projectId,
        sectionId: currentSection,
        renderPanelContent: renderPanelContent,
        customPanels: panelConfigs
      }}
    >
      <div className="p-2">
        <Validation />
      </div>
    </ToolComponent>
  );
};

export default ValidationTool; 