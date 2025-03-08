import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Award,
  Lightbulb,
  Target,
  Users,
  Clipboard,
  Beaker,
  TrendingUp,
  MessageSquare,
  FileText
} from 'lucide-react';
import { ProjectInsight } from '@/types/project';

interface InsightsSectionProps {
  insights: ProjectInsight[];
  onInsightClick?: (section: string) => void;
}

export function InsightsSection({ insights, onInsightClick }: InsightsSectionProps) {
  // Get the appropriate icon component
  const getInsightIcon = (iconName: string) => {
    switch (iconName) {
      case 'award':
        return <Award className="h-8 w-8 text-amber-500" />;
      case 'target':
        return <Target className="h-8 w-8 text-green-500" />;
      case 'users':
        return <Users className="h-8 w-8 text-blue-500" />;
      case 'clipboard':
        return <Clipboard className="h-8 w-8 text-purple-500" />;
      case 'beaker':
        return <Beaker className="h-8 w-8 text-indigo-500" />;
      case 'trending-up':
        return <TrendingUp className="h-8 w-8 text-rose-500" />;
      case 'message-square':
        return <MessageSquare className="h-8 w-8 text-cyan-500" />;
      case 'file-text':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'lightbulb':
      default:
        return <Lightbulb className="h-8 w-8 text-yellow-500" />;
    }
  };

  // Get color class for a specific color name
  const getColorClass = (color: string, element: 'text' | 'bg' | 'border' = 'text') => {
    const colorMap: Record<string, string> = {
      amber: `${element}-amber-500`,
      green: `${element}-green-500`,
      blue: `${element}-blue-500`,
      purple: `${element}-purple-500`,
      indigo: `${element}-indigo-500`,
      red: `${element}-red-500`,
      yellow: `${element}-yellow-500`,
      rose: `${element}-rose-500`,
      cyan: `${element}-cyan-500`,
    };
    
    return colorMap[color] || `${element}-gray-500`;
  };
  
  if (!insights || insights.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Project Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500">
            <Lightbulb className="h-12 w-12 mb-4 text-gray-300" />
            <p>No insights available yet.</p>
            <p className="text-sm mt-1">Complete more sections to generate insights about your project.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Project Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight) => (
            <Card 
              key={insight.id} 
              className={`border-l-4 ${getColorClass(insight.color, 'border')} hover:bg-gray-50 transition-colors cursor-pointer`}
              onClick={() => insight.section && onInsightClick?.(insight.section)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {getInsightIcon(insight.icon)}
                  <div>
                    <div className="text-2xl font-bold mb-1">{insight.value}</div>
                    <div className="text-sm font-medium">{insight.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{insight.description}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 