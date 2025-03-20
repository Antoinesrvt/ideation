import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, ArrowRight, Check, X, AlignLeft, Sparkles, FileInput, Settings, Layers, MoveRight } from 'lucide-react';
import { ProductFeature } from "@/store/types";
import { useToast } from '@/components/ui/use-toast';
import { useProductStepper } from '@/context/product-stepper-context';
import { useProjectStore } from '@/store/project-store';
import { Solution } from '@/context/product-stepper-context';

// Define a local ProductFeature type if the imported one is causing issues
interface LocalProductFeature {
  id: string;
  name: string;
  description: string | null;
  priority: 'must' | 'should' | 'could' | 'wont';
  status: 'planned' | 'in_progress' | 'completed';
  tags: string[] | null;
  project_id: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Extended interface for features with additional properties for this step
interface FeatureFormData {
  name: string;
  description: string | null;
  priority: 'must' | 'should' | 'could' | 'wont';
  status: 'planned' | 'in_progress' | 'completed';
  solutionId?: string;
  effortEstimate?: number;
  valueEstimate?: number;
  tags: string[] | null;
  dependencies?: string[];
  project_id?: string | null;
  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface DefineFeatureStepProps {
  // Optional props for overriding behavior if needed
  onAddFeature?: (feature: Omit<LocalProductFeature, 'id'>) => void;
  onUpdateFeature?: (id: string, updates: Partial<LocalProductFeature>) => void;
  onDeleteFeature?: (id: string) => void;
}

export function DefineFeatureStep({
  onAddFeature,
  onUpdateFeature,
  onDeleteFeature
}: DefineFeatureStepProps) {
  const { toast } = useToast();
  const { currentData } = useProjectStore();
  const projectId = currentData.project?.id;
  
  const [activeTab, setActiveTab] = useState('solutions-to-features');
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [newFeatureForm, setNewFeatureForm] = useState<FeatureFormData>({
    name: '',
    description: '',
    priority: 'should',
    status: 'planned',
    tags: []
  });

  // Use hooks to get data from the database
  const {
    solutions,
    features: dbFeatures,
    addFeature: addFeatureToStore,
    updateFeature: updateFeatureInStore,
    deleteFeature: deleteFeatureFromStore,
    isLoading
  } = useProductStepper();

  // Convert database features to LocalProductFeature type - memoize to prevent unnecessary recalculations
  const features = useMemo(() => dbFeatures.map(feature => ({
    id: feature.id,
    name: feature.name,
    description: feature.description,
    priority: feature.priority as 'must' | 'should' | 'could' | 'wont',
    status: feature.status as 'planned' | 'in_progress' | 'completed',
    tags: feature.tags,
    project_id: feature.project_id,
    created_by: feature.created_by,
    created_at: feature.created_at,
    updated_at: feature.updated_at
  })), [dbFeatures]);

  // Get features derived from a solution - memoize to prevent unnecessary function recreations
  const getFeaturesFromSolution = useCallback((solutionId: string): LocalProductFeature[] => {
    return features.filter(feature => 
      feature.description?.includes(`Solution ID: ${solutionId}`) || 
      feature.tags?.includes(solutionId)
    );
  }, [features]);
  
  // Count features by priority - memoize to prevent unnecessary recalculations
  const featureCountByPriority = useMemo(() => ({
    must: features.filter(f => f.priority === 'must').length,
    should: features.filter(f => f.priority === 'should').length,
    could: features.filter(f => f.priority === 'could').length,
    wont: features.filter(f => f.priority === 'wont').length
  }), [features]);

  // Validated solutions that can be implemented - memoize to prevent unnecessary recalculations
  const validatedSolutions = useMemo(() => 
    solutions.filter(s => s.effectiveness >= 50 && s.feasibility >= 50),
    [solutions]
  );

  const handleNewFeatureFromSolution = useCallback((solution: Solution) => {
    setSelectedSolution(solution);
    setNewFeatureForm({
      name: `Feature based on: ${solution.title}`,
      description: `This feature implements the solution: "${solution.description}"\n\nSolution ID: ${solution.id}`,
      priority: 'should',
      status: 'planned',
      solutionId: solution.id,
      effortEstimate: 50,
      valueEstimate: solution.effectiveness,
      tags: [solution.id],
      project_id: projectId || null
    });
    setIsFeatureDialogOpen(true);
  }, [projectId]);

  const handleNewFeatureManually = useCallback(() => {
    setSelectedSolution(null);
    setNewFeatureForm({
      name: '',
      description: '',
      priority: 'should',
      status: 'planned',
      solutionId: undefined,
      effortEstimate: 50,
      valueEstimate: 50,
      tags: [],
      project_id: projectId || null
    });
    setIsFeatureDialogOpen(true);
  }, [projectId]);

  const handleFormInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFeatureForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePriorityChange = useCallback((value: 'must' | 'should' | 'could' | 'wont') => {
    setNewFeatureForm(prev => ({ ...prev, priority: value }));
  }, []);

  const handleStatusChange = useCallback((value: 'planned' | 'in_progress' | 'completed') => {
    setNewFeatureForm(prev => ({ ...prev, status: value }));
  }, []);

  const handleSolutionLinkChange = useCallback((checked: boolean) => {
    if (!selectedSolution) return;
    
    setNewFeatureForm(prev => ({
      ...prev,
      solutionId: checked ? selectedSolution.id : undefined,
      tags: checked ? [selectedSolution.id] : []
    }));
  }, [selectedSolution]);

  const handleSubmitFeature = useCallback(async () => {
    if (!newFeatureForm.name) {
      toast({
        title: "Feature name required",
        description: "Please provide a name for the feature.",
        variant: "destructive"
      });
      return;
    }

    const featureData = {
      name: newFeatureForm.name,
      description: newFeatureForm.description,
      priority: newFeatureForm.priority,
      status: newFeatureForm.status,
      tags: newFeatureForm.tags,
      project_id: newFeatureForm.project_id || null,
      created_by: newFeatureForm.created_by || null,
      created_at: newFeatureForm.created_at || null,
      updated_at: newFeatureForm.updated_at || null
    };

    try {
      // Use prop handler if provided, otherwise use hook
      if (onAddFeature) {
        onAddFeature(featureData);
      } else {
        await addFeatureToStore(featureData);
      }

      toast({
        title: "Feature added",
        description: `${newFeatureForm.name} has been added to your feature map.`
      });

      setIsFeatureDialogOpen(false);
      
      // Reset form
      setNewFeatureForm({
        name: '',
        description: '',
        priority: 'should',
        status: 'planned',
        tags: [],
        project_id: projectId || null
      });
    } catch (error) {
      console.error('Error adding feature:', error);
      toast({
        title: "Error adding feature",
        description: "There was a problem adding your feature. Please try again.",
        variant: "destructive"
      });
    }
  }, [newFeatureForm, onAddFeature, addFeatureToStore, toast, projectId]);

  const handleUpdateFeature = useCallback(async (id: string, updates: Partial<LocalProductFeature>) => {
    try {
      // Use prop handler if provided, otherwise use hook
      if (onUpdateFeature) {
        onUpdateFeature(id, updates);
      } else {
        await updateFeatureInStore(id, updates);
      }

      toast({
        title: "Feature updated",
        description: "The feature has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating feature:', error);
      toast({
        title: "Error updating feature",
        description: "There was a problem updating the feature. Please try again.",
        variant: "destructive"
      });
    }
  }, [onUpdateFeature, updateFeatureInStore, toast]);

  const handleDeleteFeature = useCallback(async (id: string) => {
    try {
      // Use prop handler if provided, otherwise use hook
      if (onDeleteFeature) {
        onDeleteFeature(id);
      } else {
        await deleteFeatureFromStore(id);
      }

      toast({
        title: "Feature deleted",
        description: "The feature has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast({
        title: "Error deleting feature",
        description: "There was a problem deleting the feature. Please try again.",
        variant: "destructive"
      });
    }
  }, [onDeleteFeature, deleteFeatureFromStore, toast]);

  // Show loading state if data is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading feature data...</p>
      </div>
    );
  }

  const renderSolutionsToFeaturesTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Validated Solutions</h3>
            <p className="text-sm text-muted-foreground">
              Transform your validated solutions into concrete product features
            </p>
          </div>
          <Button variant="outline" onClick={handleNewFeatureManually}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Feature Manually
          </Button>
        </div>

        {validatedSolutions.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Sparkles className="h-8 w-8 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-1">No validated solutions yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                Return to the "Validate Solutions" step to identify and validate potential solutions to user problems.
              </p>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('feature-brainstorm')}>
                Try feature brainstorming instead
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {validatedSolutions.map(solution => (
              <Card key={solution.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{solution.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {solution.description}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={solution.effectiveness >= 70 && solution.feasibility >= 70 ? "success" : "default"}
                      className="ml-2"
                    >
                      {`${solution.effectiveness}% effective`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Feasibility:</span>
                      <span className="font-medium">{solution.feasibility}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${solution.feasibility}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
                
                <div className="px-6 py-3 bg-muted/30">
                  <div className="flex flex-col space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="text-sm font-medium">Features from this solution</div>
                      <Button 
                        size="sm" 
                        onClick={() => handleNewFeatureFromSolution(solution)}
                      >
                        <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                        Create Feature
                      </Button>
                    </div>
                    
                    {getFeaturesFromSolution(solution.id).length === 0 ? (
                      <div className="text-sm text-muted-foreground italic">
                        No features created yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getFeaturesFromSolution(solution.id).map(feature => (
                          <div 
                            key={feature.id} 
                            className="text-sm bg-background p-2 rounded flex justify-between items-center"
                          >
                            <div className="flex items-center">
                              <Badge variant={
                                feature.priority === 'must' ? 'destructive' : 
                                feature.priority === 'should' ? 'warning' :
                                feature.priority === 'could' ? 'success' : 'outline'
                              } className="mr-2">
                                {feature.priority}
                              </Badge>
                              <span>{feature.name}</span>
                            </div>
                            <Badge variant={
                              feature.status === 'completed' ? 'success' :
                              feature.status === 'in_progress' ? 'warning' : 'outline'
                            }>
                              {feature.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFeatureBrainstormTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Feature Brainstorming</h3>
            <p className="text-sm text-muted-foreground">
              Brainstorm potential features using AI assistance and structured techniques
            </p>
          </div>
          <Button onClick={handleNewFeatureManually}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI-Assisted Feature Generation</CardTitle>
            <CardDescription>
              Generate feature ideas based on your validated problems and solutions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe your target users and their main goals with your product..."
              className="min-h-[100px]"
            />
            <div className="flex space-x-2">
              <Button className="flex-1">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Feature Ideas
              </Button>
              <Button variant="outline" className="flex-1">
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Ideation Techniques</CardTitle>
            <CardDescription>
              Structured methods to help you think of innovative features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="jobs-to-be-done">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="jobs-to-be-done">Jobs to be Done</TabsTrigger>
                <TabsTrigger value="user-stories">User Stories</TabsTrigger>
                <TabsTrigger value="competitor-analysis">Competitor Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="jobs-to-be-done" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Think about what jobs your users are trying to get done with your product:
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium mb-1">Job Template</p>
                    <p className="text-sm">
                      When <span className="italic">[situation]</span>, I want to <span className="italic">[motivation]</span>, so I can <span className="italic">[outcome]</span>.
                    </p>
                  </div>
                  <Textarea 
                    placeholder="When working remotely, I want to effectively collaborate with my team, so I can maintain productivity without being in the same location."
                    className="min-h-[100px]"
                  />
                  <Button>
                    <MoveRight className="h-4 w-4 mr-2" />
                    Convert to Feature
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="user-stories" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Structure your features as user stories:
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-md">
                    <p className="font-medium mb-1">User Story Template</p>
                    <p className="text-sm">
                      As a <span className="italic">[type of user]</span>, I want <span className="italic">[goal]</span>, so that <span className="italic">[benefit]</span>.
                    </p>
                  </div>
                  <Textarea 
                    placeholder="As a project manager, I want to see team workload at a glance, so that I can balance assignments effectively."
                    className="min-h-[100px]"
                  />
                  <Button>
                    <MoveRight className="h-4 w-4 mr-2" />
                    Convert to Feature
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="competitor-analysis" className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Look at competitor features and consider how you can improve upon them:
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="competitor">Competitor</Label>
                      <Input id="competitor" placeholder="Competitor name" />
                    </div>
                    <div>
                      <Label htmlFor="feature">Their Feature</Label>
                      <Input id="feature" placeholder="Feature description" />
                    </div>
                    <div>
                      <Label htmlFor="improvement">Your Improvement</Label>
                      <Input id="improvement" placeholder="How you'll improve it" />
                    </div>
                  </div>
                  <Button>
                    <MoveRight className="h-4 w-4 mr-2" />
                    Convert to Feature
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFeatureSummaryTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Feature Summary</h3>
            <p className="text-sm text-muted-foreground">
              Overview of all features defined for your product
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2 bg-red-50">
              <CardTitle className="text-base text-red-900">Must Have</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <span className="text-2xl font-bold">{featureCountByPriority.must}</span>
                <span className="text-sm text-muted-foreground ml-2">features</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 bg-yellow-50">
              <CardTitle className="text-base text-yellow-900">Should Have</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <span className="text-2xl font-bold">{featureCountByPriority.should}</span>
                <span className="text-sm text-muted-foreground ml-2">features</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 bg-green-50">
              <CardTitle className="text-base text-green-900">Could Have</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <span className="text-2xl font-bold">{featureCountByPriority.could}</span>
                <span className="text-sm text-muted-foreground ml-2">features</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2 bg-gray-50">
              <CardTitle className="text-base text-gray-900">Won't Have</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <span className="text-2xl font-bold">{featureCountByPriority.wont}</span>
                <span className="text-sm text-muted-foreground ml-2">features</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feature Breakdown</CardTitle>
            <CardDescription>
              All features organized by priority
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all-features">
              <TabsList className="mb-4">
                <TabsTrigger value="all-features">All Features</TabsTrigger>
                <TabsTrigger value="must-have">Must Have</TabsTrigger>
                <TabsTrigger value="should-have">Should Have</TabsTrigger>
                <TabsTrigger value="could-have">Could Have</TabsTrigger>
                <TabsTrigger value="wont-have">Won't Have</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all-features">
                <div className="space-y-4">
                  {features.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No features defined yet. Start by adding features from validated solutions.
                    </div>
                  ) : (
                    features.map(feature => (
                      <div 
                        key={feature.id}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="flex items-center">
                          <Badge variant={
                            feature.priority === 'must' ? 'destructive' : 
                            feature.priority === 'should' ? 'warning' :
                            feature.priority === 'could' ? 'success' : 'outline'
                          } className="mr-3">
                            {feature.priority}
                          </Badge>
                          <div>
                            <div className="font-medium">{feature.name}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{feature.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            feature.status === 'completed' ? 'success' :
                            feature.status === 'in_progress' ? 'warning' : 'outline'
                          }>
                            {feature.status}
                          </Badge>
                          <Button size="sm" variant="ghost">Edit</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
              
              {['must-have', 'should-have', 'could-have', 'wont-have'].map(tab => {
                const priority = tab.split('-')[0] as 'must' | 'should' | 'could' | 'wont';
                const filteredFeatures = features.filter(f => f.priority === priority);
                
                return (
                  <TabsContent key={tab} value={tab}>
                    <div className="space-y-4">
                      {filteredFeatures.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No {priority} features defined yet.
                        </div>
                      ) : (
                        filteredFeatures.map(feature => (
                          <div 
                            key={feature.id}
                            className="flex items-center justify-between p-3 border rounded-md"
                          >
                            <div>
                              <div className="font-medium">{feature.name}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">{feature.description}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                feature.status === 'completed' ? 'success' :
                                feature.status === 'in_progress' ? 'warning' : 'outline'
                              }>
                                {feature.status}
                              </Badge>
                              <Button size="sm" variant="ghost">Edit</Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="solutions-to-features">Solutions to Features</TabsTrigger>
          <TabsTrigger value="feature-brainstorm">Feature Brainstorm</TabsTrigger>
          <TabsTrigger value="feature-summary">Feature Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="solutions-to-features" className="mt-6">
          {renderSolutionsToFeaturesTab()}
        </TabsContent>
        
        <TabsContent value="feature-brainstorm" className="mt-6">
          {renderFeatureBrainstormTab()}
        </TabsContent>
        
        <TabsContent value="feature-summary" className="mt-6">
          {renderFeatureSummaryTab()}
        </TabsContent>
      </Tabs>

      <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedSolution ? 'Create Feature from Solution' : 'Create New Feature'}
            </DialogTitle>
            <DialogDescription>
              {selectedSolution 
                ? 'Transform this solution into a concrete product feature' 
                : 'Define a new feature for your product'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feature-title">Feature Name</Label>
              <Input 
                id="feature-title" 
                value={newFeatureForm.name} 
                onChange={handleFormInputChange}
                placeholder="Enter a clear, concise feature name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feature-description">Description</Label>
              <Textarea 
                id="feature-description" 
                value={newFeatureForm.description || ''} 
                onChange={handleFormInputChange}
                placeholder="Describe what this feature does and how it helps users"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feature-priority">Priority</Label>
                <Select 
                  value={newFeatureForm.priority} 
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="must">Must Have</SelectItem>
                    <SelectItem value="should">Should Have</SelectItem>
                    <SelectItem value="could">Could Have</SelectItem>
                    <SelectItem value="wont">Won't Have</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feature-status">Status</Label>
                <Select 
                  value={newFeatureForm.status} 
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedSolution && (
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-center mb-2">
                  <Checkbox 
                    id="link-solution"
                    checked={!!newFeatureForm.solutionId}
                    onCheckedChange={handleSolutionLinkChange}
                  />
                  <Label htmlFor="link-solution" className="ml-2">
                    Link to original solution
                  </Label>
                </div>
                <div className="text-sm text-muted-foreground">
                  This will help you track which features implement which solutions
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeatureDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitFeature}>
              Create Feature
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 