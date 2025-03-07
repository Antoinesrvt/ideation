import React, { useState } from 'react';
import { PlusCircle, HelpCircle, AlertCircle, Tag, PlayCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ProductFeature } from '@/store/types';

interface FeatureMapProps {
  features: ProductFeature[];
  onAddFeature: (priority: 'must' | 'should' | 'could' | 'wont') => void;
  onEditFeature?: (id: string) => void;
}

export const FeatureMap: React.FC<FeatureMapProps> = ({ 
  features,
  onAddFeature,
  onEditFeature 
}) => {
  const [showHelp, setShowHelp] = useState<{[key: string]: boolean}>({});
  
  // Group features by priority
  const featuresByPriority = {
    must: features.filter(f => f.priority === 'must'),
    should: features.filter(f => f.priority === 'should'),
    could: features.filter(f => f.priority === 'could'),
    wont: features.filter(f => f.priority === 'wont')
  };
  
  const priorityLabels = {
    must: 'Must Have (MVP)',
    should: 'Should Have (Version 1.0)',
    could: 'Could Have (Future)',
    wont: 'Won\'t Have (Out of Scope)'
  };

  const priorityDescriptions = {
    must: 'Critical features required for a minimum viable product launch.',
    should: 'Important features planned for the first full release.',
    could: 'Desirable features that would enhance the product but are not essential.',
    wont: 'Features that have been considered but excluded from current scope.'
  };
  
  const priorityColors = {
    must: {
      bg: 'bg-red-500',
      text: 'text-white',
      border: 'border-red-600',
      variant: 'destructive',
      cardBg: 'bg-red-50/60',
      cardBorder: 'border-red-200',
    },
    should: {
      bg: 'bg-yellow-500',
      text: 'text-white',
      border: 'border-yellow-600',
      variant: 'warning',
      cardBg: 'bg-yellow-50/60',
      cardBorder: 'border-yellow-200',
    },
    could: {
      bg: 'bg-green-500',
      text: 'text-white',
      border: 'border-green-600',
      variant: 'success',
      cardBg: 'bg-green-50/60',
      cardBorder: 'border-green-200',
    },
    wont: {
      bg: 'bg-gray-500',
      text: 'text-white',
      border: 'border-gray-600',
      variant: 'secondary',
      cardBg: 'bg-gray-50/60',
      cardBorder: 'border-gray-200',
    }
  };
  
  const toggleHelp = (priority: string) => {
    setShowHelp(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };

  const renderFeatureGroup = (priority: 'must' | 'should' | 'could' | 'wont') => {
    const features = featuresByPriority[priority];
    
    return (
      <div className="mb-6 last:mb-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Badge 
              variant={priorityColors[priority].variant as any}
              className="mr-2"
            >
              {priorityLabels[priority]}
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className={`h-4 w-4 text-primary-400 cursor-pointer`} />
                </TooltipTrigger>
                <TooltipContent 
                  className="bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100"
                >
                  <p>{priorityDescriptions[priority]}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-primary-700 border-primary-200 hover:border-primary-300 hover:bg-primary-50"
              onClick={() => onAddFeature(priority)}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
              Add Feature
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-dark-500"
              onClick={() => toggleHelp(priority)}
            >
              {showHelp[priority] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <Collapsible open={showHelp[priority]} className="mb-4">
          <CollapsibleContent className="text-sm p-3 bg-white/70 border border-gray-200 rounded-md backdrop-blur-sm">
            <p className="text-dark-600">
              {priority === 'must' && (
                <>
                  <strong className="text-primary-800 font-medium">Must Have:</strong> Use this category for core features that define your product's value proposition and are essential for initial launch.
                </>
              )}
              {priority === 'should' && (
                <>
                  <strong className="text-primary-800 font-medium">Should Have:</strong> These important but not critical features enhance your product and are planned for the first major release after MVP.
                </>
              )}
              {priority === 'could' && (
                <>
                  <strong className="text-primary-800 font-medium">Could Have:</strong> Nice-to-have features that add significant value but can be delayed without impacting the core product experience.
                </>
              )}
              {priority === 'wont' && (
                <>
                  <strong className="text-primary-800 font-medium">Won't Have:</strong> Features explicitly excluded from current plans - capture these to prevent scope creep and track for potential future releases.
                </>
              )}
            </p>
          </CollapsibleContent>
        </Collapsible>

        {features.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-md p-4 bg-white/50 text-dark-500 text-center text-sm">
            No {priority} have features added yet
          </div>
        ) : (
          <div className={`grid gap-3 grid-cols-1`}>
            {features.map(feature => (
              <Card 
                key={feature.id} 
                variant="default" 
                className={`${feature.status ? 'border-l-4' : ''} ${
                  feature.status === 'new' ? `border-l-green-500 ${priorityColors[priority].cardBg}` :
                  feature.status === 'modified' ? `border-l-yellow-500 ${priorityColors[priority].cardBg}` :
                  feature.status === 'removed' ? `border-l-red-500 ${priorityColors[priority].cardBg}` :
                  ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-heading font-medium text-primary-800 mb-1">
                        {feature.name}
                      </h3>
                      <p className="text-sm text-dark-600 mb-2">
                        {feature.description || <span className="text-dark-400 italic">No description provided</span>}
                      </p>
                      {feature.tags && feature.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {feature.tags.map((tag, idx) => (
                            <Badge 
                              key={idx} 
                              variant="subtle-primary" 
                              size="sm"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {onEditFeature && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary-700 hover:bg-primary-50"
                        onClick={() => onEditFeature(feature.id)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderFeatureGroup('must')}
      <Separator variant="ghost" className="opacity-50" />
      {renderFeatureGroup('should')}
      <Separator variant="ghost" className="opacity-50" />
      {renderFeatureGroup('could')}
      <Separator variant="ghost" className="opacity-50" />
      {renderFeatureGroup('wont')}
    </div>
  );
};