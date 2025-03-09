import React, { useState } from 'react';
import { Save, X, Check, ExternalLink, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExtendedMarketCompetitor } from '../types';

export interface EnhancedCompetitorCardProps {
  competitor: ExtendedMarketCompetitor;
  onSave: (params: { id: string; data: Partial<Omit<ExtendedMarketCompetitor, 'id' | 'created_at' | 'updated_at' | 'status'>> }) => void;
  onCancel: () => void;
  isNew?: boolean;
}

export function EnhancedCompetitorCard({ 
  competitor,
  onSave,
  onCancel,
  isNew = false
}: EnhancedCompetitorCardProps) {
  // Form state
  const [formData, setFormData] = useState({
    name: competitor.name || '',
    website: competitor.website || '',
    price: competitor.price || '',
    market_share: competitor.market_share || '',
    notes: competitor.notes || '',
    strengths: competitor.strengths || [] as string[],
    weaknesses: competitor.weaknesses || [] as string[]
  });
  
  // Track new array item inputs
  const [newStrength, setNewStrength] = useState('');
  const [newWeakness, setNewWeakness] = useState('');
  
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
  
  // Handle save
  const handleSave = () => {
    onSave({
      id: competitor.id,
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
  };
  
  return (
    <div className="space-y-6 p-1">
      <div className="space-y-2">
        <label className="text-sm font-medium text-dark-700">Competitor Name *</label>
        <Input 
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Competitor Name"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
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
                  type="button"
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
              <Plus className="h-4 w-4" />
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
                  type="button"
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
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="text-dark-700"
          type="button"
        >
          Cancel
        </Button>
        <Button 
          variant="default" 
          onClick={handleSave}
          className="bg-primary-600 hover:bg-primary-700"
          type="button"
          disabled={!formData.name.trim()}
        >
          <Save className="h-4 w-4 mr-2" />
          {isNew ? 'Create Competitor' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
} 