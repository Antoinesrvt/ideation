import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  ArrowRight, 
  Grid, 
  PieChart, 
  CheckCircle,
  FileCode,
  UserPlus,
  BarChart2,
  Palette,
  FileText,
  Sparkles
} from 'lucide-react';

interface RecommendedStep {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  stageId: string;
  toolId: string;
}

interface RecommendedStepsProps {
  projectId: string;
  stages: Array<{
    id: string;
    title: string;
    tools: string[];
    recommendedFirst: string;
    color: string;
  }>;
  onStepSelect: (stageId: string, toolId: string) => void;
}

export function RecommendedSteps({ projectId, stages, onStepSelect }: RecommendedStepsProps) {
  // Mock data for recommended steps - in a real implementation, this would be calculated
  // based on the project's progress and current state
  const mockRecommendedSteps: RecommendedStep[] = [
    {
      id: '1',
      title: 'Finalize your Business Model Canvas',
      description: 'Complete all sections of your business model canvas',
      priority: 'high',
      stageId: 'propose',
      toolId: 'business-model'
    },
    {
      id: '2',
      title: 'Analyze your target market',
      description: 'Research market size, trends, and competitors',
      priority: 'high',
      stageId: 'validity',
      toolId: 'market'
    },
    {
      id: '3',
      title: 'Create user personas',
      description: 'Define your target customers and their needs',
      priority: 'medium',
      stageId: 'validity',
      toolId: 'validation'
    },
    {
      id: '4',
      title: 'Draft your financial projections',
      description: 'Estimate costs, revenue streams, and break-even point',
      priority: 'medium',
      stageId: 'viability',
      toolId: 'financials'
    }
  ];
  
  // Get the appropriate icon for a tool
  const getToolIcon = (toolId: string) => {
    switch (toolId) {
      case 'business-model':
        return <Grid className="h-4 w-4 text-purple-500" />;
      case 'product-design':
        return <FileCode className="h-4 w-4 text-blue-500" />;
      case 'market':
        return <PieChart className="h-4 w-4 text-green-500" />;
      case 'validation':
        return <CheckCircle className="h-4 w-4 text-indigo-500" />;
      case 'team':
        return <UserPlus className="h-4 w-4 text-orange-500" />;
      case 'financials':
        return <BarChart2 className="h-4 w-4 text-red-500" />;
      case 'brand':
        return <Palette className="h-4 w-4 text-pink-500" />;
      case 'documents':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <ChevronRight className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Get the stage info by id
  const getStageInfo = (stageId: string) => {
    return stages.find(stage => stage.id === stageId);
  };
  
  // Get color for priority badge
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="h-5 w-5 text-[#7209B7] mr-2" />
          Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-3">
          {mockRecommendedSteps.map((step) => {
            const stageInfo = getStageInfo(step.stageId);
            return (
              <div key={step.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {getToolIcon(step.toolId)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 text-sm">{step.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(step.priority)}`}>
                        {step.priority.charAt(0).toUpperCase() + step.priority.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                    
                    <div className="flex items-center mt-2">
                      {stageInfo && (
                        <span 
                          className="text-xs px-2 py-0.5 rounded text-white mr-2"
                          style={{ backgroundColor: stageInfo.color }}
                        >
                          {stageInfo.title}
                        </span>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-blue-600 hover:text-blue-800 hover:bg-transparent"
                        onClick={() => onStepSelect(step.stageId, step.toolId)}
                      >
                        Get started <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 