import React, { useState } from 'react';
import { PlusCircle, Info, Edit, ArrowUpDown, ExternalLink, Trash, Save, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompetitorTableProps } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedCompetitorTableProps extends CompetitorTableProps {
  // Additional props specific to the enhanced version
}

export function EnhancedCompetitorTable({ 
  competitors,
  onAdd,
  onEdit,
  onUpdate,
  onDelete,
  readOnly = false
}: EnhancedCompetitorTableProps) {
  // Track which competitor is being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Track submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state for the currently edited competitor
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    price: '',
    market_share: '',
    notes: '',
    strengths: [] as string[],
    weaknesses: [] as string[]
  });
  
  // Track new array item inputs
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  
  // Helper function from original component
  const hasPricingAdvantage = (price: string | null) => {
    if (!price) return false;
    if (price.toLowerCase().includes('free')) return true;
    if (price.toLowerCase().includes('low')) return true;
    return false;
  };
  
  // Start editing a competitor
  const startEditing = (competitorId: string) => {
    const competitor = competitors.find(c => c.id === competitorId);
    if (competitor) {
      setFormData({
        name: competitor.name || '',
        website: competitor.website || '',
        price: competitor.price || '',
        market_share: competitor.market_share || '',
        notes: competitor.notes || '',
        strengths: competitor.strengths || [],
        weaknesses: competitor.weaknesses || []
      });
      setEditingId(competitorId);
    }
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle adding a new strength
  const addStrength = () => {
    if (newStrength.trim()) {
      setFormData(prev => ({
        ...prev,
        strengths: [...prev.strengths, newStrength.trim()]
      }));
      setNewStrength('');
    }
  };
  
  // Handle adding a new weakness
  const addWeakness = () => {
    if (newWeakness.trim()) {
      setFormData(prev => ({
        ...prev,
        weaknesses: [...prev.weaknesses, newWeakness.trim()]
      }));
      setNewWeakness('');
    }
  };
  
  // Handle removing a strength
  const removeStrength = (index: number) => {
    setFormData(prev => ({
      ...prev,
      strengths: prev.strengths.filter((_, i) => i !== index)
    }));
  };
  
  // Handle removing a weakness
  const removeWeakness = (index: number) => {
    setFormData(prev => ({
      ...prev,
      weaknesses: prev.weaknesses.filter((_, i) => i !== index)
    }));
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setFormData({
      name: '',
      website: '',
      price: '',
      market_share: '',
      notes: '',
      strengths: [],
      weaknesses: []
    });
  };
  
  // Save changes
  const saveChanges = async () => {
    if (editingId && onUpdate) {
      setIsSubmitting(true);
      try {
        await onUpdate({
          id: editingId,
          data: {
            name: formData.name,
            website: formData.website,
            price: formData.price,
            market_share: formData.market_share,
            notes: formData.notes,
            strengths: formData.strengths,
            weaknesses: formData.weaknesses
          }
        });
        cancelEditing();
      } catch (error) {
        console.error("Failed to update competitor:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Handle delete with loading state
  const handleDelete = async (id: string) => {
    if (onDelete) {
      setIsSubmitting(true);
      try {
        await onDelete(id);
      } catch (error) {
        console.error("Failed to delete competitor:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Edit mode delete button handler
  const handleDeleteWithSubmitting = async (id: string) => {
    if (onDelete) {
      setIsSubmitting(true);
      try {
        await onDelete(id);
        // If we were editing this competitor, cancel editing
        if (editingId === id) {
          cancelEditing();
        }
      } catch (error) {
        console.error("Failed to delete competitor:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Animations for the editable row
  const rowVariants = {
    initial: { opacity: 0.6, height: 0, overflow: 'hidden' },
    animate: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3 } 
    },
    exit: { 
      opacity: 0.6, 
      height: 0,
      transition: { duration: 0.2 } 
    }
  };
  
  return (
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
            onClick={onAdd}
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
            <TableBody className="relative">
              {competitors.map(competitor => (
                <React.Fragment key={competitor.id}>
                  {/* Regular row (visible when not editing) */}
                  {editingId !== competitor.id && (
                    <TableRow className={`hover:bg-slate-50 ${
                      competitor.status === 'new' ? 'bg-green-50/30' :
                      competitor.status === 'modified' ? 'bg-yellow-50/30' :
                      competitor.status === 'removed' ? 'bg-red-50/30' :
                      ''
                    }`}>
                      <TableCell className="pl-5 align-top">
                        <div className="font-medium text-primary-800">{competitor.name || 'Unnamed'}</div>
                        {competitor.website && (
                          <a 
                            href={competitor.website.startsWith('http') ? competitor.website : `https://${competitor.website}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary-600 hover:text-primary-800 flex items-center mt-1"
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
                      
                      {!editingId ? (
                        // View Mode
                        <TableCell>
                          <div className="flex space-x-1">
                            {!readOnly && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-6 py-0 px-1.5 hover:bg-primary-50 text-primary-700 justify-start"
                                onClick={() => startEditing(competitor.id)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                <span className="text-xs">Edit</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      ) : (
                        // Edit Mode (When editing this competitor row)
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 py-0 px-1.5 hover:bg-gray-100 text-gray-700 justify-start"
                              onClick={cancelEditing}
                              disabled={isSubmitting}
                            >
                              <X className="h-3 w-3 mr-1" />
                              <span className="text-xs">Cancel</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-6 py-0 px-1.5 hover:bg-primary-50 text-primary-700 justify-start"
                              onClick={saveChanges}
                              disabled={isSubmitting}
                            >
                              <Save className="h-3 w-3 mr-1" />
                              <span className="text-xs">Save</span>
                            </Button>
                            {onDelete && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-6 py-0 px-1.5 hover:bg-accent-50 text-accent-700 justify-start"
                                onClick={() => handleDeleteWithSubmitting(competitor.id)}
                                disabled={isSubmitting}
                              >
                                <Trash className="h-3 w-3 mr-1" />
                                <span className="text-xs">Delete</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                  
                  {/* Edit row - shown when editing this competitor */}
                  <AnimatePresence>
                    {editingId === competitor.id && (
                      <motion.tr
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={rowVariants}
                        className="bg-primary-50/30 border-b border-t border-primary-100"
                      >
                        <td colSpan={!readOnly ? 6 : 5} className="py-4 px-5">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-dark-700">Competitor Name</label>
                                <Input 
                                  name="name"
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  placeholder="Competitor Name"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-dark-700">Website</label>
                                <Input 
                                  name="website"
                                  value={formData.website}
                                  onChange={handleInputChange}
                                  placeholder="Website URL"
                                  type="url"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-dark-700">Price Point</label>
                                <Select 
                                  value={formData.price} 
                                  onValueChange={(value) => handleSelectChange('price', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select price point" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Free">Free</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-dark-700">Market Share</label>
                                <Input 
                                  name="market_share"
                                  value={formData.market_share}
                                  onChange={handleInputChange}
                                  placeholder="Market share (e.g., 15%)"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-dark-700">Notes</label>
                              <Textarea 
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Additional notes about this competitor..."
                                className="min-h-[80px]"
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-dark-700">Strengths</label>
                                <div className="flex flex-wrap gap-1 mb-2 min-h-[40px] bg-white rounded-md border border-slate-200 p-1.5">
                                  {formData.strengths.map((strength, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="outline" 
                                      className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                                    >
                                      {strength}
                                      <button 
                                        onClick={() => removeStrength(index)}
                                        className="ml-1 rounded-full hover:bg-green-200/50 p-0.5"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <Input 
                                    value={newStrength}
                                    onChange={(e) => setNewStrength(e.target.value)}
                                    placeholder="Add strength..."
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addStrength();
                                      }
                                    }}
                                  />
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={addStrength}
                                    disabled={!newStrength.trim()}
                                    type="button"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-dark-700">Weaknesses</label>
                                <div className="flex flex-wrap gap-1 mb-2 min-h-[40px] bg-white rounded-md border border-slate-200 p-1.5">
                                  {formData.weaknesses.map((weakness, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="outline" 
                                      className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1"
                                    >
                                      {weakness}
                                      <button 
                                        onClick={() => removeWeakness(index)}
                                        className="ml-1 rounded-full hover:bg-red-200/50 p-0.5"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <Input 
                                    value={newWeakness}
                                    onChange={(e) => setNewWeakness(e.target.value)}
                                    placeholder="Add weakness..."
                                    className="flex-1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addWeakness();
                                      }
                                    }}
                                  />
                                  <Button 
                                    variant="outline" 
                                    size="icon"
                                    onClick={addWeakness}
                                    disabled={!newWeakness.trim()}
                                    type="button"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-3">
                              <Button 
                                variant="outline" 
                                onClick={cancelEditing}
                                className="text-dark-700"
                                type="button"
                              >
                                Cancel
                              </Button>
                              <Button 
                                variant="default" 
                                onClick={saveChanges}
                                className="bg-primary-600 hover:bg-primary-700"
                                type="button"
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
              
              {competitors.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <p className="text-dark-500">No competitors added yet</p>
                      {!readOnly && onAdd && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={onAdd}
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
  );
} 