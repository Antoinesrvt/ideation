'use client';

import React from 'react';
import { JOURNEY_STAGES } from '../constants';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HomeIcon, ChevronRight } from 'lucide-react';
import { CyclingSidebar, PanelType, PanelConfig } from '@/features/common/components/CyclingSidebar';

interface ToolComponentProps {
  stageId: string;
  toolId: string;
  onBackToOverview: () => void;
  onBackToStage: () => void;
  title?: string; // Optional custom title
  currentSection?: string; // Optional current section for breadcrumb
  onSectionBack?: () => void; // Optional callback for section navigation
  children?: React.ReactNode;  // Content to be rendered inside the tool
  sections?: { id: string, label: string }[];
  activeSection?: string;
  onSectionSelect?: (sectionId: string) => void;
  sidebarContent?: React.ReactNode; // Deprecated - will be removed in favor of sidebarConfig
  sidebarConfig?: {
    projectId: string;
    sectionId: string;
    renderPanelContent: (panelId: PanelType) => React.ReactNode;
    customPanels?: PanelConfig[];
    defaultPanel?: PanelType;
  }; // New prop for configuring the cycling sidebar
}

const ToolComponent: React.FC<ToolComponentProps> = ({
  stageId,
  toolId,
  onBackToOverview,
  onBackToStage,
  title,
  currentSection,
  onSectionBack,
  children,
  sections,
  activeSection,
  onSectionSelect,
  sidebarContent,
  sidebarConfig
}) => {
  const toolStage = JOURNEY_STAGES.find(s => s.id === stageId);
  
  if (!toolStage) {
    return (
      <div className="p-6">
        <Card>
          <CardContent>
            <div className="p-8 text-center">
              <p className="text-red-500">Stage not found</p>
              <Button onClick={onBackToOverview} className="mt-4">
                Back to Overview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const defaultToolName = toolId.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  const toolName = title || defaultToolName;

  return (
    <div>
      <Card>
        <CardHeader className="flex-row items-center justify-between p-4 border-b space-y-0">
          {/* Left side with breadcrumb */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToOverview}
              className="flex-shrink-0"
              title="Back to journey"
            >
              <HomeIcon className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-4" />

            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: toolStage.color }}
              ></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToStage}
                className="h-8 px-2 flex items-center"
              >
                <span
                  className="truncate max-w-[120px]"
                  style={{ color: toolStage.color }}
                >
                  {toolStage.title}
                </span>
              </Button>
            </div>

            <Separator orientation="vertical" className="h-4" />

            {currentSection && currentSection !== "overview" ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSectionBack}
                  className="h-8 px-2 flex items-center"
                >
                  <span className="truncate max-w-[120px]">{toolName}</span>
                </Button>

                <ChevronRight className="h-4 w-4 text-muted-foreground" />

                <CardTitle className="text-base whitespace-nowrap">
                  {currentSection}
                </CardTitle>
              </>
            ) : (
              <CardTitle className="text-base whitespace-nowrap">
                {toolName}
              </CardTitle>
            )}
          </div>

          {/* Right side with section tabs if provided */}
          {sections && sections.length > 0 && (
            <div className="flex items-center space-x-1">
              {sections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onSectionSelect && onSectionSelect(section.id)}
                  className="h-8"
                >
                  {section.label}
                </Button>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6">
          {/* Use new CyclingSidebar if config is provided, otherwise use legacy layout */}
          {children || sidebarContent || sidebarConfig ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main content area */}
              <div className={sidebarConfig ? "md:col-span-2 space-y-6" : (sidebarContent ? "md:col-span-2 space-y-6" : "col-span-full space-y-6")}>
                {children ? children : (
                  <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <h2 className="text-xl font-medium mb-2">Tool: {toolId}</h2>
                      <p className="text-gray-500">
                        This tool helps you complete the stage: {toolStage.title}
                      </p>
                      <p className="text-sm text-gray-400 mt-4">
                        In a real implementation, the tool component would be loaded here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right sidebar - use new CyclingSidebar if config is provided */}
              {sidebarConfig ? (
                <div className="md:col-span-1 h-[calc(100vh-220px)]">
                  <CyclingSidebar 
                    toolId={toolId}
                    projectId={sidebarConfig.projectId}
                    sectionId={sidebarConfig.sectionId}
                    renderPanelContent={sidebarConfig.renderPanelContent}
                    customPanels={sidebarConfig.customPanels}
                    defaultPanel={sidebarConfig.defaultPanel}
                  />
                </div>
              ) : sidebarContent ? (
                <div className="md:col-span-1 space-y-4">
                  {sidebarContent}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <h2 className="text-xl font-medium mb-2">Tool: {toolId}</h2>
                <p className="text-gray-500">
                  This tool helps you complete the stage: {toolStage.title}
                </p>
                <p className="text-sm text-gray-400 mt-4">
                  In a real implementation, the tool component would be loaded here.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolComponent; 