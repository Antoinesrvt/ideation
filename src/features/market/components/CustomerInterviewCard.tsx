import React from 'react';
import { FileText, CalendarIcon, Info, MessageCircle, Edit, Trash } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomerInterviewCardProps } from '../types';

export function CustomerInterviewCard({ 
  interview,
  onEdit,
  onUpdate,
  onDelete,
  readOnly = false
}: CustomerInterviewCardProps) {
  const getSentimentVariant = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'destructive';
      default:
        return 'secondary';
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
    
  const cardVariant = 
    interview.status === 'new' ? 'gradient' :
    interview.status === 'modified' ? 'elevated' :
    interview.status === 'removed' ? 'outline' :
    'default';
    
  const customClasses = 
    interview.status === 'new' ? 'border-green-300 from-green-50 to-white' :
    interview.status === 'modified' ? 'border-yellow-300 shadow-yellow-100/50' :
    interview.status === 'removed' ? 'border-red-300 text-red-800' :
    '';
  
  return (
    <Card 
      variant={cardVariant}
      animation="hover"
      className={customClasses}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-sm mr-3 ${
              sentiment === 'positive' ? 'bg-green-100 text-green-700' : 
              sentiment === 'negative' ? 'bg-red-100 text-red-700' : 
              'bg-gray-100 text-gray-600'
            }`}>
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-primary-800">
                {interview.name || 'Anonymous Customer'}
              </h3>
              <div className="flex items-center mt-0.5">
                <CalendarIcon className="h-3.5 w-3.5 text-dark-400 mr-1" />
                <span className="text-xs text-dark-500">
                  {interview.interview_date ? formatDate(interview.interview_date) : 'Date not specified'}
                </span>
              </div>
            </div>
          </div>
          <Badge 
            variant={getSentimentVariant(sentiment)}
            className="py-0.5 px-2"
          >
            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)} Feedback
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center mb-1.5">
              <p className="text-sm font-medium text-primary-800">Key Insights</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
                    <p>The most important takeaways from this customer interview that relate to your product or service.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {keyInsights && keyInsights.length > 0 
                ? keyInsights.map((insight, index) => (
                  <Badge key={index} variant="subtle-primary" size="sm">
                    {insight}
                  </Badge>
                ))
                : <span className="text-dark-400 text-sm italic">No key insights recorded</span>
              }
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-1.5">
              <p className="text-sm font-medium text-primary-800">Interview Notes</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
                    <p>Summary of the conversation, focusing on customer needs, pain points, and feedback about your product.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-sm text-dark-600 bg-white/50 p-3 rounded-lg border border-gray-100 backdrop-blur-sm">
              {interview.notes 
                ? interview.notes
                : <span className="italic text-dark-400">No notes recorded for this interview</span>
              }
            </div>
          </div>
          
          {interview.tags && interview.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-primary-800 mb-1.5">Customer Segments</p>
              <div className="flex flex-wrap gap-1.5">
                {interview.tags.map((tag, index) => (
                  <Badge key={index} variant="outline-secondary" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {interview.company && (
            <div>
              <p className="text-sm font-medium text-primary-800 mb-1.5">Company</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="ghost" size="sm">
                  {interview.company}
                </Badge>
              </div>
            </div>
          )}
        </div>
        
        {!readOnly && (
          <>
            <Separator className="my-4" variant="ghost" />
            <div className="flex justify-between">
              {onEdit && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary-700 hover:bg-primary-50"
                  onClick={() => onEdit(interview.id)}
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Edit Interview
                </Button>
              )}
              
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-accent-700 hover:bg-accent-50"
                  onClick={() => onDelete(interview.id)}
                >
                  <Trash className="h-3.5 w-3.5 mr-1.5" />
                  Delete
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}