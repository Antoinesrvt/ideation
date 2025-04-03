import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  User, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Award, 
  Mic,
  MicOff,
  Plus,
  X,
  CheckCircle,
  ListChecks,
  MapPin,
  Building,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useInterviewService } from '@/lib/hooks';
import { AudioRecorder } from './AudioRecorder';
import { 
  RuntimeTemplate, 
  Question,
  sanitizeQuestions
} from '@/lib/utils/interview-utils';
import { format as formatDate } from 'date-fns';
import { Insert, MarketInterview } from '@/store/types';

// Define a type for the interview data that includes the fields we need
interface InterviewData {
  name: string;
  company?: string;
  scheduled_date?: string;
  location?: string;
  notes?: string;
  status: 'scheduled' | 'draft' | 'conducted' | 'analyzed';
}

// Replace the existing InterviewQuestion interface with our Question type
type InterviewResponse = Record<string, string>;

// Update ExtendedInterviewTemplate to use our RuntimeTemplate
interface ExtendedInterviewTemplate extends RuntimeTemplate {
  // Any additional fields specific to this component
}

interface InterviewConductorProps {
  projectId: string;
  templateId: string;
  interviewId?: string;
  onComplete: () => void;
  onCancel: () => void;
  preloadedTemplate?: RuntimeTemplate; // Add optional preloaded template
}

// Add this function at the top level, before the main component
function FallbackInterviewConductor({
  projectId,
  templateId,
  interviewId,
  onComplete,
  onCancel,
  error
}: InterviewConductorProps & { error?: string }) {
  return (
    <div className="flex flex-col h-full p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <X className="h-6 w-6 text-red-500 mr-2" />
          <h2 className="text-xl font-semibold text-red-700">Unable to load interview</h2>
        </div>
        
        <p className="text-red-600 mb-6">
          {error || "There was a problem loading the interview data. This could be due to network issues, missing permissions, or the template may no longer exist."}
        </p>
        
        <div className="flex flex-col space-y-2 text-sm mb-4">
          <p><strong>Project ID:</strong> {projectId}</p>
          <p><strong>Template ID:</strong> {templateId}</p>
          {interviewId && <p><strong>Interview ID:</strong> {interviewId}</p>}
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onCancel}>
            Return to Market Tool
          </Button>
        </div>
      </div>
    </div>
  );
}

// Loading state component with more detailed information
function LoadingState({ step, projectId, templateId, interviewId }: { 
  step: 'template' | 'interview' | 'general',
  projectId: string,
  templateId: string,
  interviewId?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh]">
      <div className="animate-pulse flex flex-col items-center space-y-6 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Clock className="h-8 w-8 text-primary/40" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">
            {step === 'template' ? 'Loading Interview Template...' : 
             step === 'interview' ? 'Loading Interview Data...' : 
             'Preparing Interview...'}
          </h3>
          <p className="text-muted-foreground">
            {step === 'template' ? 'Getting your interview questions ready' : 
             step === 'interview' ? 'Retrieving previous responses' : 
             'Setting up the interview environment'}
          </p>
        </div>
        
        <div className="bg-muted/20 rounded-lg p-4 w-full text-left text-xs text-muted-foreground space-y-1">
          <p><strong>Project ID:</strong> {projectId}</p>
          <p><strong>Template ID:</strong> {templateId}</p>
          {interviewId && <p><strong>Interview ID:</strong> {interviewId}</p>}
        </div>
      </div>
    </div>
  );
}

/**
 * InterviewConductor component - handles the interview process for a template
 * @param projectId - The project ID
 * @param templateId - The template ID to load
 * @param interviewId - Optional interview ID when editing an existing interview
 * @param onComplete - Callback when the interview is completed
 * @param onCancel - Callback when the interview is cancelled
 * @param preloadedTemplate - Preloaded template data (preferred method to avoid additional fetching)
 */
export function InterviewConductor({
  projectId,
  templateId,
  interviewId,
  onComplete,
  onCancel,
  preloadedTemplate
}: InterviewConductorProps) {
  const { toast } = useToast();
  const {
    fetchTemplates,
    createInterview,
    updateInterview,
    fetchInterviews,
    error: serviceError,
    uploadRecording
  } = useInterviewService(projectId);

  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  
  // CRITICAL FIX: Use a function initializer for template state
  // This ensures the preloadedTemplate is only processed once during initial render
  const [template, setTemplate] = useState<ExtendedInterviewTemplate | null>(() => {
    if (preloadedTemplate) {
      console.log('Initializing with preloaded template:', {
        id: preloadedTemplate.id,
        name: preloadedTemplate.name,
        questionCount: preloadedTemplate.questions?.length || 0
      });
      
      // Process the template immediately in the initializer to avoid re-renders
      return {
        ...preloadedTemplate,
        questions: Array.isArray(preloadedTemplate.questions) 
          ? preloadedTemplate.questions.map((q: any, index: number) => ({
              id: q.id || `question-${index}`,
              text: q.text || '',
              type: q.type || 'open',
              options: q.options || [],
              required: q.required !== undefined ? q.required : true,
              order: q.order !== undefined ? q.order : index
            }))
          : []
      };
    }
    return null;
  });
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecordings, setAudioRecordings] = useState<Record<string, Blob>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [interviewData, setInterviewData] = useState<InterviewData>({
    name: '',
    scheduled_date: formatDate(new Date(), 'yyyy-MM-dd'),
    location: '',
    notes: '',
    status: 'draft'
  });
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // Use refs to track processing state and prevent infinite loops
  const hasStartedFetching = useRef(false);
  const hasLoadedData = useRef(false);
  const isMounted = useRef(true);

  // Log component initialization with all relevant props for debugging
  console.log('InterviewConductor render', { 
    hasPreloadedTemplate: !!preloadedTemplate,
    templateIsSet: !!template,
    projectId,
    templateId,
    interviewId,
    isLoading,
    hasStartedFetching: hasStartedFetching.current,
    hasLoadedData: hasLoadedData.current,
    currentStep,
    timestamp: new Date().toISOString()
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Use effect to fetch interview data and template (if needed) on mount
  useEffect(() => {
    // Skip if we've already loaded data or started fetching
    if (hasLoadedData.current || hasStartedFetching.current) {
      console.log('Interview data already loaded or fetch in progress, skipping fetch');
      return;
    }

    hasStartedFetching.current = true;
    console.log('Starting data fetching process');

    // Function to fetch only interview data (used when template is preloaded)
    const loadInterviewDataOnly = async () => {
      if (!isMounted.current) return;
      
      setIsLoading(true);
      try {
        // If editing an existing interview, fetch its data
        if (interviewId) {
          console.log('Fetching interview data only (template already loaded)');
          const interviews = await fetchInterviews(projectId) || [];
          const interview = interviews.find(i => i.id === interviewId);
          
          if (interview) {
            // Extract interview data or use defaults
            const processedInterviewData = {
              name: interview.name || '',
              company: interview.company as string || '',
              scheduled_date: interview.scheduled_date as string || formatDate(new Date(), 'yyyy-MM-dd'),
              location: interview.location as string || '',
              notes: interview.notes as string || '',
              status: (interview.status as 'scheduled' | 'draft' | 'conducted' | 'analyzed') || 'draft'
            };
            
            if (isMounted.current) {
              setInterviewData(processedInterviewData);
              
              // Set responses from dedicated responses field
              if (interview.responses) {
                setResponses(interview.responses as Record<string, string>);
              }
            }
          }
        }
        
        if (isMounted.current) {
          hasLoadedData.current = true; // Mark as loaded
        }
      } catch (error) {
        console.error('Error fetching interview data:', error);
        if (isMounted.current) {
          if (error instanceof Error) {
            setLoadingError(error.message);
          }
          toast({
            title: 'Error',
            description: 'Failed to load interview data',
            variant: 'destructive'
          });
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };
    
    // If we already have the template (either from props or state), just load interview data
    if (template) {
      console.log('Template already available, loading interview data only');
      loadInterviewDataOnly();
      return;
    }

    // Original data fetching logic when no template is available
    const fetchData = async () => {
      if (!isMounted.current) return;
      
      setIsLoading(true);
      setLoadingError(null); // Reset any existing errors
      
      // STEP 1: Fetch and process the template
      try {
        console.log('Fetching template data', { projectId, templateId });
        
        if (!projectId || !templateId) {
          const errorMessage = !projectId ? 'Project ID is required' : 'Template ID is required';
          console.error(errorMessage);
          
          if (isMounted.current) {
            toast({
              title: 'Error',
              description: errorMessage,
              variant: 'destructive'
            });
            onCancel();
          }
          return;
        }
        
        // Fetch template
        console.log('Fetching templates for project', projectId);
        const templates = await fetchTemplates(projectId) || [];
        console.log('Templates fetched:', templates.length);
        
        if (!isMounted.current) return;
        
        const foundTemplate = templates.find(t => t.id === templateId);
        console.log('Template search result:', { 
          found: !!foundTemplate, 
          templateId,
          availableTemplatesCount: templates.length
        });
        
        if (!foundTemplate) {
          console.error('Template not found', { 
            templateId, 
            availableTemplateIds: templates.map(t => t.id) 
          });
          
          if (isMounted.current) {
            toast({
              title: 'Error',
              description: 'Template not found',
              variant: 'destructive'
            });
            onCancel();
          }
          return;
        }
        
        // Process the template with proper question structure
        const processedTemplate = {
          ...foundTemplate,
          questions: Array.isArray(foundTemplate.questions) 
            ? foundTemplate.questions.map((q: any, index: number) => ({
                id: q.id || `question-${index}`,
                text: q.text || '',
                type: q.type || 'open',
                options: q.options || [],
                required: q.required !== undefined ? q.required : true,
                order: q.order !== undefined ? q.order : index
              }))
            : []
        };
        
        console.log('Processed template successfully:', { 
          id: processedTemplate.id, 
          name: processedTemplate.name, 
          questionCount: processedTemplate.questions.length 
        });
        
        if (isMounted.current) {
          setTemplate(processedTemplate);
        }
      } catch (error) {
        console.error('Error fetching template data:', error);
        
        if (isMounted.current) {
          if (error instanceof Error) {
            console.error('Template error details:', error.message, error.stack);
            setLoadingError(`Template error: ${error.message}`);
          } else {
            setLoadingError('An unknown error occurred while loading the template');
          }
          
          toast({
            title: 'Template Error',
            description: `Failed to load template: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: 'destructive'
          });
        }
        return; // Exit but don't cancel to show the error
      }
      
      // STEP 2: Fetch interview data if needed
      if (interviewId && isMounted.current) {
        console.log('Fetching interview data', { interviewId });
        try {
          const interviews = await fetchInterviews(projectId) || [];
          console.log('Interviews fetched:', interviews.length);
          
          if (!isMounted.current) return;
          
          const interview = interviews.find(i => i.id === interviewId);
          console.log('Interview search result:', { 
            found: !!interview, 
            interviewId 
          });
          
          if (interview && isMounted.current) {
            // Extract interview data
            const processedInterviewData = {
              name: interview.name || '',
              company: interview.company as string || '',
              scheduled_date: interview.scheduled_date as string || formatDate(new Date(), 'yyyy-MM-dd'),
              location: interview.location as string || '',
              notes: interview.notes as string || '',
              status: (interview.status as 'scheduled' | 'draft' | 'conducted' | 'analyzed') || 'draft'
            };
            
            console.log('Processed interview data:', processedInterviewData);
            setInterviewData(processedInterviewData);
            
            // Set responses from existing interview's analysis field
            if (interview.responses) {
              console.log('Setting responses from responses field');
              setResponses(interview.responses as Record<string, string>);
            }
          }
        } catch (error) {
          console.error('Error fetching interview data:', error);
          // Continue with template data even if interview data fails
          if (isMounted.current) {
            toast({
              title: 'Warning',
              description: 'Loaded template but failed to load interview data',
              variant: 'default'
            });
          }
        }
      }
      
      if (isMounted.current) {
        hasLoadedData.current = true; // Mark as loaded
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, templateId, interviewId, fetchInterviews, fetchTemplates, toast, onCancel, template]);

  // Get current question with proper type checking
  const currentQuestion = template?.questions && template.questions.length > 0
    ? [...template.questions].sort((a, b) => a.order - b.order)[currentStep]
    : null;

  const totalQuestions = template?.questions?.length || 0;

  // Handle moving to next/previous questions
  const handleNext = () => {
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Handle response changes
  const handleResponseChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Handle recording for a question
  const handleToggleRecording = (questionId: string) => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
    }
  };

  // Handle audio blob from recorder
  const handleAudioRecorded = (questionId: string, audioBlob: Blob) => {
    setAudioRecordings(prev => ({
      ...prev,
      [questionId]: audioBlob
    }));
  };

  // Handle metadata changes
  const handleMetadataChange = (key: keyof InterviewData, value: string) => {
    setInterviewData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle saving the interview
  const handleSave = async (status: 'draft' | 'conducted') => {
    try {
      setIsLoading(true);
      
      // Prepare the interview ID for the recordings
      const tempId = interviewId || `temp-${Date.now()}`;
      
      // Upload any audio recordings
      for (const [questionId, blob] of Object.entries(audioRecordings)) {
        // Convert blob to File
        const file = new File([blob], `interview_${tempId}_q${questionId}.webm`, { 
          type: 'audio/webm' 
        });
        
        try {
          // Use the uploadRecording with correct parameters (interviewId, file)
          const recordingUrl = await uploadRecording(tempId, file);
          
          // Store the URL in responses only if upload was successful
          if (recordingUrl) {
            responses[`recording_${questionId}`] = recordingUrl;
          }
        } catch (error) {
          console.error(`Failed to upload recording for question ${questionId}:`, error);
          toast({
            title: 'Warning',
            description: `Failed to upload recording for question ${questionId}`,
            variant: 'destructive'
          });
        }
      }
      
      // Prepare the interview data
      const interviewPayload: Insert<'market_interviews'> = {
        project_id: projectId,
        template_id: templateId,
        name: interviewData.name,
        company: interviewData.company,
        scheduled_date: interviewData.scheduled_date,
        location: interviewData.location,
        notes: interviewData.notes,
        status,
        responses: responses as any, // Type casting to any to avoid type issues
        analysis: null as any, // Initialize the analysis field as null
        tags: [],
        key_insights: [],
        transcript: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (interviewId) {
        // Update existing interview with dedicated responses field
        await updateInterview(interviewId, {
          ...interviewData,
          status,
          responses: responses as any, // Type casting to any to avoid type issues
          analysis: null as any // Clear the analysis field if previously used for responses
        });
        
        toast({
          title: 'Success',
          description: 'Interview updated successfully',
          variant: 'default'
        });
      } else {
        // Create new interview with dedicated responses field
        const newInterview = await createInterview(interviewPayload);
        
        toast({
          title: 'Success',
          description: 'Interview created successfully',
          variant: 'default'
        });
      }
      
      onComplete();
    } catch (error) {
      console.error('Error saving interview:', error);
      toast({
        title: 'Error',
        description: 'Failed to save interview',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If there's an error or the template is not loaded after loading completes, show the fallback component
  if (isLoading) {
    return (
      <LoadingState 
        step={interviewId ? 'interview' : 'template'} 
        projectId={projectId}
        templateId={templateId}
        interviewId={interviewId}
      />
    );
  }

  if (loadingError || !template) {
    return (
      <FallbackInterviewConductor
        projectId={projectId}
        templateId={templateId}
        interviewId={interviewId}
        onComplete={onComplete}
        onCancel={onCancel}
        error={loadingError || "Template could not be loaded"}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-muted/10">
        <div>
          <h2 className="text-xl font-bold">{template?.name || "Interview"}</h2>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4" />
            <span>Est. duration: {template?.estimated_duration || 30} min</span>
            <ListChecks className="h-4 w-4 ml-2" />
            <span>{totalQuestions} questions</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => handleSave("draft")}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => handleSave("conducted")}>
            <Award className="h-4 w-4 mr-2" />
            Complete
          </Button>
        </div>
      </div>

      {/* Progress indicator */}

      <div className="grid grid-cols-1 md:grid-cols-4 flex-grow overflow-hidden">
        {/* Left side - Interview metadata & navigation */}
        <div className="md:col-span-1 border-r overflow-hidden flex flex-col">
          <Card className="flex flex-col h-full rounded-none border-0 border-r shadow-none">
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 px-4 flex-grow overflow-auto">
              <div className="space-y-2">
                <Label htmlFor="interviewee">Interviewee Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="interviewee"
                    value={interviewData.name}
                    onChange={(e) =>
                      handleMetadataChange("name", e.target.value)
                    }
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Interview Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={interviewData.scheduled_date}
                    onChange={(e) =>
                      handleMetadataChange("scheduled_date", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={interviewData.location}
                    onChange={(e) =>
                      handleMetadataChange("location", e.target.value)
                    }
                    placeholder="Zoom / In person / Phone"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={interviewData.notes}
                  onChange={(e) =>
                    handleMetadataChange("notes", e.target.value)
                  }
                  placeholder="Additional context or notes about this interview"
                  rows={4}
                />
              </div>

              {/* Audio recording moved to sidebar */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">
                    Audio Recording
                  </Label>
                  <Badge variant="outline" className="text-xs">
                    {Object.keys(audioRecordings).length} recordings
                  </Badge>
                </div>

                {currentQuestion && (
                  <div className="bg-muted/20 p-3 rounded-md">
                    <p className="text-xs text-muted-foreground mb-2">
                      Current question:
                    </p>
                    <p className="text-sm font-medium mb-3 line-clamp-2">
                      {currentQuestion.text}
                    </p>

                    <AudioRecorder
                      questionId={currentQuestion.id}
                      isRecording={isRecording}
                      onToggleRecording={() =>
                        handleToggleRecording(currentQuestion.id)
                      }
                      onAudioRecorded={(blob: Blob) =>
                        handleAudioRecorded(currentQuestion.id, blob)
                      }
                      hasRecording={!!audioRecordings[currentQuestion.id]}
                    />
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col items-stretch border-t p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Questions</div>
                <Badge variant="outline">
                  {
                    Object.keys(responses).filter(
                      (id) => !id.startsWith("recording_")
                    ).length
                  }
                  /{totalQuestions}
                </Badge>
              </div>
              <ScrollArea className="h-40">
                <div className="space-y-1">
                  {template?.questions &&
                    [...template.questions]
                      .sort((a, b) => a.order - b.order)
                      .map((question, index) => {
                        const hasResponse = !!responses[question.id];
                        const hasRecording = !!audioRecordings[question.id];

                        return (
                          <Button
                            key={question.id}
                            variant={
                              currentStep === index ? "default" : "ghost"
                            }
                            className={cn(
                              "w-full justify-start text-left h-auto py-2",
                              hasResponse
                                ? "text-primary font-medium"
                                : "text-muted-foreground"
                            )}
                            onClick={() => {
                              setCurrentStep(index);
                              // Scroll to the question
                              document
                                .getElementById(`question-${question.id}`)
                                ?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                            }}
                          >
                            <div className="flex items-start mr-2">
                              <div
                                className={cn(
                                  "h-5 w-5 rounded-full flex items-center justify-center text-xs",
                                  hasResponse
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground border"
                                )}
                              >
                                {index + 1}
                              </div>
                            </div>
                            <div className="flex flex-col items-start">
                              <span className="truncate max-w-[180px]">
                                {question.text.substring(0, 30)}
                                {question.text.length > 30 ? "..." : ""}
                              </span>
                              {hasResponse && (
                                <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                  <span>Answered</span>
                                  {hasRecording && (
                                    <>
                                      <Mic className="h-3 w-3 ml-2 mr-1 text-blue-500" />
                                      <span>Recorded</span>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </Button>
                        );
                      })}
                </div>
              </ScrollArea>
            </CardFooter>
          </Card>
        </div>

        {/* Right side - Scrollable question form */}
        <div className="md:col-span-3 flex flex-col h-full overflow-hidden">
          <div className="px-4 py-2 border-b bg-white">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Interview Progress</span>
              <span className="text-sm text-muted-foreground">
                {
                  Object.keys(responses).filter(
                    (id) => !id.startsWith("recording_")
                  ).length
                }{" "}
                of {totalQuestions} questions answered
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${
                    totalQuestions > 0
                      ? (Object.keys(responses).filter(
                          (id) => !id.startsWith("recording_")
                        ).length /
                          totalQuestions) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
          <ScrollArea className="h-full">
            <div className="p-6 space-y-8">
              {template?.questions &&
                [...template.questions]
                  .sort((a, b) => a.order - b.order)
                  .map((question, index) => {
                    const isCurrentQuestion = currentStep === index;
                    const hasResponse = !!responses[question.id];
                    const hasRecording = !!audioRecordings[question.id];

                    return (
                      <div
                        key={question.id}
                        id={`question-${question.id}`}
                        className={cn(
                          "p-6 rounded-lg transition-all duration-200",
                          isCurrentQuestion
                            ? "bg-primary/5 border border-primary/20 shadow-sm"
                            : hasResponse
                            ? "bg-muted/10 border border-muted"
                            : "bg-white border border-border"
                        )}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="mb-2">
                            Question {index + 1} of {totalQuestions}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="mb-2">
                              {question.type === "open"
                                ? "Open-ended"
                                : question.type === "multiple_choice"
                                ? "Multiple Choice"
                                : question.type === "rating"
                                ? "Rating"
                                : "Yes/No"}
                            </Badge>
                            {hasResponse && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 mb-2"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Answered
                              </Badge>
                            )}
                            {hasRecording && (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 mb-2"
                              >
                                <Mic className="h-3 w-3 mr-1" />
                                Recorded
                              </Badge>
                            )}
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-4">
                          {question.text}
                        </h3>

                        <div className="mt-4">
                          {question.type === "open" && (
                            <Textarea
                              value={responses[question.id] || ""}
                              onChange={(e) =>
                                handleResponseChange(
                                  question.id,
                                  e.target.value
                                )
                              }
                              placeholder="Record the response here..."
                              className="min-h-[120px]"
                              onClick={() => setCurrentStep(index)}
                            />
                          )}

                          {question.type === "multiple_choice" && (
                            <div className="space-y-3">
                              {question.options &&
                                question.options.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`option-${index}-${optionIndex}`}
                                      checked={
                                        responses[question.id] === option
                                      }
                                      onCheckedChange={() => {
                                        handleResponseChange(
                                          question.id,
                                          option
                                        );
                                        setCurrentStep(index);
                                      }}
                                    />
                                    <Label
                                      htmlFor={`option-${index}-${optionIndex}`}
                                    >
                                      {option}
                                    </Label>
                                  </div>
                                ))}
                            </div>
                          )}

                          {question.type === "rating" && (
                            <div className="flex justify-between items-center py-4">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <Button
                                  key={rating}
                                  variant={
                                    responses[question.id] === rating.toString()
                                      ? "default"
                                      : "outline"
                                  }
                                  className="h-12 w-12 rounded-full"
                                  onClick={() => {
                                    handleResponseChange(
                                      question.id,
                                      rating.toString()
                                    );
                                    setCurrentStep(index);
                                  }}
                                >
                                  {rating}
                                </Button>
                              ))}
                            </div>
                          )}

                          {question.type === "yes_no" && (
                            <div className="flex space-x-4 py-4">
                              <Button
                                variant={
                                  responses[question.id] === "Yes"
                                    ? "default"
                                    : "outline"
                                }
                                className="flex-1 py-6"
                                onClick={() => {
                                  handleResponseChange(question.id, "Yes");
                                  setCurrentStep(index);
                                }}
                              >
                                Yes
                              </Button>
                              <Button
                                variant={
                                  responses[question.id] === "No"
                                    ? "default"
                                    : "outline"
                                }
                                className="flex-1 py-6"
                                onClick={() => {
                                  handleResponseChange(question.id, "No");
                                  setCurrentStep(index);
                                }}
                              >
                                No
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

              {/* Navigation buttons at the bottom */}
              <div className="flex justify-end pt-4 mb-10">
                <Button
                  onClick={() => handleSave("conducted")}
                  className="px-6"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Complete Interview
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
} 