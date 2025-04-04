import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Edit, Trash, Info, Save, X, AlertTriangle, Zap, Plus, Clock, Target, Tag, Link } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MarketTrendCardProps } from '../types';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

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
    tags: trend.tags || [] as string[],
    // New fields with defaults
    impact_score: trend.impact_score || 5,
    timeframe: trend.timeframe || 'medium',
    confidence: trend.confidence || 3,
    related_segments: trend.related_segments || [] as string[],
    related_personas: trend.related_personas || [] as string[],
    related_trends: trend.related_trends || [] as string[],
    status: trend.status || 'emerging',
    opportunity_size: trend.opportunity_size || 0
  });
  
  // New input states
  const [newSource, setNewSource] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newSegment, setNewSegment] = useState('');
  const [newPersona, setNewPersona] = useState('');
  const [newRelatedTrend, setNewRelatedTrend] = useState('');
  
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

  const getTimeframeVariant = (timeframe: 'short' | 'medium' | 'long') => {
    switch (timeframe) {
      case 'short':
        return 'blue';
      case 'medium':
        return 'purple';
      case 'long':
        return 'orange';
      default:
        return 'secondary';
    }
  };
  
  const getStatusVariant = (status: 'emerging' | 'established' | 'declining') => {
    switch (status) {
      case 'emerging':
        return 'blue';
      case 'established':
        return 'green';
      case 'declining':
        return 'amber';
      default:
        return 'secondary';
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
  
  // Handle number input changes
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
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
  
  // Handle adding a new segment
  const addSegment = () => {
    if (newSegment.trim()) {
      setFormData(prev => ({
        ...prev,
        related_segments: [...prev.related_segments, newSegment.trim()]
      }));
      setNewSegment('');
    }
  };
  
  // Handle adding a new persona
  const addPersona = () => {
    if (newPersona.trim()) {
      setFormData(prev => ({
        ...prev,
        related_personas: [...prev.related_personas, newPersona.trim()]
      }));
      setNewPersona('');
    }
  };
  
  // Handle adding a new related trend
  const addRelatedTrend = () => {
    if (newRelatedTrend.trim()) {
      setFormData(prev => ({
        ...prev,
        related_trends: [...prev.related_trends, newRelatedTrend.trim()]
      }));
      setNewRelatedTrend('');
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
  
  // Handle removing a segment
  const removeSegment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      related_segments: prev.related_segments.filter((_, i) => i !== index)
    }));
  };
  
  // Handle removing a persona
  const removePersona = (index: number) => {
    setFormData(prev => ({
      ...prev,
      related_personas: prev.related_personas.filter((_, i) => i !== index)
    }));
  };
  
  // Handle removing a related trend
  const removeRelatedTrend = (index: number) => {
    setFormData(prev => ({
      ...prev,
      related_trends: prev.related_trends.filter((_, i) => i !== index)
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
          tags: formData.tags,
          // Include new fields
          impact_score: formData.impact_score,
          timeframe: formData.timeframe,
          confidence: formData.confidence,
          related_segments: formData.related_segments,
          related_personas: formData.related_personas,
          related_trends: formData.related_trends,
          status: formData.status,
          opportunity_size: formData.opportunity_size
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
      tags: trend.tags || [],
      // Reset new fields
      impact_score: trend.impact_score || 5,
      timeframe: trend.timeframe || 'medium',
      confidence: trend.confidence || 3,
      related_segments: trend.related_segments || [],
      related_personas: trend.related_personas || [],
      related_trends: trend.related_trends || [],
      status: trend.status || 'emerging',
      opportunity_size: trend.opportunity_size || 0
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
              <p className="text-xs text-dark-500">Sources: {trend.sources.length}</p>
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
      
      {/* Status, Timeframe, and Confidence Top Row */}
      <div className="flex justify-between mb-3">
        {trend.status && (
          <Badge variant="outline" className="bg-slate-50 border-slate-200">
            Status: {trend.status}
          </Badge>
        )}
        
        {trend.timeframe && (
          <Badge variant="outline" className="bg-slate-50 border-slate-200 flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {trend.timeframe === 'short' ? 'Short-term' : 
             trend.timeframe === 'long' ? 'Long-term' : 'Medium-term'}
          </Badge>
        )}
        
        {trend.confidence !== undefined && (
          <Badge variant="outline" className="bg-slate-50 border-slate-200 flex items-center">
            <Target className="mr-1 h-3 w-3" />
            Confidence: {trend.confidence}/5
          </Badge>
        )}
      </div>
      
      {/* Impact Score and Opportunity Size */}
      {((trend.impact_score !== undefined && trend.impact_score !== null) || 
        (trend.opportunity_size !== undefined && trend.opportunity_size !== null && trend.opportunity_size > 0)) && (
        <div className="flex gap-2 mb-3">
          {trend.impact_score !== undefined && trend.impact_score !== null && (
            <div className="flex-1 p-2 bg-slate-50 rounded-md border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Impact Score</div>
              <div className="flex items-center gap-2">
                <Progress value={trend.impact_score * 10} className="h-2" />
                <span className="font-medium">{trend.impact_score}/10</span>
              </div>
            </div>
          )}
          
          {trend.opportunity_size !== undefined && trend.opportunity_size !== null && trend.opportunity_size > 0 && (
            <div className="flex-1 p-2 bg-slate-50 rounded-md border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">Market Opportunity</div>
              <div className="font-medium">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(trend.opportunity_size || 0)}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-gray-100 mb-4 text-sm text-dark-600">
        {trend.description || 'No description provided'}
      </div>
      
      {/* Display related items */}
      {(trend.related_segments && trend.related_segments.length > 0) && (
        <div className="mb-3">
          <div className="text-xs text-slate-500 mb-1 flex items-center">
            <Tag className="h-3 w-3 mr-1" />
            Related Segments
          </div>
          <div className="flex flex-wrap gap-1">
            {trend.related_segments.map((segment, index) => (
              <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {segment}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {(trend.related_personas && trend.related_personas.length > 0) && (
        <div className="mb-3">
          <div className="text-xs text-slate-500 mb-1 flex items-center">
            <Tag className="h-3 w-3 mr-1" />
            Related Personas
          </div>
          <div className="flex flex-wrap gap-1">
            {trend.related_personas.map((persona, index) => (
              <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {persona}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {(trend.related_trends && trend.related_trends.length > 0) && (
        <div className="mb-3">
          <div className="text-xs text-slate-500 mb-1 flex items-center">
            <Link className="h-3 w-3 mr-1" />
            Related Trends
          </div>
          <div className="flex flex-wrap gap-1">
            {trend.related_trends.map((relatedTrend, index) => (
              <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {relatedTrend}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
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
        
        {!readOnly && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => onEdit && onEdit(trend.id)}>
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete && onDelete(trend.id)}>
              <Trash className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  );
  
  // Edit mode content
  const editContent = (
    <CardContent className="p-5">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-dark-700 mb-1">
            Trend Name
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter trend name"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="trend_type" className="block text-sm font-medium text-dark-700 mb-1">
              Trend Type
            </label>
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
          
          <div>
            <label htmlFor="direction" className="block text-sm font-medium text-dark-700 mb-1">
              Direction
            </label>
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
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="timeframe" className="block text-sm font-medium text-dark-700 mb-1">
              Timeframe
            </label>
            <Select
              value={formData.timeframe}
              onValueChange={(value) => handleSelectChange('timeframe', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short-term</SelectItem>
                <SelectItem value="medium">Medium-term</SelectItem>
                <SelectItem value="long">Long-term</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-dark-700 mb-1">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="emerging">Emerging</SelectItem>
                <SelectItem value="established">Established</SelectItem>
                <SelectItem value="declining">Declining</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="impact_score" className="block text-sm font-medium text-dark-700 mb-1">
              Impact Score (1-10)
            </label>
            <Input
              id="impact_score"
              name="impact_score"
              type="number"
              min="1"
              max="10"
              value={formData.impact_score}
              onChange={handleNumberInputChange}
            />
          </div>
          
          <div>
            <label htmlFor="confidence" className="block text-sm font-medium text-dark-700 mb-1">
              Confidence (1-5)
            </label>
            <Input
              id="confidence"
              name="confidence"
              type="number"
              min="1"
              max="5"
              value={formData.confidence}
              onChange={handleNumberInputChange}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="opportunity_size" className="block text-sm font-medium text-dark-700 mb-1">
            Opportunity Size (Market Value)
          </label>
          <Input
            id="opportunity_size"
            name="opportunity_size"
            type="number"
            min="0"
            value={formData.opportunity_size}
            onChange={handleNumberInputChange}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-dark-700 mb-1">
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the trend"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">
            Sources
          </label>
          <div className="flex space-x-2 mb-2">
            <Input
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              placeholder="Add source"
              className="flex-1"
            />
            <Button variant="outline" onClick={addSource} size="sm" type="button">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {formData.sources.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.sources.map((source, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {source}
                  <button 
                    onClick={() => removeSource(index)} 
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">
            Tags
          </label>
          <div className="flex space-x-2 mb-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag"
              className="flex-1"
            />
            <Button variant="outline" onClick={addTag} size="sm" type="button">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button 
                    onClick={() => removeTag(index)} 
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <Separator />
        
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">
            Related Segments
          </label>
          <div className="flex space-x-2 mb-2">
            <Input
              value={newSegment}
              onChange={(e) => setNewSegment(e.target.value)}
              placeholder="Add segment"
              className="flex-1"
            />
            <Button variant="outline" onClick={addSegment} size="sm" type="button">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {formData.related_segments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.related_segments.map((segment, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-700">
                  {segment}
                  <button 
                    onClick={() => removeSegment(index)} 
                    className="ml-1 text-blue-500 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">
            Related Personas
          </label>
          <div className="flex space-x-2 mb-2">
            <Input
              value={newPersona}
              onChange={(e) => setNewPersona(e.target.value)}
              placeholder="Add persona"
              className="flex-1"
            />
            <Button variant="outline" onClick={addPersona} size="sm" type="button">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {formData.related_personas.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.related_personas.map((persona, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-700">
                  {persona}
                  <button 
                    onClick={() => removePersona(index)} 
                    className="ml-1 text-purple-500 hover:text-purple-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-dark-700 mb-1">
            Related Trends
          </label>
          <div className="flex space-x-2 mb-2">
            <Input
              value={newRelatedTrend}
              onChange={(e) => setNewRelatedTrend(e.target.value)}
              placeholder="Add related trend"
              className="flex-1"
            />
            <Button variant="outline" onClick={addRelatedTrend} size="sm" type="button">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          {formData.related_trends.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.related_trends.map((relatedTrend, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-700">
                  {relatedTrend}
                  <button 
                    onClick={() => removeRelatedTrend(index)} 
                    className="ml-1 text-green-500 hover:text-green-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
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
    />
  );
} 