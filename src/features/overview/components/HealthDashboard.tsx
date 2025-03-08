import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target,
  BarChart as BarChartIcon
} from 'lucide-react';
import { ProjectMetrics, ProjectPhase } from '@/types/project';

interface HealthDashboardProps {
  metrics: ProjectMetrics;
}

export function HealthDashboard({ metrics }: HealthDashboardProps) {
  // Get the color based on health score
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  // Get the health status text
  const getHealthStatus = (score: number) => {
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'Needs attention';
    return 'At risk';
  };
  
  // Get color for phase indicator
  const getPhaseColor = (phase: ProjectPhase) => {
    switch (phase) {
      case 'launch-ready':
        return 'bg-green-500';
      case 'refinement':
        return 'bg-blue-500';
      case 'validation':
        return 'bg-indigo-500';
      case 'development':
        return 'bg-amber-500';
      case 'concept':
      default:
        return 'bg-gray-500';
    }
  };
  
  // Format phase name for display
  const formatPhase = (phase: ProjectPhase) => {
    switch (phase) {
      case 'launch-ready':
        return 'Ready for Launch';
      case 'concept':
        return 'Concept';
      default:
        return phase.charAt(0).toUpperCase() + phase.slice(1);
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Project Health Card */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
              Project Health
            </div>
            <Badge 
              className={`
                ${metrics.healthScore >= 80 ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
                ${metrics.healthScore >= 50 && metrics.healthScore < 80 ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : ''}
                ${metrics.healthScore < 50 ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
              `}
            >
              {getHealthStatus(metrics.healthScore)}
            </Badge>
          </CardTitle>
          <CardDescription>
            Overall health score based on completion and validation metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Health Score</span>
                <span className="text-sm font-medium text-blue-600">{metrics.healthScore}%</span>
              </div>
              <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={getHealthColor(metrics.healthScore)}
                  style={{ width: `${metrics.healthScore}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="border rounded-lg p-3">
                <div className="text-sm text-gray-500 mb-1">Current Phase</div>
                <div className="font-medium flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${getPhaseColor(metrics.phase)}`} />
                  {formatPhase(metrics.phase)}
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="text-sm text-gray-500 mb-1">Completion</div>
                <div className="font-medium">{metrics.sectionCompletion.overall}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Section Progress Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <BarChartIcon className="h-5 w-5 text-indigo-500 mr-2" />
            Section Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.sectionCompletion)
              .filter(([key]) => key !== 'overall')
              .sort(([, a], [, b]) => b - a)
              .map(([section, completion]) => (
                <div key={section} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs capitalize font-medium">
                      {section.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">{completion}%</span>
                  </div>
                  <Progress value={completion} className="h-1.5" />
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 