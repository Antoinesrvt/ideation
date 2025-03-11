import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Import, Search, Check, AlertCircle, MessageSquare, ArrowRightLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStepper } from '@/context/product-stepper-context';
import { useMarketAnalysis } from '@/hooks/features/useMarketAnalysis';
import { useValidation } from '@/hooks/features/useValidation';
import { useToast } from '@/components/ui/use-toast';
import type { Problem } from '../ProblemSolutionFit';
import type { MarketInterview } from '@/store/types';
import type { ValidationUserFeedback } from '@/store/types';
import { useProjectStore } from "@/store/project-store";


interface DiscoverProblemsStepProps {
  // Optional props for overriding behavior if needed
  onAddProblem?: (problem: Omit<Problem, 'id'>) => void;
  onUpdateProblem?: (id: string, updates: Partial<Problem>) => void;
}

export function DiscoverProblemsStep({
  onAddProblem,
  onUpdateProblem
}: DiscoverProblemsStepProps) {
  const { toast } = useToast();
  const { currentData } = useProjectStore();
  const projectId = currentData.project?.id;  
  const [activeTab, setActiveTab] = useState('problem-board');
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ id: string, type: string } | null>(null);
  
  // Use the context through the hook
  const {
    problems,
    addProblem: addProblemToStore,
    updateProblem: updateProblemInStore,
    isLoading: isProblemLoading
  } = useProductStepper();
  
  const { 
    data: marketData, 
    isLoading: isMarketLoading 
  } = useMarketAnalysis(projectId);
  
  const { 
    data: validationData, 
    isLoading: isValidationLoading 
  } = useValidation(projectId);

  // Memoize derived data to prevent unnecessary recalculations
  const marketInterviews = useMemo(() => marketData?.interviews || [], [marketData?.interviews]);
  const userFeedback = useMemo(() => validationData?.userFeedback || [], [validationData?.userFeedback]);
  
  // Use useMemo for problemsByStatus to prevent unnecessary state updates
  const problemsByStatus = useMemo(() => {
    return {
      discovered: problems.filter(p => p.status === 'discovered'),
      validated: problems.filter(p => p.status === 'validated'),
      critical: problems.filter(p => p.status === 'critical'),
    };
  }, [problems]);
  
  // Handle drag start
  const handleDragStart = useCallback((id: string, type: string) => {
    setIsDragging(true);
    setDraggedItem({ id, type });
  }, []);
  
  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDraggedItem(null);
  }, []);
  
  // Handle dropping a problem card into a status column
  const handleDrop = useCallback((status: 'discovered' | 'validated' | 'critical') => {
    if (draggedItem && draggedItem.type === 'problem') {
      const problemId = draggedItem.id;
      
      // Use prop handler if provided, otherwise use hook
      if (onUpdateProblem) {
        onUpdateProblem(problemId, { status });
      } else {
        updateProblemInStore(problemId, { status })
          .then(() => {
            toast({
              title: 'Problem updated',
              description: `Problem moved to ${status} status`,
            });
          })
          .catch(error => {
            console.error('Error updating problem:', error);
            toast({
              title: 'Error updating problem',
              description: 'An error occurred while updating the problem status',
              variant: 'destructive',
            });
          });
      }
    }
  }, [draggedItem, onUpdateProblem, updateProblemInStore, toast]);
  
  // Convert market interview insights to problems
  const handleImportInsight = useCallback((insight: string, source: string, segment: string) => {
    const newProblem = {
      title: insight,
      description: `From ${source}`,
      status: 'discovered' as const,
      significance: 50,
      customerSegments: [segment],
      evidenceCount: 1
    };
    
    // Use prop handler if provided, otherwise use hook
    if (onAddProblem) {
      onAddProblem(newProblem);
    } else {
      addProblemToStore(newProblem)
        .then(() => {
          toast({
            title: 'Problem added',
            description: 'New problem has been added from insight',
          });
        })
        .catch(error => {
          console.error('Error adding problem:', error);
          toast({
            title: 'Error adding problem',
            description: 'An error occurred while adding the problem',
            variant: 'destructive',
          });
        });
    }
  }, [onAddProblem, addProblemToStore, toast]);
  
  // Memoize the problem card render function to prevent unnecessary re-renders
  const renderProblemCard = useCallback((problem: Problem) => {
    return (
      <motion.div
        key={problem.id}
        layoutId={`problem-${problem.id}`}
        className="mb-3 last:mb-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        draggable
        onDragStart={() => handleDragStart(problem.id, 'problem')}
        onDragEnd={handleDragEnd}
      >
        <Card className="bg-white border-l-4 shadow-sm hover:shadow-md transition-shadow cursor-move"
              style={{ borderLeftColor: problem.significance > 75 ? '#ef4444' : problem.significance > 50 ? '#f59e0b' : problem.significance > 25 ? '#3b82f6' : '#6b7280' }}>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base font-medium">{problem.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground mb-2">{problem.description}</p>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Significance</span>
              <Badge variant={problem.significance > 75 ? "destructive" : problem.significance > 50 ? "default" : "secondary"}>
                {problem.significance}/100
              </Badge>
            </div>
            
            <div className="flex flex-wrap space-x-1">
              {problem.customerSegments.map((segment, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {segment}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [handleDragStart, handleDragEnd]);
  
  // Show loading state if data is loading
  if (isProblemLoading || isMarketLoading || isValidationLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading data...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="problem-board" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Problem Board
          </TabsTrigger>
          <TabsTrigger value="customer-insights" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Customer Insights
          </TabsTrigger>
          <TabsTrigger value="user-feedback" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            User Feedback
          </TabsTrigger>
        </TabsList>
        
        {/* Problem Board Tab */}
        <TabsContent value="problem-board" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Discovered Problems Column */}
            <div 
              className={`p-4 rounded-md bg-gray-50 min-h-[300px] border-2 ${isDragging ? 'border-dashed border-gray-300' : 'border-transparent'}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop('discovered');
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center">
                  <Search className="h-4 w-4 mr-2 text-gray-500" />
                  Discovered Problems
                </h3>
                <Badge variant="outline">{problemsByStatus.discovered.length}</Badge>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {problemsByStatus.discovered.map(problem => renderProblemCard(problem))}
                </AnimatePresence>
                
                {problemsByStatus.discovered.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground text-sm">
                    No discovered problems yet
                  </div>
                )}
              </div>
            </div>
            
            {/* Validated Problems Column */}
            <div 
              className={`p-4 rounded-md bg-blue-50 min-h-[300px] border-2 ${isDragging ? 'border-dashed border-blue-200' : 'border-transparent'}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop('validated');
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center">
                  <Check className="h-4 w-4 mr-2 text-blue-500" />
                  Validated Problems
                </h3>
                <Badge variant="outline">{problemsByStatus.validated.length}</Badge>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {problemsByStatus.validated.map(problem => renderProblemCard(problem))}
                </AnimatePresence>
                
                {problemsByStatus.validated.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground text-sm">
                    Drag validated problems here
                  </div>
                )}
              </div>
            </div>
            
            {/* Critical Problems Column */}
            <div 
              className={`p-4 rounded-md bg-red-50 min-h-[300px] border-2 ${isDragging ? 'border-dashed border-red-200' : 'border-transparent'}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop('critical');
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                  Critical Problems
                </h3>
                <Badge variant="outline">{problemsByStatus.critical.length}</Badge>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {problemsByStatus.critical.map(problem => renderProblemCard(problem))}
                </AnimatePresence>
                
                {problemsByStatus.critical.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground text-sm">
                    Drag critical problems here
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Customer Insights Tab */}
        <TabsContent value="customer-insights">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Insights from Customer Interviews</CardTitle>
              <CardDescription>Import insights from your customer interviews to identify potential problems</CardDescription>
            </CardHeader>
            <CardContent>
              {marketInterviews.length > 0 ? (
                <div className="space-y-4">
                  {marketInterviews.map((interview, interviewIndex) => (
                    <Card key={interviewIndex} className="bg-muted/40">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle className="text-base">{interview.name}</CardTitle>
                          <Badge variant="outline">{interview.company}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {interview.key_insights && interview.key_insights.length > 0 ? (
                          <div className="space-y-2">
                            {interview.key_insights.map((insight: string, insightIndex: number) => (
                              <div 
                                key={insightIndex} 
                                className="flex items-center justify-between p-2 bg-background border rounded-md"
                              >
                                <span className="text-sm">{insight}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleImportInsight(insight, interview.name, interview.company || 'Unknown')}
                                >
                                  <Import className="h-4 w-4 mr-1" />
                                  Import as Problem
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No insights recorded for this interview.</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Customer Interviews Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Conduct customer interviews in the Market Research section to gather insights about customer problems.
                  </p>
                  <Button variant="outline" className="mx-auto">
                    Go to Customer Interviews
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* User Feedback Tab */}
        <TabsContent value="user-feedback">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Feedback</CardTitle>
              <CardDescription>Convert user feedback into actionable problems</CardDescription>
            </CardHeader>
            <CardContent>
              {userFeedback.length > 0 ? (
                <div className="space-y-4">
                  {userFeedback.map((feedback, feedbackIndex) => (
                    <Card key={feedbackIndex} className="bg-muted/40">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{feedback.content}</CardTitle>
                          <Badge 
                            variant={
                              feedback.sentiment === 'positive' ? 'success' : 
                              feedback.sentiment === 'negative' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {feedback.sentiment || 'Neutral'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm mb-3">{feedback.content}</p>
                        <div className="flex justify-end">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleImportInsight(
                              feedback.content, 
                              feedback.source || 'User Feedback', 
                              feedback.type || 'Anonymous'
                            )}
                          >
                            <ArrowRightLeft className="h-4 w-4 mr-1" />
                            Convert to Problem
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No User Feedback Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Collect user feedback in the Validation section to identify potential problems and pain points.
                  </p>
                  <Button variant="outline" className="mx-auto">
                    Go to User Feedback
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="bg-muted/20 p-4 rounded-md border border-muted">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <Plus className="h-4 w-4 mr-2 text-primary" />
          Progress Tip
        </h3>
        <p className="text-sm text-muted-foreground">
          Try to identify and validate at least 3-5 customer problems before moving on to solution definition. 
          Focus on problems that are significant for your customers and align with your business goals.
        </p>
      </div>
    </div>
  );
} 