import React from 'react';
import { ChevronRight } from 'lucide-react';
import { CustomerInterview } from '@/types';
import { formatDate } from '@/lib/utils';

interface CustomerInterviewCardProps {
  interview: CustomerInterview;
  onView?: (id: string) => void;
}

export const CustomerInterviewCard: React.FC<CustomerInterviewCardProps> = ({ 
  interview,
  onView 
}) => {
  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">
            {interview.name 
              ? `Interview: ${interview.name}${interview.company ? ` from ${interview.company}` : ''}` 
              : 'New Interview'}
          </h3>
          <p className="text-sm text-gray-500">{formatDate(interview.date)}</p>
        </div>
        <span className={`px-2 py-1 ${getSentimentColor(interview.sentiment)} text-xs rounded-full`}>
          {interview.sentiment.charAt(0).toUpperCase() + interview.sentiment.slice(1)}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {interview.notes || 'No notes recorded for this interview.'}
      </p>
      <button 
        className="mt-2 text-blue-600 text-sm flex items-center"
        onClick={() => onView && onView(interview.id)}
      >
        View Details <ChevronRight className="h-4 w-4 ml-1" />
      </button>
    </div>
  );
};