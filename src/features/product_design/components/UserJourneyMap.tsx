import React, { useState } from 'react';
import { Check, PlusCircle, HelpCircle, AlertTriangle, UserCheck, Lightbulb, Info } from 'lucide-react';
import {ProductJourneyStage} from '@/store/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface UserJourneyMapProps {
  stages: ProductJourneyStage[];
  selectedStage: string | null;
  onSelectStage: (stageId: string) => void;
  onAddStage: () => void;
  onEditStage?: (stageId: string) => void;
}

export const UserJourneyMap: React.FC<UserJourneyMapProps> = ({ 
  stages,
  selectedStage,
  onSelectStage,
  onAddStage,
  onEditStage 
}) => {
  const [showHelp, setShowHelp] = useState(false);

  const getSelectedStage = (): ProductJourneyStage | undefined => {
    return stages.find((stage) => stage.id === selectedStage);
  };
  
  const getStageNumber = (stageId: string): number => {
    const index = stages.findIndex((stage) => stage.id === stageId);
    return index + 1;
  };

  const getStageColor = (completed: boolean): string => {
    return completed ? 'bg-blue-500' : 'bg-gray-300';
  };

  const getStageTextColor = (completed: boolean): string => {
    return completed ? 'text-blue-500' : 'text-gray-600';
  };
  
  return (
    <div className="relative">
      <TooltipProvider>

        {/* Journey Timeline */}
        {stages.length > 0 && (
          <>
            <div className="absolute h-1 bg-gray-200 top-8 left-8 right-8 z-0"></div>
            <div className="relative z-10 flex justify-between px-4">
              {stages.map((stage, index) => (
                <div 
                  key={stage.id} 
                  className="text-center cursor-pointer group"
                  onClick={() => onSelectStage(stage.id)}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        className={`w-10 h-10 rounded-full ${
                          getStageColor(stage.completed || false)
                        } mx-auto flex items-center justify-center text-white mb-2 transition-transform group-hover:scale-110`}
                      >
                        {stage.completed ? <Check className="h-5 w-5" /> : index + 1}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="font-medium">{stage.name}</p>
                      <p className="text-xs">{stage.description}</p>
                      <p className="text-xs mt-1">{`Status: ${stage.completed ? 'Completed' : 'Pending'}`}</p>
                    </TooltipContent>
                  </Tooltip>
                  <h4 className={`font-medium text-sm ${getStageTextColor(stage.completed || false)}`}>{stage.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{stage.description?.substring(0, 20) || ''}{stage.description?.length || 0 > 20 ? '...' : ''}</p>
                  
                  {stage.completed && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs mt-1">
                      <Check className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              ))}
              
              <div 
                className="text-center cursor-pointer group"
                onClick={onAddStage}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto flex items-center justify-center text-gray-500 mb-2 transition-transform group-hover:scale-110 group-hover:bg-gray-300">
                      <PlusCircle className="h-5 w-5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Add a new stage to your user journey</p>
                  </TooltipContent>
                </Tooltip>
                <h4 className="font-medium text-sm">Add Stage</h4>
              </div>
            </div>
          </>
        )}
        
        {/* Selected Stage Details */}
        {selectedStage && getSelectedStage() ? (
          <div className="mt-12 border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full ${getStageColor(getSelectedStage()?.completed || false)} flex items-center justify-center text-white mr-3`}>
                  {getStageNumber(selectedStage)}
                </div>
                <h3 className="font-semibold">{getSelectedStage()?.name}</h3>
              </div>
              <Badge variant="outline" className={getSelectedStage()?.completed ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                {getSelectedStage()?.completed ? 'Completed' : 'In Progress'}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{getSelectedStage()?.description}</p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <UserCheck className="h-4 w-4 text-blue-600 mr-2" />
                    User Actions
                  </h4>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" align="end" className="w-60">
                      <p className="text-xs">Actions that users take during this stage of their journey</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                {/* <ul className="mt-2 space-y-2">
                  {getSelectedStage()?.actions.map((action, index) => (
                    <li key={index} className="text-sm flex items-start bg-white p-2 rounded border border-blue-50">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      {action}
                    </li>
                  ))}
                  <li className="text-sm flex items-start text-gray-500 p-2 rounded border border-dashed border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
                    <PlusCircle className="h-4 w-4 mr-2 mt-0.5" />
                    Add action...
                  </li>
                </ul> */}
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    Pain Points & Solutions
                  </h4>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" align="end" className="w-60">
                      <p className="text-xs">Challenges users face and how your product addresses them</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                {/* <div className="mt-2 space-y-2">
                  {getSelectedStage()?.painPoints.map((painPoint, index) => (
                    <div key={index} className="bg-white border border-red-100 p-3 rounded text-sm">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-700">{painPoint.issue}</p>
                          <div className="flex items-start mt-2">
                            <Lightbulb className="h-4 w-4 text-amber-500 mr-2 mt-0.5" />
                            <p className="text-sm text-amber-700">Solution: {painPoint.solution}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="border border-dashed border-red-200 rounded p-3 flex items-center justify-center text-gray-500 text-sm cursor-pointer hover:bg-red-100 transition-colors">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Pain Point
                  </div>
                </div> */}
              </div>
            </div>
            
            <Collapsible open={showHelp} onOpenChange={setShowHelp} className="mt-4">
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 flex justify-between"
                >
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Journey Stage Tips
                  </div>
                  {showHelp ? (
                    <span className="text-xs flex items-center">Hide Tips <HelpCircle className="h-3 w-3 ml-1" /></span>
                  ) : (
                    <span className="text-xs flex items-center">Show Tips <HelpCircle className="h-3 w-3 ml-1" /></span>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 bg-blue-50 p-3 rounded border border-blue-100 text-xs text-blue-800">
                  <h5 className="font-medium mb-2">Tips for mapping this journey stage:</h5>
                  <ul className="space-y-1">
                    <li>• Be specific about user actions in this stage</li>
                    <li>• Identify pain points from user research or feedback</li>
                    <li>• Connect each pain point to a solution in your product</li>
                    <li>• Mark a stage as complete when you've validated your solutions</li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : (
          <div className="mt-6 border border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <h4 className="font-medium text-gray-700 mb-2">Start Mapping Your User Journey</h4>
              <p className="text-gray-500 mb-4">Create a visual map of your user's experience with your product.</p>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center mx-auto hover:bg-blue-700 transition-colors"
                onClick={onAddStage}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create First Stage
              </button>
            </div>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
};