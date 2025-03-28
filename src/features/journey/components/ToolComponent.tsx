'use client';

import React from 'react';
import { JOURNEY_STAGES } from '../constants';
import { APP_CONFIG, AppType } from './ToolRouter';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { HomeIcon, ChevronRight } from 'lucide-react';
import { CyclingSidebar, PanelType, PanelConfig } from '@/features/common/components/CyclingSidebar';
import { cn } from '@/lib/utils';

interface ToolComponentProps {
  stageId: string;
  toolId: string; 
  icon?: React.ReactNode;
  color?: string;
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
  icon,
  color,
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
  // Check if we're in app mode (new approach) or stage mode (old approach)
  const isAppMode = ['market', 'brand', 'product', 'financials'].includes(stageId);
  
  // For app mode, use the APP_CONFIG, otherwise find the stage from JOURNEY_STAGES
  const appConfig = isAppMode ? APP_CONFIG[stageId as AppType] : null;
  const toolStage = isAppMode ? null : JOURNEY_STAGES.find(s => s.id === stageId);
  
  // Get stage information, either from app config or journey stage
  const stageInfo = isAppMode 
    ? { 
        id: appConfig?.id || stageId, 
        title: appConfig?.title || stageId.charAt(0).toUpperCase() + stageId.slice(1), 
        color: appConfig?.color || '#666666' 
      } 
    : toolStage;
  
  // If no stage info is available, show error
  if (!stageInfo) {
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
    <div className="h-full flex flex-col">
      <Card className="flex flex-col h-full overflow-hidden">
        <CardHeader className="flex-row items-center justify-between p-4 border-b space-y-0 flex-shrink-0">
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
                style={{ backgroundColor: stageInfo.color }}
              ></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackToStage}
                className="h-8 px-2 flex items-center"
              >
                <span
                  className="truncate max-w-[120px]"
                  style={{ color: stageInfo.color }}
                >
                  {stageInfo.title}
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
            <div className="flex items-center space-x-1 overflow-x-auto">
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

        <CardContent className="p-4 flex-grow flex flex-col overflow-hidden">
          {/* Use new CyclingSidebar if config is provided, otherwise use legacy layout */}
          {children || sidebarContent || sidebarConfig ? (
            <div className="flex flex-col md:flex-row gap-4 h-full overflow-hidden">
              {/* Main content area - takes 2/3 width and full height with scrolling */}
              <div 
                className={cn(
                  "flex-grow overflow-y-auto scrollbar-hide", 
                  sidebarConfig || sidebarContent ? "md:w-2/3" : "w-full"
                )}
              >
                {children ? (
                  <div className="h-full">{children}</div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <h2 className="text-xl font-medium mb-2">Tool: {toolId}</h2>
                      <p className="text-gray-500">
                        This tool helps you with: {stageInfo.title}
                      </p>
                      <p className="text-sm text-gray-400 mt-4">
                        In a real implementation, the tool component would be loaded here.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right sidebar - fixed width and full height with sticky positioning */}
              {sidebarConfig ? (
                <div className="h-full md:w-1/3 md:flex-shrink-0">
                  <CyclingSidebar 
                    toolId={toolId}
                    projectId={sidebarConfig.projectId}
                    sectionId={sidebarConfig.sectionId}
                    renderPanelContent={sidebarConfig.renderPanelContent}
                    customPanels={sidebarConfig.customPanels}
                    defaultPanel={sidebarConfig.defaultPanel}
                    className="h-full"
                  />
                </div>
              ) : sidebarContent ? (
                <div className="h-full md:w-1/3 md:flex-shrink-0 overflow-auto">
                  {sidebarContent}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <h2 className="text-xl font-medium mb-2">Tool: {toolId}</h2>
                <p className="text-gray-500">
                  This tool helps you with: {stageInfo.title}
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