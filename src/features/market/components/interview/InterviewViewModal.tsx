import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Calendar, 
  FileText, 
  MessageSquare, 
  Clock, 
  User, 
  Building, 
  MapPin,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Check,
  BarChart,
  BookOpen,
  PlayCircle,
  Edit,
  ArrowRight
} from 'lucide-react';
import { MarketInterview, MarketPersona } from '@/store/types';
import { useInterviewService } from '@/lib/hooks';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { RuntimeTemplate, Question } from '@/lib/utils/interview-utils';

interface InterviewViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewId: string;
  projectId: string;
  onEdit?: () => void;
  onConduct?: () => void;
  onAnalyze?: () => void;
}

export function InterviewViewModal({
  isOpen,
  onClose,
  interviewId,
  projectId,
  onEdit,
  onConduct,
  onAnalyze
}: InterviewViewModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [interview, setInterview] = useState<MarketInterview | null>(null);
  const [linkedPersona, setLinkedPersona] = useState<MarketPersona | null>(null);
  const [template, setTemplate] = useState<RuntimeTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const {
    fetchInterview,
    fetchTemplates,
    fetchInsightsForInterview,
    data: interviewData
  } = useInterviewService(projectId);
  
  // Fetch interview data when modal opens
  useEffect(() => {
    const loadInterviewData = async () => {
      if (!isOpen || !interviewId) return;
      
      setIsLoading(true);
      try {
        const interviewData = await fetchInterview(interviewId);
        if (interviewData) {
          setInterview(interviewData);
          
          // If there's a template_id, fetch the template
          if (interviewData.template_id) {
            const templates = await fetchTemplates(projectId);
            const associatedTemplate = templates.find(t => t.id === interviewData.template_id);
            if (associatedTemplate) {
              setTemplate(associatedTemplate);
            }
          }
          
          // If there's a linked persona, find it in the data
          if (interviewData.persona_id) {
            // This would need to be implemented in a real app to fetch the persona
            // For now we'll just mock this
            setLinkedPersona({
              id: interviewData.persona_id as string,
              name: 'Sample Persona',
              role: 'User',
              demographics: null,
              pain_points: null,
              avatar_url: null,
              created_by: null,
              updated_at: null,
              goals: null,
              created_at: new Date().toISOString(),
              project_id: projectId,
              influence_score: 4,
              priority: 'high',
              persona_segments: ['segment1', 'segment2'],
              empathy_map: null
            });
          }
        }
      } catch (error) {
        console.error('Error loading interview data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load interview details',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInterviewData();
  }, [isOpen, interviewId, fetchInterview, fetchTemplates, projectId, toast]);
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  // Helper function to render status badge
  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    switch(status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'conducted':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Conducted</Badge>;
      case 'analyzed':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Analyzed</Badge>;
      default:
        return null;
    }
  };
  
  // Helper function to render sentiment badge
  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return null;
    
    switch(sentiment) {
      case 'positive':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <ThumbsUp className="h-3 w-3 mr-1" /> Positive
          </Badge>
        );
      case 'negative':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <ThumbsDown className="h-3 w-3 mr-1" /> Negative
          </Badge>
        );
      case 'neutral':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            <AlertCircle className="h-3 w-3 mr-1" /> Neutral
          </Badge>
        );
      default:
        return null;
    }
  };
  
  // Render appropriate buttons based on interview status
  const renderActionButtons = () => {
    if (!interview || !interview.status) return null;
    
    switch(interview.status) {
      case 'draft':
        return (
          <>
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Interview
            </Button>
            <Button onClick={onConduct}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Conduct Interview
            </Button>
          </>
        );
      case 'scheduled':
        return (
          <Button onClick={onConduct}>
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Interview
          </Button>
        );
      case 'conducted':
        return (
          <Button onClick={onAnalyze}>
            <BarChart className="h-4 w-4 mr-2" />
            Analyze Interview
          </Button>
        );
      case 'analyzed':
        return (
          <>
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
            <Button onClick={onEdit}>
              <BarChart className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </>
        );
      default:
        return null;
    }
  };
  
  // Render content based on interview status
  const renderContent = () => {
    if (isLoading || !interview) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading interview details...</p>
          </div>
        </div>
      );
    }
    
    return (
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          {(interview.status === 'conducted' || interview.status === 'analyzed') && (
            <TabsTrigger value="insights">Insights</TabsTrigger>
          )}
        </TabsList>
        
        <ScrollArea className="h-[500px]">
          <TabsContent value="overview" className="space-y-4 p-1">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Interviewee</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{interview.name || 'Not specified'}</span>
                  </div>
                  {interview.company && (
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{interview.company}</span>
                    </div>
                  )}
                  {/* {interview.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{interview.location}</span>
                    </div>
                  )} */}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {interview.scheduled_date ? (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{format(new Date(interview.scheduled_date), 'PPP')}</span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">No date scheduled</div>
                  )}
                  {interview.duration && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{interview.duration} minutes</span>
                    </div>
                  )}
                  {interview.completed_date && (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Completed: {format(new Date(interview.completed_date), 'PPP')}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {linkedPersona && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Linked Persona</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{linkedPersona.name}</span>
                    {linkedPersona.role && (
                      <span className="ml-2 text-sm text-muted-foreground">{linkedPersona.role}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {interview.notes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{interview.notes}</p>
                </CardContent>
              </Card>
            )}
            
            {interview.status === 'analyzed' && interview.sentiment && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center">
                    <span className="mr-2">Overall Sentiment:</span>
                    {getSentimentBadge(interview.sentiment as string)}
                  </div>
                  
                  {/* Next Steps Recommendations */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Recommended Next Steps</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                        <span>Follow up with {interview.name} about specific pain points</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                        <span>Update persona based on new insights</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowRight className="h-4 w-4 mr-2 mt-0.5 text-blue-600" />
                        <span>Schedule follow-up interview in 3-4 weeks</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {interview.status === 'draft' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>This interview is in draft mode</AlertTitle>
                <AlertDescription>
                  Complete the interview details and questions before conducting the interview.
                </AlertDescription>
              </Alert>
            )}
            
            {interview.status === 'scheduled' && !interview.scheduled_date && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Set a schedule</AlertTitle>
                <AlertDescription>
                  This interview is marked as scheduled but doesn't have a date set.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="questions" className="space-y-4 p-1">
            {!interview.template_id ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No template associated</AlertTitle>
                <AlertDescription>
                  This interview doesn't have a template with questions.
                </AlertDescription>
              </Alert>
            ) : !template ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading template questions...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Template: {template.name}
                </div>
                
                <div className="space-y-4">
                  {template.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-md p-4">
                      <div className="font-medium mb-2">Question {index + 1}</div>
                      <p className="text-sm">{question.text}</p>
                      {(interview.status === 'conducted' || interview.status === 'analyzed') && interview.analysis ? (
                        <div className="mt-3 bg-muted p-3 rounded-md">
                          <div className="text-xs text-muted-foreground mb-1">Response:</div>
                          <p className="text-sm">
                            {(interview.analysis as Record<string, string>)[question.id] || 
                              'No response recorded'}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ))}
                  
                  {template.questions.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No questions in template</AlertTitle>
                      <AlertDescription>
                        This template doesn't have any questions defined.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          {(interview.status === 'conducted' || interview.status === 'analyzed') && (
            <TabsContent value="insights" className="space-y-4 p-1">
              {interview.analysis ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Key Insights</CardTitle>
                      <CardDescription>
                        Extracted from the interview responses
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="border-l-4 border-blue-600 pl-4 py-2">
                        <p className="text-sm">User requires better integration capabilities with existing systems</p>
                      </div>
                      <div className="border-l-4 border-blue-600 pl-4 py-2">
                        <p className="text-sm">Budget constraints are a major concern for implementing new solutions</p>
                      </div>
                      <div className="border-l-4 border-blue-600 pl-4 py-2">
                        <p className="text-sm">Cloud-based deployment is strongly preferred over on-premise</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pain Points</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Current solution lacks proper scalability</li>
                          <li>Integration issues with legacy systems</li>
                          <li>Difficult learning curve for new team members</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Desired Features</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Easy-to-use interface with minimal training</li>
                          <li>Comprehensive analytics dashboard</li>
                          <li>API-based integration capabilities</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {interview.transcript && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-sm font-medium">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Transcript
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-80 overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap">
                          {interview.transcript}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No analysis available</AlertTitle>
                  <AlertDescription>
                    This interview has been conducted but not yet analyzed.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          )}
        </ScrollArea>
      </Tabs>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex flex-col space-y-1.5">
            <DialogTitle>
              {interview?.name ? interview.name : 'Interview Details'}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {interview?.template_id ? interview.template_id : 'No template'}
              </span>
              {interview?.status && getStatusBadge(interview.status as string)}
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
        
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {renderActionButtons()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 