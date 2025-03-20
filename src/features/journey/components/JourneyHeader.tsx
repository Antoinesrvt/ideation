import React from 'react';
import { formatDate } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ExternalLink, RefreshCw } from 'lucide-react';

interface JourneyHeaderProps {
  projectName: string;
  lastEdited: string;
  progress: number;
}

export function JourneyHeader({ projectName, lastEdited, progress }: JourneyHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{projectName}</h1>
          <p className="text-sm text-gray-500">Last edited: {formatDate(lastEdited)}</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Overall Progress</h3>
          <span className="text-sm font-medium" style={{ color: '#7209B7' }}>
            {progress}%
          </span>
        </div>
        <Progress 
          value={progress} 
          className="h-2 bg-gray-100" 
          indicatorClassName="bg-gradient-to-r from-[#7209B7] to-[#4CC9F0]" 
        />
      </div>
    </div>
  );
} 