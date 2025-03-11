import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
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
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

// Define the types for the component
export interface Problem {
  id: string;
  title: string;
  description: string;
  status: 'discovered' | 'validated' | 'critical';
  significance: number; // 1-100
  customerSegments: string[];
  evidenceCount: number;
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  problemId: string;
  effectiveness: number; // 1-100
  feasibility: number; // 1-100
  hypothesisStatement: string;
}

export interface Evidence {
  id: string;
  title: string;
  description: string;
  source: string;
  type: 'interview' | 'survey' | 'research' | 'observation' | 'test';
  status: 'unverified' | 'partial' | 'verified';
  relatedIds: string[]; // IDs of problems or solutions this evidence relates to
}

interface ProblemSolutionFitProps {
  problems?: Problem[];
  solutions?: Solution[];
  evidence?: Evidence[];
  onAddProblem?: (problem: Omit<Problem, 'id'>) => void;
  onUpdateProblem?: (id: string, updates: Partial<Problem>) => void;
  onDeleteProblem?: (id: string) => void;
  onAddSolution?: (solution: Omit<Solution, 'id'>) => void;
  onUpdateSolution?: (id: string, updates: Partial<Solution>) => void;
  onDeleteSolution?: (id: string) => void;
  onAddEvidence?: (evidence: Omit<Evidence, 'id'>) => void;
  onUpdateEvidence?: (id: string, updates: Partial<Evidence>) => void;
  onDeleteEvidence?: (id: string) => void;
}

export function ProblemSolutionFit({
  problems = [],
  solutions = [],
  evidence = [],
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
  const [activeProblemBoard, setActiveProblemBoard] = useState<'discovered' | 'validated' | 'critical'>('discovered');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ id: string, type: string } | null>(null);
  
  // Group problems by status
  const problemsByStatus = {
    discovered: problems.filter(p => p.status === 'discovered'),
    validated: problems.filter(p => p.status === 'validated'),
    critical: problems.filter(p => p.status === 'critical'),
  };
  
  // New problem form state
  const [newProblem, setNewProblem] = useState({
    title: '',
    description: '',
    significance: 50,
    customerSegments: [],
  });
  
  // New solution form state
  const [newSolution, setNewSolution] = useState({
    title: '',
    description: '',
    problemId: '',
    effectiveness: 50,
    feasibility: 70,
    hypothesisStatement: '',
  });
  
  // Helper to update problem status when dragged between columns
  const handleProblemStatusChange = (problemId: string, newStatus: 'discovered' | 'validated' | 'critical') => {
    if (onUpdateProblem) {
      onUpdateProblem(problemId, { status: newStatus });
      
      toast({
        title: "Problem status updated",
        description: `Problem moved to ${newStatus} status`,
      });
    }
  };
  
  // Handle drag start
  const handleDragStart = (id: string, type: string) => {
    setIsDragging(true);
    setDraggedItem({ id, type });
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
  };
  
  // Handle drop in problem status column
  const handleDrop = (status: 'discovered' | 'validated' | 'critical') => {
    if (draggedItem && draggedItem.type === 'problem') {
      handleProblemStatusChange(draggedItem.id, status);
    }
  };
  
  // Handle adding a new problem
  const handleAddNewProblem = () => {
    if (!newProblem.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for the problem",
        variant: "destructive",
      });
      return;
    }
    
    if (onAddProblem) {
      onAddProblem({
        title: newProblem.title,
        description: newProblem.description,
        status: 'discovered',
        significance: newProblem.significance,
        customerSegments: newProblem.customerSegments,
        evidenceCount: 0
      });
      
      // Reset form
      setNewProblem({
        title: '',
        description: '',
        significance: 50,
        customerSegments: [],
      });
      
      toast({
        title: "Problem added",
        description: "New problem has been added to the discovery board",
      });
    }
  };
  
  // Handle adding a new solution
  const handleAddNewSolution = () => {
    if (!newSolution.title || !newSolution.problemId) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a related problem",
        variant: "destructive",
      });
      return;
    }
    
    if (onAddSolution) {
      onAddSolution({
        title: newSolution.title,
        description: newSolution.description,
        problemId: newSolution.problemId,
        effectiveness: newSolution.effectiveness,
        feasibility: newSolution.feasibility,
        hypothesisStatement: newSolution.hypothesisStatement,
      });
      
      // Reset form
      setNewSolution({
        title: '',
        description: '',
        problemId: '',
        effectiveness: 50,
        feasibility: 70,
        hypothesisStatement: '',
      });
      
      toast({
        title: "Solution added",
        description: "New solution has been added to the solution list",
      });
    }
  };
  
  // Generate hypothesis statement from inputs
  const generateHypothesisStatement = (solution: string, problem: string, segment: string, mechanism: string) => {
    return `We believe that ${solution} will solve ${problem} for ${segment} by ${mechanism}.`;
  };
  
  // Get solution for a problem
  const getSolutionsForProblem = (problemId: string) => {
    return solutions.filter(s => s.problemId === problemId);
  };
  
  // Get evidence for an item
  const getEvidenceForItem = (itemId: string) => {
    return evidence.filter(e => e.relatedIds.includes(itemId));
  };
  
  // Render problem card
  const renderProblemCard = (problem: Problem) => {
    const relatedSolutions = getSolutionsForProblem(problem.id);
    const relatedEvidence = getEvidenceForItem(problem.id);
    
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
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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
                {problem.customerSegments.map((segment, index) => (
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
  };
  
  // Render the problem-solution matrix
  const renderProblemSolutionMatrix = () => {
    return (
      <div className="w-full bg-gray-50 p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Problem-Solution Matrix</h3>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4 mr-1" />
                Help
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Understanding the Matrix</h4>
                <p className="text-sm text-muted-foreground">
                  This matrix helps you visualize the relationship between problem significance and solution effectiveness.
                  Focus on high-significance problems with high-effectiveness solutions.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        
        <div className="relative h-80 border bg-white rounded-md">
          {/* Y-axis label */}
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-500 font-medium">
            Solution Effectiveness
          </div>
          
          {/* X-axis label */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-xs text-gray-500 font-medium">
            Problem Significance
          </div>
          
          {/* Quadrant labels */}
          <div className="absolute top-2 left-2 text-xs font-medium text-gray-500">Low Value</div>
          <div className="absolute top-2 right-2 text-xs font-medium text-gray-500">Potential Value</div>
          <div className="absolute bottom-2 left-2 text-xs font-medium text-gray-500">Consider Value</div>
          <div className="absolute bottom-2 right-2 text-xs font-medium text-gray-500">High Value</div>
          
          {/* Dividing lines */}
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-300"></div>
          <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-gray-300"></div>
          
          {/* Plot problems and solutions */}
          {problems.map(problem => {
            const problemSolutions = getSolutionsForProblem(problem.id);
            
            return (
              <React.Fragment key={problem.id}>
                {/* Problem dot */}
                <motion.div
                  className="absolute w-6 h-6 bg-blue-100 rounded-full border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-700 z-10"
                  style={{
                    left: `calc(${problem.significance}% - 12px)`,
                    top: `calc(${100 - 50}% - 12px)`, // Use 50 as placeholder for now
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  whileHover={{ scale: 1.1 }}
                >
                  P
                </motion.div>
                
                {/* Solution dots */}
                {problemSolutions.map(solution => (
                  <motion.div
                    key={solution.id}
                    className="absolute w-6 h-6 bg-green-100 rounded-full border-2 border-green-500 flex items-center justify-center text-xs font-bold text-green-700 z-20"
                    style={{
                      left: `calc(${problem.significance}% - 12px)`,
                      top: `calc(${100 - solution.effectiveness}% - 12px)`,
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    S
                  </motion.div>
                ))}
                
                {/* Connection lines between problem and solutions */}
                {problemSolutions.map(solution => (
                  <svg
                    key={`line-${problem.id}-${solution.id}`}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
                  >
                    <line
                      x1={`${problem.significance}%`}
                      y1={`${100 - 50}%`} // Use 50 as placeholder for now
                      x2={`${problem.significance}%`}
                      y2={`${100 - solution.effectiveness}%`}
                      stroke="#22c55e"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                  </svg>
                ))}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render solution hypothesis builder
  const renderSolutionHypothesisBuilder = () => {
    // State for hypothesis builder form
    const [hypothesisForm, setHypothesisForm] = useState({
      solution: '',
      problem: '',
      customerSegment: '',
      mechanism: '',
    });
    
    // Generate hypothesis statement
    const hypothesisStatement = useMemo(() => {
      if (!hypothesisForm.solution || !hypothesisForm.problem || !hypothesisForm.customerSegment || !hypothesisForm.mechanism) {
        return '';
      }
      
      return generateHypothesisStatement(
        hypothesisForm.solution,
        hypothesisForm.problem,
        hypothesisForm.customerSegment,
        hypothesisForm.mechanism
      );
    }, [hypothesisForm]);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-primary" />
            Solution Hypothesis Builder
          </CardTitle>
          <CardDescription>
            Create structured hypotheses to validate your solutions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="solution">Solution</Label>
                <Input
                  id="solution"
                  placeholder="e.g., a mobile app with offline capabilities"
                  value={hypothesisForm.solution}
                  onChange={(e) => setHypothesisForm({ ...hypothesisForm, solution: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="problem">Problem</Label>
                <Input
                  id="problem"
                  placeholder="e.g., the data access issues in remote areas"
                  value={hypothesisForm.problem}
                  onChange={(e) => setHypothesisForm({ ...hypothesisForm, problem: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="customerSegment">Customer Segment</Label>
                <Input
                  id="customerSegment"
                  placeholder="e.g., field researchers"
                  value={hypothesisForm.customerSegment}
                  onChange={(e) => setHypothesisForm({ ...hypothesisForm, customerSegment: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="mechanism">How It Works</Label>
                <Input
                  id="mechanism"
                  placeholder="e.g., providing data synchronization when connectivity returns"
                  value={hypothesisForm.mechanism}
                  onChange={(e) => setHypothesisForm({ ...hypothesisForm, mechanism: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex flex-col">
              <Label>Generated Hypothesis</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-md border flex-grow">
                {hypothesisStatement ? (
                  <p className="text-sm">{hypothesisStatement}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Fill in all fields to generate a hypothesis statement
                  </p>
                )}
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="verifiable">Is this statement verifiable?</Label>
                  <HoverCard>
                    <HoverCardTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">
                        A good hypothesis should be specific and testable. 
                        You should be able to design experiments to validate it.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="verifiable" />
                  <Label htmlFor="verifiable">Yes, this can be tested</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <Button onClick={() => {
              if (hypothesisStatement) {
                // Add solution with hypothesis
                if (onAddSolution) {
                  onAddSolution({
                    title: hypothesisForm.solution,
                    description: `Addresses: ${hypothesisForm.problem}`,
                    problemId: 'temp-id', // Would need to select actual problem ID
                    effectiveness: 70,
                    feasibility: 60,
                    hypothesisStatement,
                  });
                }
                
                // Reset form
                setHypothesisForm({
                  solution: '',
                  problem: '',
                  customerSegment: '',
                  mechanism: '',
                });
                
                toast({
                  title: "Hypothesis created",
                  description: "Your solution hypothesis has been added",
                });
              } else {
                toast({
                  title: "Incomplete hypothesis",
                  description: "Please complete all fields to create a hypothesis",
                  variant: "destructive",
                });
              }
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Solution with Hypothesis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render evidence collector
  const renderEvidenceCollector = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClipboardCheck className="h-5 w-5 mr-2 text-primary" />
            Validation Evidence Collector
          </CardTitle>
          <CardDescription>
            Gather and organize evidence to validate your problems and solutions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Validation Progress</h3>
                <Badge variant="outline">{Math.round((evidence.length / Math.max(problems.length + solutions.length, 1)) * 100)}%</Badge>
              </div>
              <Progress value={(evidence.length / Math.max(problems.length + solutions.length, 1)) * 100} />
              <p className="text-xs text-muted-foreground mt-2">
                {evidence.length} pieces of evidence collected for {problems.length} problems and {solutions.length} solutions
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evidence.slice(0, 3).map(item => (
                <Card key={item.id} className="bg-white">
                  <CardHeader className="p-3 pb-0">
                    <div className="flex items-start justify-between">
                      <Badge variant={
                        item.status === 'verified' ? 'default' : 
                        item.status === 'partial' ? 'secondary' : 
                        'outline'
                      }>
                        {item.status}
                      </Badge>
                      <Badge variant="outline">{item.type}</Badge>
                    </div>
                    <CardTitle className="text-sm mt-2">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <p className="text-xs text-primary">Source: {item.source}</p>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="bg-gray-50 border-dashed flex flex-col items-center justify-center p-6">
                <PlusCircle className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-muted-foreground text-center">Add New Evidence</p>
              </Card>
            </div>
            
            <div className="flex justify-end">
              <Button variant="outline">
                View All Evidence
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
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
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Critical <Badge variant="outline" className="ml-2">{problemsByStatus.critical.length}</Badge>
                </TabsTrigger>
              </TabsList>
              
              <Button variant="outline" size="sm" onClick={() => {
                // Open add problem form
              }}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Problem
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Problem columns */}
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
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Problem-Solution Matrix */}
      {renderProblemSolutionMatrix()}
      
      {/* Solution Hypothesis Builder */}
      {renderSolutionHypothesisBuilder()}
      
      {/* Validation Evidence Collector */}
      {renderEvidenceCollector()}
    </div>
  );
} 