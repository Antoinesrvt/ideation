import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  Link as LinkIcon,
  Unlink,
  Plus,
  Calendar,
  User,
  Building,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { EmptyPlaceholder } from './EmptyPlaceholder';
import { MarketPersona } from '@/store/types';

export interface MarketInterview {
  id: string;
  project_id: string;
  title: string;
  company?: string | null;
  contact_name?: string | null;
  date: string | null;
  sentiment: string | null;
  summary?: string | null;
  key_insights?: string[] | null;
  created_at?: string | null;
  persona_id?: string | null;
}

export interface PersonaInterviewsProps {
  persona: MarketPersona;
  interviews: MarketInterview[];
  onAddInterview?: () => void;
  allInterviews?: MarketInterview[];
  onLinkInterview?: (interviewId: string, personaId: string) => Promise<any>;
  onUnlinkInterview?: (interviewId: string) => Promise<any>;
}

export const PersonaInterviews: React.FC<PersonaInterviewsProps> = ({
  persona,
  interviews = [],
  onAddInterview,
  allInterviews = [],
  onLinkInterview,
  onUnlinkInterview,
}) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>('');
  const [isUnlinkDialogOpen, setIsUnlinkDialogOpen] = useState(false);
  const [interviewToUnlink, setInterviewToUnlink] = useState<string | null>(null);
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null);

  // Get unlinked interviews that can be linked to this persona
  const unlinkedInterviews = allInterviews?.filter(
    (interview) => !interview.persona_id || interview.persona_id === ''
  ) || [];

  const handleLinkInterview = async () => {
    if (!selectedInterviewId || !onLinkInterview) return;

    try {
      await onLinkInterview(selectedInterviewId, persona.id);
      setIsLinkDialogOpen(false);
      setSelectedInterviewId('');
    } catch (error) {
      console.error('Error linking interview:', error);
    }
  };

  const handleUnlinkInterview = async () => {
    if (!interviewToUnlink || !onUnlinkInterview) return;

    try {
      await onUnlinkInterview(interviewToUnlink);
      setIsUnlinkDialogOpen(false);
      setInterviewToUnlink(null);
    } catch (error) {
      console.error('Error unlinking interview:', error);
    }
  };

  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return 'bg-gray-100 text-gray-800';
    
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getSentimentIcon = (sentiment: string | null) => {
    if (!sentiment) return <Minus className="h-4 w-4" />;
    
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4" />;
      case 'neutral':
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-none p-2">
      <CardHeader className="bg-muted/20 pb-4 px-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary/80" />
            <span>Interviews</span>
            <Badge variant="outline" className="ml-1">{interviews.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            {onAddInterview && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAddInterview}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            )}
            
            {onLinkInterview && unlinkedInterviews.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLinkDialogOpen(true)}
                className="gap-1"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                Link Existing
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {interviews.length === 0 ? (
          <EmptyPlaceholder
            icon={<MessageSquare className="h-10 w-10 text-muted-foreground opacity-20" />}
            title="No Interviews Yet"
            description="Interviews linked to this persona will appear here."
            actions={
              <div className="flex gap-2">
                {onAddInterview && (
                  <Button onClick={onAddInterview}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Interview
                  </Button>
                )}
                {onLinkInterview && unlinkedInterviews.length > 0 && (
                  <Button variant="outline" onClick={() => setIsLinkDialogOpen(true)}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Link Existing
                  </Button>
                )}
              </div>
            }
          />
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="divide-y">
              {interviews.map((interview) => (
                <motion.div
                  key={interview.id}
                  layout
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={cn(
                    "p-4 hover:bg-muted/30 transition-colors",
                    activeInterviewId === interview.id ? "bg-primary/5" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium">{interview.title || 'Untitled Interview'}</span>
                        <Badge variant="outline" className={cn("flex items-center gap-1", getSentimentColor(interview.sentiment))}>
                          {getSentimentIcon(interview.sentiment)}
                          <span>{interview.sentiment || 'Unknown'}</span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                        {interview.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(interview.date)}</span>
                          </div>
                        )}
                        
                        {interview.contact_name && (
                          <div className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            <span>{interview.contact_name}</span>
                          </div>
                        )}
                        
                        {interview.company && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3.5 w-3.5" />
                            <span>{interview.company}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      {onUnlinkInterview && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setInterviewToUnlink(interview.id);
                            setIsUnlinkDialogOpen(true);
                          }}
                          title="Unlink from persona"
                        >
                          <Unlink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setActiveInterviewId(activeInterviewId === interview.id ? null : interview.id)}
                        title="Toggle details"
                      >
                        {activeInterviewId === interview.id ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                        )}
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {activeInterviewId === interview.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {interview.summary && (
                          <div className="mb-3 p-3 bg-background rounded-md">
                            <div className="text-sm font-medium mb-1 text-muted-foreground">Summary</div>
                            <p className="text-sm whitespace-pre-line">{interview.summary}</p>
                          </div>
                        )}

                        {interview.key_insights && interview.key_insights.length > 0 && (
                          <div className="mb-2">
                            <div className="text-sm font-medium mb-1 text-muted-foreground flex items-center gap-1">
                              <Lightbulb className="h-3.5 w-3.5" />
                              <span>Key Insights</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {interview.key_insights.map((insight, index) => (
                                <Badge key={index} variant="outline" className="bg-primary/5">
                                  {insight}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Link Interview Dialog */}
      {onLinkInterview && (
        <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Link Existing Interview</DialogTitle>
              <DialogDescription>
                Associate an existing interview with {persona.name}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Select
                value={selectedInterviewId}
                onValueChange={setSelectedInterviewId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an interview" />
                </SelectTrigger>
                <SelectContent>
                  {unlinkedInterviews.length > 0 ? (
                    unlinkedInterviews.map((interview) => (
                      <SelectItem key={interview.id} value={interview.id}>
                        {interview.title || 'Untitled Interview'} 
                        {interview.company && ` - ${interview.company}`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No unlinked interviews available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleLinkInterview} 
                disabled={!selectedInterviewId}
                className="gap-1"
              >
                <LinkIcon className="h-4 w-4" />
                Link Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Unlink Interview Dialog */}
      {onUnlinkInterview && (
        <Dialog open={isUnlinkDialogOpen} onOpenChange={setIsUnlinkDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Unlink Interview</DialogTitle>
              <DialogDescription>
                This will remove the association between this interview and {persona.name}.
                The interview will not be deleted and can be linked to a different persona.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUnlinkDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleUnlinkInterview}
                className="gap-1"
              >
                <Unlink className="h-4 w-4" />
                Unlink Interview
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}; 