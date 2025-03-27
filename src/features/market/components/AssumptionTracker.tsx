import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  PlusCircle, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileQuestion,
  Pencil 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export type AssumptionStatus = 'unverified' | 'validated' | 'invalidated';

export interface MarketAssumption {
  id: string;
  text: string;
  status: AssumptionStatus;
  createdAt: Date;
  updatedAt?: Date;
  validationMethod?: string;
}

interface AssumptionTrackerProps {
  assumptions: MarketAssumption[];
  onAddAssumption?: (assumption: Omit<MarketAssumption, 'id' | 'createdAt'>) => void;
  onUpdateAssumption?: (id: string, updates: Partial<MarketAssumption>) => void;
  onDeleteAssumption?: (id: string) => void;
  readOnly?: boolean;
  maxHeight?: string;
  className?: string;
}

export function AssumptionTracker({
  assumptions,
  onAddAssumption,
  onUpdateAssumption,
  onDeleteAssumption,
  readOnly = false,
  maxHeight,
  className = ''
}: AssumptionTrackerProps) {
  const [newAssumption, setNewAssumption] = useState('');
  const [editingAssumption, setEditingAssumption] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  // Handle adding a new assumption
  const handleAddAssumption = () => {
    if (!newAssumption.trim() || !onAddAssumption) return;
    
    onAddAssumption({
      text: newAssumption.trim(),
      status: 'unverified',
    });
    
    setNewAssumption('');
  };
  
  // Handle updating an assumption status
  const handleStatusChange = (id: string, status: AssumptionStatus) => {
    if (!onUpdateAssumption) return;
    onUpdateAssumption(id, { status });
  };
  
  // Handle editing an assumption
  const startEditing = (assumption: MarketAssumption) => {
    setEditingAssumption(assumption.id);
    setEditText(assumption.text);
  };
  
  // Save edited assumption
  const saveEdit = () => {
    if (!editingAssumption || !onUpdateAssumption) return;
    
    onUpdateAssumption(editingAssumption, { text: editText.trim() });
    setEditingAssumption(null);
    setEditText('');
  };
  
  // Cancel editing
  const cancelEdit = () => {
    setEditingAssumption(null);
    setEditText('');
  };
  
  // Handle pressing Enter in edit input
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: AssumptionStatus) => {
    switch (status) {
      case 'validated':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Validated
          </Badge>
        );
      case 'invalidated':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <X className="h-3 w-3 mr-1" />
            Invalidated
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <FileQuestion className="h-3 w-3 mr-1" />
            Unverified
          </Badge>
        );
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -10 }
  };
  
  return (
    <div className={`space-y-3 ${className}`}>
      {!readOnly && (
        <div className="flex space-x-2">
          <Input 
            placeholder="Add a market assumption to validate..." 
            value={newAssumption}
            onChange={(e) => setNewAssumption(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddAssumption()}
            className="text-sm"
          />
          <Button size="sm" onClick={handleAddAssumption} disabled={!newAssumption.trim()}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      )}
      
      <div 
        className={`space-y-2 overflow-y-auto`}
        style={{ maxHeight: maxHeight || 'auto' }}
      >
        {assumptions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <FileQuestion className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No assumptions added yet</p>
            {!readOnly && (
              <p className="text-xs mt-1">
                Add assumptions about your market that need validation
              </p>
            )}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            <AnimatePresence>
              {assumptions.map((assumption) => (
                <motion.div
                  key={assumption.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`p-2 rounded-md border ${
                    assumption.status === 'validated' ? 'bg-green-50 border-green-200' :
                    assumption.status === 'invalidated' ? 'bg-red-50 border-red-200' :
                    'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      {editingAssumption === assumption.id ? (
                        <div className="flex space-x-2">
                          <Input 
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="text-sm"
                            autoFocus
                          />
                          <Button size="sm" onClick={saveEdit} variant="ghost">Save</Button>
                          <Button size="sm" onClick={cancelEdit} variant="ghost">Cancel</Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm">{assumption.text}</p>
                          <div className="flex flex-wrap gap-2">
                            {getStatusBadge(assumption.status)}
                            {assumption.validationMethod && (
                              <Badge variant="secondary" className="text-xs">
                                {assumption.validationMethod}
                              </Badge>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                    
                    {!readOnly && editingAssumption !== assumption.id && (
                      <div className="flex space-x-1 ml-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={() => startEditing(assumption)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-red-500 hover:text-red-700" 
                          onClick={() => onDeleteAssumption && onDeleteAssumption(assumption.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {!readOnly && editingAssumption !== assumption.id && (
                    <div className="flex space-x-1 mt-2">
                      <Button 
                        variant={assumption.status === 'validated' ? 'default' : 'outline'} 
                        size="sm" 
                        className="text-xs h-6 px-2"
                        onClick={() => handleStatusChange(assumption.id, 'validated')}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Validated
                      </Button>
                      <Button 
                        variant={assumption.status === 'invalidated' ? 'default' : 'outline'} 
                        size="sm" 
                        className="text-xs h-6 px-2"
                        onClick={() => handleStatusChange(assumption.id, 'invalidated')}
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Invalidated
                      </Button>
                      <Button 
                        variant={assumption.status === 'unverified' ? 'default' : 'outline'} 
                        size="sm" 
                        className="text-xs h-6 px-2"
                        onClick={() => handleStatusChange(assumption.id, 'unverified')}
                      >
                        <FileQuestion className="h-3 w-3 mr-1" />
                        Unverified
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
} 