import React from 'react';
import { FileText, CalendarIcon, Info, MessageCircle, Edit, Trash } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomerInterviewCardProps } from '../types';

export function CustomerInterviewCard({ 
  interview,
  onEdit,
  onUpdate,
  onDelete,
  readOnly = false
}: CustomerInterviewCardProps) {
  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <MessageCircle className="h-4 w-4 text-red-600" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-600" />;
    }
  };
  
  // Function to extract key insights from notes (this is a simplistic example)
  const extractKeyInsights = (notes: string) => {
    if (!notes) return [];
    // This is a simple implementation - in a real app you might use NLP or more sophisticated logic
    const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 2).map(s => s.trim());
  };
  
  const keyInsights = interview.key_insights || extractKeyInsights(interview.notes || '');
  
  // Ensure sentiment is one of the valid values
  const sentiment: 'positive' | 'neutral' | 'negative' = 
    interview.sentiment === 'positive' ? 'positive' :
    interview.sentiment === 'negative' ? 'negative' : 
    'neutral';
  
  return (
    <div className={`bg-white border rounded-lg p-4 transition-shadow ${
      interview.status === 'new' ? 'border-green-300 shadow-green-100' :
      interview.status === 'modified' ? 'border-yellow-300 shadow-yellow-100' :
      interview.status === 'removed' ? 'border-red-300 shadow-red-100' :
      'border-gray-200 hover:shadow-md'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold">
              {interview.name 
                ? `${interview.name}${interview.company ? ` from ${interview.company}` : ''}` 
                : 'New Interview'}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="h-3.5 w-3.5 mr-1" />
              <span>{formatDate(interview.interview_date || '')}</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className={`flex items-center gap-1 ${getSentimentColor(sentiment)}`}>
          {getSentimentIcon(sentiment)}
          <span>{sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</span>
        </Badge>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center mb-1">
          <p className="text-sm font-medium text-gray-700">Interview Notes</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Record verbatim quotes and observations from the interview. Focus on the customer's words, not your interpretations.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-24 overflow-y-auto">
          {interview.notes || 'No notes recorded for this interview.'}
        </p>
      </div>
      
      {keyInsights.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Key Insights</p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pl-1">
            {keyInsights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      )}
      
      {interview.tags && interview.tags.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-1">Tags</p>
          <div className="flex flex-wrap gap-1">
            {interview.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {!readOnly && (
        <div className="flex justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            className="text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2.5 py-1.5"
            onClick={() => onEdit?.(interview.id)}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Interview
          </Button>
          
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-600 flex items-center gap-1 hover:bg-red-50 px-2.5 py-1.5"
              onClick={() => onDelete(interview.id)}
            >
              <Trash className="h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}