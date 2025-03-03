import React from 'react';
import { PlusCircle, Info, Edit, ArrowUpDown, ExternalLink } from 'lucide-react';
import { Competitor } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CompetitorTableProps {
  competitors: Competitor[];
  onAddCompetitor: () => void;
  onEditCompetitor?: (id: string) => void;
}

export const CompetitorTable: React.FC<CompetitorTableProps> = ({ 
  competitors,
  onAddCompetitor,
  onEditCompetitor 
}) => {
  // Function to determine if there is a pricing advantage
  const hasPricingAdvantage = (price: string) => {
    if (!price) return false;
    // This is simplistic - in a real app, you would compare against your product pricing
    return price.toLowerCase().includes('high') || price.includes('$$$');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h4 className="text-sm font-medium">Competitive Analysis Matrix</h4>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Compare your competitors based on their strengths, weaknesses, and pricing to identify opportunities for differentiation.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={onAddCompetitor}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Add Competitor
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <div className="flex items-center">
                  Competitor
                  <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-gray-400" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Strengths
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>What makes this competitor successful? What do customers love about them?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Weaknesses
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Where does this competitor fall short? What problems do their customers have?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Price
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>How much does their product or service cost? Consider using price tiers (e.g., $, $$, $$$) for easier comparison.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  No competitors added yet. Click "Add Competitor" to begin your competitive analysis.
                </TableCell>
              </TableRow>
            ) : (
              competitors.map(competitor => (
                <TableRow 
                  key={competitor.id}
                  className="hover:bg-gray-50"
                >
                  <TableCell className="font-medium">
                    {competitor.name || 'Unnamed competitor'}
                  </TableCell>
                  <TableCell>
                    {competitor.strengths && competitor.strengths.length > 0 
                      ? (
                        <div className="flex flex-wrap gap-1">
                          {competitor.strengths.map((strength, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      ) 
                      : <span className="text-gray-500 italic">None specified</span>
                    }
                  </TableCell>
                  <TableCell>
                    {competitor.weaknesses && competitor.weaknesses.length > 0 
                      ? (
                        <div className="flex flex-wrap gap-1">
                          {competitor.weaknesses.map((weakness, index) => (
                            <Badge key={index} variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100">
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      ) 
                      : <span className="text-gray-500 italic">None specified</span>
                    }
                  </TableCell>
                  <TableCell>
                    {competitor.price ? (
                      <Badge variant={hasPricingAdvantage(competitor.price) ? "outline" : "secondary"}
                        className={hasPricingAdvantage(competitor.price) 
                          ? "border-green-200 bg-green-50 text-green-700" 
                          : ""
                        }
                      >
                        {competitor.price}
                      </Badge>
                    ) : (
                      <span className="text-gray-500 italic">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-blue-600"
                      onClick={() => onEditCompetitor && onEditCompetitor(competitor.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <h5 className="text-sm font-medium mb-2 flex items-center">
          <ExternalLink className="h-4 w-4 mr-1 text-gray-600" />
          Competitive Analysis Tips
        </h5>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Look beyond direct competitors to alternative solutions your customers might use</li>
          <li>• Regularly update your analysis as competitors evolve and new players enter the market</li>
          <li>• Use customer interviews to understand how they perceive your competitors</li>
        </ul>
      </div>
    </div>
  );
};