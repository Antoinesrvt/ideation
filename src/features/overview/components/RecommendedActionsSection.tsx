import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowRight, 
  Layers, 
  Target, 
  Users, 
  FileText, 
  Beaker,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecommendedAction } from '@/types/project';

interface RecommendedActionsSectionProps {
  actions: RecommendedAction[];
  onActionClick?: (section: string) => void;
}

export function RecommendedActionsSection({ actions, onActionClick }: RecommendedActionsSectionProps) {
  // Get icon for section
  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'canvas':
        return <Layers className="h-4 w-4 text-blue-500" />;
      case 'market':
        return <Target className="h-4 w-4 text-green-500" />;
      case 'product-design':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'validation':
        return <Beaker className="h-4 w-4 text-indigo-500" />;
      case 'documents':
        return <FileText className="h-4 w-4 text-red-500" />;
      default:
        return <ChevronRight className="h-4 w-4 text-gray-500" />;
    }
  };
  
  if (!actions || actions.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500">
            <p>No recommended actions at this time.</p>
            <p className="text-sm mt-1">Continue working on your project to receive guidance.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Recommended Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action) => (
            <div key={action.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    {getSectionIcon(action.section)}
                    <span className="text-sm text-gray-500 ml-2 capitalize">
                      {action.section.replace('-', ' ')}
                    </span>
                  </div>
                  <h4 className="font-medium mb-1">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="ml-4 mt-1"
                  onClick={() => onActionClick?.(action.section)}
                >
                  Get Started
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 