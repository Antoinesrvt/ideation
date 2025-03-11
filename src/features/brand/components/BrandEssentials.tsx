import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Save, X, BookOpen } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SectionHeader } from './shared/SectionHeader';
import { CoreIdentityForm } from './core/CoreIdentityForm';
import { BrandValuesForm } from './core/BrandValuesForm';
import { TargetAudienceForm } from './core/TargetAudienceForm';
import { BrandDNA } from './visualizations/BrandDNA';
import { AudienceAnalysis } from './visualizations/AudienceAnalysis';
import { MissionFunnel } from './visualizations/MissionFunnel';
import { 
  BrandEssentialsProps, 
  ActiveView, 
  BrandEssentialsData,
  CompletionMetrics
} from '../types/brand-essentials.types';
import { cn } from '@/lib/utils';

export function BrandEssentials({ initialData, onSave, className }: BrandEssentialsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('form');
  const [formData, setFormData] = useState<BrandEssentialsData>(initialData);

  // Calculate completion metrics
  const completion = useMemo<CompletionMetrics>(() => {
    const calculateFieldCompletion = (value: string) => 
      value && value.trim().length > 0 ? 100 : 0;
    
    const coreCompletion = [
      calculateFieldCompletion(formData.name),
      calculateFieldCompletion(formData.tagline),
      calculateFieldCompletion(formData.mission),
      calculateFieldCompletion(formData.vision),
      calculateFieldCompletion(formData.uniqueValueProposition)
    ].reduce((acc, curr) => acc + curr, 0) / 5;

    const valuesCompletion = formData.values.length > 0 ? 100 : 0;
    const audienceCompletion = formData.targetAudience.length > 0 ? 100 : 0;
    
    const overall = (coreCompletion + valuesCompletion + audienceCompletion) / 3;
    
    return {
      core: coreCompletion,
      values: valuesCompletion,
      audience: audienceCompletion,
      overall,
      lastUpdated: new Date().toISOString()
    };
  }, [formData]);

  const handleUpdate = (data: Partial<BrandEssentialsData>) => {
    setFormData(prev => ({
      ...prev,
      ...data,
      completion,
      lastModified: new Date().toISOString()
    }));
  };

  const handleSave = async () => {
    try {
      if (onSave) {
        await onSave(formData);
      }
      
      toast({
        title: "Changes saved",
        description: "Your brand essentials have been updated successfully."
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error saving changes",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setIsEditing(false);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <SectionHeader
        title="Brand Essentials"
        description="Define your brand's core identity and values"
        icon={<BookOpen className="h-5 w-5" />}
        completion={completion.overall}
        actions={
          isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Brand Essentials
            </Button>
          )
        }
      />

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ActiveView)}>
        <TabsList className="mb-6">
          <TabsTrigger value="form">Details</TabsTrigger>
          <TabsTrigger value="connections">Brand DNA</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="funnel">Mission Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <CoreIdentityForm
            data={formData}
            isEditing={isEditing}
            onUpdate={handleUpdate}
          />
          
          <BrandValuesForm
            data={formData}
            isEditing={isEditing}
            onUpdate={handleUpdate}
          />
          
          <TargetAudienceForm
            data={formData}
            isEditing={isEditing}
            onUpdate={handleUpdate}
          />
        </TabsContent>

        <TabsContent value="connections">
          <BrandDNA data={formData} />
        </TabsContent>

        <TabsContent value="audience">
          <AudienceAnalysis data={formData} />
        </TabsContent>

        <TabsContent value="funnel">
          <MissionFunnel data={formData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
