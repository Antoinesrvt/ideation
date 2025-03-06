import React from 'react';
import { useProjectStore } from '@/store';
import type { ProjectState } from '@/store/types';

interface DiffViewProps {
  currentValue: unknown;
  stagedValue: unknown;
  label: string;
}

const DiffView: React.FC<DiffViewProps> = ({ currentValue, stagedValue, label }) => {
  const isDifferent = JSON.stringify(currentValue) !== JSON.stringify(stagedValue);

  if (!isDifferent) return null;

  return (
    <div className="p-4 border rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">{label}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded">
          <h4 className="text-sm font-medium mb-2">Current</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(currentValue, null, 2)}
          </pre>
        </div>
        <div className="p-3 bg-blue-50 rounded">
          <h4 className="text-sm font-medium mb-2">Proposed</h4>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(stagedValue, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

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

  const renderComparison = (
    key: keyof ProjectState['currentData'],
    label: string
  ) => (
    <DiffView
      key={key}
      currentValue={currentData[key]}
      stagedValue={stagedData[key]}
      label={label}
    />
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Review Changes</h2>
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

      <div className="space-y-6">
        {renderComparison('project', 'Project Details')}
        {renderComparison('canvasSections', 'Canvas Sections')}
        {renderComparison('canvasItems', 'Canvas Items')}
        {renderComparison('grpCategories', 'GRP Categories')}
        {renderComparison('grpSections', 'GRP Sections')}
        {renderComparison('grpItems', 'GRP Items')}
        {renderComparison('marketPersonas', 'Market Personas')}
        {renderComparison('marketInterviews', 'Market Interviews')}
        {renderComparison('marketCompetitors', 'Market Competitors')}
        {renderComparison('marketTrends', 'Market Trends')}
        {renderComparison('productWireframes', 'Product Wireframes')}
        {renderComparison('productFeatures', 'Product Features')}
        {renderComparison('productJourneyStages', 'Product Journey Stages')}
        {renderComparison('productJourneyActions', 'Product Journey Actions')}
        {renderComparison('productJourneyPainPoints', 'Product Journey Pain Points')}
        {renderComparison('financialRevenueStreams', 'Financial Revenue Streams')}
        {renderComparison('financialCostStructure', 'Financial Cost Structure')}
        {renderComparison('financialPricingStrategies', 'Financial Pricing Strategies')}
        {renderComparison('financialProjections', 'Financial Projections')}
        {renderComparison('validationExperiments', 'Validation Experiments')}
        {renderComparison('validationABTests', 'Validation AB Tests')}
        {renderComparison('validationUserFeedback', 'Validation User Feedback')}
        {renderComparison('validationHypotheses', 'Validation Hypotheses')}
        {renderComparison('teamMembers', 'Team Members')}
        {renderComparison('teamTasks', 'Team Tasks')}
        {renderComparison('teamResponsibilityMatrix', 'Team Responsibility Matrix')}
        {renderComparison('documents', 'Documents')}
        {renderComparison('documentCollaborators', 'Document Collaborators')}
        {renderComparison('notifications', 'Notifications')}
        {renderComparison('relatedItems', 'Related Items')}
        {renderComparison('projectTags', 'Project Tags')}
        {renderComparison('featureItemTags', 'Feature Item Tags')}
      </div>
    </div>
  );
}; 