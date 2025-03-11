import React, { useState } from 'react';
import { BusinessModelCanvas } from '@/features/business_model/components/canvas/components/BusinessModelCanvas';
import { GRPModel } from '@/features/business_model/components/grp/components/GRPModel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid, Activity, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export function BusinessModelWrapper() {
  const [activeModelType, setActiveModelType] = useState<'canvas' | 'grp'>('canvas');

  return (
    <div className="space-y-4">

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Choose Your Model</CardTitle>
            <Tabs 
              value={activeModelType} 
              onValueChange={(value) => setActiveModelType(value as 'canvas' | 'grp')}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="canvas" className="flex items-center gap-1">
                  <Grid className="h-4 w-4" />
                  <span>Canvas</span>
                </TabsTrigger>
                <TabsTrigger value="grp" className="flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  <span>GRP</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardDescription>
            {activeModelType === 'canvas' ? 
              'The Business Model Canvas helps you visualize the building blocks of your business' : 
              'The GRP Model analyzes your business through growth, risk, and profit dimensions'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {activeModelType === 'canvas' ? (
            <div className="p-4">
              <BusinessModelCanvas />
            </div>
          ) : (
            <div className="p-4">
              <GRPModel />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Add an export for the index file
export default BusinessModelWrapper;