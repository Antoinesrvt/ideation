"use client"
import React, { ErrorInfo, useEffect, useState, useRef } from 'react';
import { InterviewConductor } from '@/features/market/components/interview/InterviewConductor';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { RuntimeTemplate, deserializeTemplateQuestions, SerializedTemplate } from '@/lib/utils/interview-utils';
import { useInterviewService } from '@/lib/hooks';
import { useToast } from '@/components/ui/use-toast';
import { useSupabase } from '@/context/supabase-context';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useRouter, useParams } from 'next/navigation';

// ErrorBoundary component to catch errors
const ErrorBoundary: React.FC<{ fallbackUrl: string }> = ({ fallbackUrl }) => {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center space-y-4 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h1 className="text-xl font-bold">Error Loading Interview</h1>
        <p className="text-muted-foreground">
          There was an error loading the interview template.
        </p>
        <button
          onClick={() => router.push(fallbackUrl)}
          className="flex items-center space-x-2 text-blue-500 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Project</span>
        </button>
      </div>
    </div>
  );
};

function SimpleFallback({ error, returnUrl }: { error: unknown, returnUrl: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
          <h2 className="text-xl font-semibold text-red-700">Unable to load interview</h2>
        </div>
        <p className="text-red-600 mb-4">
          {error instanceof Error 
            ? error.message 
            : "A critical error occurred while rendering the interview page."
          }
        </p>
        <Link href={returnUrl}>
          <Button variant="outline" className="mt-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Market Tool
          </Button>
        </Link>
      </div>
    </div>
  );
}

function LoadingIndicator({ message = "Loading interview template..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="flex items-center">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mr-2" />
        <span className="text-lg text-gray-700">{message}</span>
      </div>
    </div>
  );
}

interface InterviewConductorPageProps {
  params: {
    id: string;
    templateId: string;
  };
  searchParams: {
    interviewId?: string;
  };
}

// Helper function for delay with exponential backoff
const delay = (attemptNumber: number) => 
  new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attemptNumber), 10000)));

export default function InterviewConductorPage() {
  const params = useParams<{ id: string; templateId: string }>();
  const router = useRouter();
  const { id: projectId, templateId } = params;
  const { toast } = useToast();
  // Get interviewId from URL query parameters - for client components, we need to parse it manually
  const interviewId = typeof window !== 'undefined' ? 
    new URLSearchParams(window.location.search).get('interviewId') ?? undefined : 
    undefined;
  const { user, supabase } = useSupabase();
  
  const [template, setTemplate] = useState<RuntimeTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { fetchTemplates } = useInterviewService(projectId);
  
  // Use a ref to track fetch state
  const hasSuccessfullyFetched = useRef(false);

  // Check if Supabase session is ready
  const isSessionReady = !!user;
  console.log("Supabase session is ready:", isSessionReady);

  // Direct Supabase query for fetching a template
  const fetchTemplateDirectly = async (): Promise<RuntimeTemplate | null> => {
    console.log(`[TemplateDebug] Direct Supabase query attempt for template ${templateId} in project ${projectId}`);
    
    try {
      if (!supabase) {
        console.error("[TemplateDebug] Supabase client not available for direct query");
        return null;
      }
      
      const startTime = performance.now();
      const { data, error } = await supabase
        .from('interview_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      const queryTime = performance.now() - startTime;
      
      if (error) {
        console.error(`[TemplateDebug] Direct Supabase query error (${queryTime.toFixed(2)}ms):`, error);
        return null;
      }
      
      if (!data) {
        console.log(`[TemplateDebug] No template found with direct query (${queryTime.toFixed(2)}ms)`);
        return null;
      }
      
      console.log(`[TemplateDebug] Template found via direct query (${queryTime.toFixed(2)}ms): ${data.name}`);
      
      // The deserializer function already handles both string and array formats
      const deserializedTemplate = deserializeTemplateQuestions(data as SerializedTemplate);
      console.log(`[TemplateDebug] Deserialized template has ${deserializedTemplate.questions.length} questions`);
      
      return deserializedTemplate;
    } catch (err) {
      console.error("[TemplateDebug] Exception during direct template query:", err);
      return null;
    }
  };

  // Function to fetch templates with retries and exponential backoff
  const fetchTemplateWithRetry = async (attempt: number = 1, maxAttempts: number = 5): Promise<RuntimeTemplate | null> => {
    console.log(`[TemplateDebug] Attempt ${attempt}/${maxAttempts} to fetch template ${templateId}`);
    
    if (attempt > maxAttempts) {
      console.error(`[TemplateDebug] Max retry attempts (${maxAttempts}) reached for template ${templateId}`);
      return null;
    }
    
    try {
      // Try to fetch via the React Query hook first
      console.log(`[TemplateDebug] Fetching templates via React Query for project ${projectId}`);
      const templates = await fetchTemplates(projectId);
      console.log(`[TemplateDebug] Fetched ${templates?.length || 0} templates via React Query`);
      
      if (templates && templates.length > 0) {
        const foundTemplate = templates.find(t => t.id === templateId);
        
        if (foundTemplate) {
          console.log(`[TemplateDebug] Found template via React Query: ${foundTemplate.name}`);
          return foundTemplate;
        }
        
        console.log(`[TemplateDebug] Template ${templateId} not found in ${templates.length} templates`);
      } else {
        console.log(`[TemplateDebug] No templates returned from React Query. Will try direct Supabase query.`);
      }
      
      // If not found via React Query, try direct Supabase query
      const directTemplate = await fetchTemplateDirectly();
      if (directTemplate) {
        console.log(`[TemplateDebug] Successfully fetched template via direct query: ${directTemplate.name}`);
        return directTemplate;
      }
      
      // If we reach here, we've failed with both methods
      // Wait with exponential backoff before retrying
      const backoffTime = Math.min(100 * Math.pow(2, attempt), 5000); // Cap at 5 seconds
      console.log(`[TemplateDebug] Retry attempt ${attempt} failed. Waiting ${backoffTime}ms before next attempt`);
      
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return fetchTemplateWithRetry(attempt + 1, maxAttempts);
    } catch (error) {
      console.error(`[TemplateDebug] Error in attempt ${attempt}:`, error);
      
      // Wait before retrying
      const backoffTime = Math.min(100 * Math.pow(2, attempt), 5000);
      console.log(`[TemplateDebug] Error during fetch, waiting ${backoffTime}ms before retry`);
      
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return fetchTemplateWithRetry(attempt + 1, maxAttempts);
    }
  };

  // Use effect to fetch template data
  useEffect(() => {
    // Skip if we don't have user auth yet, or if we've already successfully fetched
    if (!user || !projectId || !templateId || hasSuccessfullyFetched.current) {
      console.log(`[TemplateDebug] Skipping template fetch:`, {
        hasUser: !!user,
        hasProjectId: !!projectId,
        hasTemplateId: !!templateId,
        alreadyFetched: hasSuccessfullyFetched.current
      });
      return;
    }
    
    console.log(`[TemplateDebug] Starting template fetch process for ${templateId} in project ${projectId}`);
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    
    const fetchTemplate = async () => {
      try {
        const startTime = performance.now();
        const fetchedTemplate = await fetchTemplateWithRetry();
        const fetchTime = performance.now() - startTime;
        
        // Check if component is still mounted before updating state
        if (!isMounted) {
          console.log('[TemplateDebug] Component unmounted during fetch, discarding results');
          return;
        }
        
        if (fetchedTemplate) {
          console.log(`[TemplateDebug] Template fetch successful (${fetchTime.toFixed(2)}ms): ${fetchedTemplate.name}`);
          setTemplate(fetchedTemplate);
          hasSuccessfullyFetched.current = true;
        } else {
          console.error(`[TemplateDebug] Failed to fetch template after multiple attempts`);
          setError(new Error('Template not found after multiple attempts'));
        }
      } catch (err) {
        console.error('[TemplateDebug] Exception during template fetch:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error fetching template'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchTemplate();
    
    // Cleanup function
    return () => {
      isMounted = false;
      console.log('[TemplateDebug] Template fetch useEffect cleanup - component unmounting');
    };
  }, [user, projectId, templateId, fetchTemplates, supabase]);
  
  // Navigation handlers
  const handleComplete = () => {
    console.log('[TemplateDebug] Interview completed, redirecting to project canvas');
    router.push(`/project/canvas/${projectId}?app=market&section=interviews`);
  };
  
  const handleCancel = () => {
    console.log('[TemplateDebug] Interview cancelled, redirecting to project canvas');
    router.push(`/project/canvas/${projectId}?app=market&section=interviews`);
  };
  
  console.log('InterviewConductorPage rendering with params:', {
    projectId,
    templateId,
    interviewId,
    templateLoaded: !!template,
    isLoading,
    error: error?.message,
    hasSuccessfullyFetched: hasSuccessfullyFetched.current
  });
  
  // If there's an error and no template, show the fallback
  if (error && !template) {
    return (
      <SimpleFallback 
        error={error} 
        returnUrl={`/project/canvas/${projectId}?app=market&section=interviews`} 
      />
    );
  }
  
  // Show loading indicator while fetching
  if (isLoading && !template) {
    return <LoadingIndicator />;
  }
  
  // Show error if template is not found
  if (!template) {
    return (
      <SimpleFallback 
        error={new Error("Template not found")} 
        returnUrl={`/project/canvas/${projectId}?app=market&section=interviews`} 
      />
    );
  }
  
  // Render the interview conductor with the template
  return (
    <ReactErrorBoundary
      fallback={<ErrorBoundary fallbackUrl={`/project/canvas/${projectId}?app=market&section=interviews`} />}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading interview template...</p>
          </div>
        </div>
      ) : error ? (
        <SimpleFallback 
          error={error} 
          returnUrl={`/project/canvas/${projectId}?app=market&section=interviews`} 
        />
      ) : (
        <InterviewConductor
          projectId={projectId}
          templateId={templateId}
          interviewId={interviewId}
          preloadedTemplate={template}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      )}
    </ReactErrorBoundary>
  );
} 