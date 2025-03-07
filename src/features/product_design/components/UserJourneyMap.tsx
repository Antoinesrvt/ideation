import React, { useState } from 'react';
import { 
  PlusCircle, 
  ArrowRight, 
  Edit2, 
  AlertCircle, 
  ChevronDown, 
  X, 
  Info, 
  HelpCircle,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ProductJourneyStage } from '@/store/types';

// Add extended type for ProductJourneyStage to include status
interface ExtendedProductJourneyStage extends ProductJourneyStage {
  status?: 'new' | 'modified' | 'removed';
  sentiment?: number;
  touchpoint?: string;
}

interface UserJourneyMapProps {
  stages: ExtendedProductJourneyStage[];
  selectedStage?: string;
  onSelectStage?: (id: string) => void;
  onAddStage?: () => void;
  onEditStage?: (id: string) => void;
}

export const UserJourneyMap: React.FC<UserJourneyMapProps> = ({ 
  stages,
  selectedStage,
  onSelectStage,
  onAddStage,
  onEditStage
}) => {
  const [showHelp, setShowHelp] = useState(false);
  
  // Helper functions for sentiment display
  const getSentimentIcon = (sentiment: number) => {
    if (sentiment >= 4) return <Smile className="text-success-500 h-5 w-5" />;
    if (sentiment <= 2) return <Frown className="text-destructive-500 h-5 w-5" />;
    return <Meh className="text-warning-500 h-5 w-5" />;
  };
  
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 4) return 'bg-success-50 text-success-700 border-success-200';
    if (sentiment <= 2) return 'bg-destructive-50 text-destructive-700 border-destructive-200';
    return 'bg-warning-50 text-warning-700 border-warning-200';
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <h3 className="text-base font-heading font-medium text-primary-900">
              User Journey Map
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 ml-2">
                  <Info className="h-4 w-4 text-dark-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm backdrop-blur-sm">
                <p className="text-sm">
                  User journey maps visualize the steps a user takes when interacting with your product, including their thoughts, emotions, and actions.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelp(!showHelp)}
            className="text-primary-700 border-primary-200 hover:border-primary-300 hover:bg-primary-50"
          >
            <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
            {showHelp ? 'Hide' : 'Show'} Help
          </Button>
        </div>
        
        <Collapsible open={showHelp} className="mb-6">
          <CollapsibleContent>
            <Card variant="default" className="border-primary-100 bg-primary-50/30">
              <CardContent className="p-4">
                <h3 className="text-sm font-heading font-semibold text-primary-800 mb-2">
                  Creating Effective User Journeys
                </h3>
                <ul className="space-y-2 text-sm text-dark-600">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>
                      <strong className="font-medium text-primary-700">Focus on users:</strong> Create journey maps from the perspective of specific user personas.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>
                      <strong className="font-medium text-primary-700">Include emotions:</strong> Record user sentiment at each stage to identify pain points.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>
                      <strong className="font-medium text-primary-700">Document touchpoints:</strong> List all interactions between the user and your product.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>
                      <strong className="font-medium text-primary-700">Identify opportunities:</strong> Use the journey map to find areas for product improvement.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
        
        {stages.length === 0 ? (
          <Card variant="default" className="border-dashed border-gray-300">
            <CardContent className="p-8 flex flex-col items-center justify-center text-center">
              <div className="bg-primary-50 p-3 rounded-full mb-4">
                <ArrowRight className="h-8 w-8 text-primary-400" />
              </div>
              <h3 className="text-lg font-heading font-medium text-primary-800 mb-2">
                No Journey Stages Defined
              </h3>
              <p className="text-dark-500 max-w-sm mb-4">
                Journey maps help visualize how users interact with your product across different stages.
              </p>
              {onAddStage && (
                <Button 
                  variant="default" 
                  onClick={onAddStage}
                  className="bg-gradient-primary text-white"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add First Journey Stage
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-primary-100 -translate-y-1/2 z-0"></div>
            <div className="flex justify-between relative z-10">
              {stages.map((stage, index) => (
                <div 
                  key={stage.id} 
                  className={cn(
                    "flex flex-col items-center",
                    index === 0 ? "ml-0" : "",
                    index === stages.length - 1 ? "mr-0" : ""
                  )}
                >
                  <Card
                    className={cn(
                      "w-36 sm:w-44 hover:shadow-md transition-all cursor-pointer mb-4",
                      selectedStage === stage.id && "ring-2 ring-primary-500 ring-opacity-50",
                      stage.status === 'new' ? 'border-l-4 border-l-green-500 bg-green-50/60' :
                      stage.status === 'modified' ? 'border-l-4 border-l-yellow-500 bg-yellow-50/60' :
                      stage.status === 'removed' ? 'border-l-4 border-l-red-500 bg-red-50/60' : ''
                    )}
                    onClick={() => onSelectStage && onSelectStage(stage.id)}
                  >
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm font-heading font-medium text-primary-800 line-clamp-2">
                        {stage.name || `Stage ${index + 1}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-1">
                      <div className="text-xs text-dark-500 line-clamp-2 min-h-[2rem]">
                        {stage.description || "No description provided"}
                      </div>
                      
                      <div className="mt-2 flex justify-between items-center">
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div 
                              className={cn(
                                "text-xs px-2 py-1 rounded-full inline-flex items-center",
                                getSentimentColor(stage.sentiment || 3)
                              )}
                            >
                              {getSentimentIcon(stage.sentiment || 3)}
                              <span className="ml-1">{stage.sentiment || 3}/5</span>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-56 p-3 text-xs backdrop-blur-sm">
                            <p className="font-medium mb-1">User Sentiment</p>
                            <p>How the user feels during this stage of their journey.</p>
                          </HoverCardContent>
                        </HoverCard>
                        
                        {onEditStage && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-dark-400 hover:text-primary-700 hover:bg-primary-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditStage(stage.id);
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="bg-white w-10 h-10 rounded-full border-2 border-primary-200 flex items-center justify-center">
                    <div className="bg-primary-100 text-primary-800 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="mt-2 bg-white text-xs px-2">
                    {stage.touchpoint || "Touchpoint"}
                  </Badge>
                </div>
              ))}
              
              {onAddStage && (
                <div className="flex flex-col items-center">
                  <Card
                    className="w-36 sm:w-44 border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50/10 transition-colors cursor-pointer mb-4"
                    onClick={onAddStage}
                  >
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                      <PlusCircle className="h-6 w-6 text-primary-400 mb-2" />
                      <p className="text-sm text-primary-700 font-medium">Add Stage</p>
                      <p className="text-xs text-dark-500 mt-1">Next step in journey</p>
                    </CardContent>
                  </Card>
                  
                  <div className="bg-white w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <PlusCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="h-6 mt-2"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};