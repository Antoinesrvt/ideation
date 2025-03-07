import React from 'react';
import { PlusCircle, Info, Edit, ArrowUpDown, ExternalLink, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompetitorTableProps } from '../types';

export function CompetitorTable({ 
  competitors,
  onAdd,
  onEdit,
  onUpdate,
  onDelete,
  readOnly = false
}: CompetitorTableProps) {
  // Function to determine if there is a pricing advantage
  const hasPricingAdvantage = (price: string | null) => {
    if (!price) return false;
    // This is simplistic - in a real app, you would compare against your product pricing
    return price.toLowerCase().includes('high') || price.includes('$$$');
  };
  
  const cardVariant = 
    competitors.some(c => c.status === 'new') ? 'gradient' :
    competitors.some(c => c.status === 'modified') ? 'elevated' :
    competitors.some(c => c.status === 'removed') ? 'outline' :
    'default';
    
  const customClasses = 
    competitors.some(c => c.status === 'new') ? 'border-green-300 from-green-50 to-white' :
    competitors.some(c => c.status === 'modified') ? 'border-yellow-300 shadow-yellow-100/50' :
    competitors.some(c => c.status === 'removed') ? 'border-red-300 text-red-800' :
    '';
  
  return (
    <Card variant={cardVariant} className={customClasses}>
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h4 className="text-sm font-medium text-primary-800">Competitive Analysis Matrix</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                </TooltipTrigger>
                <TooltipContent className="bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
                  <p>Compare your competitors based on their strengths, weaknesses, and pricing to identify opportunities for differentiation.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {!readOnly && onAdd && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onAdd}
            >
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
              Add Competitor
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow className="border-primary-100 hover:bg-primary-50/30">
              <TableHead className="w-[200px] text-primary-800">
                <div className="flex items-center">
                  Competitor
                  <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-primary-400" />
                </div>
              </TableHead>
              <TableHead className="text-primary-800">
                <div className="flex items-center">
                  Strengths
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
                        <p>What makes this competitor successful? What do customers love about them?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead className="text-primary-800">
                <div className="flex items-center">
                  Weaknesses
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
                        <p>Where does this competitor fall short? What problems do their customers have?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead className="text-primary-800">
                <div className="flex items-center">
                  Price
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-primary-400" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white/90 backdrop-blur-sm shadow-lg border border-primary-100">
                        <p>How much does their product or service cost? Consider using price tiers (e.g., $, $$, $$$) for easier comparison.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              {!readOnly && <TableHead className="w-[80px] text-primary-800">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={readOnly ? 4 : 5} className="text-center py-6 text-dark-500">
                  No competitors added yet. {!readOnly && 'Click "Add Competitor" to begin your competitive analysis.'}
                </TableCell>
              </TableRow>
            ) : (
              competitors.map(competitor => (
                <TableRow 
                  key={competitor.id}
                  className={`hover:bg-primary-50/30 transition-colors ${
                    competitor.status === 'new' ? 'bg-green-50/60' :
                    competitor.status === 'modified' ? 'bg-yellow-50/60' :
                    competitor.status === 'removed' ? 'bg-red-50/60' :
                    ''
                  }`}
                >
                  <TableCell className="font-medium text-dark-800">
                    {competitor.name || 'Unnamed competitor'}
                    {competitor.website && (
                      <a 
                        href={competitor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center ml-1 text-primary-600 hover:text-primary-700"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    {competitor.strengths && competitor.strengths.length > 0 
                      ? (
                        <div className="flex flex-wrap gap-1.5">
                          {competitor.strengths.map((strength, index) => (
                            <Badge key={index} variant="subtle-primary" size="sm" rounded="full">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      )
                      : <span className="text-dark-400 text-sm italic">None specified</span>
                    }
                  </TableCell>
                  <TableCell>
                    {competitor.weaknesses && competitor.weaknesses.length > 0 
                      ? (
                        <div className="flex flex-wrap gap-1.5">
                          {competitor.weaknesses.map((weakness, index) => (
                            <Badge key={index} variant="subtle-accent" size="sm" rounded="full">
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      )
                      : <span className="text-dark-400 text-sm italic">None specified</span>
                    }
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={hasPricingAdvantage(competitor.price) ? "warning" : "success"} 
                      rounded="sm"
                      className="py-0.5 px-2"
                    >
                      {competitor.price || 'Unknown'}
                    </Badge>
                  </TableCell>
                  {!readOnly && (
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-primary-700 hover:bg-primary-50 hover:text-primary-800"
                            onClick={() => onEdit(competitor.id)}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-accent-700 hover:bg-accent-50 hover:text-accent-800"
                            onClick={() => onDelete(competitor.id)}
                          >
                            <Trash className="h-3.5 w-3.5" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}