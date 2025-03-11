import React, { useState } from 'react';
import { PlusCircle, Info, Edit, ArrowUpDown, ExternalLink, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompetitorTableProps } from '../types';
import { CompetitorCard } from './CompetitorCard';
import { EnhancedCompetitorCard } from './EnhancedCompetitorCard';

export function CompetitorTable({ 
  competitors,
  onAdd,
  onEdit,
  onUpdate,
  onDelete,
  readOnly = false
}: CompetitorTableProps) {
  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'add'>('view');
  
  // Helper function from original component
  const hasPricingAdvantage = (price: string | null) => {
    if (!price) return false;
    if (price.toLowerCase().includes('free')) return true;
    if (price.toLowerCase().includes('low')) return true;
    return false;
  };
  
  // Handle opening the dialog for viewing a competitor
  const handleViewCompetitor = (id: string) => {
    const competitor = competitors.find(c => c.id === id);
    if (competitor) {
      setSelectedCompetitor(competitor);
      setDialogMode('view');
      setDialogOpen(true);
    }
  };
  
  // Handle opening the dialog for editing a competitor
  const handleEditCompetitor = (id: string) => {
    const competitor = competitors.find(c => c.id === id);
    if (competitor) {
      setSelectedCompetitor(competitor);
      setDialogMode('edit');
      setDialogOpen(true);
    }
  };
  
  // Handle opening the dialog for adding a new competitor
  const handleAddCompetitor = () => {
    // Create a placeholder competitor for the dialog
    setSelectedCompetitor({
      id: 'new',
      name: '',
      website: '',
      price: '',
      market_share: '',
      notes: '',
      strengths: [],
      weaknesses: [],
      status: 'new'
    });
    setDialogMode('add');
    setDialogOpen(true);
  };
  
  // Handle saving competitor changes
  const handleSaveCompetitor = (params: { id: string; data: any }) => {
    if (dialogMode === 'add' && onAdd) {
      onAdd();
    } else if (onUpdate) {
      onUpdate(params);
    }
    setDialogOpen(false);
    setSelectedCompetitor(null);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCompetitor(null);
  };
  
  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="px-5 py-4 flex flex-row items-center justify-between">
          <div>
            <h3 className="text-base font-medium flex items-center">
              Competitor Analysis
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                    <span><Info className="h-3.5 w-3.5 ml-1 text-primary-400" /></span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                    <p className="text-xs">Track your competitors, their features, strengths, and weaknesses</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
            </h3>
            <p className="text-sm text-dark-500">Compare your product against competitors</p>
        </div>
          
        {!readOnly && onAdd && (
          <Button 
              variant="default" 
            size="sm" 
              className="bg-primary-600 hover:bg-primary-700"
              onClick={handleAddCompetitor}
          >
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
            Add Competitor
          </Button>
        )}
        </CardHeader>
        
        <CardContent className="px-0 pb-1">
          <div className="overflow-auto">
        <Table>
          <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-5 w-60">Competitor</TableHead>
                  <TableHead className="w-40">
                <div className="flex items-center">
                      Price Point
                      <ArrowUpDown className="h-3 w-3 ml-1 text-primary-400" />
                </div>
              </TableHead>
                  <TableHead className="w-48">Strengths</TableHead>
                  <TableHead className="w-48">Weaknesses</TableHead>
                  <TableHead className="w-28">Market Share</TableHead>
                  {!readOnly && <TableHead className="text-right pr-5 w-24">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
                {competitors.map(competitor => (
                <TableRow 
                  key={competitor.id}
                    className={`hover:bg-slate-50 cursor-pointer ${
                      competitor.status === 'new' ? 'bg-green-50/30' :
                      competitor.status === 'modified' ? 'bg-yellow-50/30' :
                      competitor.status === 'removed' ? 'bg-red-50/30' :
                    ''
                  }`}
                    onClick={() => handleViewCompetitor(competitor.id)}
                  >
                    <TableCell className="pl-5 align-top">
                      <div className="font-medium text-primary-800">{competitor.name || 'Unnamed'}</div>
                      {competitor.website && (
                        <a 
                          href={competitor.website.startsWith('http') ? competitor.website : `https://${competitor.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary-600 hover:text-primary-800 flex items-center mt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {competitor.website.replace(/^https?:\/\//, '')}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </TableCell>
                    
                    <TableCell className="align-top">
                      <Badge variant={hasPricingAdvantage(competitor.price) ? 'success' : 'outline'} className="capitalize">
                        {competitor.price || 'Unknown'}
                      </Badge>
                  </TableCell>
                    
                    <TableCell className="align-top">
                        <div className="flex flex-wrap gap-1">
                        {competitor.strengths && competitor.strengths.length > 0 ? 
                          competitor.strengths.map((strength, index) => (
                            <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {strength}
                            </Badge>
                          )) : 
                          <span className="text-xs text-dark-400 italic">None specified</span>
                        }
                        </div>
                  </TableCell>
                    
                    <TableCell className="align-top">
                        <div className="flex flex-wrap gap-1">
                        {competitor.weaknesses && competitor.weaknesses.length > 0 ? 
                          competitor.weaknesses.map((weakness, index) => (
                            <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              {weakness}
                            </Badge>
                          )) : 
                          <span className="text-xs text-dark-400 italic">None specified</span>
                        }
                      </div>
                    </TableCell>
                    
                    <TableCell className="align-top">
                      {competitor.market_share || 'Unknown'}
                  </TableCell>
                    
                  {!readOnly && (
                      <TableCell className="text-right pr-5 align-top">
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 py-0 px-1.5 hover:bg-primary-50 text-primary-700 justify-start"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCompetitor(competitor.id);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            <span className="text-xs">Edit</span>
                          </Button>

                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                
                {competitors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={!readOnly ? 6 : 5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 py-4">
                        <p className="text-dark-500">No competitors added yet</p>
                        {!readOnly && onAdd && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleAddCompetitor}
                          >
                            <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                            Add Your First Competitor
                          </Button>
                        )}
                      </div>
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
        </CardContent>
      </Card>
      
      {/* Dialog for viewing or editing a competitor */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'view' ? 'Competitor Details' : 
               dialogMode === 'edit' ? 'Edit Competitor' : 
               'Add New Competitor'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedCompetitor && (
            <>
              {dialogMode === 'view' && (
                <div className="pt-4">
                  <CompetitorCard 
                    competitor={selectedCompetitor}
                    onEdit={() => setDialogMode('edit')}
                    onDelete={onDelete}
                    readOnly={readOnly}
                  />
      </div>
              )}
              
              {(dialogMode === 'edit' || dialogMode === 'add') && (
                <EnhancedCompetitorCard 
                  competitor={selectedCompetitor}
                  onSave={handleSaveCompetitor}
                  onCancel={handleDialogClose}
                  onDelete={dialogMode === 'edit' ? onDelete : undefined}
                  isNew={dialogMode === 'add'}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}