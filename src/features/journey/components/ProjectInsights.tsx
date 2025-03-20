import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Lightbulb, 
  Target, 
  Users, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  Beaker,
  CheckCircle
} from 'lucide-react';

interface ProjectInsightsProps {
  projectId: string;
}

// Mock insights data for demo purposes
const MOCK_INSIGHTS = [
  {
    id: '1',
    title: 'Market Potential',
    value: '$2.5B',
    description: 'Estimated total addressable market',
    icon: 'target',
    color: 'green',
    section: 'market'
  },
  {
    id: '2',
    title: 'Completion Rate',
    value: '38%',
    description: 'Overall project completion',
    icon: 'trending-up',
    color: 'purple',
    section: 'overview'
  },
  {
    id: '3',
    title: 'User Interviews',
    value: '6',
    description: 'Completed user validations',
    icon: 'users',
    color: 'blue',
    section: 'validation'
  },
  {
    id: '4',
    title: 'Business Model',
    value: '85%',
    description: 'Business model validation score',
    icon: 'check-circle',
    color: 'amber',
    section: 'business-model'
  },
  {
    id: '5',
    title: 'Time Invested',
    value: '42h',
    description: 'Total time spent on project',
    icon: 'clock',
    color: 'cyan',
    section: 'overview'
  },
  {
    id: '6',
    title: 'Experiments',
    value: '3',
    description: 'Validation experiments conducted',
    icon: 'beaker',
    color: 'indigo',
    section: 'validation'
  }
];

export function ProjectInsights({ projectId }: ProjectInsightsProps) {
  // In a real implementation, fetch insights based on projectId
  const insights = MOCK_INSIGHTS;
  
  // Get the appropriate icon component
  const getInsightIcon = (iconName: string) => {
    switch (iconName) {
      case 'target':
        return <Target className="h-8 w-8 text-green-500" />;
      case 'users':
        return <Users className="h-8 w-8 text-blue-500" />;
      case 'trending-up':
        return <TrendingUp className="h-8 w-8 text-purple-500" />;
      case 'clock':
        return <Clock className="h-8 w-8 text-cyan-500" />;
      case 'beaker':
        return <Beaker className="h-8 w-8 text-indigo-500" />;
      case 'check-circle':
        return <CheckCircle className="h-8 w-8 text-amber-500" />;
      case 'lightbulb':
      default:
        return <Lightbulb className="h-8 w-8 text-yellow-500" />;
    }
  };

  // Get color class for a specific color name
  const getColorClass = (color: string, element: 'text' | 'bg' | 'border' = 'bg') => {
    const colorMap: Record<string, string> = {
      amber: `${element}-amber-100`,
      green: `${element}-green-100`,
      blue: `${element}-blue-100`,
      purple: `${element}-purple-100`,
      indigo: `${element}-indigo-100`,
      red: `${element}-red-100`,
      yellow: `${element}-yellow-100`,
      cyan: `${element}-cyan-100`,
    };
    
    return colorMap[color] || `${element}-gray-100`;
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
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Lightbulb className="h-5 w-5 text-amber-500 mr-2" />
          Project Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight) => (
            <div 
              key={insight.id} 
              className={`${getColorClass(insight.color)} p-4 rounded-lg hover:shadow-sm transition-shadow cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div className="mr-4">
                  {getInsightIcon(insight.icon)}
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold">{insight.value}</div>
                  <div className="text-sm font-medium text-gray-700">{insight.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{insight.description}</div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 