import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Target,
  PlusCircle,
  ArrowRight,
  Trash2,
  Edit,
  Check,
  Info,
  ArrowUpRight,
  GitBranch,
  Calendar,
  CheckCircle2,
  BarChart,
  Layers,
  MoveHorizontal,
  MoveVertical,
  ChevronRight,
  PanelLeftOpen,
  MoveRight,
  Milestone,
  Clock,
  AlertTriangle,
  Trophy
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProductFeature } from '@/store/types';


// Define the types for the component
export interface MVPFeature extends ProductFeature {
  effortScore: number; // 1-100
  valueScore: number; // 1-100
  isSelected: boolean;
  category?: string;
  dependencies?: string[];
  estimatedTime?: number; // in days
  assignedTo?: string;
}

export interface SuccessCriterion {
  id: string;
  title: string;
  description: string;
  metricType: 'qualitative' | 'quantitative';
  targetValue?: string;
  currentValue?: string;
  isAchieved: boolean;
}

export interface TimelinePhase {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  features: string[]; // IDs of features in this phase
  milestones: Array<{
    id: string;
    title: string;
    date: string;
    isCompleted: boolean;
  }>;
}

interface MVPScopeDefinitionProps {
  features: ProductFeature[];
  onUpdateFeature?: (id: string, updates: Partial<ProductFeature>) => void;
  onUpdateMVPScope?: (featureIds: string[]) => void;
  selectedMVPFeatures?: string[]; // IDs of features selected for MVP
  onSaveSuccessCriteria?: (criteria: SuccessCriterion[]) => void;
  successCriteria?: SuccessCriterion[];
  onSaveTimeline?: (timeline: TimelinePhase[]) => void;
  timeline?: TimelinePhase[];
}

export function MVPScopeDefinition({
  features = [],
  onUpdateFeature,
  onUpdateMVPScope,
  selectedMVPFeatures = [],
  onSaveSuccessCriteria,
  successCriteria = [],
  onSaveTimeline,
  timeline = []
}: MVPScopeDefinitionProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('prioritization');
  
  // Convert features to MVP features with additional properties
  const [mvpFeatures, setMvpFeatures] = useState<MVPFeature[]>(
    features.map(feature => ({
      ...feature,
      effortScore: Math.floor(Math.random() * 100) + 1, // Random initial value
      valueScore: Math.floor(Math.random() * 100) + 1, // Random initial value
      isSelected: selectedMVPFeatures.includes(feature.id)
    }))
  );
  
  // State for the success criteria
  const [criteria, setCriteria] = useState<SuccessCriterion[]>(successCriteria);
  
  // State for the timeline
  const [phases, setPhases] = useState<TimelinePhase[]>(timeline.length > 0 ? timeline : [
    {
      id: 'mvp',
      title: 'MVP Phase',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days from now
      features: selectedMVPFeatures,
      milestones: []
    },
    {
      id: 'v1',
      title: 'Version 1.0',
      startDate: new Date(Date.now() + 61 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 61 days from now
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 120 days from now
      features: [],
      milestones: []
    }
  ]);
  
  // Effect to update MVPFeatures when features change
  useEffect(() => {
    setMvpFeatures(
      features.map(feature => {
        const existingMvpFeature = mvpFeatures.find(f => f.id === feature.id);
        return {
          ...feature,
          effortScore: existingMvpFeature?.effortScore || Math.floor(Math.random() * 100) + 1,
          valueScore: existingMvpFeature?.valueScore || Math.floor(Math.random() * 100) + 1,
          isSelected: selectedMVPFeatures.includes(feature.id),
          category: existingMvpFeature?.category,
          dependencies: existingMvpFeature?.dependencies,
          estimatedTime: existingMvpFeature?.estimatedTime,
          assignedTo: existingMvpFeature?.assignedTo
        };
      })
    );
  }, [features, selectedMVPFeatures]);
  
  // Calculate development timeline based on selected features
  const calculateTimeline = () => {
    const selectedFeatures = mvpFeatures.filter(f => f.isSelected);
    const totalEffort = selectedFeatures.reduce((sum, feature) => sum + feature.effortScore, 0);
    
    // Rough estimation: 1 point of effort = 0.2 days
    const totalDays = Math.ceil(totalEffort * 0.2);
    
    return {
      days: totalDays,
      weeks: Math.ceil(totalDays / 5), // Assuming 5 working days per week
      months: Math.ceil(totalDays / 20) // Assuming 20 working days per month
    };
  };
  
  // Selected features count
  const selectedCount = mvpFeatures.filter(f => f.isSelected).length;
  
  // Timeline calculation
  const timelineEstimate = calculateTimeline();
  
  // Handle feature selection toggle
  const toggleFeatureSelection = (id: string) => {
    setMvpFeatures(mvpFeatures.map(feature => 
      feature.id === id ? { ...feature, isSelected: !feature.isSelected } : feature
    ));
    
    // Update selected features
    const updatedSelectedFeatures = mvpFeatures
      .map(f => f.id === id ? { ...f, isSelected: !f.isSelected } : f)
      .filter(f => f.isSelected)
      .map(f => f.id);
    
    if (onUpdateMVPScope) {
      onUpdateMVPScope(updatedSelectedFeatures);
    }
  };
  
  // Update feature scores
  const updateFeatureScore = (id: string, field: 'effortScore' | 'valueScore', value: number) => {
    setMvpFeatures(mvpFeatures.map(feature => 
      feature.id === id ? { ...feature, [field]: value } : feature
    ));
  };
  
  // Add new success criterion
  const addSuccessCriterion = () => {
    const newCriterion: SuccessCriterion = {
      id: `criterion-${Date.now()}`,
      title: 'New Success Criterion',
      description: '',
      metricType: 'qualitative',
      isAchieved: false
    };
    
    setCriteria([...criteria, newCriterion]);
    
    if (onSaveSuccessCriteria) {
      onSaveSuccessCriteria([...criteria, newCriterion]);
    }
  };
  
  // Update success criterion
  const updateCriterion = (id: string, updates: Partial<SuccessCriterion>) => {
    const updatedCriteria = criteria.map(criterion => 
      criterion.id === id ? { ...criterion, ...updates } : criterion
    );
    
    setCriteria(updatedCriteria);
    
    if (onSaveSuccessCriteria) {
      onSaveSuccessCriteria(updatedCriteria);
    }
  };
  
  // Delete success criterion
  const deleteCriterion = (id: string) => {
    const updatedCriteria = criteria.filter(criterion => criterion.id !== id);
    
    setCriteria(updatedCriteria);
    
    if (onSaveSuccessCriteria) {
      onSaveSuccessCriteria(updatedCriteria);
    }
  };
  
  // Add new phase
  const addPhase = () => {
    const lastPhase = phases[phases.length - 1];
    const newEndDate = new Date(lastPhase.endDate);
    newEndDate.setDate(newEndDate.getDate() + 60); // 60 days after the last phase
    
    const newPhase: TimelinePhase = {
      id: `phase-${Date.now()}`,
      title: `New Phase`,
      startDate: new Date(lastPhase.endDate).toISOString().split('T')[0], // Start after the last phase
      endDate: newEndDate.toISOString().split('T')[0],
      features: [],
      milestones: []
    };
    
    const updatedPhases = [...phases, newPhase];
    setPhases(updatedPhases);
    
    if (onSaveTimeline) {
      onSaveTimeline(updatedPhases);
    }
  };
  
  // Update phase
  const updatePhase = (id: string, updates: Partial<TimelinePhase>) => {
    const updatedPhases = phases.map(phase => 
      phase.id === id ? { ...phase, ...updates } : phase
    );
    
    setPhases(updatedPhases);
    
    if (onSaveTimeline) {
      onSaveTimeline(updatedPhases);
    }
  };
  
  // Add feature to phase
  const addFeatureToPhase = (featureId: string, phaseId: string) => {
    const updatedPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          features: [...phase.features, featureId]
        };
      }
      return phase;
    });
    
    setPhases(updatedPhases);
    
    if (onSaveTimeline) {
      onSaveTimeline(updatedPhases);
    }
  };
  
  // Remove feature from phase
  const removeFeatureFromPhase = (featureId: string, phaseId: string) => {
    const updatedPhases = phases.map(phase => {
      if (phase.id === phaseId) {
        return {
          ...phase,
          features: phase.features.filter(id => id !== featureId)
        };
      }
      return phase;
    });
    
    setPhases(updatedPhases);
    
    if (onSaveTimeline) {
      onSaveTimeline(updatedPhases);
    }
  };
  
  // Render feature prioritization grid
  const renderPrioritizationGrid = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Feature Prioritization Matrix</h3>
            <p className="text-sm text-muted-foreground">
              Plot your features based on development effort and customer value
            </p>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="sm">
                <Info className="h-4 w-4 mr-1" />
                How to use
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">About the Prioritization Matrix</h4>
                <p className="text-xs text-muted-foreground">
                  Features in the top-right quadrant (high value, low effort) are ideal MVP candidates.
                  Features in the top-left (high value, high effort) should be carefully evaluated.
                  Features in the bottom-right (low value, low effort) can be considered if time permits.
                  Features in the bottom-left (low value, high effort) should be deferred.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        
        {/* Prioritization Grid */}
        <div className="relative h-96 border bg-white rounded-md">
          {/* Y-axis label */}
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-500 font-medium">
            Customer Value
          </div>
          
          {/* X-axis label */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-xs text-gray-500 font-medium">
            Development Effort
          </div>
          
          {/* Quadrant labels */}
          <div className="absolute top-2 left-2 text-xs font-medium text-yellow-600">Evaluate</div>
          <div className="absolute top-2 right-2 text-xs font-medium text-green-600">Prioritize</div>
          <div className="absolute bottom-2 left-2 text-xs font-medium text-red-600">Defer</div>
          <div className="absolute bottom-2 right-2 text-xs font-medium text-blue-600">Consider</div>
          
          {/* Dividing lines */}
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-gray-300"></div>
          <div className="absolute top-0 bottom-0 left-1/2 border-l border-dashed border-gray-300"></div>
          
          {/* Feature dots */}
          {mvpFeatures.map(feature => (
            <motion.div
              key={feature.id}
              className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-xs cursor-pointer ${
                feature.isSelected ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100 border border-gray-300'
              }`}
              style={{
                left: `calc(${feature.effortScore}% - 24px)`,
                top: `calc(${100 - feature.valueScore}% - 24px)`,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              whileHover={{ scale: 1.1 }}
              onClick={() => toggleFeatureSelection(feature.id)}
              title={feature.name || 'Unnamed Feature'}
            >
              {feature.isSelected && <Check className="h-3 w-3 absolute top-0 right-0 text-green-600" />}
              <span className="text-xs font-medium truncate max-w-[40px]">
                {feature.name?.split(' ')[0] || 'Feature'}
              </span>
            </motion.div>
          ))}
        </div>
        
        {/* Feature List with Values */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Feature Scores</h3>
          <div className="space-y-4">
            {mvpFeatures.map(feature => (
              <Card key={feature.id} className={`${feature.isSelected ? 'border-green-200 bg-green-50' : ''}`}>
                <CardHeader className="py-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Checkbox 
                        checked={feature.isSelected}
                        onCheckedChange={() => toggleFeatureSelection(feature.id)}
                        className="mr-2"
                      />
                      <CardTitle className="text-base font-medium">{feature.name}</CardTitle>
                    </div>
                    <Badge variant={feature.priority === 'must' ? 'destructive' : 
                                    feature.priority === 'should' ? 'default' : 
                                    feature.priority === 'could' ? 'secondary' : 'outline'}>
                      {feature.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-3">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm">Development Effort</Label>
                      <div className="flex items-center space-x-4">
                        <Slider
                          value={[feature.effortScore]}
                          min={1}
                          max={100}
                          step={1}
                          onValueChange={(value) => updateFeatureScore(feature.id, 'effortScore', value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-right text-sm">{feature.effortScore}/100</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Customer Value</Label>
                      <div className="flex items-center space-x-4">
                        <Slider
                          value={[feature.valueScore]}
                          min={1}
                          max={100}
                          step={1}
                          onValueChange={(value) => updateFeatureScore(feature.id, 'valueScore', value[0])}
                          className="flex-1"
                        />
                        <span className="w-12 text-right text-sm">{feature.valueScore}/100</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // Render MVP Feature Selector
  const renderMVPSelector = () => {
    // Group features by priority
    const mustHaveFeatures = mvpFeatures.filter(f => f.priority === 'must');
    const shouldHaveFeatures = mvpFeatures.filter(f => f.priority === 'should');
    const couldHaveFeatures = mvpFeatures.filter(f => f.priority === 'could');
    const wontHaveFeatures = mvpFeatures.filter(f => f.priority === 'wont');
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">MVP Feature Selection</h3>
            <p className="text-sm text-muted-foreground">
              Select the features that will be included in your MVP
            </p>
          </div>
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            {selectedCount} features selected
          </Badge>
        </div>
        
        {/* Timeline Impact */}
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-base">Development Timeline Impact</CardTitle>
          </CardHeader>
          <CardContent className="py-0">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-md bg-gray-50">
                <h4 className="text-2xl font-bold text-primary">{timelineEstimate.days}</h4>
                <p className="text-sm text-muted-foreground">Days</p>
              </div>
              <div className="p-4 rounded-md bg-gray-50">
                <h4 className="text-2xl font-bold text-primary">{timelineEstimate.weeks}</h4>
                <p className="text-sm text-muted-foreground">Weeks</p>
              </div>
              <div className="p-4 rounded-md bg-gray-50">
                <h4 className="text-2xl font-bold text-primary">{timelineEstimate.months}</h4>
                <p className="text-sm text-muted-foreground">Months</p>
              </div>
            </div>
            
            <div className="mt-4 mb-2">
              <div className="flex justify-between items-center text-sm mb-1">
                <span>Minimal Viability Threshold</span>
                <span>{Math.min(100, Math.floor((selectedCount / mustHaveFeatures.length) * 100))}%</span>
              </div>
              <Progress value={Math.min(100, Math.floor((selectedCount / mustHaveFeatures.length) * 100))} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {mustHaveFeatures.length - mustHaveFeatures.filter(f => f.isSelected).length > 0 
                  ? `${mustHaveFeatures.length - mustHaveFeatures.filter(f => f.isSelected).length} must-have features not selected` 
                  : 'All must-have features selected'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Feature Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center">
              <PanelLeftOpen className="h-4 w-4 mr-2 text-primary" />
              Available Features
            </h4>
            
            <div className="space-y-3">
              {mvpFeatures.filter(f => !f.isSelected).map(feature => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => toggleFeatureSelection(feature.id)}>
                    <CardContent className="p-3 flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium">{feature.name}</h4>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {feature.description || 'No description'}
                        </p>
                      </div>
                      <Badge variant={feature.priority === 'must' ? 'destructive' : 
                                      feature.priority === 'should' ? 'default' : 
                                      feature.priority === 'could' ? 'secondary' : 'outline'}>
                        {feature.priority}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {mvpFeatures.filter(f => !f.isSelected).length === 0 && (
                <div className="text-center p-8 text-muted-foreground text-sm">
                  No features available. All are included in MVP.
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
              MVP Features
            </h4>
            
            <div className="space-y-3">
              {mvpFeatures.filter(f => f.isSelected).map(feature => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="border-green-200 bg-green-50 cursor-pointer hover:shadow-md transition-shadow" onClick={() => toggleFeatureSelection(feature.id)}>
                    <CardContent className="p-3 flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium">{feature.name}</h4>
                        <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                          {feature.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <Badge variant={feature.priority === 'must' ? 'destructive' : 
                                        feature.priority === 'should' ? 'default' : 
                                        feature.priority === 'could' ? 'secondary' : 'outline'}>
                          {feature.priority}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {mvpFeatures.filter(f => f.isSelected).length === 0 && (
                <div className="text-center p-8 text-muted-foreground text-sm">
                  No features selected for MVP. Click on features to include them.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => {
            // Reset all feature selections
            setMvpFeatures(mvpFeatures.map(f => ({ ...f, isSelected: false })));
            if (onUpdateMVPScope) {
              onUpdateMVPScope([]);
            }
          }}>
            Reset Selection
          </Button>
          
          <Button variant="default" onClick={() => {
            toast({
              title: "MVP scope updated",
              description: `${selectedCount} features selected for MVP`
            });
            
            // Here we would normally save the scope
            // Already handled in the toggle function
          }}>
            Save MVP Scope
          </Button>
        </div>
      </div>
    );
  };
  
  // Render Success Criteria Builder
  const renderSuccessCriteriaBuilder = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Success Criteria</h3>
            <p className="text-sm text-muted-foreground">
              Define clear success metrics to validate your MVP
            </p>
          </div>
          <Button size="sm" onClick={addSuccessCriterion}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Criterion
          </Button>
        </div>
        
        <div className="space-y-4">
          {criteria.map(criterion => (
            <Card key={criterion.id}>
              <CardHeader className="py-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <Switch 
                      checked={criterion.isAchieved}
                      onCheckedChange={(checked) => updateCriterion(criterion.id, { isAchieved: checked as boolean })}
                      className="mr-2"
                    />
                    <Input 
                      value={criterion.title}
                      onChange={(e) => updateCriterion(criterion.id, { title: e.target.value })}
                      className="border-none text-base font-medium bg-transparent p-0 h-auto"
                      placeholder="Success criterion title"
                    />
                  </div>
                  <div className="flex space-x-1">
                    <Select 
                      value={criterion.metricType}
                      onValueChange={(value: 'qualitative' | 'quantitative') => updateCriterion(criterion.id, { metricType: value })}
                    >
                      <SelectTrigger className="w-[160px] h-8">
                        <SelectValue placeholder="Metric Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="qualitative">Qualitative</SelectItem>
                        <SelectItem value="quantitative">Quantitative</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteCriterion(criterion.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-0">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Textarea
                      placeholder="Description of what success looks like"
                      value={criterion.description}
                      onChange={(e) => updateCriterion(criterion.id, { description: e.target.value })}
                      className="resize-none min-h-[80px]"
                    />
                  </div>
                  
                  {criterion.metricType === 'quantitative' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`target-${criterion.id}`}>Target Value</Label>
                        <Input
                          id={`target-${criterion.id}`}
                          placeholder="e.g., 1000 users, 50% conversion"
                          value={criterion.targetValue || ''}
                          onChange={(e) => updateCriterion(criterion.id, { targetValue: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`current-${criterion.id}`}>Current Value</Label>
                        <Input
                          id={`current-${criterion.id}`}
                          placeholder="e.g., 250 users, 30% conversion"
                          value={criterion.currentValue || ''}
                          onChange={(e) => updateCriterion(criterion.id, { currentValue: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="py-3">
                <div className="w-full flex justify-between items-center">
                  <Badge variant={criterion.isAchieved ? 'default' : 'outline'} className="flex items-center">
                    <Trophy className="h-3 w-3 mr-1" />
                    {criterion.isAchieved ? 'Achieved' : 'Not Achieved'}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {criterion.metricType === 'quantitative' && criterion.targetValue && criterion.currentValue && (
                      <span>Progress: {criterion.currentValue} / {criterion.targetValue}</span>
                    )}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
          
          {criteria.length === 0 && (
            <Card className="border-dashed flex flex-col items-center justify-center p-12">
              <div className="text-center space-y-2">
                <Target className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Success Criteria Defined</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Define clear success criteria to validate your MVP. These can be qualitative
                  assessments or quantitative metrics.
                </p>
                <Button className="mt-4" onClick={addSuccessCriterion}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Success Criterion
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  };
  
  // Render Roadmap Visualizer
  const renderRoadmapVisualizer = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Product Roadmap</h3>
            <p className="text-sm text-muted-foreground">
              Plan feature distribution across development phases
            </p>
          </div>
          <Button size="sm" onClick={addPhase}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Phase
          </Button>
        </div>
        
        <div className="space-y-8">
          {phases.map((phase, index) => (
            <div key={phase.id} className="relative">
              {/* Connector Line */}
              {index > 0 && (
                <div className="absolute top-0 left-1/2 h-8 -mt-8 -ml-px w-px border-l border-dashed border-gray-300"></div>
              )}
              
              <Card>
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Badge className="mr-2" variant={index === 0 ? 'default' : 'outline'}>
                        Phase {index + 1}
                      </Badge>
                      <Input 
                        value={phase.title}
                        onChange={(e) => updatePhase(phase.id, { title: e.target.value })}
                        className="border-none text-base font-medium bg-transparent p-0 h-auto"
                        placeholder="Phase title"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-2 items-center text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <input 
                          type="date" 
                          value={phase.startDate} 
                          onChange={(e) => updatePhase(phase.id, { startDate: e.target.value })}
                          className="border-none bg-transparent text-muted-foreground"
                        />
                        <span className="text-muted-foreground">-</span>
                        <input 
                          type="date" 
                          value={phase.endDate} 
                          onChange={(e) => updatePhase(phase.id, { endDate: e.target.value })}
                          className="border-none bg-transparent text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center">
                        <GitBranch className="h-4 w-4 mr-2 text-primary" />
                        Available Features
                      </h4>
                      
                      <div className="space-y-2">
                        {mvpFeatures.filter(f => !phase.features.includes(f.id)).map(feature => (
                          <div 
                            key={feature.id} 
                            className="flex justify-between items-center p-2 bg-gray-50 hover:bg-gray-100 rounded-md cursor-pointer"
                            onClick={() => addFeatureToPhase(feature.id, phase.id)}
                          >
                            <span className="text-sm">{feature.name || 'Unnamed Feature'}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoveRight className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        
                        {mvpFeatures.filter(f => !phase.features.includes(f.id)).length === 0 && (
                          <div className="text-center p-4 text-muted-foreground text-sm">
                            All features have been assigned
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center">
                        <GitBranch className="h-4 w-4 mr-2 text-primary" />
                        Available Features
                      </h4>
                      
                      <div className="space-y-2">
                        {mvpFeatures.filter(f => !phase.features.includes(f.id)).map(feature => (
                          <div 
                            key={feature.id} 
                            className="flex justify-between items-center p-2 bg-muted rounded-md" 
                          >
                            <span className="text-sm">{feature.name || 'Unnamed Feature'}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => removeFeatureFromPhase(feature.id, phase.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        
                        {mvpFeatures.filter(f => !phase.features.includes(f.id)).length === 0 && (
                          <div className="text-center p-4 text-muted-foreground text-sm">
                            All features have been assigned
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="py-3">
                  <div className="w-full flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline">
                        {phase.features.length} features
                      </Badge>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="prioritization" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="prioritization" className="flex items-center">
            <Target className="h-4 w-4 mr-2" />
            Prioritization
          </TabsTrigger>
          <TabsTrigger value="selection" className="flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            MVP Selection
          </TabsTrigger>
          <TabsTrigger value="criteria" className="flex items-center">
            <Milestone className="h-4 w-4 mr-2" />
            Success Criteria
          </TabsTrigger>
          <TabsTrigger value="roadmap" className="flex items-center">
            <GitBranch className="h-4 w-4 mr-2" />
            Roadmap
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="prioritization" className="space-y-6">
            {renderPrioritizationGrid()}
          </TabsContent>
          
          <TabsContent value="selection" className="space-y-6">
            {renderMVPSelector()}
          </TabsContent>
          
          <TabsContent value="criteria" className="space-y-6">
            {renderSuccessCriteriaBuilder()}
          </TabsContent>
          
          <TabsContent value="roadmap" className="space-y-6">
            {renderRoadmapVisualizer()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}