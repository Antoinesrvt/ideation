import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Feature } from '@/types';

interface FeatureMapProps {
  features: Feature[];
  onAddFeature: (priority: 'must' | 'should' | 'could' | 'wont') => void;
  onEditFeature?: (id: string) => void;
}

export const FeatureMap: React.FC<FeatureMapProps> = ({ 
  features,
  onAddFeature,
  onEditFeature 
}) => {
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
  
  const priorityColors = {
    must: 'bg-red-500',
    should: 'bg-yellow-500',
    could: 'bg-green-500',
    wont: 'bg-gray-500'
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
  
  const renderFeatureGroup = (priority: 'must' | 'should' | 'could' | 'wont') => {
    return (
      <div>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
          <span className={`w-2 h-2 ${priorityColors[priority]} rounded-full mr-2`}></span>
          {priorityLabels[priority]}
        </h3>
        <div className="space-y-2">
          {featuresByPriority[priority].map(feature => (
            <div 
              key={feature.id} 
              className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => onEditFeature && onEditFeature(feature.id)}
            >
              <div>
                <h4 className="font-medium">{feature.name || 'Unnamed Feature'}</h4>
                <p className="text-xs text-gray-500">{feature.description || 'No description'}</p>
              </div>
              <div className="flex items-center">
                {feature.tags && feature.tags.length > 0 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded mr-2">
                    {feature.tags[0]}
                    {feature.tags.length > 1 && `+${feature.tags.length - 1}`}
                  </span>
                )}
                <span className={`px-2 py-1 ${statusColors[feature.status]} text-xs rounded mr-2`}>
                  {statusLabels[feature.status]}
                </span>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          
          <div 
            className="border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-50"
            onClick={() => onAddFeature(priority)}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            <p>Add Feature</p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {renderFeatureGroup('must')}
      {renderFeatureGroup('should')}
      {renderFeatureGroup('could')}
      {renderFeatureGroup('wont')}
    </div>
  );
};