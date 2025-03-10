import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ValidationExperiment } from '@/store/types';
import { 
  Edit, 
  Trash2, 
  Beaker,
  Calendar,
  LightbulbIcon,
  ClipboardCheck,
  ArrowRightLeft,
  Clock
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { formatDistance, format, isValid } from 'date-fns';

interface ExperimentCardProps {
  experiment: ValidationExperiment;
  onEdit: (experiment: ValidationExperiment) => void;
  onDelete: (id: string) => void;
}

export function ExperimentCard({ experiment, onEdit, onDelete }: ExperimentCardProps) {
  // Helper functions for display
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed':
        return <ClipboardCheck className="h-3.5 w-3.5" />;
      case 'in_progress':
        return <ArrowRightLeft className="h-3.5 w-3.5" />;
      case 'planned':
        return <Clock className="h-3.5 w-3.5" />;
      case 'cancelled':
        return <Trash2 className="h-3.5 w-3.5" />;
      default:
        return <Beaker className="h-3.5 w-3.5" />;
    }
  };
  
  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return null;
      return format(date, 'MMM d, yyyy');
    } catch {
      return null;
    }
  };
  
  const formatUpdatedDate = (dateString?: string | null) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return `${formatDistance(date, new Date(), { addSuffix: true })}`;
    } catch {
      return 'Recently';
    }
  };
  
  // Get date range display
  const getDateRangeDisplay = () => {
    const startDate = formatDate(experiment.start_date);
    const endDate = formatDate(experiment.end_date);
    
    if (startDate && endDate) {
      return `${startDate} - ${endDate}`;
    } else if (startDate) {
      return `Started on ${startDate}`;
    } else if (endDate) {
      return `Due by ${endDate}`;
    }
    
    return null;
  };
  
  return (
    <Card className="h-full flex flex-col hover:border-primary-200 transition-colors duration-200">
      <CardHeader className="pb-2 flex-row justify-between items-start space-y-0 gap-2">
        <Badge className={getStatusColor(experiment.status)}>
          <span className="flex items-center gap-1.5">
            {getStatusIcon(experiment.status)}
            {experiment.status ? experiment.status.replace('_', ' ') : 'New'}
          </span>
        </Badge>
        
        {getDateRangeDisplay() && (
          <div className="flex items-center text-xs text-gray-500">
            <Calendar className="h-3.5 w-3.5 mr-1" />
            {getDateRangeDisplay()}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow pb-0">
        <div className="flex items-start space-x-3">
          <div className="bg-primary-50 rounded-full p-2 flex-shrink-0 mt-1">
            <Beaker className="h-5 w-5 text-primary-500" />
          </div>
          
          <div className="space-y-3 flex-grow">
            <h3 className="font-semibold text-gray-800 line-clamp-2">
              {experiment.title}
            </h3>
            
            {/* Description */}
            {experiment.description && (
              <p className="text-sm text-gray-600 line-clamp-3">
                {experiment.description}
              </p>
            )}
            
            {/* Hypothesis */}
            {experiment.hypothesis && (
              <div className="flex items-start gap-1.5">
                <LightbulbIcon className="h-3.5 w-3.5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600 line-clamp-2">
                  <span className="text-gray-500">Hypothesis:</span> {experiment.hypothesis}
                </p>
              </div>
            )}
            
            {/* Metrics */}
            {experiment.metrics && typeof experiment.metrics === 'object' && (
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-xs font-medium text-gray-700 mb-1">Key Metrics:</p>
                <ul className="text-xs text-gray-600 pl-4 list-disc space-y-0.5">
                  {Object.entries(experiment.metrics as Record<string, any>).map(([key, value], i) => (
                    <li key={i} className="line-clamp-1">
                      {key}: {value === true ? 'Yes' : value === false ? 'No' : value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Results and learnings */}
            {(experiment.status === 'completed' || experiment.status === 'in_progress') && (
              <div className="space-y-2">
                {experiment.results && (
                  <div>
                    <p className="text-xs font-medium text-gray-700">Results:</p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {experiment.results}
                    </p>
                  </div>
                )}
                
                {experiment.learnings && (
                  <div>
                    <p className="text-xs font-medium text-gray-700">Learnings:</p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {experiment.learnings}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 flex justify-between items-center mt-auto">
        <span className="text-xs text-gray-500">
          Updated {formatUpdatedDate(experiment.updated_at)}
        </span>
        
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(experiment)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Edit experiment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onDelete(experiment.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Delete experiment</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
} 