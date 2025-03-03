'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store';
import { useProject } from '@/hooks/useProject';
import { Header } from '@/components/project/Header';
import { Sidebar } from '@/components/project/Sidebar';
import { BusinessModelCanvas } from '@/features/canvas/components/BusinessModelCanvas';
import { GRPModel } from '@/features/grp/components/GRPModel';
import { MarketAnalysis } from '@/features/market/components/MarketAnalysis';
import { UserFlowDesign } from '@/features/product_design/components/UserFlowDesign';
import { ProjectOverview } from '@/features/overview';
import { DocumentGenerator } from '@/features/documents/components/DocumentGenerator';
import { ExternalTools } from '@/features/tools/components/ExternalTools';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FloatingAIChat } from '@/features/ai/components/FloatingAIChat';
import { Button } from '@/components/ui/button';
import { FinancialProjections } from '@/features/financials/components/FinancialProjections';
import { TeamManagement } from '@/features/team/components/TeamManagement';
import { Validation } from '@/features/validation/components/Validation';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface ProjectWorkspaceProps {
  projectId: string;
}

export type ActiveSection = 'overview' | 'canvas' | 'grp' | 'market' | 'product-design' | 'validation' | 'financials' | 'team' | 'documents' | 'external-tools';

export function ProjectWorkspace({ projectId }: ProjectWorkspaceProps) {
  const { project, updateProject } = useProject(projectId);
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  
  // Set the current project in the store when it loads
  useEffect(() => {
    if (project.data) {
      // Update any store data if needed
      // This would connect to your existing store mechanism
    }
  }, [project.data]);
  
  const handleExport = () => {
    // Export project functionality
    console.log('Exporting project...');
  };
  
  const handleUpdateCanvas = (updates: any) => {
    if (project.data) {
      updateProject({
        id: project.data.id,
        data: {
          canvas: {
            ...project.data.canvas,
            ...updates
          }
        }
      });
    } else {
      console.warn('Cannot update canvas: project data is not available');
      // TODO: Add proper error handling or user notification
    }
  };
  
  const handleUpdateGRP = (updates: any) => {
    if (project.data) {
      updateProject({
        id: project.data.id,
        data: {
          grpModel: {
            ...(project.data.grpModel || {}),
            ...updates
          }
        }
      });
    } else {
      console.warn('Cannot update GRP model: project data is not available');
    }
  };
  
  const handleUpdateMarket = (updates: any) => {
    if (project.data) {
      updateProject({
        id: project.data.id,
        data: {
          marketAnalysis: {
            ...(project.data.marketAnalysis || {}),
            ...updates
          }
        }
      });
    } else {
      console.warn('Cannot update market analysis: project data is not available');
    }
  };
  
  const handleUpdateUserFlow = (updates: any) => {
    if (project.data) {
      updateProject({
        id: project.data.id,
        data: {
          userFlow: {
            ...(project.data.userFlow || {}),
            ...updates
          }
        }
      });
    } else {
      console.warn('Cannot update user flow: project data is not available');
    }
  };

  const handleUpdateFinancialProjections = (updates: any) => {
    if (project.data) {
      updateProject({
        id: project.data.id,
        data: {
          financialProjections: {
            ...(project.data.financialProjections || {}),
            ...updates
          }
        }
      });
    }
  }

  const handleUpdateValidation = (updates: any) => {
    if (project.data) {
      updateProject({
        id: project.data.id,
        data: {
          validation: {
            ...(project.data.validation || {}),
            ...updates
          }
        }
      });
    }
  }

  const handleUpdateTeam = (updates: any) => {
    if (project.data) {
      updateProject({
        id: project.data.id,
        data: {
          team: {
            ...(project.data.team || {}),
            ...updates
          }
        }
      });
    }
  }
  
  // Show loading state
  if (project.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Loading project...</h1>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (project.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <h1 className="text-xl font-bold">Error loading project</h1>
            <p className="mt-2">{project.error.toString()}</p>
            <Button 
              variant="default" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col w-full h-full min-h-screen bg-gray-50">
        {/* Header */}
        <Header onExport={handleExport} />
        
        {/* Main Content */}
        <main className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {project.data && (
            <Sidebar 
              projectName={project.data.name}
              lastEdited={project.data.lastEdited}
              completion={project.data.completion}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          )}
          
          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <ErrorBoundary>
              {activeSection === 'overview' && project.data && (
                <ProjectOverview 
                  project={project.data}
                />
              )}
              
              {activeSection === 'canvas' && (
                <BusinessModelCanvas 
                  data={project.data?.canvas}
                  onUpdate={handleUpdateCanvas}
                />
              )}
              
              {activeSection === 'grp' && (
                <GRPModel 
                  data={project.data?.grpModel}
                  onUpdate={handleUpdateGRP}
                />
              )}
              
              {activeSection === 'market' && (
                <MarketAnalysis 
                  data={project.data?.marketAnalysis}
                  onUpdate={handleUpdateMarket}
                />
              )}
              
              {activeSection === 'product-design' && (
                <UserFlowDesign 
                  data={project.data?.userFlow}
                  onUpdate={handleUpdateUserFlow}
                />
              )}
              

              {activeSection === 'validation' && (
                <Validation 
                  data={project.data ?? undefined}
                  onUpdate={handleUpdateValidation}
                />
              )}

              {activeSection === "financials" && (
                <FinancialProjections 
                  data={project.data?.financialProjections}
                  onUpdate={handleUpdateFinancialProjections}
                />
              )}

              {activeSection === 'team' && (
                <TeamManagement 
                  data={project.data?.team}
                  onUpdate={handleUpdateTeam}
                />
              )}
              
              {activeSection === 'documents' && project.data && (
                <DocumentGenerator 
                  projectId={project.data.id}
                  documents={project.data.documents || []}
                />
              )}
              
              {activeSection === 'external-tools' && (
                <ExternalTools />
              )}
            </ErrorBoundary>
          </div>
        </main>
        
        {/* Floating AI Chat */}
        <FloatingAIChat />
      </div>
    </QueryClientProvider>
  );
} 