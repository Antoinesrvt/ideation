'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjectStore } from '@/store';
import { useAIStore } from '@/hooks/useAIStore';
import { useProject } from '@/hooks/useProject';
import { Header } from '@/components/project/Header';
import { Sidebar } from '@/components/project/Sidebar';
import { BusinessModelCanvas } from '@/features/canvas/components/BusinessModelCanvas';
import { GRPModel } from '@/features/grp/components/GRPModel';
import { MarketAnalysis } from '@/features/market/components/MarketAnalysis';
import { ProductDesign } from '@/features/product_design/components/ProductDesign';
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
import { AIProjectWrapper } from '@/components/project/AIProjectWrapper';
import { ProjectState } from '@/store/types';
// Import Database type for proper typing
import { Database } from '@/types/database';

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
  // Get project data from API (will be used for initial loading and syncing)
  const { project } = useProject(projectId);
  
  // Use our store for state management
  const {
    currentData,
    isLoading: storeLoading,
    error: storeError,
    setCurrentData,
    setProject,
  } = useProjectStore();
  
  const { hasStagedChanges, comparisonMode } = useAIStore();

  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  
  // Set the current project in the store when it loads
  useEffect(() => {
    if (project.data) {
      // Initialize our store with the project data
      if (project.data.id) {
        setProject({
          id: project.data.id,
          name: project.data.name,
          // Handle potential missing description safely
          description: project.data.description || '',
          owner_id: project.data.owner_id || '',
          created_at: project.data.created_at || project.data.lastEdited,
          updated_at: project.data.updated_at || project.data.lastEdited,
          is_archived: project.data.is_archived || false,
          industry: project.data.industry || null,
          stage: project.data.stage || null,
          metadata: project.data.metadata || {},
          created_by: project.data.created_by || null
        });
      }

      // The data loading is now handled by useProjectSync in our store
      // which will load all the required data for each section
    }
  }, [project.data, setProject]);
  
  const handleExport = () => {
    // Export project functionality
    console.log('Exporting project...');
  };
  
  // Show loading state
  if (project.isLoading || storeLoading) {
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
  if (project.error || storeError) {
    const errorMessage = project.error?.toString() || storeError?.toString() || 'Unknown error';
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            <h1 className="text-xl font-bold">Error loading project</h1>
            <p className="mt-2">{errorMessage}</p>
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
  
  // Make sure we have project data
  if (!project.data || !currentData.project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg">
            <h1 className="text-xl font-bold">Project not found</h1>
            <p className="mt-2">The requested project could not be found.</p>
            <Button 
              variant="default" 
              className="mt-4"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Get project information from our store
  const projectDetails = currentData.project;
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col w-full h-full min-h-screen bg-gray-50">
        {/* Header */}
        <Header onExport={handleExport} />

        {/* Main Content */}
        <main className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <Sidebar
            projectName={projectDetails.name || ""}
            lastEdited={projectDetails.updated_at || new Date().toISOString()}
            completion={project.data.completion || 0}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            hasStagedChanges={hasStagedChanges}
            comparisonMode={comparisonMode}
          />

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <ErrorBoundary>
              <AIProjectWrapper>
                {activeSection === "overview" && <ProjectOverview />}

                {activeSection === "canvas" && <BusinessModelCanvas />}

                {activeSection === "grp" && <GRPModel />}

                {activeSection === "market" && <MarketAnalysis />}

                {activeSection === "product-design" && <ProductDesign />}

                {activeSection === "validation" && <Validation />}

                {activeSection === "financials" && <FinancialProjections />}

                {activeSection === "team" && <TeamManagement />}

                {activeSection === "documents" && projectDetails && (
                  <DocumentGenerator projectId={projectDetails.id} />
                )}

                {activeSection === "external-tools" && <ExternalTools />}
              </AIProjectWrapper>
            </ErrorBoundary>
          </div>
        </main>

        {/* Floating AI Chat */}
        <FloatingAIChat />
      </div>
    </QueryClientProvider>
  );
} 