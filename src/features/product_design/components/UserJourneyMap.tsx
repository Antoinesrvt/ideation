import React from 'react';
import { Check, PlusCircle } from 'lucide-react';
import { UserJourney, JourneyStage } from '@/types';

interface UserJourneyMapProps {
  journey: UserJourney;
  selectedStage: string | null;
  onSelectStage: (stageId: string) => void;
  onAddStage: () => void;
  onEditStage?: (stageId: string) => void;
}

export const UserJourneyMap: React.FC<UserJourneyMapProps> = ({ 
  journey,
  selectedStage,
  onSelectStage,
  onAddStage,
  onEditStage 
}) => {
  const getSelectedStage = (): JourneyStage | undefined => {
    return journey.stages.find(stage => stage.id === selectedStage);
  };
  
  return (
    <div className="relative">
      {/* Journey Timeline */}
      {journey.stages.length > 0 && (
        <>
          <div className="absolute h-1 bg-gray-200 top-8 left-8 right-8 z-0"></div>
          <div className="relative z-10 flex justify-between px-4">
            {journey.stages.map((stage, index) => (
              <div 
                key={stage.id} 
                className="text-center cursor-pointer"
                onClick={() => onSelectStage(stage.id)}
              >
                <div 
                  className={`w-10 h-10 rounded-full ${
                    stage.completed ? 'bg-blue-500' : 'bg-gray-300'
                  } mx-auto flex items-center justify-center text-white mb-2`}
                >
                  {index + 1}
                </div>
                <h4 className="font-medium text-sm">{stage.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{stage.description.substring(0, 20)}{stage.description.length > 20 ? '...' : ''}</p>
              </div>
            ))}
            
            <div 
              className="text-center cursor-pointer"
              onClick={onAddStage}
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 mx-auto flex items-center justify-center text-gray-500 mb-2">
                <PlusCircle className="h-5 w-5" />
              </div>
              <h4 className="font-medium text-sm">Add Stage</h4>
            </div>
          </div>
        </>
      )}
      
      {/* Selected Stage Details */}
      {selectedStage && getSelectedStage() ? (
        <div className="mt-12 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Selected Stage: {getSelectedStage()?.name}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700">User Actions</h4>
              <ul className="mt-2 space-y-2">
                {getSelectedStage()?.actions.map((action, index) => (
                  <li key={index} className="text-sm flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                    {action}
                  </li>
                ))}
                <li className="text-sm flex items-start text-gray-500">
                  <PlusCircle className="h-4 w-4 mr-2 mt-0.5" />
                  Add action...
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Pain Points & Solutions</h4>
              <div className="mt-2 space-y-2">
                {getSelectedStage()?.painPoints.map((painPoint, index) => (
                  <div key={index} className="bg-red-50 border border-red-100 p-2 rounded text-sm">
                    <p className="font-medium text-red-700">{painPoint.issue}</p>
                    <p className="text-xs text-red-600 mt-1">Solution: {painPoint.solution}</p>
                  </div>
                ))}
                <div className="border border-dashed border-gray-300 rounded p-2 flex items-center justify-center text-gray-500 text-sm cursor-pointer">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Pain Point
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No journey stages defined yet</p>
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center mx-auto"
            onClick={onAddStage}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create First Stage
          </button>
        </div>
      )}
    </div>
  );
};