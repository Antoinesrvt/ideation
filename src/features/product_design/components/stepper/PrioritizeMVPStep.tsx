import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, ArrowRight, Check, X, ChevronRight, ChevronDown, RefreshCw, Clock, Sparkles, Target, Calendar, BarChart2, PieChart, AlertCircle, Layers } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Solution } from '../ProblemSolutionFit';
import { useProductStepper } from '@/context/product-stepper-context';
import { useProjectStore } from '@/store/project-store';

// Create memoized Select components to prevent unnecessary re-renders
const MemoizedSelect = React.memo(<T extends string = string>({
  defaultValue,
  value,
  onValueChange,
  children,
  placeholder,
  className
}: {
  defaultValue?: T;
  value?: T;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  className?: string;
}) => {
  // Create a stable wrapper function to handle the value change
  const handleValueChange = React.useCallback((val: string) => {
    if (onValueChange) {
      onValueChange(val);
    }
  }, [onValueChange]);
  
  return (
    <Select 
      defaultValue={defaultValue as string} 
      value={value as string} 
      onValueChange={handleValueChange}
    >
      <SelectTrigger className={className || "w-[180px]"}>
        <SelectValue placeholder={placeholder || "Select an option"} />
      </SelectTrigger>
      {children}
    </Select>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only compare value and defaultValue
  return prevProps.value === nextProps.value && 
         prevProps.defaultValue === nextProps.defaultValue;
});

MemoizedSelect.displayName = "MemoizedSelect";

// Create a memoized checkbox component to prevent unnecessary re-renders
const MemoizedCheckbox = React.memo(({ 
  checked, 
  onCheckedChange,
  className 
}: { 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}) => {
  // Create a stable callback function that won't change on re-renders
  const handleChange = useCallback((value: boolean) => {
    onCheckedChange(value);
  }, [onCheckedChange]);

  return (
    <Checkbox
      checked={checked}
      onCheckedChange={handleChange}
      className={className}
    />
  );
}, 
// Custom comparison function to prevent re-renders unless props change
(prevProps, nextProps) => 
  prevProps.checked === nextProps.checked && 
  prevProps.className === nextProps.className
);

MemoizedCheckbox.displayName = 'MemoizedCheckbox';

// Memoized Slider component
const MemoizedSlider = React.memo(({
  value,
  onValueChange,
  min = 1,
  max = 100,
  step = 1,
  disabled = false
}: {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}) => {
  return (
    <Slider
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    />
  );
});

MemoizedSlider.displayName = "MemoizedSlider";

// Define the types here
export interface ProductFeature {
  id: string;
  name: string; // Using name to match DB structure
  description?: string;
  priority: 'must' | 'should' | 'could' | 'wont';
  status: 'planned' | 'in_progress' | 'completed';
  tags?: string[];
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

interface MVPFeature extends ProductFeature {
  effortScore: number; // 1-100
  valueScore: number; // 1-100
  isSelected: boolean;
  estimatedTime?: number; // in days
  assignedTo?: string;
}

interface PrioritizeMVPStepProps {
  // Optional props for overriding behavior if needed
  onUpdateFeature?: (id: string, updates: Partial<ProductFeature>) => void;
  onUpdateMVPScope?: (featureIds: string[]) => void;
  onSaveSuccessCriteria?: (criteria: SuccessCriterion[]) => void;
  onSaveTimeline?: (timeline: TimelinePhase[]) => void;
}

export function PrioritizeMVPStep({
  onUpdateFeature,
  onUpdateMVPScope,
  onSaveSuccessCriteria,
  onSaveTimeline
}: PrioritizeMVPStepProps) {
  const { toast } = useToast();
  const { currentData } = useProjectStore();
  const projectId = currentData?.project?.id;
  
  const [activeTab, setActiveTab] = useState("mvp-selection");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTimelineDialogOpen, setIsTimelineDialogOpen] = useState(false);
  const [isSuccessCriteriaDialogOpen, setIsSuccessCriteriaDialogOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<MVPFeature | null>(null);
  
  // Add a stable callback for the view filter change
  const handleViewFilterChange = useCallback((value: string) => {
    console.log("View filter changed:", value);
    // Add your filtering logic here
  }, []);
  
  // Use refs to store previous values for comparison
  const prevDbFeaturesRef = useRef<any[]>([]);
  const prevDbSelectedFeaturesRef = useRef<string[]>([]);
  const prevDbSuccessCriteriaRef = useRef<SuccessCriterion[]>([]);
  const prevDbTimelineRef = useRef<TimelinePhase[]>([]);
  
  // Track if initial data has been loaded
  const initialLoadRef = useRef({
    features: false,
    selected: false,
    criteria: false,
    timeline: false
  });
  
  // Use hooks to get data from the database
  const {
    features: dbFeatures,
    selectedMVPFeatures: dbSelectedFeatures,
    successCriteria: dbSuccessCriteria,
    timeline: dbTimeline,
    updateFeature: updateFeatureInStore,
    updateMVPScope: updateMVPScopeInStore,
    saveSuccessCriteria: saveSuccessCriteriaInStore,
    saveTimeline: saveTimelineInStore,
    isLoading
  } = useProductStepper();

  // Convert database features to MVPFeature type
  const [mvpFeatures, setMvpFeatures] = useState<MVPFeature[]>([]);
  const [selectedMVPFeatures, setSelectedMVPFeatures] = useState<string[]>([]);
  const [successCriteria, setSuccessCriteria] = useState<SuccessCriterion[]>([]);
  const [timeline, setTimeline] = useState<TimelinePhase[]>([]);
  
  // Initialize form states
  const [newCriterion, setNewCriterion] = useState<SuccessCriterion>({
    id: "",
    title: "",
    description: "",
    metricType: "qualitative",
    isAchieved: false,
  });

  const [newPhase, setNewPhase] = useState<Omit<TimelinePhase, "id">>({
    title: "",
    startDate: "",
    endDate: "",
    features: [],
    milestones: [],
  });

  // Memoize form state update handlers
  const handlePriorityChange = useCallback((value: "must" | "should" | "could" | "wont") => {
    setCurrentFeature(prev => {
      if (!prev) return prev;
      return { ...prev, priority: value };
    });
  }, []);

  const handleEffortScoreChange = useCallback((values: number[]) => {
    setCurrentFeature(prev => {
      if (!prev) return prev;
      return { ...prev, effortScore: values[0] };
    });
  }, []);

  const handleValueScoreChange = useCallback((values: number[]) => {
    setCurrentFeature(prev => {
      if (!prev) return prev;
      return { ...prev, valueScore: values[0] };
    });
  }, []);

  const handleIsSelectedChange = useCallback((checked: boolean) => {
    setCurrentFeature(prev => {
      if (!prev) return prev;
      return { ...prev, isSelected: checked };
    });
  }, []);

  const handleMetricTypeChange = useCallback((value: string) => {
    // Ensure value is one of our allowed types
    if (value === "qualitative" || value === "quantitative") {
      setNewCriterion(prev => ({ ...prev, metricType: value as "qualitative" | "quantitative" }));
    }
  }, []);

  // Helper function for deep comparison
  const hasDataChanged = (prev: any, current: any): boolean => {
    if (!prev || !current) return true;
    return JSON.stringify(prev) !== JSON.stringify(current);
  };

  // Load features data from database
  useEffect(() => {
    if (isLoading || !dbFeatures || dbFeatures.length === 0) {
      return;
    }
    
    // Skip if the data hasn't changed
    if (!hasDataChanged(prevDbFeaturesRef.current, dbFeatures)) {
      return;
    }
    
    // Update ref for future comparison
    prevDbFeaturesRef.current = dbFeatures;
    
    // Convert features to MVPFeature type
    const convertedFeatures: MVPFeature[] = dbFeatures.map(feature => {
      const metadata = feature.metadata && typeof feature.metadata === 'object' 
        ? feature.metadata as Record<string, any> 
        : {};
      
      return {
        id: feature.id,
        name: feature.name,
        description: feature.description || "",
        priority: feature.priority as 'must' | 'should' | 'could' | 'wont',
        status: feature.status as 'planned' | 'in_progress' | 'completed',
        tags: feature.tags || [],
        
        // Extract metadata with defaults
        effortScore: metadata.effortScore !== undefined ? metadata.effortScore : 50,
        valueScore: metadata.valueScore !== undefined ? metadata.valueScore : 50,
        isSelected: metadata.isSelected !== undefined ? metadata.isSelected : false,
        estimatedTime: metadata.estimatedTime,
        assignedTo: metadata.assignedTo
      };
    });
    
    setMvpFeatures(convertedFeatures);
    initialLoadRef.current.features = true;
  }, [isLoading, dbFeatures]);
  
  // Handle selected MVP features updates
  useEffect(() => {
    if (isLoading || !dbSelectedFeatures || !initialLoadRef.current.features) {
      return;
    }
    
    // Skip if the data hasn't changed
    if (!hasDataChanged(prevDbSelectedFeaturesRef.current, dbSelectedFeatures)) {
      return;
    }
    
    // Update ref for future comparison
    prevDbSelectedFeaturesRef.current = dbSelectedFeatures;
    
    setSelectedMVPFeatures(dbSelectedFeatures);
    initialLoadRef.current.selected = true;
  }, [isLoading, dbSelectedFeatures]);
  
  // Handle success criteria updates
  useEffect(() => {
    if (isLoading || !dbSuccessCriteria || !initialLoadRef.current.features) {
      return;
    }
    
    // Skip if the data hasn't changed
    if (!hasDataChanged(prevDbSuccessCriteriaRef.current, dbSuccessCriteria)) {
      return;
    }
    
    // Update ref for future comparison
    prevDbSuccessCriteriaRef.current = dbSuccessCriteria;
    
    setSuccessCriteria(dbSuccessCriteria);
    initialLoadRef.current.criteria = true;
  }, [isLoading, dbSuccessCriteria]);
  
  // Handle timeline updates
  useEffect(() => {
    if (isLoading || !dbTimeline || !initialLoadRef.current.features) {
      return;
    }
    
    // Skip if the data hasn't changed
    if (!hasDataChanged(prevDbTimelineRef.current, dbTimeline)) {
      return;
    }
    
    // Update ref for future comparison
    prevDbTimelineRef.current = dbTimeline;
    
    setTimeline(dbTimeline);
    initialLoadRef.current.timeline = true;
  }, [isLoading, dbTimeline]);
  
  // Toggle feature selection with optimized React state updates
  const toggleFeatureSelection = useCallback((id: string) => {
    // Use a reference to track if we've already performed the update
    // This prevents duplicate state updates that could cause render loops
    const updateRef = { performed: false };
    
    // Update mvpFeatures with functional update
    setMvpFeatures(prevFeatures => {
      // Find the feature in the previous state
      const feature = prevFeatures.find(f => f.id === id);
      if (!feature) return prevFeatures;
      
      // Determine the new selection state
      const newIsSelected = !feature.isSelected;
      
      // Calculate the new set of selected IDs from the updated features array
      // instead of using the selectedMVPFeatures from the closure
      const newSelectedIds = prevFeatures
        .map(f => f.id === id ? { ...f, isSelected: newIsSelected } : f)
        .filter(f => f.isSelected)
        .map(f => f.id);
        
      // Schedule the selectedMVPFeatures update if we haven't done it yet
      if (!updateRef.performed) {
        updateRef.performed = true;
        
        // Update selectedMVPFeatures in the next tick to avoid render conflicts
        setTimeout(() => {
          setSelectedMVPFeatures(newSelectedIds);
          
          // Use another timeout to break the potential render cycle
          // This ensures all component rendering is complete before context updates
          setTimeout(() => {
            // Update context or call prop handler if provided
            if (onUpdateMVPScope) {
              onUpdateMVPScope(newSelectedIds);
            } else if (updateMVPScopeInStore) {
              updateMVPScopeInStore(newSelectedIds);
            }
          }, 0);
        }, 0);
      }
      
      // Return the updated features array
      return prevFeatures.map(f => 
        f.id === id ? { ...f, isSelected: newIsSelected } : f
      );
    });
    
  }, [onUpdateMVPScope, updateMVPScopeInStore]);
  
  // Update feature scores with functional state updates
  const updateFeatureScore = useCallback(async (id: string, field: 'effortScore' | 'valueScore', value: number) => {
    // Update local state using functional updates
    setMvpFeatures(prevFeatures => 
      prevFeatures.map(feature => 
        feature.id === id ? { ...feature, [field]: value } : feature
      )
    );
    
    try {
      // Use prop handler if provided, otherwise use hook
      if (onUpdateFeature) {
        onUpdateFeature(id, { [field]: value });
      } else {
        await updateFeatureInStore(id, { 
          metadata: { [field]: value }
        });
      }
    } catch (error) {
      console.error(`Error updating feature ${field}:`, error);
      toast({
        title: "Error updating feature",
        description: `There was a problem updating the feature ${field.replace('Score', '')}. Please try again.`,
        variant: "destructive"
      });
    }
  }, [onUpdateFeature, updateFeatureInStore, toast]);
  
  // Add success criterion with useCallback and functional updates
  const addSuccessCriterion = useCallback(async () => {
    if (!newCriterion.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for the success criterion.",
        variant: "destructive"
      });
      return;
    }
    
    const newCriterionWithId = {
      ...newCriterion,
      id: Date.now().toString()
    };
    
    // Use functional update to avoid closures with stale state
    setSuccessCriteria(prevCriteria => {
      const updatedCriteria = [...prevCriteria, newCriterionWithId];
      
      // Fire and forget async operation
      (async () => {
        try {
          // Use prop handler if provided, otherwise use hook
          if (onSaveSuccessCriteria) {
            onSaveSuccessCriteria(updatedCriteria);
          } else {
            await saveSuccessCriteriaInStore(updatedCriteria);
          }
          
          toast({
            title: "Success criterion added",
            description: "The success criterion has been added successfully."
          });
        } catch (error) {
          console.error('Error adding success criterion:', error);
          toast({
            title: "Error adding criterion",
            description: "There was a problem adding the success criterion. Please try again.",
            variant: "destructive"
          });
        }
      })();
      
      return updatedCriteria;
    });
    
    // Reset form
    setNewCriterion({
      id: "",
      title: "",
      description: "",
      metricType: "qualitative",
      isAchieved: false
    });
    
    setIsSuccessCriteriaDialogOpen(false);
  }, [newCriterion, onSaveSuccessCriteria, saveSuccessCriteriaInStore, toast]);
  
  // Update criterion with useCallback and functional updates
  const updateCriterion = useCallback(async (id: string, updates: Partial<SuccessCriterion>) => {
    // Use functional update to avoid closures with stale state
    setSuccessCriteria(prevCriteria => {
      const updatedCriteria = prevCriteria.map(criterion => 
        criterion.id === id ? { ...criterion, ...updates } : criterion
      );
      
      // Fire and forget async operation
      (async () => {
        try {
          // Use prop handler if provided, otherwise use hook
          if (onSaveSuccessCriteria) {
            onSaveSuccessCriteria(updatedCriteria);
          } else {
            await saveSuccessCriteriaInStore(updatedCriteria);
          }
        } catch (error) {
          console.error('Error updating success criterion:', error);
          toast({
            title: "Error updating criterion",
            description: "There was a problem updating the success criterion. Please try again.",
            variant: "destructive"
          });
        }
      })();
      
      return updatedCriteria;
    });
  }, [onSaveSuccessCriteria, saveSuccessCriteriaInStore, toast]);
  
  // Delete criterion with useCallback and functional updates
  const deleteCriterion = useCallback(async (id: string) => {
    // Use functional update to avoid closures with stale state
    setSuccessCriteria(prevCriteria => {
      const updatedCriteria = prevCriteria.filter(criterion => criterion.id !== id);
      
      // Fire and forget async operation
      (async () => {
        try {
          // Use prop handler if provided, otherwise use hook
          if (onSaveSuccessCriteria) {
            onSaveSuccessCriteria(updatedCriteria);
          } else {
            await saveSuccessCriteriaInStore(updatedCriteria);
          }
          
          toast({
            title: "Success criterion deleted",
            description: "The success criterion has been deleted successfully."
          });
        } catch (error) {
          console.error('Error deleting success criterion:', error);
          toast({
            title: "Error deleting criterion",
            description: "There was a problem deleting the success criterion. Please try again.",
            variant: "destructive"
          });
        }
      })();
      
      return updatedCriteria;
    });
  }, [onSaveSuccessCriteria, saveSuccessCriteriaInStore, toast]);
  
  // Add timeline phase with useCallback and functional updates
  const addPhase = useCallback(async () => {
    if (!newPhase.title || !newPhase.startDate || !newPhase.endDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields for the timeline phase.",
        variant: "destructive"
      });
      return;
    }
    
    const newPhaseWithId = {
      ...newPhase,
      id: Date.now().toString()
    };
    
    // Use functional update to avoid closures with stale state
    setTimeline(prevTimeline => {
      const updatedTimeline = [...prevTimeline, newPhaseWithId];
      
      // Fire and forget async operation
      (async () => {
        try {
          // Use prop handler if provided, otherwise use hook
          if (onSaveTimeline) {
            onSaveTimeline(updatedTimeline);
          } else {
            await saveTimelineInStore(updatedTimeline);
          }
          
          toast({
            title: "Timeline phase added",
            description: "The timeline phase has been added successfully."
          });
        } catch (error) {
          console.error('Error adding timeline phase:', error);
          toast({
            title: "Error adding phase",
            description: "There was a problem adding the timeline phase. Please try again.",
            variant: "destructive"
          });
        }
      })();
      
      return updatedTimeline;
    });
    
    // Reset form
    setNewPhase({
      title: "",
      startDate: "",
      endDate: "",
      features: [],
      milestones: []
    });
    
    setIsTimelineDialogOpen(false);
  }, [newPhase, onSaveTimeline, saveTimelineInStore, toast]);
  

  // Show loading state if data is loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading data...</p>
      </div>
    );
  }

  // Calculate MVP metrics
  const mvpMetrics = {
    totalFeatures: dbFeatures.length,
    selectedFeatures: selectedMVPFeatures.length,
    estimatedEffort: mvpFeatures
      .filter((f) => f.isSelected)
      .reduce((sum, f) => sum + (f.estimatedTime || 0), 0),
    averageValue:
      mvpFeatures.filter((f) => f.isSelected).length > 0
        ? mvpFeatures
            .filter((f) => f.isSelected)
            .reduce((sum, f) => sum + f.valueScore, 0) /
          mvpFeatures.filter((f) => f.isSelected).length
        : 0,
  };

  const handleEditFeature = useCallback((feature: MVPFeature) => {
    setCurrentFeature(feature);
    setIsDialogOpen(true);
  }, []);

  const saveFeatureChanges = useCallback(() => {
    if (!currentFeature) return;

    // Use functional update to avoid stale state
    setMvpFeatures(prev =>
      prev.map(feature =>
        feature.id === currentFeature.id ? currentFeature : feature
      )
    );

    // Update selection state if needed
    if (currentFeature.isSelected) {
      setSelectedMVPFeatures(prev => {
        if (prev.includes(currentFeature.id)) return prev;
        return [...prev, currentFeature.id];
      });
    } else {
      setSelectedMVPFeatures(prev => 
        prev.filter(id => id !== currentFeature.id)
      );
    }

    // Save changes to parent component if handler provided
    if (onUpdateFeature) {
      const {
        effortScore,
        valueScore,
        isSelected,
        estimatedTime,
        assignedTo,
        ...updatableProps
      } = currentFeature;
      onUpdateFeature(currentFeature.id, updatableProps);
    }

    setIsDialogOpen(false);
    setCurrentFeature(null);

    toast({
      title: "Feature updated",
      description: "The feature has been updated successfully.",
    });
  }, [currentFeature, onUpdateFeature, toast]);

  const handleOpenFeatureDialog = useCallback(() => setIsDialogOpen(true), []);
  const handleCloseFeatureDialog = useCallback(() => setIsDialogOpen(false), []);
  
  const handleOpenSuccessCriteriaDialog = useCallback(() => setIsSuccessCriteriaDialogOpen(true), []);
  const handleCloseSuccessCriteriaDialog = useCallback(() => setIsSuccessCriteriaDialogOpen(false), []);
  
  const handleOpenTimelineDialog = useCallback(() => setIsTimelineDialogOpen(true), []);
  const handleCloseTimelineDialog = useCallback(() => setIsTimelineDialogOpen(false), []);

  const renderPrioritizationGrid = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">MVP Feature Selection</h3>
            <p className="text-sm text-muted-foreground">
              Prioritize features based on value and effort
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <MemoizedSelect
              defaultValue="effort-value"
              onValueChange={handleViewFilterChange}
            >
              <SelectContent>
                <SelectItem value="effort-value">Effort vs. Value</SelectItem>
                <SelectItem value="moscow">MoSCoW Priority</SelectItem>
                <SelectItem value="custom">Custom Ranking</SelectItem>
              </SelectContent>
            </MemoizedSelect>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="relative aspect-square border rounded-lg overflow-hidden bg-muted/20">
          {/* Chart background */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            <div className="border-b border-r p-3 flex items-end justify-end">
              <Badge variant="destructive" className="opacity-30">
                High Value, Low Effort
              </Badge>
            </div>
            <div className="border-b border-l p-3 flex items-end justify-start">
              <Badge variant="warning" className="opacity-30">
                High Value, High Effort
              </Badge>
            </div>
            <div className="border-t border-r p-3 flex items-start justify-end">
              <Badge className="opacity-30">Low Value, Low Effort</Badge>
            </div>
            <div className="border-t border-l p-3 flex items-start justify-start">
              <Badge variant="outline" className="opacity-30">
                Low Value, High Effort
              </Badge>
            </div>
          </div>

          {/* X and Y axis labels */}
          <div className="absolute w-full bottom-2 text-center text-xs text-muted-foreground">
            Effort →
          </div>
          <div className="absolute h-full left-2 flex items-center justify-center">
            <div className="transform -rotate-90 text-xs text-muted-foreground whitespace-nowrap">
              Value →
            </div>
          </div>

          {/* Scatter plot of features */}
          <div className="absolute inset-8">
            {mvpFeatures.map((feature) => (
              <div
                key={feature.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 ${
                  feature.isSelected ? "ring-2 ring-primary" : ""
                }`}
                style={{
                  left: `${feature.effortScore}%`,
                  top: `${100 - feature.valueScore}%`,
                }}
              >
                <button
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    feature.isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border shadow-sm hover:bg-muted"
                  }`}
                  onClick={() => toggleFeatureSelection(feature.id)}
                  title={feature.name.substring(0, 2).toUpperCase()}
                >
                  {feature.name.substring(0, 2).toUpperCase()}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Selected for MVP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {mvpMetrics.selectedFeatures}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  / {mvpMetrics.totalFeatures}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Estimated Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {mvpMetrics.estimatedEffort}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  days
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feature List</CardTitle>
            <CardDescription>
              Select features to include in your MVP
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {mvpFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className="p-4 flex items-center hover:bg-muted/50"
                >
                  <MemoizedCheckbox
                    checked={feature.isSelected}
                    onCheckedChange={(checked) => {
                      if (checked !== feature.isSelected) {
                        toggleFeatureSelection(feature.id);
                      }
                    }}
                    className="mr-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <Badge
                        variant={
                          feature.priority === "must"
                            ? "destructive"
                            : feature.priority === "should"
                            ? "warning"
                            : feature.priority === "could"
                            ? "success"
                            : "outline"
                        }
                        className="mr-2"
                      >
                        {feature.priority}
                      </Badge>
                      <h4 className="font-medium">{feature.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {feature.description || "No description"}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-1">
                    <div className="text-sm flex items-center">
                      <span className="text-muted-foreground mr-2">Value:</span>
                      <span className="font-medium">
                        {feature.valueScore}/100
                      </span>
                    </div>
                    <div className="text-sm flex items-center">
                      <span className="text-muted-foreground mr-2">
                        Effort:
                      </span>
                      <span className="font-medium">
                        {feature.effortScore}/100
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-4"
                    onClick={() => handleEditFeature(feature)}
                  >
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMVPSelector = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">MVP Definition</h3>
            <p className="text-sm text-muted-foreground">
              Define the scope of your Minimum Viable Product
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Selected MVP Features</CardTitle>
              <CardDescription>
                Features that will be included in your first release
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {selectedMVPFeatures.length === 0 ? (
                <div className="p-6 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium mb-1">
                    No features selected yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Use the prioritization grid to select which features to
                    include in your MVP.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {selectedMVPFeatures.map((featureId) => {
                    const feature = mvpFeatures.find(
                      (f) => f.id === featureId
                    );
                    return feature ? (
                      <div
                        key={feature.id}
                        className="p-4 flex items-start hover:bg-muted/50"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <Badge
                              variant={
                                feature.priority === "must"
                                  ? "destructive"
                                  : feature.priority === "should"
                                  ? "warning"
                                  : feature.priority === "could"
                                  ? "success"
                                  : "outline"
                              }
                              className="mr-2"
                            >
                              {feature.priority}
                            </Badge>
                            <h4 className="font-medium">{feature.name}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {feature.description || "No description"}
                          </p>
                          <div className="flex items-center mt-2 text-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                            <span>{feature.estimatedTime} days</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-4"
                          onClick={() => toggleFeatureSelection(feature.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-muted/50 py-3 px-4">
              <div className="flex justify-between items-center w-full">
                <div className="text-sm">
                  <span className="font-medium">
                    {selectedMVPFeatures.length}
                  </span>{" "}
                  features selected
                </div>
                <div className="text-sm">
                  Estimated time:{" "}
                  <span className="font-medium">
                    {mvpMetrics.estimatedEffort} days
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Success Criteria</CardTitle>
                <CardDescription>
                  Define how you'll measure MVP success
                </CardDescription>
              </CardHeader>
              <CardContent>
                {successCriteria.length === 0 ? (
                  <div className="text-center py-4">
                    <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No success criteria defined yet
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {successCriteria.map((criterion) => (
                      <li key={criterion.id} className="flex items-start">
                        <MemoizedCheckbox
                          checked={criterion.isAchieved}
                          onCheckedChange={(checked) =>
                            updateCriterion(criterion.id, {
                              isAchieved: !!checked,
                            })
                          }
                          className="mt-1 mr-2"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{criterion.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {criterion.description}
                          </div>
                          {criterion.metricType === "quantitative" &&
                            criterion.targetValue && (
                              <div className="text-xs mt-1">
                                Target:{" "}
                                <span className="font-medium">
                                  {criterion.targetValue}
                                </span>
                                {criterion.currentValue && (
                                  <>
                                    {" "}
                                    • Current:{" "}
                                    <span className="font-medium">
                                      {criterion.currentValue}
                                    </span>
                                  </>
                                )}
                              </div>
                            )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleOpenSuccessCriteriaDialog}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Criterion
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>Plan your development phases</CardDescription>
              </CardHeader>
              <CardContent>
                {timeline.length === 0 ? (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No timeline phases defined yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {timeline.map((phase) => (
                      <div
                        key={phase.id}
                        className="border rounded-md overflow-hidden"
                      >
                        <div className="bg-muted p-3">
                          <div className="font-medium">{phase.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(phase.startDate).toLocaleDateString()} to{" "}
                            {new Date(phase.endDate).toLocaleDateString()}
                          </div>
                        </div>
                        {phase.features.length > 0 && (
                          <div className="p-3 text-sm">
                            <div className="font-medium mb-2">
                              {phase.features.length} Features:
                            </div>
                            <ul className="space-y-1">
                              {phase.features.map((featureId) => {
                                const feature = mvpFeatures.find(
                                  (f) => f.id === featureId
                                );
                                return feature ? (
                                  <li
                                    key={featureId}
                                    className="flex justify-between"
                                  >
                                    <span>{feature.name}</span>
                                    <span className="text-muted-foreground">
                                      {feature.estimatedTime} days
                                    </span>
                                  </li>
                                ) : null;
                              })}
                            </ul>
                          </div>
                        )}
                        {phase.milestones.length > 0 && (
                          <div className="border-t p-3 text-sm bg-background">
                            <div className="font-medium mb-1">Milestones:</div>
                            {phase.milestones.map((milestone) => (
                              <div
                                key={milestone.id}
                                className="flex justify-between"
                              >
                                <span>{milestone.title}</span>
                                <span className="text-muted-foreground">
                                  {new Date(
                                    milestone.date
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button size="sm" onClick={handleOpenTimelineDialog}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Phase
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderSuccessCriteriaBuilder = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Success Criteria</h3>
            <p className="text-sm text-muted-foreground">
              Define how you'll measure the success of your MVP
            </p>
          </div>
          <Button onClick={handleOpenSuccessCriteriaDialog}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Criterion
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Why Define Success Criteria?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>Defining clear success criteria for your MVP helps you:</p>
              <ul>
                <li>Establish measurable goals to evaluate your MVP against</li>
                <li>Align your team around what success looks like</li>
                <li>Make data-driven decisions about future development</li>
                <li>Determine when you've validated your core assumptions</li>
              </ul>

              <h4 className="text-foreground">
                Qualitative vs. Quantitative Criteria
              </h4>
              <p>
                <strong>Qualitative criteria</strong> focus on aspects that
                can't easily be measured with numbers, such as user satisfaction
                or experience quality.
              </p>
              <p>
                <strong>Quantitative criteria</strong> involve specific,
                measurable metrics with target values, such as conversion rates
                or user engagement.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Current Success Criteria</CardTitle>
            <CardDescription>
              {successCriteria.length === 0
                ? "You haven't defined any success criteria yet"
                : `${successCriteria.length} criteria defined`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {successCriteria.length === 0 ? (
              <div className="text-center py-12 px-6">
                <Target className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No success criteria defined yet
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Success criteria help you measure whether your MVP is
                  achieving its goals.
                </p>
                <Button onClick={handleOpenSuccessCriteriaDialog}>
                  Define Your First Success Criterion
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {successCriteria.map((criterion) => (
                  <div key={criterion.id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium">{criterion.title}</h4>
                          <Badge
                            className="ml-2"
                            variant={
                              criterion.metricType === "quantitative"
                                ? "default"
                                : "outline"
                            }
                          >
                            {criterion.metricType === "quantitative"
                              ? "Quantitative"
                              : "Qualitative"}
                          </Badge>
                          <Badge
                            className="ml-2"
                            variant={
                              criterion.isAchieved ? "success" : "outline"
                            }
                          >
                            {criterion.isAchieved ? "Achieved" : "Not Achieved"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {criterion.description}
                        </p>

                        {criterion.metricType === "quantitative" && (
                          <div className="mt-2 text-sm">
                            {criterion.targetValue && (
                              <div>
                                <span className="text-muted-foreground">
                                  Target:
                                </span>{" "}
                                {criterion.targetValue}
                              </div>
                            )}
                            {criterion.currentValue && (
                              <div>
                                <span className="text-muted-foreground">
                                  Current:
                                </span>{" "}
                                {criterion.currentValue}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setNewCriterion(criterion);
                            handleOpenSuccessCriteriaDialog();
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCriterion(criterion.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {criterion.metricType === "quantitative" &&
                      criterion.targetValue &&
                      criterion.currentValue && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>0</span>
                            <span>{criterion.targetValue}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                criterion.isAchieved
                                  ? "bg-green-500"
                                  : "bg-primary"
                              } rounded-full`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (parseFloat(criterion.currentValue || "0") /
                                    parseFloat(criterion.targetValue || "1")) *
                                    100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRoadmapVisualizer = () => {
    const today = new Date();

    // If no timeline exists, show a message
    if (timeline.length === 0) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Development Roadmap</h3>
              <p className="text-sm text-muted-foreground">
                Plan your product development beyond the MVP
              </p>
            </div>
            <Button onClick={handleOpenTimelineDialog}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Timeline
            </Button>
          </div>

          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No development roadmap yet
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Create a timeline to plan your development phases, starting with
                your MVP and extending to future releases.
              </p>
              <Button onClick={handleOpenTimelineDialog}>
                Create Your First Phase
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Development Roadmap</h3>
            <p className="text-sm text-muted-foreground">
              Plan your product development beyond the MVP
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <PieChart className="h-4 w-4 mr-2" />
              Feature Allocation
            </Button>
            <Button onClick={handleOpenTimelineDialog}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Phase
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Timeline Overview</CardTitle>
            <CardDescription>
              Your development phases and milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              {/* Timeline visualization */}
              <div className="border-l border-primary/30 ml-4 pl-6 py-2">
                {timeline.map((phase, index) => {
                  const startDate = new Date(phase.startDate);
                  const endDate = new Date(phase.endDate);
                  const duration = Math.round(
                    (endDate.getTime() - startDate.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div key={phase.id} className="mb-8 relative">
                      {/* Phase marker */}
                      <div className="absolute -left-10 bg-background flex items-center justify-center w-8 h-8 rounded-full border-2 border-primary text-primary font-medium">
                        {index + 1}
                      </div>

                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-primary/10 p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-lg">
                                {phase.title}
                              </h4>
                              <div className="text-sm mt-1 flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                <span>
                                  {startDate.toLocaleDateString()} —{" "}
                                  {endDate.toLocaleDateString()}
                                </span>
                                <Badge variant="outline" className="ml-2">
                                  {duration} days
                                </Badge>
                              </div>
                            </div>
                            <div className="flex">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Edit phase logic
                                  console.log("Edit phase", phase.id);
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium mb-2 flex items-center">
                                <Layers className="h-4 w-4 mr-1.5 text-muted-foreground" />
                                Features ({phase.features.length})
                              </h5>

                              {phase.features.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic">
                                  No features assigned to this phase
                                </div>
                              ) : (
                                <ul className="space-y-2">
                                  {phase.features.map((featureId) => {
                                    const feature = mvpFeatures.find(
                                      (f) => f.id === featureId
                                    );
                                    return feature ? (
                                      <li
                                        key={featureId}
                                        className="text-sm flex justify-between items-center"
                                      >
                                        <div className="flex items-center">
                                          <Badge
                                            variant={
                                              feature.priority === "must"
                                                ? "destructive"
                                                : feature.priority === "should"
                                                ? "warning"
                                                : feature.priority === "could"
                                                ? "success"
                                                : "outline"
                                            }
                                            className="mr-2"
                                          >
                                            {feature.priority}
                                          </Badge>
                                          <span>{feature.name}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            toggleFeatureSelection(feature.id)
                                          }
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </Button>
                                      </li>
                                    ) : null;
                                  })}
                                </ul>
                              )}

                              <div className="mt-3">
                                <Select
                                  onValueChange={(featureId) =>
                                    toggleFeatureSelection(featureId)
                                  }
                                >
                                  <SelectTrigger className="text-sm h-8">
                                    <SelectValue placeholder="Assign feature..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mvpFeatures
                                      .filter(
                                        (f) => !phase.features.includes(f.id)
                                      )
                                      .map((feature) => (
                                        <SelectItem
                                          key={feature.id}
                                          value={feature.id}
                                        >
                                          {feature.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-sm font-medium mb-2 flex items-center">
                                <Target className="h-4 w-4 mr-1.5 text-muted-foreground" />
                                Milestones ({phase.milestones.length})
                              </h5>

                              {phase.milestones.length === 0 ? (
                                <div className="text-sm text-muted-foreground italic">
                                  No milestones for this phase
                                </div>
                              ) : (
                                <ul className="space-y-2">
                                  {phase.milestones.map((milestone) => (
                                    <li
                                      key={milestone.id}
                                      className="text-sm flex justify-between items-center"
                                    >
                                      <div className="flex items-center">
                                        <Checkbox
                                          checked={milestone.isCompleted}
                                          onCheckedChange={(checked) => {
                                            const updatedPhase = {
                                              ...phase,
                                              milestones: phase.milestones.map(
                                                (m) =>
                                                  m.id === milestone.id
                                                    ? {
                                                        ...m,
                                                        isCompleted: !!checked,
                                                      }
                                                    : m
                                              ),
                                            };
                                            // Update phase in store
                                            // This is a placeholder and should be replaced with actual store update logic
                                          }}
                                          className="mr-2"
                                        />
                                        <span>{milestone.title}</span>
                                      </div>
                                      <span className="text-muted-foreground">
                                        {new Date(
                                          milestone.date
                                        ).toLocaleDateString()}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              )}

                              <div className="mt-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-sm h-8"
                                  onClick={() => {
                                    // Add milestone logic
                                    // This is a placeholder and should be replaced with actual store logic
                                  }}
                                >
                                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                                  Add Milestone
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add new phase button */}
                <div className="text-center ml-2">
                  <Button
                    variant="outline"
                    onClick={handleOpenTimelineDialog}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Next Phase
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Debug to track render cycles
  const renderCountRef = useRef(0);
  const uniqueIdRef = useRef(`mvp-step-${Math.random().toString(36).substring(2, 9)}`);
  
  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`[${uniqueIdRef.current}] PrioritizeMVPStep rendered ${renderCountRef.current} times`);
    
    return () => {
      console.log(`[${uniqueIdRef.current}] PrioritizeMVPStep effect cleanup`);
    };
  });

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mvp-selection">MVP Selection</TabsTrigger>
          <TabsTrigger value="mvp-definition">MVP Definition</TabsTrigger>
          <TabsTrigger value="success-criteria">Success Criteria</TabsTrigger>
          <TabsTrigger value="development-roadmap">
            Development Roadmap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mvp-selection" className="mt-6">
          {renderPrioritizationGrid()}
        </TabsContent>

        <TabsContent value="mvp-definition" className="mt-6">
          {renderMVPSelector()}
        </TabsContent>

        <TabsContent value="success-criteria" className="mt-6">
          {renderSuccessCriteriaBuilder()}
        </TabsContent>

        <TabsContent value="development-roadmap" className="mt-6">
          {renderRoadmapVisualizer()}
        </TabsContent>
      </Tabs>

      {/* Edit Feature Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseFeatureDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Feature</DialogTitle>
            <DialogDescription>
              Update feature details and scoring
            </DialogDescription>
          </DialogHeader>

          {currentFeature && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="feature-title">Feature Title</Label>
                  <Input
                    id="feature-title"
                    value={currentFeature.name}
                    onChange={(e) =>
                      setCurrentFeature({
                        ...currentFeature,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feature-priority">Priority</Label>
                  <Select
                    value={currentFeature?.priority}
                    onValueChange={handlePriorityChange}
                  >
                    <SelectTrigger id="feature-priority">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="feature-description">Description</Label>
                <Textarea
                  id="feature-description"
                  value={currentFeature.description || ""}
                  onChange={(e) =>
                    setCurrentFeature({
                      ...currentFeature,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-estimate">Time Estimate (days)</Label>
                <Input
                  id="time-estimate"
                  type="number"
                  min="1"
                  value={currentFeature.estimatedTime || 1}
                  onChange={(e) =>
                    setCurrentFeature({
                      ...currentFeature,
                      estimatedTime: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="value-score">
                    Value Score: {currentFeature.valueScore}
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {currentFeature.valueScore}/100
                  </span>
                </div>
                <MemoizedSlider
                  value={[currentFeature.valueScore]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={handleValueScoreChange}
                />
                <div className="text-xs text-muted-foreground">
                  How valuable is this feature to your users and business?
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label htmlFor="effort-score">
                    Effort Score: {currentFeature.effortScore}
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {currentFeature.effortScore}/100
                  </span>
                </div>
                <MemoizedSlider
                  value={[currentFeature.effortScore]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={handleEffortScoreChange}
                />
                <div className="text-xs text-muted-foreground">
                  How much effort will this feature require to implement?
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <MemoizedCheckbox
                  checked={currentFeature.isSelected}
                  onCheckedChange={handleIsSelectedChange}
                  className="mr-4"
                />
                <Label htmlFor="include-mvp">Include in MVP</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseFeatureDialog}>
              Cancel
            </Button>
            <Button onClick={saveFeatureChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Success Criterion Dialog */}
      <Dialog
        open={isSuccessCriteriaDialogOpen}
        onOpenChange={handleCloseSuccessCriteriaDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {newCriterion.id
                ? "Edit Success Criterion"
                : "Add Success Criterion"}
            </DialogTitle>
            <DialogDescription>
              Define how you'll measure the success of your MVP
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="criterion-title">Title</Label>
              <Input
                id="criterion-title"
                value={newCriterion.title}
                onChange={(e) =>
                  setNewCriterion({ ...newCriterion, title: e.target.value })
                }
                placeholder="e.g., User Adoption Rate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="criterion-description">Description</Label>
              <Textarea
                id="criterion-description"
                value={newCriterion.description}
                onChange={(e) =>
                  setNewCriterion({
                    ...newCriterion,
                    description: e.target.value,
                  })
                }
                placeholder="Describe what you're measuring and why it's important"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="criterion-type">Metric Type</Label>
              <MemoizedSelect
                value={newCriterion.metricType}
                onValueChange={handleMetricTypeChange}
                placeholder="Select metric type"
              >
                <SelectContent>
                  <SelectItem value="qualitative">Qualitative</SelectItem>
                  <SelectItem value="quantitative">Quantitative</SelectItem>
                </SelectContent>
              </MemoizedSelect>
              <div className="text-xs text-muted-foreground">
                Qualitative metrics are descriptive and subjective. Quantitative
                metrics are numerical and measurable.
              </div>
            </div>

            {newCriterion.metricType === "quantitative" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-value">Target Value</Label>
                  <Input
                    id="target-value"
                    value={newCriterion.targetValue || ""}
                    onChange={(e) =>
                      setNewCriterion({
                        ...newCriterion,
                        targetValue: e.target.value,
                      })
                    }
                    placeholder="e.g., 1000 users or 25%"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-value">Current Value</Label>
                  <Input
                    id="current-value"
                    value={newCriterion.currentValue || ""}
                    onChange={(e) =>
                      setNewCriterion({
                        ...newCriterion,
                        currentValue: e.target.value,
                      })
                    }
                    placeholder="e.g., 250 users or 10%"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <MemoizedCheckbox
                checked={newCriterion.isAchieved}
                onCheckedChange={(checked) =>
                  setNewCriterion({ ...newCriterion, isAchieved: !!checked })
                }
              />
              <Label htmlFor="is-achieved">Achieved</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseSuccessCriteriaDialog}
            >
              Cancel
            </Button>
            <Button onClick={addSuccessCriterion}>
              {newCriterion.id ? "Update Criterion" : "Add Criterion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Timeline Phase Dialog */}
      <Dialog
        open={isTimelineDialogOpen}
        onOpenChange={handleCloseTimelineDialog}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Timeline Phase</DialogTitle>
            <DialogDescription>
              Define a development phase for your product roadmap
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="phase-title">Phase Title</Label>
              <Input
                id="phase-title"
                value={newPhase.title}
                onChange={(e) =>
                  setNewPhase({ ...newPhase, title: e.target.value })
                }
                placeholder="e.g., MVP Release, Version 1.0, Beta"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newPhase.startDate}
                  onChange={(e) =>
                    setNewPhase({ ...newPhase, startDate: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newPhase.endDate}
                  onChange={(e) =>
                    setNewPhase({ ...newPhase, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Milestones</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setNewPhase({
                      ...newPhase,
                      milestones: [
                        ...newPhase.milestones,
                        {
                          id: `milestone-temp-${Date.now()}`,
                          title: "",
                          date: new Date().toISOString().split("T")[0],
                          isCompleted: false,
                        },
                      ],
                    });
                  }}
                >
                  <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                  Add Milestone
                </Button>
              </div>

              {newPhase.milestones.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2">
                  No milestones added yet. Milestones help track important
                  events in your timeline.
                </div>
              ) : (
                <div className="space-y-2">
                  {newPhase.milestones.map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className="flex items-center space-x-2"
                    >
                      <Input
                        value={milestone.title}
                        onChange={(e) => {
                          const updatedMilestones = [...newPhase.milestones];
                          updatedMilestones[index] = {
                            ...milestone,
                            title: e.target.value,
                          };
                          setNewPhase({
                            ...newPhase,
                            milestones: updatedMilestones,
                          });
                        }}
                        placeholder="Milestone title"
                        className="flex-1"
                      />
                      <Input
                        type="date"
                        value={milestone.date}
                        onChange={(e) => {
                          const updatedMilestones = [...newPhase.milestones];
                          updatedMilestones[index] = {
                            ...milestone,
                            date: e.target.value,
                          };
                          setNewPhase({
                            ...newPhase,
                            milestones: updatedMilestones,
                          });
                        }}
                        className="w-40"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updatedMilestones = newPhase.milestones.filter(
                            (_, i) => i !== index
                          );
                          setNewPhase({
                            ...newPhase,
                            milestones: updatedMilestones,
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseTimelineDialog}
            >
              Cancel
            </Button>
            <Button onClick={addPhase}>Add Phase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}