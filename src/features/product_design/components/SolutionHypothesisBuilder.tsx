import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Lightbulb, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProductProblem, Insert } from '@/store/types';

interface SolutionHypothesisBuilderProps {
  problems: ProductProblem[];
  onAddSolution: (solution: Insert<'product_solutions'>) => Promise<any>;
  projectId?: string;
}

export function SolutionHypothesisBuilder({ 
  problems,
  onAddSolution,
  projectId
}: SolutionHypothesisBuilderProps) {
  const { toast } = useToast();
  
  // Add mounted ref to prevent updates after unmounting
  const isMounted = useRef(true);
  
  // Set up cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Keep track of the selected problem ID separately
  const [selectedProblemId, setSelectedProblemId] = useState<string>('');
  
  // Hypothesis builder form state - completely separate from solution state
  const [hypothesisForm, setHypothesisForm] = useState({
    solution: '',
    problem: '',
    customerSegment: '',
    mechanism: '',
  });
  
  // Solution state
  const [solutionTitle, setSolutionTitle] = useState('');
  const [solutionDescription, setSolutionDescription] = useState('');
  const [solutionEffectiveness, setSolutionEffectiveness] = useState(50);
  const [solutionFeasibility, setSolutionFeasibility] = useState(70);
  const [hypothesisStatement, setHypothesisStatement] = useState('');
  
  // Generate hypothesis statement from inputs - stable reference
  const generateHypothesisStatement = useCallback((
    solution: string, 
    problem: string, 
    segment: string, 
    mechanism: string
  ) => {
    return `We believe that ${solution || '[solution]'} will solve ${problem || '[problem]'} for ${segment || '[customer segment]'} by ${mechanism || '[mechanism]'}.`;
  }, []);
  
  // Memoize the filtered problems list to prevent unnecessary re-renders
  const filteredProblems = useMemo(() => {
    return problems.filter(p => p.status === 'validated' || p.status === 'critical');
  }, [problems]);
  
  // Create a memoized lookup for problems by ID
  const problemsById = useMemo(() => {
    const map = new Map<string, ProductProblem>();
    problems.forEach(problem => {
      map.set(problem.id, problem);
    });
    return map;
  }, [problems]);
  
  // Memoize the hypothesis statement generation to prevent unnecessary updates
  const currentHypothesisStatement = useMemo(() => {
    return generateHypothesisStatement(
      hypothesisForm.solution,
      hypothesisForm.problem,
      hypothesisForm.customerSegment,
      hypothesisForm.mechanism
    );
  }, [
    generateHypothesisStatement,
    hypothesisForm.solution,
    hypothesisForm.problem,
    hypothesisForm.customerSegment,
    hypothesisForm.mechanism
  ]);
  
  // Update hypothesis statement and solution title only when needed
  useEffect(() => {
    if (!isMounted.current) return;
    
    if (currentHypothesisStatement !== hypothesisStatement) {
      setHypothesisStatement(currentHypothesisStatement);
    }
  }, [currentHypothesisStatement, hypothesisStatement]);
  
  useEffect(() => {
    if (!isMounted.current) return;
    
    if (!solutionTitle && hypothesisForm.solution) {
      setSolutionTitle(hypothesisForm.solution);
    }
  }, [hypothesisForm.solution, solutionTitle]);
  
  // Handle problem selection - completely separate from other state updates
  const handleProblemSelect = useCallback((problemId: string) => {
    if (!isMounted.current) return;
    
    // Skip if already selected or if problemId is empty
    if (!problemId || problemId === selectedProblemId) return;
    
    const selectedProblem = problemsById.get(problemId);
    if (!selectedProblem) return;
    
    setSelectedProblemId(problemId);
    
    // Update only the hypothesis form, not the solution state
    setHypothesisForm(prev => ({
      ...prev,
      problem: selectedProblem.title,
      customerSegment: Array.isArray(selectedProblem.customer_segments) && 
                      selectedProblem.customer_segments.length > 0
        ? selectedProblem.customer_segments[0]
        : prev.customerSegment
    }));
  }, [selectedProblemId, problemsById]);
  
  // Individual handlers for hypothesis form fields - each isolated
  const handleSolutionNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHypothesisForm(prev => ({
      ...prev,
      solution: e.target.value
    }));
  }, []);
  
  const handleProblemNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHypothesisForm(prev => ({
      ...prev,
      problem: e.target.value
    }));
  }, []);
  
  const handleCustomerSegmentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHypothesisForm(prev => ({
      ...prev,
      customerSegment: e.target.value
    }));
  }, []);
  
  const handleMechanismChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHypothesisForm(prev => ({
      ...prev,
      mechanism: e.target.value
    }));
  }, []);
  
  // Isolated handlers for solution form
  const handleSolutionTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSolutionTitle(e.target.value);
  }, []);
  
  const handleSolutionDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSolutionDescription(e.target.value);
  }, []);
  
  const handleEffectivenessChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSolutionEffectiveness(parseInt(e.target.value));
  }, []);
  
  const handleFeasibilityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSolutionFeasibility(parseInt(e.target.value));
  }, []);
  
  // Reset all form state
  const resetForm = useCallback(() => {
    setSelectedProblemId('');
    setHypothesisForm({
      solution: '',
      problem: '',
      customerSegment: '',
      mechanism: '',
    });
    setSolutionTitle('');
    setSolutionDescription('');
    setSolutionEffectiveness(50);
    setSolutionFeasibility(70);
    setHypothesisStatement('');
  }, []);
  
  // Handle form submission
  const handleAddNewSolution = useCallback(async () => {
    if (!solutionTitle || !selectedProblemId) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a related problem",
        variant: "destructive",
      });
      return;
    }
    
    if (!projectId) {
      toast({
        title: "Missing project ID",
        description: "Cannot add solution without a project",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const solutionToAdd: Insert<'product_solutions'> = {
        title: solutionTitle,
        description: solutionDescription,
        problem_id: selectedProblemId,
        effectiveness: solutionEffectiveness,
        feasibility: solutionFeasibility,
        hypothesis_statement: hypothesisStatement,
        project_id: projectId,
        status: 'proposed',
        tags: []
      };
      
      await onAddSolution(solutionToAdd);
      
      // Reset form after successful submission
      resetForm();
      
      toast({
        title: "Solution added",
        description: "New solution has been added to the solution list",
      });
    } catch (err) {
      toast({
        title: "Error adding solution",
        description: "An error occurred while adding the solution",
        variant: "destructive",
      });
      console.error("Error adding solution:", err);
    }
  }, [
    solutionTitle, 
    selectedProblemId, 
    solutionDescription, 
    solutionEffectiveness, 
    solutionFeasibility, 
    hypothesisStatement, 
    projectId, 
    onAddSolution, 
    resetForm, 
    toast
  ]);
  
  // Use a stable key for the Select component
  // Remove the dependency on filteredProblems.length which causes unnecessary remounts
  const selectKey = useMemo(() => 'problem-select-stable', []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-primary" />
          Solution Hypothesis Builder
        </CardTitle>
        <CardDescription>
          Create solution hypotheses linked to validated problems
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Problem Selector */}
          <div className="space-y-2">
            <Label htmlFor="problem">Select a Problem</Label>
            <Select 
              key={selectKey}
              value={selectedProblemId || undefined}
              onValueChange={handleProblemSelect}
            >
              <SelectTrigger id="problem">
                <SelectValue placeholder="Choose a problem to solve" />
              </SelectTrigger>
              <SelectContent>
                {filteredProblems.map(problem => (
                  <SelectItem key={problem.id} value={problem.id}>
                    {problem.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Hypothesis Builder Form */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium">Build Your Hypothesis Statement</h3>
            
            <div className="space-y-2">
              <Label htmlFor="solution">Solution</Label>
              <Input
                id="solution"
                placeholder="e.g., a mobile app with AI-powered recommendations"
                value={hypothesisForm.solution}
                onChange={handleSolutionNameChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="problem">Problem</Label>
              <Input
                id="hypothesis-problem"
                placeholder="e.g., difficulty finding reliable service providers"
                value={hypothesisForm.problem}
                onChange={handleProblemNameChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="segment">Customer Segment</Label>
              <Input
                id="segment"
                placeholder="e.g., busy urban professionals"
                value={hypothesisForm.customerSegment}
                onChange={handleCustomerSegmentChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mechanism">Mechanism</Label>
              <Input
                id="mechanism"
                placeholder="e.g., using verified reviews and location-based matching"
                value={hypothesisForm.mechanism}
                onChange={handleMechanismChange}
              />
            </div>
            
            <div className="p-3 bg-white rounded border">
              <Label className="text-xs text-muted-foreground mb-1 block">Generated Hypothesis Statement</Label>
              <p className="text-sm">{hypothesisStatement}</p>
            </div>
          </div>
          
          {/* Solution Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="solution-title">Solution Title</Label>
              <Input
                id="solution-title"
                placeholder="Enter a concise title for your solution"
                value={solutionTitle}
                onChange={handleSolutionTitleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="solution-description">Description</Label>
              <Textarea
                id="solution-description"
                placeholder="Describe your solution in detail"
                className="min-h-[100px]"
                value={solutionDescription}
                onChange={handleSolutionDescriptionChange}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="effectiveness">Estimated Effectiveness</Label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="range" 
                    id="effectiveness"
                    min="0" 
                    max="100" 
                    value={solutionEffectiveness}
                    onChange={handleEffectivenessChange}
                    className="w-full"
                  />
                  <span className="text-sm">{solutionEffectiveness}%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feasibility">Implementation Feasibility</Label>
                <div className="flex items-center space-x-2">
                  <input 
                    type="range" 
                    id="feasibility"
                    min="0" 
                    max="100" 
                    value={solutionFeasibility}
                    onChange={handleFeasibilityChange}
                    className="w-full"
                  />
                  <span className="text-sm">{solutionFeasibility}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleAddNewSolution} className="flex items-center">
          Add Solution Hypothesis
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
