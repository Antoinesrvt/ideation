import React from 'react';
import { cn } from '@/lib/utils';

interface DiffViewProps {
  currentValue: unknown;
  stagedValue: unknown;
  label: string;
  showDiffOnly?: boolean;
}

export const DiffView: React.FC<DiffViewProps> = ({
  currentValue,
  stagedValue,
  label,
  showDiffOnly = true
}) => {
  const isDifferent = JSON.stringify(currentValue) !== JSON.stringify(stagedValue);

  if (showDiffOnly && !isDifferent) {
    return null;
  }

  const renderValue = (value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <pre className="text-sm overflow-auto whitespace-pre-wrap">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    return <span className="text-sm">{String(value)}</span>;
  };

  return (
    <div className="border rounded-lg mb-4 overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
      </div>
      <div className="grid grid-cols-2 divide-x">
        <div className={cn(
          "p-4",
          isDifferent && "bg-red-50"
        )}>
          <h4 className="text-xs font-medium mb-2 text-gray-500">Current</h4>
          {renderValue(currentValue)}
        </div>
        <div className={cn(
          "p-4",
          isDifferent && "bg-green-50"
        )}>
          <h4 className="text-xs font-medium mb-2 text-gray-500">Proposed</h4>
          {renderValue(stagedValue)}
        </div>
      </div>
    </div>
  );
}; 