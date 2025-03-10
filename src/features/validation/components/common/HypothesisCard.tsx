import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ValidationHypothesis } from '@/store/types';
import { 
  Edit, 
  Trash2, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  FileText,
  Percent
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { formatDistance } from 'date-fns';

interface HypothesisCardProps {
  hypothesis: ValidationHypothesis;
  onEdit: (hypothesis: ValidationHypothesis) => void;
  onDelete: (id: string) => void;
}

export function HypothesisCard({ hypothesis, onEdit, onDelete }: HypothesisCardProps) {
  // Get status colors and icons, similar to the table view
  const getStatusColor = (status: ValidationHypothesis['status']) => {
    switch (status) {
      case 'validated':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'invalidated':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'unvalidated':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusIcon = (status: ValidationHypothesis['status']) => {
    switch (status) {
      case 'validated':
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case 'invalidated':
        return <XCircle className="h-3.5 w-3.5" />;
      case 'unvalidated':
      default:
        return <HelpCircle className="h-3.5 w-3.5" />;
    }
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence < 30) return 'bg-red-500';
    if (confidence < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getConfidenceTextColor = (confidence: number) => {
    if (confidence < 30) return 'text-red-600';
    if (confidence < 70) return 'text-yellow-600';
    return 'text-green-600';
  };
  
  const getConfidenceLevel = (confidence: number) => {
    if (confidence < 30) return 'Low';
    if (confidence < 70) return 'Medium';
    return 'High';
  };
  
  // Format date for display
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return `${formatDistance(date, new Date(), { addSuffix: true })}`;
    } catch {
      return 'Recently';
    }
  };
  
  return (
    <Card className="h-full flex flex-col hover:border-primary-200 transition-colors duration-200">
      <CardHeader className="pb-2 flex-row justify-between items-start space-y-0 gap-2">
        <Badge className={`${getStatusColor(hypothesis.status)} ml-auto`}>
          <span className="flex items-center gap-1.5">
            {getStatusIcon(hypothesis.status)}
            {hypothesis.status || 'Unvalidated'}
          </span>
        </Badge>
      </CardHeader>
      
      <CardContent className="flex-grow pb-0">
        <div className="flex items-start space-x-3">
          <div className="bg-primary-50 rounded-full p-2 flex-shrink-0 mt-1">
            <Lightbulb className="h-5 w-5 text-primary-500" />
          </div>
          
          <div className="space-y-3 flex-grow">
            <h3 className="font-semibold text-gray-800 line-clamp-2">
              {hypothesis.statement || "Unnamed hypothesis"}
            </h3>
            
            {/* Confidence meter */}
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getConfidenceColor(hypothesis.confidence ?? 0)}`}
                  style={{ width: `${hypothesis.confidence ?? 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  Confidence:
                </span>
                <span className={`font-medium ${getConfidenceTextColor(hypothesis.confidence ?? 0)}`}>
                  {hypothesis.confidence ?? 0}% - {getConfidenceLevel(hypothesis.confidence ?? 0)}
                </span>
              </div>
            </div>
            
            {/* Validation method */}
            {hypothesis.validation_method && (
              <div className="flex items-start gap-1.5">
                <FileText className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 line-clamp-2">
                  {hypothesis.validation_method}
                </span>
              </div>
            )}
            
            {/* Assumptions section */}
            {hypothesis.assumptions && hypothesis.assumptions.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Key assumptions:</p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5 ml-1">
                  {hypothesis.assumptions.slice(0, 3).map((assumption, i) => (
                    <li key={i} className="line-clamp-1">{assumption}</li>
                  ))}
                  {hypothesis.assumptions.length > 3 && (
                    <li className="text-gray-500">
                      +{hypothesis.assumptions.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            {/* Evidence section - if has evidence and is validated or invalidated */}
            {hypothesis.evidence && hypothesis.evidence.length > 0 && hypothesis.status !== 'unvalidated' && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">Supporting evidence:</p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5 ml-1">
                  {hypothesis.evidence.slice(0, 2).map((item, i) => (
                    <li key={i} className="line-clamp-1">{item}</li>
                  ))}
                  {hypothesis.evidence.length > 2 && (
                    <li className="text-gray-500">
                      +{hypothesis.evidence.length - 2} more
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 flex justify-between items-center mt-auto">
        <span className="text-xs text-gray-500">
          Updated {formatDate(hypothesis.updated_at)}
        </span>
        
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(hypothesis)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Edit hypothesis</p>
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
                  onClick={() => onDelete(hypothesis.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Delete hypothesis</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
} 