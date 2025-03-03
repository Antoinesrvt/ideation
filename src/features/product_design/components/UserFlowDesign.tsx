import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, PlusCircle } from 'lucide-react';
import { UserFlow as UserFlowType, Feature, Wireframe, JourneyStage } from '@/types';
import { WireframeGallery } from './WireframeGallery';
import { FeatureMap } from './FeatureMap';
import { UserJourneyMap } from './UserJourneyMap';

interface UserFlowDesignProps {
  data?: UserFlowType;
  onUpdate: (data: Partial<UserFlowType>) => void;
}

export const UserFlowDesign: React.FC<UserFlowDesignProps> = ({ 
  data = {
    wireframes: [],
    features: [],
    journey: { stages: [] }
  },
  onUpdate 
}) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(
    data.journey.stages.length > 0 ? data.journey.stages[0].id : null
  );
  
  const handleAddWireframe = () => {
    const newWireframe: Wireframe = {
      id: Math.random().toString(36).substring(2, 9),
      name: 'New Wireframe',
      createdAt: new Date().toISOString()
    };
    
    onUpdate({
      wireframes: [...data.wireframes, newWireframe]
    });
  };
  
  const handleAddFeature = (priority: 'must' | 'should' | 'could' | 'wont') => {
    const newFeature: Feature = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      description: '',
      priority,
      status: 'planned',
      tags: []
    };
    
    onUpdate({
      features: [...data.features, newFeature]
    });
  };
  
  const handleAddJourneyStage = () => {
    const newStage: JourneyStage = {
      id: Math.random().toString(36).substring(2, 9),
      name: 'New Stage',
      description: '',
      actions: [],
      painPoints: [],
      completed: false
    };
    
    onUpdate({
      journey: {
        ...data.journey,
        stages: [...data.journey.stages, newStage]
      }
    });
  };
  
  const handleSelectStage = (stageId: string) => {
    setSelectedStage(stageId);
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Flow Design</h2>
        <p className="text-gray-600">Design your product's user experience and feature set</p>
      </div>
      
      <Tabs defaultValue="wireframes">
        <TabsList className="mb-4">
          <TabsTrigger value="wireframes">Wireframes</TabsTrigger>
          <TabsTrigger value="features">Feature Mapping</TabsTrigger>
          <TabsTrigger value="journey">User Journey</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wireframes" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">App Wireframes</h3>
            <Button 
              variant="default" 
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
              onClick={handleAddWireframe}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Wireframe
            </Button>
          </div>
          
          <WireframeGallery wireframes={data.wireframes} />
        </TabsContent>
        
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Feature Map</CardTitle>
              <CardDescription>Organize and prioritize your product features</CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureMap 
                features={data.features} 
                onAddFeature={handleAddFeature} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Journey Map</CardTitle>
              <CardDescription>Visualize the complete user experience</CardDescription>
            </CardHeader>
            <CardContent>
              <UserJourneyMap 
                journey={data.journey} 
                selectedStage={selectedStage}
                onSelectStage={handleSelectStage}
                onAddStage={handleAddJourneyStage}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};