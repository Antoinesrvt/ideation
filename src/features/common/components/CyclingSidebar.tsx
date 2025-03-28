import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Bot, 
  CheckSquare, 
  BarChart, 
  StickyNote, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type PanelType = 'documents' | 'ai' | 'validation' | 'metrics' | 'notes';

export interface PanelConfig {
  id: PanelType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export interface CyclingSidebarProps {
  toolId: string;
  projectId: string;
  sectionId?: string;
  className?: string;
  // Function to render the content of each panel
  renderPanelContent: (panelId: PanelType) => React.ReactNode;
  defaultPanel?: PanelType;
  // Optional custom panels configuration
  customPanels?: PanelConfig[];
}

export function CyclingSidebar({
  toolId,
  projectId,
  sectionId,
  className,
  renderPanelContent,
  defaultPanel = 'documents',
  customPanels
}: CyclingSidebarProps) {
  const [activePanel, setActivePanel] = useState<PanelType>(defaultPanel);
  // Track the direction of animation for transitions
  const [direction, setDirection] = useState<'right' | 'left'>('right');

  // Define default panels
  const defaultPanelsConfig: PanelConfig[] = [
    {
      id: 'documents',
      label: 'Documents',
      icon: <FileText className="h-4 w-4" />,
      color: 'text-blue-500'
    },
    {
      id: 'ai',
      label: 'IA',
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

  // Use custom panels configuration if provided, otherwise use defaults
  const panels = customPanels || defaultPanelsConfig;

  // Find current panel index
  const currentIndex = panels.findIndex(panel => panel.id === activePanel);

  // Handle cycling to next panel
  const handleNext = () => {
    setDirection('right');
    const nextIndex = (currentIndex + 1) % panels.length;
    setActivePanel(panels[nextIndex].id);
  };

  // Handle cycling to previous panel
  const handlePrevious = () => {
    setDirection('left');
    const prevIndex = (currentIndex - 1 + panels.length) % panels.length;
    setActivePanel(panels[prevIndex].id);
  };
  
  // Handle direct tab selection
  const handleTabSelect = (panelId: PanelType) => {
    const targetIndex = panels.findIndex(panel => panel.id === panelId);
    setDirection(targetIndex > currentIndex ? 'right' : 'left');
    setActivePanel(panelId);
  };

  // Animation variants for panel transitions
  const slideVariants = {
    hiddenRight: { x: 50, opacity: 0 },
    hiddenLeft: { x: -50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 30 
      } 
    },
    exit: { 
      x: direction === 'right' ? -50 : 50, 
      opacity: 0,
      transition: { duration: 0.2 } 
    }
  };

  // Indicators for showing which panel is active (mobile-style dots)
  const PanelIndicators = () => (
    <div className="flex justify-center space-x-1 mt-1">
      {panels.map((panel, index) => (
        <button
          key={panel.id}
          className={cn(
            "h-1.5 rounded-full transition-all",
            index === currentIndex 
              ? `w-4 ${panel.color.replace('text-', 'bg-').replace('-500', '-500')}` 
              : 'w-1.5 bg-gray-300'
          )}
          onClick={() => handleTabSelect(panel.id)}
          aria-label={`Switch to ${panel.label} panel`}
        />
      ))}
    </div>
  );

  const activeConfig = panels.find(p => p.id === activePanel) || panels[0];

  return (
    <Card className={cn("w-full shadow-sm flex flex-col h-full", className)}>
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0 border-b flex-shrink-0 sticky top-0 z-10 bg-card">
        <div className="flex items-center space-x-1.5">
          <span className={activeConfig.color}>{activeConfig.icon}</span>
          <CardTitle className="text-sm font-medium">
            {activeConfig.label}
          </CardTitle>
        </div>

        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handlePrevious}
            aria-label="Previous panel"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {/* Tab buttons for quick navigation */}
          <div className="hidden sm:flex mr-2">
            {panels.map((panel) => (
              <Button
                key={panel.id}
                variant="ghost"
                size="icon"
                className={cn(
                  "w-8 h-8",
                  activePanel === panel.id && "bg-muted"
                )}
                onClick={() => handleTabSelect(panel.id)}
                title={panel.label}
              >
                <span
                  className={
                    panel.id === activePanel
                      ? panel.color
                      : "text-muted-foreground"
                  }
                >
                  {panel.icon}
                </span>
              </Button>
            ))}
          </div>

          {/* Navigation arrows */}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleNext}
            aria-label="Next panel"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Mobile dot indicators - only show on small screens */}
      <div className="sm:hidden py-1 border-b flex-shrink-0">
        <PanelIndicators />
      </div>

      <CardContent className="p-0 flex-grow overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activePanel}
            initial={direction === "right" ? "hiddenRight" : "hiddenLeft"}
            animate="visible"
            exit="exit"
            variants={slideVariants}
            className="h-full"
          >
            <ScrollArea className="h-full">
              {renderPanelContent(activePanel)}
            </ScrollArea>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
} 