import React from 'react';
import { ExternalLink, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Import types
import { ExtendedMarketCompetitor } from '../types';

export interface CompetitorCardProps {
  competitor: ExtendedMarketCompetitor;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  readOnly?: boolean;
}

export function CompetitorCard({ 
  competitor,
  onEdit,
  onDelete,
  readOnly = false
}: CompetitorCardProps) {
  // Helper function to determine pricing advantage
  const hasPricingAdvantage = (price: string | null) => {
    if (!price) return false;
    if (price.toLowerCase().includes('free')) return true;
    if (price.toLowerCase().includes('low')) return true;
    return false;
  };
  
  return (
    <Card className={`transition-all hover:shadow-md ${
      competitor.status === 'new' ? 'border-green-300 bg-green-50/30' :
      competitor.status === 'modified' ? 'border-yellow-300 bg-yellow-50/30' :
      competitor.status === 'removed' ? 'border-red-300 bg-red-50/30' :
      ''
    }`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-semibold text-primary-800 text-lg">{competitor.name || 'Unnamed Competitor'}</h3>
            {competitor.website && (
              <a 
                href={competitor.website.startsWith('http') ? competitor.website : `https://${competitor.website}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-800 flex items-center mt-1"
              >
                {competitor.website.replace(/^https?:\/\//, '')}
                <ExternalLink className="h-3.5 w-3.5 ml-1" />
              </a>
            )}
          </div>
          
          <div className="flex flex-col items-end">
            <Badge variant={hasPricingAdvantage(competitor.price) ? 'success' : 'outline'} className="capitalize mb-2">
              {competitor.price || 'Unknown Price'}
            </Badge>
            
            {competitor.market_share && (
              <Badge variant="outline" className="bg-primary-50 text-primary-600 border-primary-200">
                {competitor.market_share} Market Share
              </Badge>
            )}
          </div>
        </div>
        
        {competitor.notes && (
          <div className="mb-4">
            <p className="text-sm text-dark-600 bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-gray-100">
              {competitor.notes}
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-medium text-primary-700 mb-2">Strengths</h4>
            <div className="flex flex-wrap gap-1">
              {competitor.strengths && competitor.strengths.length > 0 ? 
                competitor.strengths.map((strength, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {strength}
                  </Badge>
                )) : 
                <p className="text-xs text-dark-400 italic">No strengths specified</p>
              }
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-primary-700 mb-2">Weaknesses</h4>
            <div className="flex flex-wrap gap-1">
              {competitor.weaknesses && competitor.weaknesses.length > 0 ? 
                competitor.weaknesses.map((weakness, index) => (
                  <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {weakness}
                  </Badge>
                )) : 
                <p className="text-xs text-dark-400 italic">No weaknesses specified</p>
              }
            </div>
          </div>
        </div>
        
        {!readOnly && (
          <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
            {onEdit && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-primary-700 hover:bg-primary-50"
                onClick={() => onEdit(competitor.id)}
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit Details
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-accent-700 hover:bg-accent-50"
                onClick={() => onDelete(competitor.id)}
              >
                <Trash className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 