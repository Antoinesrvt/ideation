import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ValidationUserFeedback } from '@/store/types';
import { 
  Edit, 
  Trash2, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Tag
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { formatDistance } from 'date-fns';

interface UserFeedbackCardProps {
  feedback: ValidationUserFeedback;
  onEdit: (feedback: ValidationUserFeedback) => void;
  onDelete: (id: string) => void;
}

export function UserFeedbackCard({ feedback, onEdit, onDelete }: UserFeedbackCardProps) {
  // Helper functions for display
  const getSentimentIcon = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-3.5 w-3.5" />;
      case 'negative':
        return <ThumbsDown className="h-3.5 w-3.5" />;
      case 'neutral':
      default:
        return <MessageSquare className="h-3.5 w-3.5" />;
    }
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'neutral':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string | null) => {
    switch (impact) {
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'addressed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'wont_fix':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'new':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
      <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0 gap-2">
        <Badge className={getSentimentColor(feedback.sentiment)}>
          <span className="flex items-center gap-1.5">
            {getSentimentIcon(feedback.sentiment)}
            {feedback.sentiment || 'Neutral'}
          </span>
        </Badge>
        
        {feedback.impact && (
          <Badge className={getImpactColor(feedback.impact)}>
            <span className="flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" />
              {feedback.impact} impact
            </span>
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow pb-0">
        <div className="flex items-start space-x-3">
          <div className="bg-primary-50 rounded-full p-2 flex-shrink-0 mt-1">
            <MessageSquare className="h-5 w-5 text-primary-500" />
          </div>
          
          <div className="space-y-3 flex-grow">
            {/* Content */}
            <div>
              <p className="text-sm text-gray-600 line-clamp-4">
                {feedback.content}
              </p>
            </div>
            
            {/* Source */}
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-xs">
                {feedback.source}
              </Badge>
              {feedback.type && (
                <Badge variant="outline" className="text-xs">
                  {feedback.type}
                </Badge>
              )}
            </div>
            
            {/* Tags */}
            {feedback.tags && feedback.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {feedback.tags.map((tag, i) => (
                  <div key={i} className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </div>
                ))}
              </div>
            )}
            
            {/* Response */}
            {feedback.response && (
              <div className="border-t border-gray-100 pt-2 mt-2">
                <p className="text-xs text-gray-500 mb-1">Our response:</p>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {feedback.response}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 flex justify-between items-center mt-auto">
        <div className="flex items-center space-x-3">
          <span className="text-xs text-gray-500">
            {formatDate(feedback.date || feedback.created_at)}
          </span>
          
          {feedback.status && (
            <Badge className={getStatusColor(feedback.status)} variant="secondary">
              {feedback.status.replace('_', ' ')}
            </Badge>
          )}
        </div>
        
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onEdit(feedback)}
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Edit feedback</p>
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
                  onClick={() => onDelete(feedback.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Delete feedback</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
} 