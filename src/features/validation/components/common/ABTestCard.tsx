import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ValidationABTest } from '@/store/types';
import { 
  Edit, 
  Trash2, 
  Calendar,
  LineChart,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Trophy,
  Percent
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { formatDistance, format, isValid } from 'date-fns';

interface ABTestCardProps {
  abTest: ValidationABTest;
  onEdit: (abTest: ValidationABTest) => void;
  onDelete: (id: string) => void;
}

export function ABTestCard({ abTest, onEdit, onDelete }: ABTestCardProps) {
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
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'in_progress':
        return <ArrowRightLeft className="h-3.5 w-3.5" />;
      case 'planned':
        return <Clock className="h-3.5 w-3.5" />;
      case 'cancelled':
        return <Trash2 className="h-3.5 w-3.5" />;
      default:
        return <ArrowRightLeft className="h-3.5 w-3.5" />;
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
    const startDate = formatDate(abTest.start_date);
    const endDate = formatDate(abTest.end_date);
    
    if (startDate && endDate) {
      return `${startDate} - ${endDate}`;
    } else if (startDate) {
      return `Started on ${startDate}`;
    } else if (endDate) {
      return `Due by ${endDate}`;
    }
    
    return null;
  };
  
  // Format conversion rate
  const formatConversion = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // Calculate lift
  const calculateLift = () => {
    if (abTest.conversion_a === null || abTest.conversion_b === null || abTest.conversion_a === 0) {
      return null;
    }
    
    const lift = ((abTest.conversion_b - abTest.conversion_a) / abTest.conversion_a) * 100;
    return lift.toFixed(1);
  };
  
  // Get color for lift value
  const getLiftColor = (lift: number) => {
    if (lift > 0) return 'text-green-600';
    if (lift < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  
  const getConfidenceColor = (confidence: number | null) => {
    if (!confidence) return '';
    if (confidence < 80) return 'text-yellow-600';
    if (confidence < 95) return 'text-blue-600';
    return 'text-green-600';
  };
  
  return (
    <Card className="h-full flex flex-col hover:border-primary-200 transition-colors duration-200">
      <CardHeader className="pb-2 flex-row justify-between items-start space-y-0 gap-2">
        <Badge className={getStatusColor(abTest.status)}>
          <span className="flex items-center gap-1.5">
            {getStatusIcon(abTest.status)}
            {abTest.status ? abTest.status.replace('_', ' ') : 'New'}
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
            <LineChart className="h-5 w-5 text-primary-500" />
          </div>
          
          <div className="space-y-3 flex-grow">
            <h3 className="font-semibold text-gray-800 line-clamp-2">
              {abTest.title}
            </h3>
            
            {/* Description */}
            {abTest.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {abTest.description}
              </p>
            )}
            
            {/* Variants and metrics */}
            <div className="bg-gray-50 rounded p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Key Metric</span>
                <Badge variant="outline" className="text-xs font-normal">
                  {abTest.metric}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-2 rounded border border-gray-100">
                  <p className="text-xs font-medium text-gray-700 mb-1">Variant A</p>
                  <p className="text-xs text-gray-600 line-clamp-1">{abTest.variant_a}</p>
                  {abTest.conversion_a !== null && (
                    <p className="text-xs text-gray-700 mt-1">
                      Conv: {formatConversion(abTest.conversion_a)}
                    </p>
                  )}
                </div>
                <div className="bg-white p-2 rounded border border-gray-100">
                  <p className="text-xs font-medium text-gray-700 mb-1">Variant B</p>
                  <p className="text-xs text-gray-600 line-clamp-1">{abTest.variant_b}</p>
                  {abTest.conversion_b !== null && (
                    <p className="text-xs text-gray-700 mt-1">
                      Conv: {formatConversion(abTest.conversion_b)}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex flex-wrap gap-3">
                {abTest.sample_size && (
                  <div className="text-xs text-gray-700">
                    <span className="text-gray-500">Sample size:</span> {abTest.sample_size.toLocaleString()}
                  </div>
                )}
                
                {calculateLift() && (
                  <div className="text-xs">
                    <span className="text-gray-500">Lift:</span>{' '}
                    <span className={getLiftColor(parseFloat(calculateLift() || '0'))}>
                      {calculateLift()}%
                    </span>
                  </div>
                )}
                
                {abTest.confidence && (
                  <div className="text-xs flex items-center">
                    <Percent className="h-3 w-3 text-gray-500 mr-1" />
                    <span className="text-gray-500">Confidence:</span>{' '}
                    <span className={getConfidenceColor(abTest.confidence)}>
                      {abTest.confidence}%
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Winner */}
            {abTest.winner && (
              <div className="flex items-center gap-1.5 text-xs text-gray-700">
                <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                <span>Winner: <span className="font-medium">{abTest.winner}</span></span>
              </div>
            )}
            
            {/* Notes */}
            {abTest.notes && (
              <div>
                <p className="text-xs font-medium text-gray-700">Notes:</p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {abTest.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 flex justify-between items-center mt-auto">
        <span className="text-xs text-gray-500">
          Updated {formatUpdatedDate(abTest.updated_at)}
        </span>
        
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(abTest)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Edit A/B Test</p>
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
                  onClick={() => onDelete(abTest.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Delete A/B Test</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
} 