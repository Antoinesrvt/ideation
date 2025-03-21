import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ArrowRight, CheckCircle, Lightbulb, ArrowUpRight, Network } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface ValidationCriterion {
  id: string;
  label: string;
  description: string;
  threshold: number;
  currentValue: number;
  unit?: string;
}

interface StageCanvasProps {
  stage: {
    id: string;
    title: string;
    description: string;
    color: string;
    tools: Array<{
      id: string;
      title: string;
      description: string;
    }>;
    validationCriteria?: ValidationCriterion[];
  };
  progress: Record<string, number>;
  toolProgress: Record<string, number>;
  onBack: () => void;
  onToolSelect: (toolId: string) => void;
}

export function StageCanvas({
  stage,
  progress,
  toolProgress,
  onBack,
  onToolSelect
}: StageCanvasProps) {
  const stageProgress = progress[stage.id] || 0;
  
  // Create tools with completion status
  const tools: Tool[] = stage.tools.map(tool => ({
    ...tool,
    icon: getToolIcon(tool.id),
    completed: (toolProgress[tool.id] || 0) === 100
  }));
  
  function getToolIcon(toolId: string): React.ReactNode {
    // Map tool IDs to appropriate icons
    // In a real implementation, this would be more dynamic
    switch (toolId) {
      case 'venture_viability_radar':
        return <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20z" />
            <path d="M2 12h20" />
            <path d="M12 2v20" />
          </svg>
        </div>;
      case 'go_no_go_framework':
        return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
            <path d="M8 3H5a2 2 0 0 0-2 2v3" />
            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
            <path d="M3 16v3a2 2 0 0 0 2 2h3" />
            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
            <path d="m9 15 3-3 3 3" />
            <path d="M12 12v6" />
          </svg>
        </div>;
      case 'dependency_matrix':
        return <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
          <Network className="h-4 w-4 text-violet-600" />
        </div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Lightbulb className="h-4 w-4 text-gray-600" />
        </div>;
    }
  }
  
  return (
    <div className="flex flex-col space-y-6 animate-fadeIn">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: stage.color }}>
            {stage.title}
          </h1>
          <p className="text-gray-500">{stage.description}</p>
        </div>

        <div className="flex flex-col justify-between items-center gap-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="text-xl font-semibold">Stage Progress</div>
              <Badge variant="outline" className="ml-2">
                {stageProgress}% Complete
              </Badge>
            </div>
          </div>
          <Progress
            value={stageProgress}
            className="h-2 w-full"
            style={
              {
                "--tw-gradient-from": `${stage.color}80`,
                "--tw-gradient-to": stage.color,
              } as React.CSSProperties
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Available Tools</h2>

          {tools.map((tool) => (
            <Card
              key={tool.id}
              className={`border ${
                tool.completed
                  ? "border-green-200 bg-green-50"
                  : "hover:border-blue-200 hover:shadow-md"
              } transition-all cursor-pointer`}
              onClick={() => onToolSelect(tool.id)}
            >
              <CardHeader className="p-4 flex flex-row items-center space-y-0 gap-4">
                {tool.icon}
                <div>
                  <CardTitle className="text-base">
                    {tool.title}
                    {tool.completed && (
                      <CheckCircle className="h-4 w-4 ml-2 inline text-green-600" />
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {tool.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardFooter className="p-3 pt-0 flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-0 h-auto text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent"
                >
                  <span>Open Tool</span>
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Validation Criteria</h2>

          {stage.validationCriteria ? (
            <Card>
              <CardContent className="p-4 pt-6">
                <div className="space-y-6">
                  {stage.validationCriteria.map((criterion) => {
                    const percentage = Math.min(
                      100,
                      (criterion.currentValue / criterion.threshold) * 100
                    );
                    const isMet = criterion.currentValue >= criterion.threshold;

                    return (
                      <div key={criterion.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="font-medium">
                              {criterion.label}
                            </span>
                            {isMet && (
                              <CheckCircle className="h-4 w-4 ml-2 text-green-600" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {criterion.currentValue}
                            {criterion.unit || ""} / {criterion.threshold}
                            {criterion.unit || ""}
                          </div>
                        </div>
                        <div
                          className="tooltip-wrapper relative"
                          title={criterion.description}
                        >
                          <Progress
                            value={percentage}
                            className="h-2 w-full"
                            style={{
                              backgroundColor: "rgba(229, 231, 235, 0.5)",
                            }}
                            indicatorClassName={
                              isMet ? "bg-green-500" : "bg-amber-500"
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-50 border border-dashed border-gray-200">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center text-gray-500">
                <Lightbulb className="h-10 w-10 mb-3 text-gray-400" />
                <p className="mb-2">
                  No validation criteria defined for this stage yet.
                </p>
                <p className="text-sm">
                  Complete the tools to automatically generate criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 