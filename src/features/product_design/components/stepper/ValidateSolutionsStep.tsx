import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { 
  Lightbulb, 
  Target, 
  ClipboardCheck, 
  Info, 
  CheckCircle, 
  XCircle, 
  Plus,
  Link2,
  ExternalLink,
  ArrowDown,
  FlaskConical
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useProjectStore } from "@/store/project-store";
import { useProductStepper } from '@/context/product-stepper-context';
import { useValidation } from '@/hooks/features/useValidation';
import { useToast } from '@/components/ui/use-toast';
import type { Problem, Solution, Evidence } from '@/context/product-stepper-context';

// Memoized select components to prevent unnecessary re-renders
const MemoizedProblemSelect = React.memo(({
  value,
  onChange,
  problems
}: {
  value: string;
  onChange: (value: string) => void;
  problems: Problem[];
}) => {
  return (
    <Select 
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger id="problem-select">
        <SelectValue placeholder="Select a problem" />
      </SelectTrigger>
      <SelectContent>
        {problems.filter(p => p.status === 'critical').map(problem => (
          <SelectItem key={problem.id} value={problem.id}>
            {problem.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

MemoizedProblemSelect.displayName = "MemoizedProblemSelect";

const MemoizedEvidenceTypeSelect = React.memo(({
  value,
  onChange
}: {
  value: 'interview' | 'survey' | 'research' | 'observation' | 'test';
  onChange: (value: 'interview' | 'survey' | 'research' | 'observation' | 'test') => void;
}) => {
  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger id="evidence-type">
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="interview">Customer Interview</SelectItem>
        <SelectItem value="survey">Survey</SelectItem>
        <SelectItem value="research">Market Research</SelectItem>
        <SelectItem value="observation">User Observation</SelectItem>
        <SelectItem value="test">Test or Experiment</SelectItem>
      </SelectContent>
    </Select>
  );
});

MemoizedEvidenceTypeSelect.displayName = "MemoizedEvidenceTypeSelect";

const MemoizedEvidenceStatusSelect = React.memo(({
  value,
  onChange
}: {
  value: 'unverified' | 'partial' | 'verified';
  onChange: (value: 'unverified' | 'partial' | 'verified') => void;
}) => {
  return (
    <Select
      value={value}
      onValueChange={onChange}
    >
      <SelectTrigger id="evidence-status">
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unverified">Unverified</SelectItem>
        <SelectItem value="partial">Partially Verified</SelectItem>
        <SelectItem value="verified">Verified</SelectItem>
      </SelectContent>
    </Select>
  );
});

MemoizedEvidenceStatusSelect.displayName = "MemoizedEvidenceStatusSelect";

// Add a memoized slider component to prevent unnecessary re-renders
const MemoizedSlider = React.memo(({
  id,
  value,
  min,
  max,
  step,
  onValueChange
}: {
  id: string;
  value: number[];
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number[]) => void;
}) => {
  return (
    <Slider
      id={id}
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={onValueChange}
    />
  );
});

MemoizedSlider.displayName = "MemoizedSlider";

interface ValidateSolutionsStepProps {
  // Optional props for overriding behavior if needed
  onAddSolution?: (solution: Omit<Solution, 'id'>) => void;
  onAddEvidence?: (evidence: Omit<Evidence, 'id'>) => void;
  onLinkToValidation?: (solutionId: string, hypothesisData: any) => void;
}

export function ValidateSolutionsStep({
  onAddSolution,
  onAddEvidence,
  onLinkToValidation
}: ValidateSolutionsStepProps) {
  const { toast } = useToast();
  const { currentData } = useProjectStore();
  const projectId = currentData.project?.id;
  
  const [activeTab, setActiveTab] = useState('problem-solution-matrix');
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [newSolution, setNewSolution] = useState({
    title: '',
    description: '',
    problemId: '',
    effectiveness: 50,
    feasibility: 50,
    hypothesisStatement: ''
  });
  const [newEvidence, setNewEvidence] = useState({
    title: '',
    description: '',
    source: '',
    type: 'interview' as 'interview' | 'survey' | 'research' | 'observation' | 'test',
    status: 'unverified' as 'unverified' | 'partial' | 'verified',
    relatedIds: [] as string[]
  });

  // Use hooks to get data from the database
  const {
    problems,
    solutions,
    evidence,
    addSolution: addSolutionToStore,
    addEvidence: addEvidenceToStore,
    isLoading
  } = useProductStepper();
  
  const {
    data: validationData,
    isLoading: isValidationLoading
  } = useValidation(projectId);

  // Memoize validation hypotheses to prevent unnecessary re-renders
  const validationHypotheses = useMemo(() => validationData?.hypotheses || [], [validationData?.hypotheses]);

  // Function to get solutions for a specific problem - memoize to prevent recalculation
  const getSolutionsForProblem = useCallback((problemId: string) => {
    return solutions.filter(solution => solution.problemId === problemId);
  }, [solutions]);
  
  // Function to get evidence for a specific item - memoize to prevent recalculation
  const getEvidenceForItem = useCallback((itemId: string) => {
    return evidence.filter(e => e.relatedIds.includes(itemId));
  }, [evidence]);
  
  // Set the first problem as selected by default when problems are loaded
  useEffect(() => {
    if (problems.length > 0 && !selectedProblem) {
      setSelectedProblem(problems[0].id);
    }
  }, [problems, selectedProblem]);

  // Memoize the selected problem data
  const selectedProblemData = useMemo(() => {
    return selectedProblem ? problems.find(p => p.id === selectedProblem) : null;
  }, [selectedProblem, problems]);

  // Memoize solutions for selected problem
  const solutionsForSelectedProblem = useMemo(() => {
    return selectedProblem ? getSolutionsForProblem(selectedProblem) : [];
  }, [selectedProblem, getSolutionsForProblem]);

  // Function to generate a hypothesis statement - memoize to prevent recreation
  const generateHypothesisStatement = useCallback((solution: string, problem: string, segment: string, mechanism: string) => {
    return `We believe that ${solution} will address ${problem} for ${segment} ${mechanism ? `through ${mechanism}` : ''}.`;
  }, []);

  // Memoize the slider values to prevent unnecessary re-renders
  const effectivenessValue = useMemo(() => {
    return [newSolution.effectiveness];
  }, [newSolution.effectiveness]);

  const feasibilityValue = useMemo(() => {
    return [newSolution.feasibility];
  }, [newSolution.feasibility]);

  // Memoize the hypothesis statement
  const autoGeneratedHypothesisStatement = useMemo(() => {
    if (!newSolution.problemId || !newSolution.title) return '';
    
    const problemObj = problems.find(p => p.id === newSolution.problemId);
    if (!problemObj) return '';
    
    return generateHypothesisStatement(
      newSolution.title,
      problemObj.title,
      problemObj.customerSegments[0] || 'customers',
      ''
    );
  }, [newSolution.problemId, newSolution.title, problems, generateHypothesisStatement]);

  // Function to add a new solution - use useCallback to maintain reference stability
  const handleAddSolution = useCallback(() => {
    if (!newSolution.title || !newSolution.problemId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in the required fields',
        variant: 'destructive'
      });
      return;
    }

    const solutionToAdd = {
      title: newSolution.title,
      description: newSolution.description,
      problemId: newSolution.problemId,
      effectiveness: newSolution.effectiveness,
      feasibility: newSolution.feasibility,
      hypothesisStatement: newSolution.hypothesisStatement || autoGeneratedHypothesisStatement
    };
    
    if (onAddSolution) {
      onAddSolution(solutionToAdd);
    } else {
      addSolutionToStore(solutionToAdd)
        .then(() => {
          toast({
            title: 'Solution added',
            description: 'New solution has been added successfully',
          });
          // Reset form
          setNewSolution({
            title: '',
            description: '',
            problemId: newSolution.problemId, // Keep the selected problem
            effectiveness: 50,
            feasibility: 50,
            hypothesisStatement: ''
          });
        })
        .catch(error => {
          console.error('Error adding solution:', error);
          toast({
            title: 'Error adding solution',
            description: 'An error occurred while adding the solution',
            variant: 'destructive',
          });
        });
    }
  }, [newSolution, autoGeneratedHypothesisStatement, onAddSolution, addSolutionToStore, toast]);

  // Function to link a solution to a validation hypothesis - use useCallback
  const handleLinkToValidation = useCallback((solutionId: string, hypothesisStatement: string) => {
    if (onLinkToValidation) {
      onLinkToValidation(solutionId, {
        statement: hypothesisStatement,
        source: 'product_solution',
        source_id: solutionId
      });
      
      toast({
        title: 'Linked to validation',
        description: 'Solution has been linked to the validation system',
      });
    }
  }, [onLinkToValidation, toast]);

  // Function to add new evidence - use useCallback
  const handleAddEvidence = useCallback(() => {
    if (!newEvidence.title || !newEvidence.source || newEvidence.relatedIds.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in the required fields and select related items',
        variant: 'destructive'
      });
      return;
    }

    const evidenceToAdd = {
      title: newEvidence.title,
      description: newEvidence.description,
      source: newEvidence.source,
      type: newEvidence.type,
      status: newEvidence.status,
      relatedIds: newEvidence.relatedIds
    };

    if (onAddEvidence) {
      onAddEvidence(evidenceToAdd);
    } else {
      addEvidenceToStore(evidenceToAdd)
        .then(() => {
          toast({
            title: 'Evidence added',
            description: 'New evidence has been added successfully',
          });
          // Reset form but keep the selected related items
          setNewEvidence({
            title: '',
            description: '',
            source: '',
            type: 'interview' as const,
            status: 'unverified' as const,
            relatedIds: newEvidence.relatedIds
          });
        })
        .catch(error => {
          console.error('Error adding evidence:', error);
          toast({
            title: 'Error adding evidence',
            description: 'An error occurred while adding the evidence',
            variant: 'destructive',
          });
        });
    }
  }, [newEvidence, onAddEvidence, addEvidenceToStore, toast]);

  // Handler for input changes - use useCallback
  const handleSolutionInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSolution(prev => ({ ...prev, [name]: value }));
  }, []);

  // Replace the generic slider handler with specific handlers for each slider
  const handleEffectivenessChange = useCallback((value: number[]) => {
    setNewSolution(prev => {
      // Only update if the value has actually changed
      if (prev.effectiveness === value[0]) return prev;
      return { ...prev, effectiveness: value[0] };
    });
  }, []);

  const handleFeasibilityChange = useCallback((value: number[]) => {
    setNewSolution(prev => {
      // Only update if the value has actually changed
      if (prev.feasibility === value[0]) return prev;
      return { ...prev, feasibility: value[0] };
    });
  }, []);

  const handleEvidenceInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvidence(prev => ({ ...prev, [name]: value }));
  }, []);

  // Add these handlers to replace the generic handleEvidenceSelectChange
  const handleEvidenceTypeChange = useCallback((value: 'interview' | 'survey' | 'research' | 'observation' | 'test') => {
    setNewEvidence(prev => ({
      ...prev,
      type: value
    }));
  }, []);

  const handleEvidenceStatusChange = useCallback((value: 'unverified' | 'partial' | 'verified') => {
    setNewEvidence(prev => ({
      ...prev,
      status: value
    }));
  }, []);

  // Handle selecting related items for evidence
  const handleRelatedItemsChange = useCallback((itemId: string, isSelected: boolean) => {
    setNewEvidence(prev => {
      const updatedRelatedIds = isSelected
        ? [...prev.relatedIds, itemId]
        : prev.relatedIds.filter(id => id !== itemId);
      
      return {
        ...prev,
        relatedIds: updatedRelatedIds
      };
    });
  }, []);

  // Add this handler function near the other handlers
  const handleProblemSelectChange = useCallback((value: string) => {
    setNewSolution(prev => ({
      ...prev,
      problemId: value
    }));
  }, []);

  // Show loading state if data is loading
  if (isLoading || isValidationLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading data...</p>
      </div>
    );
  }

  // Component to render the problem-solution matrix
  const renderProblemSolutionMatrix = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problems Column */}
          <div>
            <h3 className="text-lg font-medium mb-4">Critical Problems</h3>
            <div className="space-y-4">
              {problems.filter(p => p.status === 'critical').length > 0 ? (
                problems
                  .filter(p => p.status === 'critical')
                  .map(problem => (
                    <Card 
                      key={problem.id} 
                      className={`border-l-4 cursor-pointer transition ${
                        selectedProblem === problem.id ? 'ring-2 ring-primary/50' : ''
                      }`}
                      style={{ borderLeftColor: problem.significance > 75 ? '#ef4444' : problem.significance > 50 ? '#f59e0b' : '#3b82f6' }}
                      onClick={() => setSelectedProblem(problem.id)}
                    >
                      <CardHeader className="p-4 pb-1">
                        <CardTitle className="text-base">{problem.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-1">
                        <p className="text-sm text-muted-foreground mb-2">{problem.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {problem.customerSegments.map((segment, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {segment}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <Card className="bg-muted/30">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-2">No critical problems found</p>
                    <p className="text-xs text-muted-foreground">Go back to the previous step to identify and prioritize critical problems</p>
                  </CardContent>
                </Card>
              )}
          </div>
          </div>
          
          {/* Solutions Column */}
          <div>
            {selectedProblem ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Solutions</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setNewSolution(prev => ({
                        ...prev,
                        problemId: selectedProblem
                      }));
                      setActiveTab('solution-hypothesis-builder');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Solution
                  </Button>
        </div>
                <div className="space-y-4">
                  {getSolutionsForProblem(selectedProblem).length > 0 ? (
                    getSolutionsForProblem(selectedProblem).map(solution => {
                      const evidenceItems = getEvidenceForItem(solution.id);
                      const evidenceVerified = evidenceItems.filter(e => e.status === 'verified').length;
                      const totalEvidence = evidenceItems.length;
                      
                      return (
                        <Card key={solution.id} className="border-l-4 border-l-blue-500">
                          <CardHeader className="p-4 pb-1">
                            <div className="flex justify-between">
                              <CardTitle className="text-base">{solution.title}</CardTitle>
                              <HoverCard>
                                <HoverCardTrigger>
                                  <div className="flex items-center gap-1 cursor-help">
                                    <Badge variant={evidenceVerified > 0 ? "success" : "outline"}>
                                      {totalEvidence} evidence
                      </Badge>
                    </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <h4 className="text-sm font-medium mb-2">Evidence Status</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                      <span>Verified:</span>
                                      <span className="font-medium">{evidenceItems.filter(e => e.status === 'verified').length}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span>Partially Verified:</span>
                                      <span className="font-medium">{evidenceItems.filter(e => e.status === 'partial').length}</span>
                      </div>
                                    <div className="flex justify-between text-xs">
                                      <span>Unverified:</span>
                                      <span className="font-medium">{evidenceItems.filter(e => e.status === 'unverified').length}</span>
                    </div>
                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-1">
                            <p className="text-sm text-muted-foreground mb-3">{solution.description}</p>
                            
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Effectiveness</span>
                                  <span>{solution.effectiveness}/100</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-600 h-1.5 rounded-full" 
                                    style={{ width: `${solution.effectiveness}%` }}
                                  ></div>
                  </div>
              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Feasibility</span>
                                  <span>{solution.feasibility}/100</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-green-600 h-1.5 rounded-full" 
                                    style={{ width: `${solution.feasibility}%` }}
                                  ></div>
                        </div>
                        </div>
                      </div>
                          </CardContent>
                          <CardFooter className="flex justify-between p-3 pt-1">
                            <p className="text-xs text-muted-foreground italic">{solution.hypothesisStatement}</p>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleLinkToValidation(solution.id, solution.hypothesisStatement)}
                            >
                              <Link2 className="h-3.5 w-3.5 mr-1" />
                              Create Experiment
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })
                  ) : (
                    <Card className="bg-muted/30">
                      <CardContent className="p-6 text-center">
                        <p className="text-muted-foreground mb-2">No solutions yet</p>
                        <p className="text-xs text-muted-foreground mb-4">Create solutions to address the selected problem</p>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setNewSolution(prev => ({
                              ...prev,
                              problemId: selectedProblem
                            }));
                            setActiveTab('solution-hypothesis-builder');
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add First Solution
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                      </div>
              </>
            ) : (
              <Card className="h-full bg-muted/30">
                <CardContent className="p-6 flex h-full items-center justify-center">
                  <div className="text-center">
                    <ArrowDown className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground mb-2">Select a problem to see or add solutions</p>
                  </div>
                </CardContent>
              </Card>
                )}
              </div>
        </div>
      </div>
    );
  };
  
  // Component to render the solution hypothesis builder
  const renderSolutionHypothesisBuilder = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Solution Hypothesis Builder</CardTitle>
          <CardDescription>Create solutions for your critical problems and define hypothesis statements to test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="problem-select">Problem to solve <span className="text-red-500">*</span></Label>
                <MemoizedProblemSelect
                  value={newSolution.problemId}
                  onChange={handleProblemSelectChange}
                  problems={problems}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="solution-title">Solution Title <span className="text-red-500">*</span></Label>
                <Input
                  id="solution-title"
                  placeholder="Brief description of your solution"
                  value={newSolution.title}
                  onChange={handleSolutionInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="solution-description">Description</Label>
                <Textarea
                  id="solution-description"
                  placeholder="Explain how your solution works"
                  rows={3}
                  value={newSolution.description}
                  onChange={handleSolutionInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="effectiveness-slider">Effectiveness ({newSolution.effectiveness})</Label>
                  <HoverCard>
                    <HoverCardTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <h4 className="text-sm font-medium mb-2">About Effectiveness</h4>
                      <p className="text-xs text-muted-foreground">
                        Rate how well this solution addresses the problem. Consider the impact it will have on users and how completely it solves their pain points.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <MemoizedSlider
                  id="effectiveness-slider"
                  value={effectivenessValue}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={handleEffectivenessChange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="feasibility-slider">Feasibility ({newSolution.feasibility})</Label>
                  <HoverCard>
                    <HoverCardTrigger>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <h4 className="text-sm font-medium mb-2">About Feasibility</h4>
                      <p className="text-xs text-muted-foreground">
                        Rate how feasible this solution is to implement. Consider technical complexity, resource requirements, and timeline constraints.
                      </p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <MemoizedSlider
                  id="feasibility-slider"
                  value={feasibilityValue}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={handleFeasibilityChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hypothesis-statement">Hypothesis Statement</Label>
                <Textarea
                  id="hypothesis-statement"
                  placeholder="We believe that [solution] will address [problem] for [customer segment] through [mechanism]."
                  rows={3}
                  name="hypothesisStatement"
                  value={newSolution.hypothesisStatement || autoGeneratedHypothesisStatement}
                  onChange={handleSolutionInputChange}
                />
                <p className="text-xs text-muted-foreground">
                  This statement will be used to create experiments to validate your solution
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setActiveTab('problem-solution-matrix')}
          >
            Cancel
          </Button>
          <Button onClick={handleAddSolution}>
            Add Solution
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  // Component to render the evidence collector
  const renderEvidenceCollector = () => {
    const allItems = [
      ...problems.map(p => ({ id: p.id, title: p.title, type: 'problem' })),
      ...solutions.map(s => ({ id: s.id, title: s.title, type: 'solution' }))
    ];
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evidence Collector</CardTitle>
          <CardDescription>Add evidence to support or invalidate your problems and solutions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="evidence-title">Evidence Title <span className="text-red-500">*</span></Label>
                <Input
                  id="evidence-title"
                  placeholder="Brief description of the evidence"
                  value={newEvidence.title}
                  onChange={handleEvidenceInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="evidence-description">Description</Label>
                <Textarea
                  id="evidence-description"
                  placeholder="Detailed explanation of the evidence and its implications"
                  rows={3}
                  value={newEvidence.description}
                  onChange={handleEvidenceInputChange}
                />
                    </div>
              
              <div className="space-y-2">
                <Label htmlFor="evidence-source">Source <span className="text-red-500">*</span></Label>
                <Input
                  id="evidence-source"
                  placeholder="Where did this evidence come from?"
                  value={newEvidence.source}
                  onChange={handleEvidenceInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="evidence-type">Evidence Type</Label>
                <MemoizedEvidenceTypeSelect
                  value={newEvidence.type}
                  onChange={handleEvidenceTypeChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="evidence-status">Status</Label>
                <MemoizedEvidenceStatusSelect
                  value={newEvidence.status}
                  onChange={handleEvidenceStatusChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Related Items <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1 border rounded-md">
                  {allItems.map(item => (
                    <div 
                      key={item.id} 
                      className="flex items-center space-x-2 p-2 border rounded-md text-sm"
                    >
                      <input
                        type="checkbox"
                        id={`related-${item.id}`}
                        checked={newEvidence.relatedIds.includes(item.id)}
                        onChange={(e) => handleRelatedItemsChange(item.id, e.target.checked)}
                      />
                      <label htmlFor={`related-${item.id}`} className="cursor-pointer">
                        <Badge variant={item.type === 'problem' ? 'outline' : 'secondary'} className="mr-1 text-xs">
                          {item.type}
                        </Badge>
                        {item.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setActiveTab('problem-solution-matrix')}
          >
            Cancel
          </Button>
          <Button onClick={handleAddEvidence}>
            Add Evidence
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  // Component to render experiment suggestions
  const renderExperimentSuggestions = () => {
    const solutionsWithNoExperiments = solutions.filter(
      solution => !validationHypotheses.some(h => 
        h.entity_type === 'product_solution' && h.entity_id === solution.id
      )
    );
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Experiment Suggestions</CardTitle>
          <CardDescription>Convert your solution hypotheses into experiments to validate them</CardDescription>
        </CardHeader>
        <CardContent>
          {solutionsWithNoExperiments.length > 0 ? (
            <div className="space-y-4">
              {solutionsWithNoExperiments.map(solution => {
                const problem = problems.find(p => p.id === solution.problemId);
                
                return (
                  <Card key={solution.id} className="bg-muted/20">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                        <CardTitle className="text-base">{solution.title}</CardTitle>
                        <Badge variant="outline">Not Tested</Badge>
                      </div>
                      <CardDescription>
                        {problem ? `For problem: ${problem.title}` : 'Unknown problem'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm italic mb-4">{solution.hypothesisStatement}</p>
                      
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-3 rounded-md">
                          <h4 className="text-sm font-medium flex items-center mb-2">
                            <FlaskConical className="h-4 w-4 mr-1 text-blue-500" />
                            Suggested Experiment
                        </h4>
                          <p className="text-sm mb-2">
                            {solution.effectiveness > 70
                              ? 'Customer Interviews/Usability Testing'
                              : solution.effectiveness > 40
                                ? 'Prototype Testing'
                                : 'Problem Validation'
                            }
                          </p>
                        <p className="text-xs text-muted-foreground">
                            {solution.effectiveness > 70
                              ? 'Show a prototype to potential users and gather feedback on usability and effectiveness.'
                              : solution.effectiveness > 40
                                ? 'Create a simple prototype and test it with potential users to validate your solution approach.'
                                : 'Conduct interviews to further validate that this problem is worth solving before investing in this solution.'
                            }
                          </p>
                        </div>
                        
                        <Button 
                          className="w-full"
                          onClick={() => handleLinkToValidation(solution.id, solution.hypothesisStatement)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Create Experiment in Validation Section
                        </Button>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          ) : (
              <div className="text-center p-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">All Solutions Have Experiments</h3>
                <p className="text-muted-foreground mb-4">
                Great job! You've created experiments for all your solutions.
                </p>
              <Button variant="outline" onClick={() => setActiveTab('problem-solution-matrix')}>
                Return to Solutions
                </Button>
              </div>
            )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="problem-solution-matrix" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Solutions
          </TabsTrigger>
          <TabsTrigger value="solution-hypothesis-builder" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Create Solution
          </TabsTrigger>
          <TabsTrigger value="evidence-collector" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Add Evidence
          </TabsTrigger>
          <TabsTrigger value="experiment-suggestions" className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Experiments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="problem-solution-matrix">
          {renderProblemSolutionMatrix()}
        </TabsContent>
        
        <TabsContent value="solution-hypothesis-builder">
          {renderSolutionHypothesisBuilder()}
        </TabsContent>
        
        <TabsContent value="evidence-collector">
          {renderEvidenceCollector()}
        </TabsContent>
        
        <TabsContent value="experiment-suggestions">
          {renderExperimentSuggestions()}
        </TabsContent>
      </Tabs>
      
      <div className="bg-muted/20 p-4 rounded-md border border-muted">
        <h3 className="text-sm font-medium mb-2 flex items-center">
          <Info className="h-4 w-4 mr-2 text-primary" />
          Validation Tip
        </h3>
        <p className="text-sm text-muted-foreground">
          Focus on creating solutions with high effectiveness and feasibility scores. 
          Each solution should be validated with at least one piece of verified evidence 
          before moving on to feature definition.
        </p>
      </div>
    </div>
  );
} 