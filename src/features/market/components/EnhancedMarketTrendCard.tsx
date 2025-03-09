import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Edit, Trash, Info, Save, X, AlertTriangle, Zap, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MarketTrendCardProps } from '../types';

interface EnhancedMarketTrendCardProps extends MarketTrendCardProps {
  // Additional props specific to the enhanced version
}

export function EnhancedMarketTrendCard({ 
  trend,
  onEdit,
  onUpdate,
  onDelete,
  readOnly = false
}: EnhancedMarketTrendCardProps) {
  // State for handling edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: trend.name || '',
    description: trend.description || '',
    trend_type: trend.trend_type || 'neutral',
    direction: trend.direction || 'stable',
    sources: trend.sources || [] as string[],
    tags: trend.tags || [] as string[]
  });
  
  // New source input
  const [newSource, setNewSource] = useState('');
  
  // New tag input
  const [newTag, setNewTag] = useState('');
  
  // Helper functions from original component
  const getDirectionIcon = (direction: 'upward' | 'downward' | 'stable') => {
    switch (direction) {
      case 'upward':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'downward':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };
  
  const getDirectionText = (direction: 'upward' | 'downward' | 'stable') => {
    switch (direction) {
      case 'upward':
        return 'Upward';
      case 'downward':
        return 'Downward';
      default:
        return 'Stable';
    }
  };
  
  const getTypeVariant = (type: 'opportunity' | 'threat' | 'neutral') => {
    switch (type) {
      case 'opportunity':
        return 'success';
      case 'threat':
        return 'destructive';
      default:
        return 'secondary';
    }
  };
  
  const getTypeIcon = (type: 'opportunity' | 'threat' | 'neutral') => {
    switch (type) {
      case 'opportunity':
        return <Zap className="h-4 w-4 text-green-600 mr-1" />;
      case 'threat':
        return <AlertTriangle className="h-4 w-4 text-red-600 mr-1" />;
      default:
        return <Info className="h-4 w-4 text-gray-600 mr-1" />;
    }
  };
  
  const getTrendImpact = (type: 'opportunity' | 'threat' | 'neutral', direction: 'upward' | 'downward' | 'stable') => {
    if (type === 'opportunity' && direction === 'upward') return 'Positive';
    if (type === 'threat' && direction === 'downward') return 'Negative';
    if (direction === 'stable') return 'Neutral';
    return 'Mixed';
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
  
  // Handle adding a new source
  const addSource = () => {
    if (newSource.trim()) {
      setFormData(prev => ({
        ...prev,
        sources: [...prev.sources, newSource.trim()]
      }));
      setNewSource('');
    }
  };
  
  // Handle adding a new tag
  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  // Handle removing a source
  const removeSource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
  };
  
  // Handle removing a tag
  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };
  
  // Handle save
  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        id: trend.id,
        data: {
          name: formData.name,
          description: formData.description,
          trend_type: formData.trend_type,
          direction: formData.direction,
          sources: formData.sources,
          tags: formData.tags
        }
      });
    }
    setIsEditing(false);
  };
  
  // Handle cancel
  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: trend.name || '',
      description: trend.description || '',
      trend_type: trend.trend_type || 'neutral',
      direction: trend.direction || 'stable',
      sources: trend.sources || [],
      tags: trend.tags || []
    });
    setIsEditing(false);
  };
  
  // View mode content
  const viewContent = (
    <CardContent className="p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 shadow-sm">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <h3 className="font-heading font-medium text-primary-800">
              {trend.name || 'Unnamed Trend'}
            </h3>
            {trend.sources && trend.sources.length > 0 && (
              <p className="text-xs text-dark-500">Sources: {trend.sources.join(', ')}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={getTypeVariant(trend.trend_type as 'opportunity' | 'threat' | 'neutral' || 'neutral')}
            className="capitalize flex items-center"
          >
            {getTypeIcon(trend.trend_type as 'opportunity' | 'threat' | 'neutral' || 'neutral')}
            <span>{trend.trend_type || 'Neutral'}</span>
          </Badge>
          <Badge 
            variant="outline"
            className="bg-primary-50 text-primary-700 border-primary-200 flex items-center"
          >
            {getDirectionIcon(trend.direction as 'upward' | 'downward' | 'stable' || 'stable')}
            <span className="ml-1">{getDirectionText(trend.direction as 'upward' | 'downward' | 'stable' || 'stable')}</span>
          </Badge>
        </div>
      </div>
      
      <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-gray-100 mb-4 text-sm text-dark-600">
        {trend.description || 'No description provided'}
      </div>
      
      {trend.tags && trend.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {trend.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="bg-accent-50 text-accent-700 border-accent-200">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <Badge 
            variant="outline"
            className={`
              ${getTrendImpact(
                trend.trend_type as 'opportunity' | 'threat' | 'neutral' || 'neutral', 
                trend.direction as 'upward' | 'downward' | 'stable' || 'stable'
              ) === 'Positive' ? 'bg-green-50 text-green-700 border-green-200' : ''}
              ${getTrendImpact(
                trend.trend_type as 'opportunity' | 'threat' | 'neutral' || 'neutral', 
                trend.direction as 'upward' | 'downward' | 'stable' || 'stable'
              ) === 'Negative' ? 'bg-red-50 text-red-700 border-red-200' : ''}
              ${getTrendImpact(
                trend.trend_type as 'opportunity' | 'threat' | 'neutral' || 'neutral', 
                trend.direction as 'upward' | 'downward' | 'stable' || 'stable'
              ) === 'Neutral' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
              ${getTrendImpact(
                trend.trend_type as 'opportunity' | 'threat' | 'neutral' || 'neutral', 
                trend.direction as 'upward' | 'downward' | 'stable' || 'stable'
              ) === 'Mixed' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
            `}
          >
            {getTrendImpact(
              trend.trend_type as 'opportunity' | 'threat' | 'neutral' || 'neutral', 
              trend.direction as 'upward' | 'downward' | 'stable' || 'stable'
            )} Impact
          </Badge>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        {!readOnly && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary-700 hover:bg-primary-50"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Edit Trend
          </Button>
        )}
      </div>
    </CardContent>
  );
  
  // Edit mode content
  const editContent = (
    <CardContent className="p-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-700">Trend Name</label>
          <Input 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Trend Name"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-700">Type</label>
            <Select 
              value={formData.trend_type} 
              onValueChange={(value) => handleSelectChange('trend_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opportunity">Opportunity</SelectItem>
                <SelectItem value="threat">Threat</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-700">Direction</label>
            <Select 
              value={formData.direction} 
              onValueChange={(value) => handleSelectChange('direction', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upward">Upward</SelectItem>
                <SelectItem value="downward">Downward</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-dark-700">Description</label>
          <Textarea 
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe this market trend..."
            className="min-h-[100px]"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-700">Sources</label>
            <div className="flex flex-wrap gap-1 mb-2 min-h-[40px] bg-white rounded-md border border-slate-200 p-1.5">
              {formData.sources.map((source, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-primary-50 text-primary-700 border-primary-200 flex items-center gap-1"
                >
                  {source}
                  <button 
                    onClick={() => removeSource(index)}
                    className="ml-1 rounded-full hover:bg-primary-200/50 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="Add source..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSource();
                  }
                }}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={addSource}
                disabled={!newSource.trim()}
                type="button"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-700">Tags</label>
            <div className="flex flex-wrap gap-1 mb-2 min-h-[40px] bg-white rounded-md border border-slate-200 p-1.5">
              {formData.tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-accent-50 text-accent-700 border-accent-200 flex items-center gap-1"
                >
                  {tag}
                  <button 
                    onClick={() => removeTag(index)}
                    className="ml-1 rounded-full hover:bg-accent-200/50 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={addTag}
                disabled={!newTag.trim()}
                type="button"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 p-3 bg-primary-50/50 rounded-lg border border-primary-100">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-primary-700 mr-2" />
            <h4 className="text-sm font-medium text-primary-800">Trend Analysis</h4>
          </div>
          <p className="text-xs text-primary-700">
            Impact: <Badge variant="outline" className="ml-1 text-xs">
              {getTrendImpact(
                formData.trend_type as 'opportunity' | 'threat' | 'neutral',
                formData.direction as 'upward' | 'downward' | 'stable'
              )}
            </Badge>
          </p>
          <p className="text-xs text-primary-600">
            {formData.trend_type === 'opportunity' ? 'Look for ways to leverage this trend in your product strategy.' :
             formData.trend_type === 'threat' ? 'Consider how to mitigate risks associated with this trend.' :
             'Monitor this trend for potential changes in direction or impact.'}
          </p>
        </div>
      </div>
      
      <div className="flex justify-between gap-3 mt-6 pt-3 border-t border-gray-100">
        {onDelete && (
          <Button 
            variant="ghost" 
            size="sm"
            className="text-accent-700 hover:bg-accent-50"
            onClick={() => onDelete(trend.id)}
          >
            <Trash className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
        )}
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="text-dark-700"
          >
            Cancel
          </Button>
          <Button 
            variant="default" 
            onClick={handleSave}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </CardContent>
  );
  
  return (
    <EnhancedCard
      viewContent={viewContent}
      editContent={editContent}
      isEditing={isEditing}
      variant={
        trend.status === 'new' ? 'gradient' :
        trend.status === 'modified' ? 'elevated' :
        trend.status === 'removed' ? 'outline' :
        'default'
      } 
      className={`transition-all ${
        trend.status === 'new' ? 'border-green-300 from-green-50 to-white' :
        trend.status === 'modified' ? 'border-yellow-300 shadow-yellow-100/50' :
        trend.status === 'removed' ? 'border-red-300 text-red-800' :
        'hover:border-primary-300'
      }`}
    />
  );
} 