import React from 'react';
import { useProjectStore } from '@/store';
import { DiffView } from './DiffView';
import type { ProjectState } from '@/store/types';

interface ProjectComparisonProps {
  onAccept: () => void;
  onReject: () => void;
}

export const ProjectComparison: React.FC<ProjectComparisonProps> = ({
  onAccept,
  onReject,
}) => {
  const { currentData, stagedData } = useProjectStore();

  if (!stagedData) return null;

  const sections: Array<{
    key: keyof ProjectState['currentData'];
    label: string;
  }> = [
    { key: 'project', label: 'Project Details' },
    { key: 'canvasSections', label: 'Canvas Sections' },
    { key: 'canvasItems', label: 'Canvas Items' },
    { key: 'grpCategories', label: 'GRP Categories' },
    { key: 'grpSections', label: 'GRP Sections' },
    { key: 'grpItems', label: 'GRP Items' },
    { key: 'marketPersonas', label: 'Market Personas' },
    { key: 'marketInterviews', label: 'Market Interviews' },
    { key: 'marketCompetitors', label: 'Market Competitors' },
    { key: 'marketTrends', label: 'Market Trends' },
    { key: 'productWireframes', label: 'Product Wireframes' },
    { key: 'productFeatures', label: 'Product Features' },
    { key: 'productJourneyStages', label: 'Product Journey Stages' },
    { key: 'productJourneyActions', label: 'Product Journey Actions' },
    { key: 'productJourneyPainPoints', label: 'Product Journey Pain Points' },
    { key: 'financialRevenueStreams', label: 'Financial Revenue Streams' },
    { key: 'financialCostStructure', label: 'Financial Cost Structure' },
    { key: 'financialPricingStrategies', label: 'Financial Pricing Strategies' },
    { key: 'financialProjections', label: 'Financial Projections' },
    { key: 'validationExperiments', label: 'Validation Experiments' },
    { key: 'validationABTests', label: 'Validation AB Tests' },
    { key: 'validationUserFeedback', label: 'Validation User Feedback' },
    { key: 'validationHypotheses', label: 'Validation Hypotheses' },
    { key: 'teamMembers', label: 'Team Members' },
    { key: 'teamTasks', label: 'Team Tasks' },
    { key: 'teamResponsibilityMatrix', label: 'Team Responsibility Matrix' },
    { key: 'documents', label: 'Documents' },
    { key: 'documentCollaborators', label: 'Document Collaborators' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'relatedItems', label: 'Related Items' },
    { key: 'projectTags', label: 'Project Tags' },
    { key: 'featureItemTags', label: 'Feature Item Tags' },
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="sticky top-0 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Review Changes</h2>
            <div className="space-x-4">
              <button
                onClick={onReject}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
              >
                Discard Changes
              </button>
              <button
                onClick={onAccept}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {sections.map(({ key, label }) => (
            <DiffView
              key={key}
              currentValue={currentData[key]}
              stagedValue={stagedData[key]}
              label={label}
              showDiffOnly
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 