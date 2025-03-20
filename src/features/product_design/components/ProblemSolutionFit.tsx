import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { 
  PlusCircle, 
  ArrowRight, 
  Trash2, 
  Edit, 
  Check, 
  Info, 
  Lightbulb, 
  Clipboard, 
  Puzzle, 
  Search, 
  ClipboardCheck, 
  MoveHorizontal,
  AlertCircle as AlertCircleIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { ProductProblem, ProductSolution, ProductEvidence, ProductEvidenceLink, Insert, Update } from '@/store/types';
import { SolutionHypothesisBuilder } from './SolutionHypothesisBuilder';
import { ProblemSolutionMatrix } from './ProblemSolutionMatrix';
import { EvidenceCollector } from './EvidenceCollector';

// Simple spinner component as a fallback
const Spinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  return <Loader2 className={`${sizeClass} animate-spin`} />;
};

// Define the interface for component props
interface ProblemSolutionFitProps {
  // Data props
  problems: ProductProblem[];
  solutions: ProductSolution[];
  evidence: ProductEvidence[];
  evidenceLinks?: ProductEvidenceLink[];
  projectId?: string;
  isLoading?: boolean;
  error?: Error | null;
  
  // Handler functions
  onAddProblem: (problem: Insert<'product_problems'>) => Promise<ProductProblem | null>;
  onUpdateProblem: (params: { id: string; data: Update<'product_problems'> }) => Promise<ProductProblem | null>;
  onDeleteProblem: (id: string) => Promise<boolean>;
  onAddSolution: (solution: Insert<'product_solutions'>) => Promise<ProductSolution | null>;
  onUpdateSolution: (params: { id: string; data: Update<'product_solutions'> }) => Promise<ProductSolution | null>;
  onDeleteSolution: (id: string) => Promise<boolean>;
  onAddEvidence: (evidence: Insert<'product_evidence'>) => Promise<ProductEvidence | null>;
  onUpdateEvidence: (params: { id: string; data: Update<'product_evidence'> }) => Promise<ProductEvidence | null>;
  onDeleteEvidence: (id: string) => Promise<boolean>;
}

export function ProblemSolutionFit({
  problems = [],
  solutions = [],
  evidence = [],
  evidenceLinks = [],
  projectId,
  isLoading = false,
  error = null,
  onAddProblem,
  onUpdateProblem,
  onDeleteProblem,
  onAddSolution,
  onUpdateSolution,
  onDeleteSolution,
  onAddEvidence,
  onUpdateEvidence,
  onDeleteEvidence
}: ProblemSolutionFitProps) {
  const { toast } = useToast();
  
  // Add mounted ref to prevent updates after unmounting
  const isMounted = useRef(true);
  
  // Set up cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // UI-specific state (not stored in database)
  const [activeProblemBoard, setActiveProblemBoard] = useState<'discovered' | 'validated' | 'critical'>('discovered');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ id: string, type: string } | null>(null);
  
  // Form state for problem
  const [newProblem, setNewProblem] = useState<Partial<Insert<'product_problems'>>>({
    title: '',
    description: '',
    significance: 50,
    customer_segments: [],
    status: 'discovered',
    project_id: projectId || undefined
  });
  
  // Derive problems by status - memoized
  const problemsByStatus = useMemo(() => ({
    discovered: problems.filter(p => p.status === 'discovered'),
    validated: problems.filter(p => p.status === 'validated'),
    critical: problems.filter(p => p.status === 'critical'),
  }), [problems]);
  
  // Helper to update problem status when dragged between columns
  const handleProblemStatusChange = useCallback(async (problemId: string, newStatus: 'discovered' | 'validated' | 'critical') => {
    if (!isMounted.current) return;
    
    try {
      await onUpdateProblem({ 
        id: problemId, 
        data: { status: newStatus } 
      });
      
      toast({
        title: "Problem status updated",
        description: `Problem moved to ${newStatus} status`,
      });
    } catch (err) {
      toast({
        title: "Error updating problem",
        description: "An error occurred while updating the problem",
        variant: "destructive",
      });
    }
  }, [onUpdateProblem, toast]);
  
  // Handle drag start
  const handleDragStart = useCallback((id: string, type: string) => {
    if (!isMounted.current) return;
    
    setIsDragging(true);
    setDraggedItem({ id, type });
  }, []);
  
  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isMounted.current) return;
    
    setIsDragging(false);
    setDraggedItem(null);
  }, []);
  
  // Handle drop in problem status column
  const handleDrop = useCallback((status: 'discovered' | 'validated' | 'critical') => {
    if (!isMounted.current) return;
    
    if (draggedItem && draggedItem.type === 'problem') {
      handleProblemStatusChange(draggedItem.id, status);
    }
  }, [draggedItem, handleProblemStatusChange]);
  
  // Handle adding a new problem
  const handleAddNewProblem = useCallback(async () => {
    if (!isMounted.current) return;
    
    if (!newProblem.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for the problem",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await onAddProblem(newProblem as Insert<'product_problems'>);
      
      // Reset form
      setNewProblem({
        title: '',
        description: '',
        status: 'discovered',
        significance: 50,
        customer_segments: [],
        project_id: projectId || undefined
      });
      
      toast({
        title: "Problem added",
        description: "New problem has been added to the discovery board",
      });
    } catch (err) {
      toast({
        title: "Error adding problem",
        description: "An error occurred while adding the problem",
        variant: "destructive",
      });
    }
  }, [newProblem, onAddProblem, toast, projectId]);
  
  // Handle deleting a problem
  const handleDeleteProblem = useCallback(async (id: string) => {
    if (!isMounted.current) return;
    
    try {
      await onDeleteProblem(id);
      
      toast({
        title: "Problem deleted",
        description: "The problem has been removed",
      });
    } catch (err) {
      toast({
        title: "Error deleting problem",
        description: "An error occurred while deleting the problem",
        variant: "destructive",
      });
    }
  }, [onDeleteProblem, toast]);
  
  // Render problem card
  const renderProblemCard = useCallback((problem: ProductProblem) => {
    if (!isMounted.current) return null;
    
    const relatedSolutions = solutions.filter(s => s.problem_id === problem.id);
    const relatedEvidence = evidence.filter(e => {
      // Find matching evidence links
      const links = evidenceLinks.filter(link => 
        link.entity_id === problem.id && 
        link.entity_type === 'problem'
      );
      return links.length > 0;
    });
    const significance = problem.significance || 0; // Default to 0 if null
    
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
              style={{ borderLeftColor: significance > 75 ? '#ef4444' : significance > 50 ? '#f59e0b' : significance > 25 ? '#3b82f6' : '#6b7280' }}>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base font-medium">{problem.title}</CardTitle>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => {
                    // Add edit problem modal or inline edit
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-destructive"
                  onClick={() => handleDeleteProblem(problem.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm text-muted-foreground mb-2">{problem.description}</p>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Significance</span>
              <Badge variant={significance > 75 ? "destructive" : significance > 50 ? "default" : "secondary"}>
                {significance}/100
              </Badge>
            </div>
            
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-1">
                {relatedSolutions.length > 0 && (
                  <Badge variant="outline" className="flex items-center">
                    <Puzzle className="h-3 w-3 mr-1" />
                    {relatedSolutions.length}
                  </Badge>
                )}
                
                {relatedEvidence.length > 0 && (
                  <Badge variant="outline" className="flex items-center">
                    <ClipboardCheck className="h-3 w-3 mr-1" />
                    {relatedEvidence.length}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap space-x-1">
                {problem.customer_segments && problem.customer_segments.map((segment: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {segment}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [solutions, evidence, evidenceLinks, handleDragStart, handleDragEnd, handleDeleteProblem, isMounted]);
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Loading problem-solution data...</p>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || "An error occurred while loading data. Please try again."}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Memoize child component props to prevent unnecessary re-renders
  const problemSolutionMatrixProps = useMemo(() => ({
    problems,
    solutions
  }), [problems, solutions]);
  
  // Create a stable addSolution callback with mounted check
  const stableAddSolution = useCallback((solution: Insert<'product_solutions'>) => {
    if (!isMounted.current) return Promise.resolve(null);
    
    return onAddSolution({
      ...solution,
      project_id: projectId || '',
    });
  }, [onAddSolution, projectId, isMounted]);
  
  const solutionHypothesisBuilderProps = useMemo(() => ({
    problems,
    projectId,
    onAddSolution: stableAddSolution
  }), [problems, projectId, stableAddSolution]);
  
  // Create a stable addEvidence callback with mounted check
  const stableAddEvidence = useCallback(async (evidenceData: Partial<ProductEvidence>, links: Partial<ProductEvidenceLink>[]) => {
    if (!isMounted.current || !onAddEvidence) return;
    
    try {
      await onAddEvidence({
        ...evidenceData,
        project_id: projectId || ''
      } as Insert<'product_evidence'>);
      // In a real implementation you would also need to link the evidence
    } catch (err) {
      console.error("Error adding evidence:", err);
    }
  }, [onAddEvidence, projectId, isMounted]);
  
  // Create a stable deleteEvidence callback with mounted check
  const stableDeleteEvidence = useCallback(async (id: string) => {
    if (!isMounted.current || !onDeleteEvidence) return;
    
    try {
      await onDeleteEvidence(id);
    } catch (err) {
      console.error("Error deleting evidence:", err);
    }
  }, [onDeleteEvidence, isMounted]);
  
  const evidenceCollectorProps = useMemo(() => ({
    evidence,
    problems,
    solutions,
    onAddEvidence: stableAddEvidence,
    onDeleteEvidence: stableDeleteEvidence
  }), [evidence, problems, solutions, stableAddEvidence, stableDeleteEvidence]);

  return (
    <div className="space-y-8">
      {/* Problem Discovery Board */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clipboard className="h-5 w-5 mr-2 text-primary" />
            Problem Discovery Board
          </CardTitle>
          <CardDescription>
            Discover, validate, and prioritize customer problems
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Problem Board tabs */}
          <Tabs defaultValue="discovered" value={activeProblemBoard} onValueChange={(v: any) => setActiveProblemBoard(v)}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="discovered" className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Discovered <Badge variant="outline" className="ml-2">{problemsByStatus.discovered.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="validated" className="flex items-center">
                  <Check className="h-4 w-4 mr-2" />
                  Validated <Badge variant="outline" className="ml-2">{problemsByStatus.validated.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="critical" className="flex items-center">
                  <AlertCircleIcon className="h-4 w-4 mr-2" />
                  Critical <Badge variant="outline" className="ml-2">{problemsByStatus.critical.length}</Badge>
                </TabsTrigger>
              </TabsList>
              
              <Button variant="outline" size="sm" onClick={() => {
                // Modal for adding problem would be added here in a real implementation
                handleAddNewProblem();
              }}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Problem
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Discovered Problems Column */}
              <TabsContent value="discovered" className="m-0">
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
              </TabsContent>
              
              {/* Validated Problems Column */}
              <TabsContent value="validated" className="m-0">
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
              </TabsContent>
              
              {/* Critical Problems Column */}
              <TabsContent value="critical" className="m-0">
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
                      <AlertCircleIcon className="h-4 w-4 mr-2 text-red-500" />
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
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Problem-Solution Matrix */}
      <ProblemSolutionMatrix 
        {...problemSolutionMatrixProps}
      />
      
      {/* Solution Hypothesis Builder */}
      <SolutionHypothesisBuilder 
        {...solutionHypothesisBuilderProps}
      />
      
      {/* Evidence Collector */}
      <EvidenceCollector 
        {...evidenceCollectorProps}
      />
    </div>
  );
} 