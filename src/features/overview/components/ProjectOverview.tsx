import React from 'react';
import { useProjectMetrics } from '@/hooks/useProjectMetrics';
import { useAppStore } from '@/store';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { HealthDashboard } from './HealthDashboard';
import { InsightsSection } from './InsightsSection';
import { RisksSection } from './RisksSection';
import { RecommendedActionsSection } from './RecommendedActionsSection';
import { LoadingState } from '@/features/common/components/LoadingAndErrorState';

interface ProjectOverviewProps {
  project: {
    id: string;
    title: string;
    updated_at: string;
  };
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
  const { metrics, isStale, calculating, error, calculateMetrics } = useProjectMetrics(project.id);
  const { setActiveSection } = useAppStore();
  
  // Function to handle manual refresh
  const handleRefreshMetrics = () => {
    calculateMetrics();
  };
  
  // Function to handle section navigation
  const handleNavigateToSection = (section: string) => {
    setActiveSection(section as any);
  };
  
  return (
    <div className="">
      {/* <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{project.title ?? 'Untitled Project'}</h2>
          <p className="text-gray-600">Last edited: {formatDate(project.updated_at)}</p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshMetrics}
          disabled={calculating}
        >
          {calculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh metrics
            </>
          )}
        </Button>
      </div> */}
      
      {calculating && !metrics ? (
        <LoadingState message="Calculating project metrics..." />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
          <h3 className="font-medium mb-1">Error calculating metrics</h3>
          <p className="text-sm">{error.message}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={handleRefreshMetrics}
          >
            Try again
          </Button>
        </div>
      ) : metrics ? (
        <>
          <HealthDashboard metrics={metrics} />
          <InsightsSection insights={metrics.insights} onInsightClick={handleNavigateToSection} />
          <RisksSection risks={metrics.risks} onActionClick={handleNavigateToSection} />
          <RecommendedActionsSection 
            actions={metrics.recommendedActions}
            onActionClick={handleNavigateToSection}
          />
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <h3 className="font-medium text-gray-700 mb-2">No metrics available</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-4">
            Calculate metrics to get insights and recommendations for your project.
          </p>
          <Button onClick={handleRefreshMetrics}>
            Calculate metrics
          </Button>
        </div>
      )}
    </div>
  );
};