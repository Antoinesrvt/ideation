import React, { useState } from 'react';
import { PlusCircle, HelpCircle, AlertCircle, Tag, PlayCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    must: 'bg-red-500',
    should: 'bg-yellow-500',
    could: 'bg-green-500',
    wont: 'bg-gray-500'
  };

  const priorityBadgeColors = {
    must: 'bg-red-100 text-red-800 border-red-200',
    should: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    could: 'bg-green-100 text-green-800 border-green-200',
    wont: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  const statusLabels = {
    planned: 'Planned',
    'in-progress': 'In Progress',
    completed: 'Completed'
  };
  
  const statusColors = {
    planned: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800'
  };

  const statusIcons = {
    planned: <AlertCircle className="h-3 w-3 mr-1" />,
    'in-progress': <PlayCircle className="h-3 w-3 mr-1" />,
    completed: <PlusCircle className="h-3 w-3 mr-1" />
  };
  
  const toggleHelp = (priority: string) => {
    setShowHelp(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };
  
  const renderFeatureGroup = (priority: 'must' | 'should' | 'could' | 'wont') => {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <span className={`w-2 h-2 ${priorityColors[priority]} rounded-full mr-2`}></span>
            {priorityLabels[priority]}
            
          </h3>
          
          {/* <Collapsible 
            open={showHelp[priority]} 
            onOpenChange={() => toggleHelp(priority)}
            className="w-auto"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 flex gap-1 text-xs text-gray-500">
                <Info className="h-3 w-3" />
                {showHelp[priority] ? 'Hide Tips' : 'Show Tips'}
                {showHelp[priority] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible> */}
        </div>
        
        <Collapsible open={showHelp[priority]}>
          <CollapsibleContent>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
              <p className="text-xs text-gray-600">{priorityDescriptions[priority]}</p>
              {priority === 'must' && (
                <p className="text-xs text-gray-600 mt-1">Focus on these features for your MVP to validate core value proposition.</p>
              )}
              {priority === 'should' && (
                <p className="text-xs text-gray-600 mt-1">Plan these features for your first full release after MVP validation.</p>
              )}
              {priority === 'could' && (
                <p className="text-xs text-gray-600 mt-1">Consider these features for future releases if users need them.</p>
              )}
              {priority === 'wont' && (
                <p className="text-xs text-gray-600 mt-1">Documenting these helps clarify what's out of scope for now.</p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        <div className="space-y-2">
          {featuresByPriority[priority].map(feature => (
            <div 
              key={feature.id} 
              className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-start cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onEditFeature && onEditFeature(feature.id)}
            >
              <div>
                <h4 className="font-medium">{feature.name || 'Unnamed Feature'}</h4>
                <p className="text-xs text-gray-500 mt-1">{feature.description || 'No description'}</p>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className={priorityBadgeColors[priority]}>
                    {priorityLabels[priority].split(' ')[0]}
                  </Badge>
                  <Badge variant="outline" className={statusColors[(feature.status || 'planned') as 'planned' | 'in-progress' | 'completed']}>
                    {statusIcons[(feature.status || 'planned') as 'planned' | 'in-progress' | 'completed']}
                    {statusLabels[(feature.status || 'planned') as 'planned' | 'in-progress' | 'completed']}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {feature.tags && feature.tags.length > 0 && (
                  <div className="flex items-center mb-2">
                    <Tag className="h-3 w-3 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-500">
                      {feature.tags.length} tag{feature.tags.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
                <div className="flex gap-1 mt-1">
                  {feature.tags && feature.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                  {feature.tags && feature.tags.length > 2 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                      +{feature.tags.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div 
            className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => onAddFeature(priority)}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            <p>Add {priority.charAt(0).toUpperCase() + priority.slice(1)} Have Feature</p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {renderFeatureGroup("must")}
      {renderFeatureGroup("should")}
      {renderFeatureGroup("could")}
      {renderFeatureGroup("wont")}
    </div>
  );
};