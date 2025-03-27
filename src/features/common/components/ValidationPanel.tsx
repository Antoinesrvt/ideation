import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Check, 
  X, 
  HelpCircle, 
  AlertTriangle,
  Users,
  Puzzle,
  Building2,
  Globe,
  Lightbulb,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export type HypothesisStatus = 'unverified' | 'validated' | 'invalidated' | 'partially';
export type HypothesisCategory = 'customer' | 'problem' | 'market' | 'competition' | 'solution';

export interface HypothesisItem {
  id: string;
  statement: string;
  category: HypothesisCategory;
  status: HypothesisStatus;
  evidence: string;
  createdAt: string;
  updatedAt: string;
  section: string;
}

export interface SectionInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

export interface ValidationPanelProps {
  currentSection: string;
  projectId: string;
  hypotheses: HypothesisItem[];
  sectionInfo: SectionInfo;
  className?: string;
  suggestionsBySection?: Record<string, string[]>;
  onAddHypothesis?: (hypothesis: Omit<HypothesisItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onUpdateHypothesis?: (id: string, updates: Partial<HypothesisItem>) => Promise<void>;
  onDeleteHypothesis?: (id: string) => Promise<void>;
}

export function ValidationPanel({
  currentSection,
  projectId,
  hypotheses,
  sectionInfo,
  className,
  suggestionsBySection = {},
  onAddHypothesis,
  onUpdateHypothesis,
  onDeleteHypothesis
}: ValidationPanelProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingHypothesis, setEditingHypothesis] = useState<HypothesisItem | null>(null);
  const [newHypothesis, setNewHypothesis] = useState({
    statement: '',
    category: 'problem' as HypothesisCategory,
    evidence: '',
    status: 'unverified' as HypothesisStatus,
    section: currentSection
  });
  
  // Filter hypotheses for the current section
  const filteredHypotheses = React.useMemo(() => {
    return hypotheses.filter(h => h.section === currentSection);
  }, [hypotheses, currentSection]);
  
  // Get suggestions for the current section
  const suggestions = suggestionsBySection[currentSection] || [];
  
  // Handle adding a new hypothesis
  const handleAddHypothesis = async () => {
    if (!newHypothesis.statement.trim()) return;
    
    try {
      await onAddHypothesis?.({
        statement: newHypothesis.statement,
        category: newHypothesis.category,
        evidence: newHypothesis.evidence,
        status: newHypothesis.status,
        section: currentSection
      });
      
      // Reset form and close dialog
      setNewHypothesis({
        statement: '',
        category: 'problem',
        evidence: '',
        status: 'unverified',
        section: currentSection
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add hypothesis:', error);
    }
  };
  
  // Handle updating a hypothesis
  const handleUpdateHypothesis = async () => {
    if (!editingHypothesis) return;
    
    try {
      await onUpdateHypothesis?.(editingHypothesis.id, editingHypothesis);
      setEditingHypothesis(null);
    } catch (error) {
      console.error('Failed to update hypothesis:', error);
    }
  };
  
  // Handle deleting a hypothesis
  const handleDeleteHypothesis = async (id: string) => {
    try {
      await onDeleteHypothesis?.(id);
    } catch (error) {
      console.error('Failed to delete hypothesis:', error);
    }
  };
  
  // Handle updating the status of a hypothesis
  const handleUpdateStatus = async (id: string, status: HypothesisStatus) => {
    try {
      await onUpdateHypothesis?.(id, { status });
    } catch (error) {
      console.error('Failed to update hypothesis status:', error);
    }
  };
  
  // Handle clicking a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setNewHypothesis({
      ...newHypothesis,
      statement: suggestion
    });
    setIsAddDialogOpen(true);
  };
  
  // Get icon for hypothesis category
  const getCategoryIcon = (category: HypothesisCategory) => {
    switch (category) {
      case 'customer':
        return <Users className="h-4 w-4" />;
      case 'problem':
        return <Puzzle className="h-4 w-4" />;
      case 'market':
        return <Globe className="h-4 w-4" />;
      case 'competition':
        return <Building2 className="h-4 w-4" />;
      case 'solution':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  // Get badge for hypothesis status
  const getStatusBadge = (status: HypothesisStatus) => {
    switch (status) {
      case 'validated':
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
            <Check className="h-3 w-3 mr-1" /> Validated
          </Badge>
        );
      case 'invalidated':
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
            <X className="h-3 w-3 mr-1" /> Invalidated
          </Badge>
        );
      case 'partially':
        return (
          <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
            <AlertTriangle className="h-3 w-3 mr-1" /> Partially Validated
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
            <HelpCircle className="h-3 w-3 mr-1" /> Unverified
          </Badge>
        );
    }
  };
  
  return (
    <div className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Validation Hypotheses</CardTitle>
          <Badge variant="outline" className="ml-2 flex items-center gap-1.5">
            <span className={sectionInfo.color}>{sectionInfo.icon}</span>
            <span>{sectionInfo.name}</span>
          </Badge>
        </div>
        <CardDescription>
          Track and validate your key hypotheses
        </CardDescription>
      </CardHeader>
      
      <div className="px-4 mb-2">
        <Button 
          size="sm" 
          className="w-full"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Hypothesis
        </Button>
      </div>
      
      {/* Suggested hypotheses */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 bg-muted/30 border-t border-b">
          <p className="text-xs text-muted-foreground mb-2 flex items-center">
            <Lightbulb className="h-3 w-3 mr-1" /> 
            Suggested hypotheses to test:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary/5 text-xs"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                + {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-3 p-4">
            {filteredHypotheses.length > 0 ? (
              filteredHypotheses.map((hypothesis) => (
                <motion.div
                  key={hypothesis.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 rounded-full p-1.5">
                            {getCategoryIcon(hypothesis.category)}
                          </div>
                          <Badge variant="outline">
                            {hypothesis.category}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => setEditingHypothesis(hypothesis)}
                            title="Edit hypothesis"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive" 
                            onClick={() => handleDeleteHypothesis(hypothesis.id)}
                            title="Delete hypothesis"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm">{hypothesis.statement}</p>
                        {hypothesis.evidence && (
                          <div className="mt-2 bg-muted p-2 rounded-md text-xs">
                            <p className="font-medium mb-1 text-muted-foreground">Evidence:</p>
                            <p>{hypothesis.evidence}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="flex-1 min-w-fit">
                          {getStatusBadge(hypothesis.status)}
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "px-2 py-0 h-7",
                              hypothesis.status === 'validated' && "bg-green-50 border-green-200"
                            )}
                            onClick={() => handleUpdateStatus(hypothesis.id, 'validated')}
                          >
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "px-2 py-0 h-7",
                              hypothesis.status === 'invalidated' && "bg-red-50 border-red-200"
                            )}
                            onClick={() => handleUpdateStatus(hypothesis.id, 'invalidated')}
                          >
                            <X className="h-3.5 w-3.5 text-red-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "px-2 py-0 h-7",
                              hypothesis.status === 'partially' && "bg-amber-50 border-amber-200"
                            )}
                            onClick={() => handleUpdateStatus(hypothesis.id, 'partially')}
                          >
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className={cn("rounded-full p-4 mb-4 bg-muted text-muted-foreground")}>
                  {sectionInfo.icon && React.cloneElement(sectionInfo.icon as React.ReactElement, { className: "h-8 w-8 opacity-40" })}
                </div>
                <p className="text-muted-foreground text-sm">No hypotheses yet</p>
                <p className="text-muted-foreground text-xs mt-2 max-w-xs">
                  Add hypotheses to track and validate your assumptions for {sectionInfo.name}.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add First Hypothesis
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      {/* Add Hypothesis Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Hypothesis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hypothesis Statement</label>
              <Textarea 
                placeholder="Your hypothesis..."
                value={newHypothesis.statement}
                onChange={(e) => setNewHypothesis({ ...newHypothesis, statement: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={newHypothesis.category} 
                onValueChange={(value) => setNewHypothesis({ ...newHypothesis, category: value as HypothesisCategory })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="problem">Problem</SelectItem>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="competition">Competition</SelectItem>
                  <SelectItem value="solution">Solution</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Evidence (Optional)</label>
              <Textarea 
                placeholder="Any evidence or notes..."
                value={newHypothesis.evidence}
                onChange={(e) => setNewHypothesis({ ...newHypothesis, evidence: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddHypothesis}
              disabled={!newHypothesis.statement.trim()}
            >
              Add Hypothesis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Hypothesis Dialog */}
      <Dialog open={!!editingHypothesis} onOpenChange={(open) => !open && setEditingHypothesis(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hypothesis</DialogTitle>
          </DialogHeader>
          {editingHypothesis && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hypothesis Statement</label>
                <Textarea 
                  placeholder="Your hypothesis..."
                  value={editingHypothesis.statement}
                  onChange={(e) => setEditingHypothesis({ ...editingHypothesis, statement: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select 
                  value={editingHypothesis.category} 
                  onValueChange={(value) => setEditingHypothesis({ ...editingHypothesis, category: value as HypothesisCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="problem">Problem</SelectItem>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="solution">Solution</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Evidence</label>
                <Textarea 
                  placeholder="Any evidence or notes..."
                  value={editingHypothesis.evidence}
                  onChange={(e) => setEditingHypothesis({ ...editingHypothesis, evidence: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={editingHypothesis.status} 
                  onValueChange={(value) => setEditingHypothesis({ ...editingHypothesis, status: value as HypothesisStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="validated">Validated</SelectItem>
                    <SelectItem value="invalidated">Invalidated</SelectItem>
                    <SelectItem value="partially">Partially Validated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingHypothesis(null)}>Cancel</Button>
            <Button 
              onClick={handleUpdateHypothesis}
              disabled={!editingHypothesis?.statement.trim()}
            >
              Update Hypothesis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 