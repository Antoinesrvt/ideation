import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  ClipboardCheck, 
  FileText, 
  Link, 
  PlusCircle, 
  Video, 
  Mic, 
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { ProductProblem, ProductSolution, ProductEvidence, ProductEvidenceLink } from '@/store/types';

interface EvidenceCollectorProps {
  evidence: ProductEvidence[];
  problems: ProductProblem[];
  solutions: ProductSolution[];
  onAddEvidence?: (evidence: Partial<ProductEvidence>, links: Partial<ProductEvidenceLink>[]) => Promise<void>;
  onDeleteEvidence?: (id: string) => Promise<void>;
}

export function EvidenceCollector({ 
  evidence, 
  problems, 
  solutions,
  onAddEvidence,
  onDeleteEvidence 
}: EvidenceCollectorProps) {
  // Add mounted ref to prevent updates after unmounting
  const isMounted = useRef(true);
  
  // Set up cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const [activeTab, setActiveTab] = useState('all');
  
  // Form state for evidence
  const [newEvidence, setNewEvidence] = useState<Partial<ProductEvidence>>({
    title: '',
    description: '',
    type: 'interview',
    source: '',
    metadata: {
      confidence_level: 50
    }
  });
  
  // State for linking evidence
  const [selectedLinks, setSelectedLinks] = useState<{
    problemIds: string[];
    solutionIds: string[];
  }>({
    problemIds: [],
    solutionIds: []
  });
  
  // Get evidence by type
  const evidenceByType = useMemo(() => {
    return {
      all: evidence,
      interview: evidence.filter(e => e.type === 'interview'),
      survey: evidence.filter(e => e.type === 'survey'),
      experiment: evidence.filter(e => e.type === 'experiment'),
      research: evidence.filter(e => e.type === 'research'),
      other: evidence.filter(e => !['interview', 'survey', 'experiment', 'research'].includes(e.type || ''))
    };
  }, [evidence]);
  
  // Get confidence level from metadata - memoize for performance
  const getConfidenceLevel = useMemo(() => {
    return (item: ProductEvidence): number => {
      if (!item.metadata) return 0;
      return (item.metadata as any).confidence_level || 0;
    };
  }, []);
  
  // Confidence level for problems and solutions based on evidence
  const confidenceLevels = useMemo(() => {
    // Create maps to store confidence levels
    const problemConfidence = new Map<string, { total: number, count: number }>();
    const solutionConfidence = new Map<string, { total: number, count: number }>();
    
    // Initialize with all problems and solutions
    problems.forEach(p => problemConfidence.set(p.id, { total: 0, count: 0 }));
    solutions.forEach(s => solutionConfidence.set(s.id, { total: 0, count: 0 }));
    
    // Process evidence
    evidence.forEach(e => {
      // Find links for this evidence
      const links = [] as ProductEvidenceLink[]; // This would come from props in a real implementation
      
      links.forEach(link => {
        const confidenceValue = getConfidenceLevel(e);
        
        if (link.entity_type === 'problem' && problemConfidence.has(link.entity_id)) {
          const current = problemConfidence.get(link.entity_id)!;
          problemConfidence.set(link.entity_id, {
            total: current.total + confidenceValue,
            count: current.count + 1
          });
        } else if (link.entity_type === 'solution' && solutionConfidence.has(link.entity_id)) {
          const current = solutionConfidence.get(link.entity_id)!;
          solutionConfidence.set(link.entity_id, {
            total: current.total + confidenceValue,
            count: current.count + 1
          });
        }
      });
    });
    
    // Calculate averages
    const problemResults = new Map<string, number>();
    const solutionResults = new Map<string, number>();
    
    problemConfidence.forEach((value, key) => {
      problemResults.set(key, value.count > 0 ? value.total / value.count : 0);
    });
    
    solutionConfidence.forEach((value, key) => {
      solutionResults.set(key, value.count > 0 ? value.total / value.count : 0);
    });
    
    return {
      problems: problemResults,
      solutions: solutionResults
    };
  }, [evidence, problems, solutions]);
  
  // Get icon for evidence type
  const getEvidenceTypeIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return <Mic className="h-4 w-4" />;
      case 'survey':
        return <FileText className="h-4 w-4" />;
      case 'experiment':
        return <CheckCircle className="h-4 w-4" />;
      case 'research':
        return <Link className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  // Helper to get current confidence level from form - no need for memoization
  const getCurrentConfidenceLevel = (): number => {
    return (newEvidence.metadata as any)?.confidence_level || 50;
  };
  
  // Helper to update confidence level in metadata
  const updateConfidenceLevel = useCallback((value: number) => {
    if (!isMounted.current) return;
    
    setNewEvidence(prev => ({
      ...prev,
      metadata: {
        ...((prev.metadata as any) || {}),
        confidence_level: value
      }
    }));
  }, []); // No dependencies needed since it only uses the setNewEvidence function which is stable
  
  // Toggle problem selection for linking
  const toggleProblemSelection = useCallback((problemId: string) => {
    if (!isMounted.current) return;
    
    setSelectedLinks(prev => {
      const isSelected = prev.problemIds.includes(problemId);
      return {
        ...prev,
        problemIds: isSelected
          ? prev.problemIds.filter(id => id !== problemId)
          : [...prev.problemIds, problemId]
      };
    });
  }, []);
  
  // Toggle solution selection for linking
  const toggleSolutionSelection = useCallback((solutionId: string) => {
    if (!isMounted.current) return;
    
    setSelectedLinks(prev => {
      const isSelected = prev.solutionIds.includes(solutionId);
      return {
        ...prev,
        solutionIds: isSelected
          ? prev.solutionIds.filter(id => id !== solutionId)
          : [...prev.solutionIds, solutionId]
      };
    });
  }, []);
  
  // Handle adding new evidence
  const handleAddEvidence = useCallback(async () => {
    if (!isMounted.current) return;
    
    if (!newEvidence.title) {
      // Show toast error in real implementation
      return;
    }
    
    if (onAddEvidence) {
      // Create evidence links for selected problems and solutions
      const links: Partial<ProductEvidenceLink>[] = [
        ...selectedLinks.problemIds.map(problemId => ({
          entity_type: 'problem',
          entity_id: problemId
        })),
        ...selectedLinks.solutionIds.map(solutionId => ({
          entity_type: 'solution',
          entity_id: solutionId
        }))
      ];
      
      try {
        await onAddEvidence(newEvidence, links);
        
        // Only update state if component is still mounted
        if (!isMounted.current) return;
        
        // Reset form
        setNewEvidence({
          title: '',
          description: '',
          type: 'interview',
          source: '',
          metadata: {
            confidence_level: 50
          }
        });
        
        setSelectedLinks({
          problemIds: [],
          solutionIds: []
        });
        
        // Show success toast in real implementation
      } catch (err) {
        // Show error toast in real implementation
      }
    }
  }, [newEvidence, selectedLinks, onAddEvidence]);
  
  // Handle deleting evidence
  const handleDeleteEvidence = useCallback(async (id: string) => {
    if (!isMounted.current) return;
    
    if (onDeleteEvidence) {
      try {
        await onDeleteEvidence(id);
        // Show success toast in real implementation
      } catch (err) {
        // Show error toast in real implementation
      }
    }
  }, [onDeleteEvidence]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ClipboardCheck className="h-5 w-5 mr-2 text-primary" />
          Evidence Collector
        </CardTitle>
        <CardDescription>
          Collect and organize evidence to validate problems and solutions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all" className="text-xs">
                All <Badge variant="outline" className="ml-1">{evidenceByType.all.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="interview" className="text-xs">
                Interviews <Badge variant="outline" className="ml-1">{evidenceByType.interview.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="survey" className="text-xs">
                Surveys <Badge variant="outline" className="ml-1">{evidenceByType.survey.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="experiment" className="text-xs">
                Experiments <Badge variant="outline" className="ml-1">{evidenceByType.experiment.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="research" className="text-xs">
                Research <Badge variant="outline" className="ml-1">{evidenceByType.research.length}</Badge>
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Evidence collection form */}
          <div className="mb-6 p-4 border rounded-md bg-gray-50">
            <h3 className="text-sm font-medium mb-3">Add New Evidence</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="evidence-title">Title</Label>
                  <Input 
                    id="evidence-title" 
                    placeholder="Evidence title"
                    value={newEvidence.title || ''}
                    onChange={(e) => setNewEvidence(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="evidence-type">Evidence Type</Label>
                  <Select 
                    value={newEvidence.type || 'interview'} 
                    onValueChange={(value) => setNewEvidence(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger id="evidence-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interview">Customer Interview</SelectItem>
                      <SelectItem value="survey">Survey Results</SelectItem>
                      <SelectItem value="experiment">Experiment</SelectItem>
                      <SelectItem value="research">Market Research</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="evidence-description">Description</Label>
                <Textarea 
                  id="evidence-description" 
                  placeholder="Describe what this evidence supports or refutes"
                  className="min-h-[80px]"
                  value={newEvidence.description || ''}
                  onChange={(e) => setNewEvidence(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="evidence-url">Source URL or Reference</Label>
                  <Input 
                    id="evidence-url" 
                    placeholder="https:// or reference"
                    value={newEvidence.source || ''}
                    onChange={(e) => setNewEvidence(prev => ({ ...prev, source: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="evidence-confidence">Confidence Level</Label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="range" 
                      id="evidence-confidence"
                      min="0" 
                      max="100" 
                      value={getCurrentConfidenceLevel()}
                      onChange={(e) => updateConfidenceLevel(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm">{getCurrentConfidenceLevel()}%</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-sm">Link to Problems</Label>
                  <div className="max-h-40 overflow-y-auto p-2 border rounded-md bg-white">
                    {problems.length > 0 ? (
                      <div className="space-y-1">
                        {problems.map(problem => (
                          <div key={problem.id} className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`problem-${problem.id}`}
                              checked={selectedLinks.problemIds.includes(problem.id)}
                              onChange={() => toggleProblemSelection(problem.id)}
                              className="mr-2"
                            />
                            <Label htmlFor={`problem-${problem.id}`} className="text-xs cursor-pointer">
                              {problem.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No problems available</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Link to Solutions</Label>
                  <div className="max-h-40 overflow-y-auto p-2 border rounded-md bg-white">
                    {solutions.length > 0 ? (
                      <div className="space-y-1">
                        {solutions.map(solution => (
                          <div key={solution.id} className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`solution-${solution.id}`}
                              checked={selectedLinks.solutionIds.includes(solution.id)}
                              onChange={() => toggleSolutionSelection(solution.id)}
                              className="mr-2"
                            />
                            <Label htmlFor={`solution-${solution.id}`} className="text-xs cursor-pointer">
                              {solution.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No solutions available</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="pt-2 flex justify-end">
                <Button onClick={handleAddEvidence}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Evidence
                </Button>
              </div>
            </div>
          </div>
          
          {/* Evidence List */}
          <TabsContent value="all" className="m-0">
            <div className="space-y-4">
              {evidenceByType.all.length > 0 ? (
                evidenceByType.all.map(item => (
                  <Card key={item.id} className="relative overflow-hidden border-l-4" style={{ borderLeftColor: getConfidenceColor(getConfidenceLevel(item)) }}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2 flex items-center px-1.5">
                            {getEvidenceTypeIcon(item.type || 'other')}
                            <span className="ml-1 text-xs capitalize">{item.type}</span>
                          </Badge>
                          <h4 className="text-sm font-medium">{item.title}</h4>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {item.source && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                              <a href={item.source} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          )}
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => item.id && handleDeleteEvidence(item.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-xs font-medium mr-2">Confidence:</span>
                          <Progress value={getConfidenceLevel(item)} className="w-24 h-2" />
                          <span className="ml-2 text-xs">{getConfidenceLevel(item)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No evidence collected yet</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Dynamic tabs for each evidence type */}
          {['interview', 'survey', 'experiment', 'research'].map(type => (
            <TabsContent key={type} value={type} className="m-0">
              <div className="space-y-4">
                {evidenceByType[type as keyof typeof evidenceByType].length > 0 ? (
                  evidenceByType[type as keyof typeof evidenceByType].map(item => (
                    <Card key={item.id} className="relative overflow-hidden border-l-4" style={{ borderLeftColor: getConfidenceColor(getConfidenceLevel(item)) }}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-medium">{item.title}</h4>
                          
                          <div className="flex items-center space-x-1">
                            {item.source && (
                              <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                                <a href={item.source} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </Button>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-destructive"
                              onClick={() => item.id && handleDeleteEvidence(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
                        
                        <div className="mt-3 flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="text-xs font-medium mr-2">Confidence:</span>
                            <Progress value={getConfidenceLevel(item)} className="w-24 h-2" />
                            <span className="ml-2 text-xs">{getConfidenceLevel(item)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No {type} evidence collected yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Validation Progress Overview */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md border">
          <h3 className="text-sm font-medium mb-4">Validation Progress</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium mb-2">Problems Validation</h4>
              <div className="space-y-2">
                {problems.map(problem => {
                  const confidence = confidenceLevels.problems.get(problem.id) || 0;
                  return (
                    <div key={problem.id} className="flex items-center space-x-2">
                      <div className="w-1/3 truncate text-xs">{problem.title}</div>
                      <Progress value={confidence} className="flex-1 h-2" />
                      <div className="text-xs w-10 text-right">{Math.round(confidence)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium mb-2">Solutions Validation</h4>
              <div className="space-y-2">
                {solutions.map(solution => {
                  const confidence = confidenceLevels.solutions.get(solution.id) || 0;
                  return (
                    <div key={solution.id} className="flex items-center space-x-2">
                      <div className="w-1/3 truncate text-xs">{solution.title}</div>
                      <Progress value={confidence} className="flex-1 h-2" />
                      <div className="text-xs w-10 text-right">{Math.round(confidence)}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to get color based on confidence level
function getConfidenceColor(confidence: number | null | undefined): string {
  const value = confidence || 0;
  if (value > 75) return '#16a34a'; // green
  if (value > 50) return '#3b82f6'; // blue
  if (value > 25) return '#f59e0b'; // amber
  return '#6b7280'; // gray
}
