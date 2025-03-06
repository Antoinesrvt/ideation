import React from 'react';
import { DiffMetadata, ChangeType } from '@/store/types';
import { PlusCircle, Pencil, Trash, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DiffSummaryProps {
  diffMetadata: DiffMetadata;
  featureMapping?: Record<string, string>;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onApply?: () => void;
  onReject?: () => void;
}

export function DiffSummary({
  diffMetadata,
  featureMapping = {},
  onSelectAll,
  onDeselectAll,
  onApply,
  onReject
}: DiffSummaryProps) {
  // Format feature keys for display
  const getFeatureDisplayName = (key: string) => {
    return featureMapping[key] || key.replace(/([A-Z])/g, ' $1').trim();
  };
  
  // Compute totals
  let totalAdded = 0, totalModified = 0, totalDeleted = 0;
  
  // Get features with changes
  const featuresWithChanges = Object.entries(diffMetadata)
    .filter(([_, diff]) => {
      if (!diff) return false;
      
      const hasAdditions = diff.additions.length > 0;
      const hasModifications = diff.modifications.length > 0;
      const hasDeletions = diff.deletions.length > 0;
      
      if (hasAdditions) totalAdded += diff.additions.length;
      if (hasModifications) totalModified += diff.modifications.length;
      if (hasDeletions) totalDeleted += diff.deletions.length;
      
      return hasAdditions || hasModifications || hasDeletions;
    })
    .map(([key]) => key);
  
  const totalChanges = totalAdded + totalModified + totalDeleted;
  
  if (totalChanges === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-center text-gray-500">No changes to display</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">AI Suggested Changes</h3>
          
          <div className="flex space-x-2">
            {onSelectAll && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onSelectAll}
                className="text-sm"
              >
                Select All
              </Button>
            )}
            
            {onDeselectAll && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onDeselectAll}
                className="text-sm"
              >
                Deselect All
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 p-2 bg-gray-50 rounded">
          <div className="flex space-x-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Total:</span>
              <Badge variant="outline" className="font-medium">{totalChanges}</Badge>
            </div>
            
            <div className="flex items-center">
              <PlusCircle className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm">{totalAdded} added</span>
            </div>
            
            <div className="flex items-center">
              <Pencil className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm">{totalModified} modified</span>
            </div>
            
            <div className="flex items-center">
              <Trash className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-sm">{totalDeleted} deleted</span>
            </div>
          </div>
        </div>
      </div>
      
      {featuresWithChanges.length > 0 && (
        <div className="p-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Changes by feature:</h4>
          
          {featuresWithChanges.map(feature => {
            const diff = diffMetadata[feature as keyof DiffMetadata];
            if (!diff) return null;
            
            return (
              <div key={feature} className="p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                <h5 className="font-medium">{getFeatureDisplayName(feature)}</h5>
                
                <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                  {diff.additions.length > 0 && (
                    <div className="flex items-center">
                      <PlusCircle className="w-4 h-4 text-green-500 mr-1" />
                      <span>{diff.additions.length} added</span>
                    </div>
                  )}
                  
                  {diff.modifications.length > 0 && (
                    <div className="flex items-center">
                      <Pencil className="w-4 h-4 text-blue-500 mr-1" />
                      <span>{diff.modifications.length} modified</span>
                    </div>
                  )}
                  
                  {diff.deletions.length > 0 && (
                    <div className="flex items-center">
                      <Trash className="w-4 h-4 text-red-500 mr-1" />
                      <span>{diff.deletions.length} deleted</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {(onApply || onReject) && (
        <div className="p-4 border-t flex justify-end space-x-3">
          {onReject && (
            <Button
              variant="outline"
              onClick={onReject}
              className="flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Discard Changes
            </Button>
          )}
          
          {onApply && (
            <Button
              onClick={onApply}
              className="flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply Changes
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 