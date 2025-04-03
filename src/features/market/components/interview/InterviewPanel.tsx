import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  FileText,
  PlusCircle,
  Search,
  Calendar,
  FileEdit,
  Check,
  Clock,
  MessageSquare,
  AlertCircle,
  File
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useInterviewService } from '@/lib/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MarketInterview } from '@/store/types';
import { InterviewViewModal } from './InterviewViewModal';
import { RuntimeTemplate } from '@/lib/utils/interview-utils';

interface InterviewPanelProps {
  projectId: string;
  onCreateTemplate: () => void;
  onViewTemplate: (templateId: string) => void;
  onEditTemplate: (templateId: string) => void;
  onStartInterview: (templateId: string) => void;
  onViewInterview: (interviewId: string) => void;
}

export function InterviewPanel({
  projectId,
  onCreateTemplate,
  onViewTemplate,
  onEditTemplate,
  onStartInterview,
  onViewInterview
}: InterviewPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('templates');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const { 
    data, 
    isLoading, 
    error,
    fetchAllData,
    fetchTemplates,
    fetchInterviews
  } = useInterviewService(projectId);

  // Fetch data when component mounts, with better error handling
  useEffect(() => {
    if (projectId) {
      fetchAllData(projectId).catch(err => {
        console.error('Failed to fetch interview data:', err);
        // Continue showing UI with empty state rather than failing completely
      });
    }
  }, [projectId, fetchAllData]);

  // Filter templates based on search query
  const filteredTemplates = ((data?.templates || []) as unknown as RuntimeTemplate[]).filter((template) => {
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) || 
      (template.description && template.description.toLowerCase().includes(query))
    );
  });

  const filteredInterviews = data?.interviews?.filter(interview =>
    interview?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interview?.company?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Group interviews by status for better organization
  const groupedInterviews = {
    scheduled: filteredInterviews.filter(i => i?.status === 'scheduled'),
    draft: filteredInterviews.filter(i => i?.status === 'draft'),
    conducted: filteredInterviews.filter(i => i?.status === 'conducted'),
    analyzed: filteredInterviews.filter(i => i?.status === 'analyzed')
  };

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

  const getStatusIcon = (status: string | null) => {
    if (!status) return <File className="h-4 w-4" />;
    
    switch(status) {
      case 'draft':
        return <FileEdit className="h-4 w-4 text-gray-600" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'conducted':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'analyzed':
        return <Check className="h-4 w-4 text-purple-600" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };
  
  // Handle opening the interview view modal
  const handleInterviewClick = (interviewId: string) => {
    setSelectedInterviewId(interviewId);
    setIsViewModalOpen(true);
  };
  
  // Handle closing the interview view modal
  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedInterviewId(null);
  };
  
  // Handle action buttons from the modal
  const handleEditInterview = () => {
    if (selectedInterviewId) {
      onViewInterview(selectedInterviewId);
      handleCloseViewModal();
    }
  };
  
  const handleConductInterview = () => {
    if (selectedInterviewId) {
      onViewInterview(selectedInterviewId);
      handleCloseViewModal();
    }
  };
  
  const handleAnalyzeInterview = () => {
    if (selectedInterviewId) {
      onViewInterview(selectedInterviewId);
      handleCloseViewModal();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 flex justify-between items-center">
        <div className="text-sm font-medium">Interviews</div>
        <Button size="sm" variant="ghost" onClick={onCreateTemplate}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>
      
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates & interviews..."
            className="pl-8 py-1 h-8 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-2 mx-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <TabsContent value="templates" className="mt-0 p-0 flex-1">
            <div className="px-4 py-2">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-full h-16" />
                  ))}
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No interview templates found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onCreateTemplate}
                    className="mt-2"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create your first template
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <div 
                      key={template.id}
                      className="rounded-md border bg-card p-3 text-sm hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {template.estimated_duration 
                              ? `${template.estimated_duration} min` 
                              : 'Duration not set'}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => onEditTemplate(template.id)}
                            title="Edit template"
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7" 
                            onClick={() => onStartInterview(template.id)}
                            title="Start interview"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="interviews" className="mt-0 p-0 flex-1">
            <div className="px-4 py-2">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="w-full h-16" />
                  ))}
                </div>
              ) : filteredInterviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No interviews found</p>
                  <p className="text-xs mt-1">Select a template to start a new interview</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Scheduled Interviews */}
                  {groupedInterviews.scheduled.length > 0 && (
                    <div>
                      <div className="text-xs font-medium uppercase text-muted-foreground mb-2">
                        Scheduled
                      </div>
                      <div className="space-y-2">
                        {groupedInterviews.scheduled.map((interview) => (
                          <InterviewItem 
                            key={interview.id} 
                            interview={interview} 
                            onClick={() => handleInterviewClick(interview.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Draft Interviews */}
                  {groupedInterviews.draft.length > 0 && (
                    <div>
                      <div className="text-xs font-medium uppercase text-muted-foreground mb-2">
                        Drafts
                      </div>
                      <div className="space-y-2">
                        {groupedInterviews.draft.map((interview) => (
                          <InterviewItem 
                            key={interview.id} 
                            interview={interview} 
                            onClick={() => handleInterviewClick(interview.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Conducted Interviews */}
                  {groupedInterviews.conducted.length > 0 && (
                    <div>
                      <div className="text-xs font-medium uppercase text-muted-foreground mb-2">
                        Conducted
                      </div>
                      <div className="space-y-2">
                        {groupedInterviews.conducted.map((interview) => (
                          <InterviewItem 
                            key={interview.id} 
                            interview={interview} 
                            onClick={() => handleInterviewClick(interview.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Analyzed Interviews */}
                  {groupedInterviews.analyzed.length > 0 && (
                    <div>
                      <div className="text-xs font-medium uppercase text-muted-foreground mb-2">
                        Analyzed
                      </div>
                      <div className="space-y-2">
                        {groupedInterviews.analyzed.map((interview) => (
                          <InterviewItem 
                            key={interview.id} 
                            interview={interview} 
                            onClick={() => handleInterviewClick(interview.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
      
      {/* Interview View Modal */}
      {selectedInterviewId && (
        <InterviewViewModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          interviewId={selectedInterviewId}
          projectId={projectId}
          onEdit={handleEditInterview}
          onConduct={handleConductInterview}
          onAnalyze={handleAnalyzeInterview}
        />
      )}
    </div>
  );
}

function InterviewItem({ 
  interview, 
  onClick 
}: { 
  interview: MarketInterview, 
  onClick: () => void 
}) {
  // Determine status color and icon
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
  
  const getStatusIcon = (status: string | null) => {
    if (!status) return <File className="h-4 w-4" />;
    
    switch(status) {
      case 'draft':
        return <FileEdit className="h-4 w-4 text-gray-600" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'conducted':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'analyzed':
        return <Check className="h-4 w-4 text-purple-600" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };
  
  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return null;
    
    const colors = {
      positive: 'bg-green-100 text-green-800',
      negative: 'bg-red-100 text-red-800',
      neutral: 'bg-gray-100 text-gray-800'
    };
    
    const sentimentColor = colors[sentiment as keyof typeof colors] || colors.neutral;
    
    return <Badge variant="outline" className={sentimentColor}>{sentiment}</Badge>;
  };
  
  return (
    <div 
      className="rounded-md border bg-card p-3 text-sm hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="mt-0.5 mr-3">
            {getStatusIcon(interview.status)}
          </div>
          <div>
            <div className="font-medium">{interview.name}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
              {interview.company && (
                <span>{interview.company}</span>
              )}
              {interview.scheduled_date && (
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(interview.scheduled_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          {getStatusBadge(interview.status)}
          {interview.sentiment && getSentimentBadge(interview.sentiment as string)}
        </div>
      </div>
    </div>
  );
} 