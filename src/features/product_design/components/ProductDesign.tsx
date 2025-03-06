import React, { useState, useMemo } from 'react';

import {   Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter} from '@/components/ui/card';
import { Button } from '@/components/ui/button';  
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Users, PlusCircle, LightbulbIcon, ChevronDown, Info, 
  PencilRuler, MonitorSmartphone, LayoutPanelLeft, ArrowRight,
  Check, X, BarChart2
} from 'lucide-react';
import { useProjectStore } from '@/store';
import { useAIStore } from '@/hooks/useAIStore';
import { generateId } from '@/lib/utils';
import { ProductFeature, ProductWireframe, ProductJourneyStage } from '@/store/types';

// Extended types for UI that add status for comparison mode
interface ExtendedProductFeature extends Omit<ProductFeature, 'status'> {
  status?: 'new' | 'modified' | 'unchanged' | 'removed' | string | null;
}

interface ExtendedProductWireframe extends ProductWireframe {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

interface ExtendedProductJourneyStage extends ProductJourneyStage {
  status?: 'new' | 'modified' | 'unchanged' | 'removed';
}

// Define UI data structure
interface ProductDesignUIData {
  wireframes: ExtendedProductWireframe[];
  features: ExtendedProductFeature[];
  journeyStages: ExtendedProductJourneyStage[];
}

export const ProductDesign: React.FC = () => {
  const { 
    currentData,
    comparisonMode,
    stagedData,
    addProductWireframe,
    addProductFeature,
    addProductJourneyStage,
    updateProductWireframe,
    updateProductFeature,
    updateProductJourneyStage,
    deleteProductWireframe,
    deleteProductFeature,
    deleteProductJourneyStage
  } = useProjectStore();
  
  const { acceptAIChanges, rejectAIChanges } = useAIStore();
  
  // Track which help sections are expanded
  const [expandedHelp, setExpandedHelp] = useState<{
    wireframes: boolean;
    features: boolean;
    journey: boolean;
  }>({
    wireframes: false,
    features: false,
    journey: false
  });

  // Track which journey stage is currently selected
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  
  // Get current data from the store
  const data = useMemo(() => ({
    wireframes: currentData.productWireframes || [],
    features: currentData.productFeatures || [],
    journeyStages: currentData.productJourneyStages || []
  }), [currentData]);
  
  // Get staged data if in comparison mode
  const stagedUIData = useMemo(() => {
    if (!comparisonMode || !stagedData) return null;
    
    return {
      wireframes: stagedData.productWireframes || [],
      features: stagedData.productFeatures || [],
      journeyStages: stagedData.productJourneyStages || []
    };
  }, [comparisonMode, stagedData]);
  
  // Helper function to determine if an item is new/modified in comparison mode
  const getItemStatus = (
    section: 'wireframes' | 'features' | 'journeyStages',
    itemId: string
  ): 'new' | 'modified' | 'unchanged' | 'removed' => {
    if (!comparisonMode || !stagedUIData) return 'unchanged';
    
    const currentItem = data[section].find(item => item.id === itemId);
    const stagedItem = stagedUIData[section].find(item => item.id === itemId);
    
    if (!currentItem && stagedItem) return 'new';
    if (currentItem && !stagedItem) return 'removed';
    if (currentItem && stagedItem) {
      return JSON.stringify(currentItem) !== JSON.stringify(stagedItem) ? 'modified' : 'unchanged';
    }
    
    return 'unchanged';
  };
  
  // Calculate design dashboard metrics
  const designStats = useMemo(() => {
    const totalWireframes = data.wireframes.length;
    const totalFeatures = data.features.length;
    const totalJourneyStages = data.journeyStages.length;
    
    const priorityFeatures = data.features.filter(f => f.priority === 'high').length;
    
    return {
      totalWireframes,
      totalFeatures,
      totalJourneyStages,
      priorityFeatures,
      designProgress: Math.min(Math.round((totalWireframes + totalFeatures + totalJourneyStages) / 10 * 100), 100)
    };
  }, [data]);

  // Handle adding a new wireframe
  const handleAddWireframe = () => {
    const projectId = currentData.project?.id || '';
    
    addProductWireframe({
      id: generateId(),
      name: 'New Wireframe',
      description: '',
      image_url: null,
      screen_type: 'desktop',
      order_index: data.wireframes.length,
      project_id: projectId,
      created_at: null,
      created_by: null,
      updated_at: null,
      tags: []
    });
  };
  
  // Handle adding a new feature
  const handleAddFeature = () => {
    const projectId = currentData.project?.id || '';
    
    addProductFeature({
      id: generateId(),
      name: 'New Feature',
      description: '',
      priority: 'medium',
      status: 'planned',
      effort: 2,
      impact: 2,
      tags: [],
      notes: '',
      project_id: projectId,
      created_at: null,
      created_by: null,
      updated_at: null
    });
  };
  
  // Handle adding a new journey stage
  const handleAddJourneyStage = () => {
    const projectId = currentData.project?.id || '';
    
    addProductJourneyStage({
      id: generateId(),
      name: 'New Stage',
      description: '',
      completed: false,
      order_index: data.journeyStages.length,
      project_id: projectId,
      created_at: null,
      created_by: null,
      updated_at: null
    });
  };
  
  // Toggle help section visibility
  const toggleHelp = (section: keyof typeof expandedHelp) => {
    setExpandedHelp(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  return (
    <div className="p-6">
      {/* Header with help menu */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Design</h2>
          <p className="text-gray-600">Design your product's user experience, features, and interfaces</p>
        </div>
        
        <div className="flex items-center gap-2">
          {comparisonMode && (
            <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center mr-2">
              <span className="text-blue-700 text-sm font-medium">Viewing AI suggested changes</span>
            </div>
          )}
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Info className="h-4 w-4" />
                <span>Help Guide</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Product Design Guide</h4>
                <p className="text-sm text-gray-500">
                  Design your product with user flows, features, and wireframes to visualize 
                  your solution before development.
                </p>
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-1">
                    <LayoutPanelLeft className="h-4 w-4 text-blue-500" />
                    <span>Map user flows and journeys</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PencilRuler className="h-4 w-4 text-blue-500" />
                    <span>Create wireframes and mockups</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MonitorSmartphone className="h-4 w-4 text-blue-500" />
                    <span>Define product features and screens</span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
      
      {/* Design dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded">
                  <BarChart2 className="text-purple-700 h-5 w-5" />
                </div>
                <span className="font-medium">Design Progress</span>
              </div>
              <div>
                <Badge 
                  variant="outline" 
                  className={`
                    ${designStats.designProgress >= 75 ? 'bg-green-50 text-green-700 border-green-200' :
                     designStats.designProgress >= 50 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                     'bg-red-50 text-red-700 border-red-200'}
                  `}
                >
                  {designStats.designProgress}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded">
                  <LayoutPanelLeft className="text-blue-700 h-5 w-5" />
                </div>
                <span className="font-medium">User Journey</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">{designStats.totalJourneyStages}</span>
              <span className="text-xs text-gray-500">Journey stages</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded">
                  <MonitorSmartphone className="text-green-700 h-5 w-5" />
                </div>
                <span className="font-medium">Features</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <span className="text-xl font-bold">{designStats.totalFeatures}</span>
                <span className="text-xs text-gray-500">Total features</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">{designStats.priorityFeatures}</span>
                <span className="text-xs text-gray-500">High priority</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-orange-100 p-2 rounded">
                  <PencilRuler className="text-orange-700 h-5 w-5" />
                </div>
                <span className="font-medium">Wireframes</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold">{designStats.totalWireframes}</span>
              <span className="text-xs text-gray-500">Screen designs</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main content tabs */}
      <Tabs defaultValue="journey" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="journey" className="flex items-center gap-1">
            <LayoutPanelLeft className="h-4 w-4" />
            <span>User Journey</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-1">
            <MonitorSmartphone className="h-4 w-4" />
            <span>Features</span>
          </TabsTrigger>
          <TabsTrigger value="wireframes" className="flex items-center gap-1">
            <PencilRuler className="h-4 w-4" />
            <span>Wireframes</span>
          </TabsTrigger>
        </TabsList>
        
        {/* User Journey Tab */}
        <TabsContent value="journey" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-start">
              <h3 className="text-lg font-semibold">User Journey Map</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-6 w-6 p-0" 
                onClick={() => toggleHelp('journey')}
              >
                <Info className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
            
            <Button onClick={handleAddJourneyStage} className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" />
              <span>Add Journey Stage</span>
            </Button>
          </div>
          
          <Collapsible open={expandedHelp.journey} className="mb-4">
            <CollapsibleContent>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-sm text-blue-900">
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <LightbulbIcon className="h-4 w-4 text-blue-600" />
                    <span>Creating Effective User Journeys</span>
                  </h4>
                  <p className="mb-2">
                    User journeys map the flow of how users interact with your product. When creating your journey:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Define each major stage in the user's experience</li>
                    <li>Think about user goals and tasks at each stage</li>
                    <li>Identify potential pain points and opportunities</li>
                    <li>Create wireframes and features that support each stage</li>
                    <li>Ensure a logical progression from one stage to the next</li>
                  </ul>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
          
          {/* Journey stages would be displayed here */}
        </TabsContent>
        
        {/* Features Tab */}
        <TabsContent value="features" className="space-y-4">
          {/* Similar structure to User Journey tab */}
        </TabsContent>
        
        {/* Wireframes Tab */}
        <TabsContent value="wireframes" className="space-y-4">
          {/* Similar structure to User Journey tab */}
        </TabsContent>
      </Tabs>
      
      {/* AI Suggestion Actions */}
      {comparisonMode && (
        <div className="mt-6 flex justify-end gap-2">
          <Button 
            variant="outline" 
            className="text-gray-600" 
            onClick={() => rejectAIChanges()}
          >
            <X className="mr-2 h-4 w-4" /> Discard Changes
          </Button>
          <Button 
            variant="default" 
            className="bg-green-600 text-white" 
            onClick={() => acceptAIChanges()}
          >
            <Check className="mr-2 h-4 w-4" /> Apply Changes
          </Button>
        </div>
      )}
    </div>
  );
};