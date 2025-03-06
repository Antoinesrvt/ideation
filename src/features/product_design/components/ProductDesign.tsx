import React, { useState, useMemo } from 'react';

import {   Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter} from '@/components/ui/card';
import { Button } from '@/components/ui/button';  
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Check,
  PlusCircle,
  HelpCircle,
  Info,
  Layout,
  MapPin,
  Map,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { WireframeGallery } from "./WireframeGallery";
import { FeatureMap } from "./FeatureMap";
import { UserJourneyMap } from "./UserJourneyMap";

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
    const [showInfo, setShowInfo] = useState<{ [key: string]: boolean }>({
      wireframes: false,
      features: false,
      journey: false,
    });
  
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


  const toggleInfo = (section: string) => {
    setShowInfo((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  return (
    <TooltipProvider>
      <div className="p-6">

        {/* Dashboard Overview */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Layout className="h-4 w-4 mr-2 text-blue-500" />
                  Wireframes & Visuals
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-1">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="w-80">
                      <p className="text-xs">Wireframes help visualize your product's interface before development. They're useful for getting early feedback on layouts and user flows.</p>
                    </HoverCardContent>
                  </HoverCard>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{designStats.totalWireframes}</p>
                  <p className="text-xs text-gray-500 ml-2">Total wireframes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-green-500" />
                  Feature Planning
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-1">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="w-80">
                      <p className="text-xs">Feature mapping helps prioritize what to build. Focus on "Must Have" features for your MVP to validate your core concept quickly.</p>
                    </HoverCardContent>
                  </HoverCard>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{designStats.priorityFeatures} / {designStats.totalFeatures}</p>
                  <p className="text-xs text-gray-500 ml-2">MVP / Total features</p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Map className="h-4 w-4 mr-2 text-purple-500" />
                  User Journey
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-1">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="w-80">
                      <p className="text-xs">User journey maps visualize the complete user experience from start to finish. Identify pain points and opportunities to improve the user experience.</p>
                    </HoverCardContent>
                  </HoverCard>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <p className="text-2xl font-bold">{designStats.totalJourneyStages}</p>
                  <p className="text-xs text-gray-500 ml-2">Total stages</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Tabs defaultValue="wireframes">
          <TabsList className="mb-4">
            <TabsTrigger value="wireframes">Wireframes</TabsTrigger>
            <TabsTrigger value="features">Feature Mapping</TabsTrigger>
            <TabsTrigger value="journey">User Journey</TabsTrigger>
          </TabsList>
          
          <TabsContent value="wireframes" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>App Wireframes</CardTitle>
                    <CardDescription>Visualize your product's interface and user flow</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Collapsible open={showInfo.wireframes} onOpenChange={() => toggleInfo('wireframes')}>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" size="sm" className="flex gap-1">
                          <Info className="h-4 w-4" />
                          {showInfo.wireframes ? (
                            <span className="text-xs flex items-center">Hide Info <ChevronUp className="h-3 w-3 ml-1" /></span>
                          ) : (
                            <span className="text-xs flex items-center">What are wireframes? <ChevronDown className="h-3 w-3 ml-1" /></span>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </Collapsible>
                    
                    <Button 
                      variant="default" 
                      className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
                      onClick={handleAddWireframe}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      New Wireframe
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Collapsible open={showInfo.wireframes}>
                  <CollapsibleContent>
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">What are wireframes?</h4>
                      <p className="text-sm text-gray-500">
                        Wireframes are simplified visual representations of your product's interface. They help you:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-500">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          Visualize page layouts and elements without getting distracted by visual design
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          Test user flows and navigation before investing in development
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          Get stakeholder feedback on interface concepts early in the process
                        </li>
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <WireframeGallery wireframes={data.wireframes} onAdd={handleAddWireframe} onSelect={(id) => console.log(id)} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Product Feature Map</CardTitle>
                    <CardDescription>Prioritize features for your product roadmap</CardDescription>
                  </div>
                  <Collapsible open={showInfo.features} onOpenChange={() => toggleInfo('features')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm" className="flex gap-1">
                        <Info className="h-4 w-4" />
                        {showInfo.features ? (
                          <span className="text-xs flex items-center">Hide Info <ChevronUp className="h-3 w-3 ml-1" /></span>
                        ) : (
                          <span className="text-xs flex items-center">What is MoSCoW? <ChevronDown className="h-3 w-3 ml-1" /></span>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                </div>
              </CardHeader>
              <CardContent>
                <Collapsible open={showInfo.features}>
                  <CollapsibleContent>
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">MoSCoW Method</h4>
                      <p className="text-sm text-gray-500">
                        The MoSCoW method helps you prioritize features and scope your MVP:
                      </p>
                      <div className="mt-2 grid grid-cols-4 gap-3">
                        <div className="p-2 bg-red-50 border border-red-100 rounded">
                          <h5 className="text-xs font-medium text-red-800">Must Have</h5>
                          <p className="text-xs text-red-600">Critical for your MVP</p>
                        </div>
                        <div className="p-2 bg-yellow-50 border border-yellow-100 rounded">
                          <h5 className="text-xs font-medium text-yellow-800">Should Have</h5>
                          <p className="text-xs text-yellow-600">Important but not critical</p>
                        </div>
                        <div className="p-2 bg-green-50 border border-green-100 rounded">
                          <h5 className="text-xs font-medium text-green-800">Could Have</h5>
                          <p className="text-xs text-green-600">Valuable if resources allow</p>
                        </div>
                        <div className="p-2 bg-gray-50 border border-gray-100 rounded">
                          <h5 className="text-xs font-medium text-gray-800">Won't Have (now)</h5>
                          <p className="text-xs text-gray-600">Out of current scope</p>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <FeatureMap features={data.features} onAddFeature={handleAddFeature} onEditFeature={(id) => console.log(id)} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="journey" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Journey Map</CardTitle>
                    <CardDescription>Map out your user's experience with your product</CardDescription>
                  </div>
                  <Collapsible open={showInfo.journey} onOpenChange={() => toggleInfo('journey')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" size="sm" className="flex gap-1">
                        <Info className="h-4 w-4" />
                        {showInfo.journey ? (
                          <span className="text-xs flex items-center">Hide Info <ChevronUp className="h-3 w-3 ml-1" /></span>
                        ) : (
                          <span className="text-xs flex items-center">What is a User Journey? <ChevronDown className="h-3 w-3 ml-1" /></span>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </Collapsible>
                </div>
              </CardHeader>
              <CardContent>
                <Collapsible open={showInfo.journey}>
                  <CollapsibleContent>
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">User Journey Mapping</h4>
                      <p className="text-sm text-gray-500">
                        User journey maps help you visualize the end-to-end experience of your users:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-gray-500">
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          Break down the user experience into discrete stages
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          Identify pain points and opportunities at each stage
                        </li>
                        <li className="flex items-start">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          Connect user needs to specific features and solutions
                        </li>
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <UserJourneyMap 
                  stages={data.journeyStages} 
                  selectedStage={selectedStageId} 
                  onSelectStage={setSelectedStageId} 
                  onAddStage={handleAddJourneyStage} 
                  onEditStage={(id) => console.log(id)} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};
