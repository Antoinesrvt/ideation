import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Edit, 
  Trash2, 
  Tag, 
  DollarSign,
  Users,
  ArrowRight,
  Save,
  X,
  Plus,
  Minus,
  Building,
  Target
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { PricingStrategy as BasePricingStrategy } from './EditablePricingRow';
import { formatCurrency } from '../../utils/dataProcessing';
import { parseJsonbField } from '@/lib/utils';
import { formatDistance } from 'date-fns';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';

// Market segments
const MARKET_SEGMENTS = [
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'small-business', label: 'Small Business' },
  { value: 'mid-market', label: 'Mid-market' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'b2b', label: 'B2B' },
  { value: 'b2c', label: 'B2C' },
  { value: 'government', label: 'Government' },
  { value: 'non-profit', label: 'Non-profit' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'other', label: 'Other' }
];

// Strategy types
const STRATEGY_TYPES = [
  { value: 'value-based', label: 'Value-Based' },
  { value: 'competition-based', label: 'Competition-Based' },
  { value: 'cost-plus', label: 'Cost-Plus' },
  { value: 'penetration', label: 'Penetration' },
  { value: 'premium', label: 'Premium' },
  { value: 'skimming', label: 'Skimming' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'bundling', label: 'Bundling' }
];

// Extend the PricingStrategy interface to include strategy_type
export interface ExtendedPricingStrategy extends BasePricingStrategy {
  strategy_type?: string;
  updated_at?: string;
}

// Update the type in the props interface
interface PricingStrategyCardProps {
  strategy: ExtendedPricingStrategy;
  onEdit: (strategy: ExtendedPricingStrategy) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  readOnly?: boolean;
}

export function PricingStrategyCard({ 
  strategy, 
  onEdit, 
  onDelete, 
  readOnly = false 
}: PricingStrategyCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form state based on the strategy prop
  const [formData, setFormData] = useState<ExtendedPricingStrategy>({
    ...strategy,
    target_price_range: typeof strategy.target_price_range === 'string'
      ? JSON.parse(strategy.target_price_range)
      : strategy.target_price_range,
    strategy_type: strategy.strategy_type || 'value-based'
  });

  // Helper function to get the price range object
  const getPriceRange = (priceRange: { min: number; max: number } | string) => {
    if (typeof priceRange === 'string') {
      try {
        return JSON.parse(priceRange);
      } catch (e) {
        return { min: 0, max: 0 };
      }
    }
    return priceRange;
  };
  
  // Format the price range for display
  const formatPriceRange = (priceRange: { min: number; max: number } | string) => {
    const range = getPriceRange(priceRange);
    return `${formatCurrency(range.min)} - ${formatCurrency(range.max)}`;
  };
  
  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
      const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get a gradient color for the card header
  const getGradient = () => {
    // Generate a deterministic color based on the strategy type
    const strategyType = strategy.strategy_type || 'value-based';
    
    // Different colors for different strategy types
    const colors: Record<string, string> = {
      'value-based': 'linear-gradient(135deg, hsl(220, 70%, 95%) 0%, hsl(220, 60%, 85%) 100%)',
      'competition-based': 'linear-gradient(135deg, hsl(260, 70%, 95%) 0%, hsl(260, 60%, 85%) 100%)',
      'cost-plus': 'linear-gradient(135deg, hsl(190, 70%, 95%) 0%, hsl(190, 60%, 85%) 100%)',
      'premium': 'linear-gradient(135deg, hsl(340, 70%, 95%) 0%, hsl(340, 60%, 85%) 100%)',
      'penetration': 'linear-gradient(135deg, hsl(160, 70%, 95%) 0%, hsl(160, 60%, 85%) 100%)',
      'skimming': 'linear-gradient(135deg, hsl(30, 70%, 95%) 0%, hsl(30, 60%, 85%) 100%)',
      'freemium': 'linear-gradient(135deg, hsl(280, 70%, 95%) 0%, hsl(280, 60%, 85%) 100%)',
      'subscription': 'linear-gradient(135deg, hsl(210, 70%, 95%) 0%, hsl(210, 60%, 85%) 100%)',
      'bundling': 'linear-gradient(135deg, hsl(60, 70%, 95%) 0%, hsl(60, 60%, 85%) 100%)'
    };
    
    return colors[strategyType] || 'linear-gradient(135deg, hsl(220, 70%, 95%) 0%, hsl(220, 60%, 85%) 100%)';
  };

  // Get styles for the market segment badge
  const getMarketBadgeStyle = () => {
    // Generate a deterministic color based on the target market
    const hash = strategy.target_market.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    const hue = (hash % 280) + 40; // Avoid pure red/green for better contrast with text
    
    return {
      background: `hsl(${hue}, 85%, 97%)`,
      color: `hsl(${hue}, 75%, 35%)`,
      border: `1px solid hsl(${hue}, 70%, 90%)`,
      padding: '0.25rem 0.5rem',
      borderRadius: '0.375rem',
      fontSize: '0.75rem',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      marginTop: '0.25rem'
    };
  };

  // Get badge for strategy type
  const getStrategyTypeBadge = () => {
    const strategyType = strategy.strategy_type || 'value-based';
    const strategyLabel = STRATEGY_TYPES.find(st => st.value === strategyType)?.label || 'Value-Based';
    
    return (
      <Badge className="bg-blue-100 text-blue-800 border-0">
        <Target className="h-3 w-3 mr-1" />
        {strategyLabel}
      </Badge>
    );
  };

  // Format the market segment name
  const formatMarketSegment = (segment: string) => {
    // Try to find in the predefined market segments
    const marketSegment = MARKET_SEGMENTS.find(ms => ms.value === segment);
    if (marketSegment) {
      return marketSegment.label;
    }
    
    // Fallback to formatting the string
    return segment.split(/[-_\s]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };
  
  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Select change handler
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Price range change handler
  const handlePriceRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    
    setFormData(prev => {
      const priceRange = typeof prev.target_price_range === 'string'
        ? JSON.parse(prev.target_price_range)
        : prev.target_price_range;
        
      return {
        ...prev,
        target_price_range: {
          ...priceRange,
          [field]: numValue
        }
      };
    });
  };
  
  // Start editing
  const handleEdit = () => {
    setFormData({
      ...strategy,
      target_price_range: getPriceRange(strategy.target_price_range),
      strategy_type: strategy.strategy_type || 'value-based'
    });
    setIsEditing(true);
  };
  
  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  // Save changes
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Format data for saving
      const saveData: ExtendedPricingStrategy = {
        ...formData,
        target_price_range: typeof formData.target_price_range === 'object'
          ? JSON.stringify(formData.target_price_range)
          : formData.target_price_range,
        strategy_type: formData.strategy_type || 'value-based'
      };
      
      await onEdit(saveData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update pricing strategy:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    setIsDeleting(true);
  };
  
  // Confirm deletion
  const handleConfirmDelete = async () => {
    setIsSubmitting(true);
    try {
      await onDelete(strategy.id);
      setIsDeleting(false);
    } catch (error) {
      console.error('Failed to delete pricing strategy:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Card className={`overflow-hidden transition-all h-full flex flex-col ${
        isEditing ? "shadow-md ring-2 ring-primary-200" : "hover:shadow-md"
      }`}>
        <CardHeader className="relative pb-2" style={{ background: getGradient() }}>
          {!isEditing && !readOnly && (
            <div className="absolute right-4 top-4 flex space-x-1">
                    <Button
                      variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 bg-white/80 hover:bg-white rounded-full"
                onClick={handleEdit}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
            </div>
          )}
          
          {isEditing ? (
            <div className="space-y-3 pt-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Name
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Strategy name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Target Market
                  </label>
                  <Select
                    value={formData.target_market}
                    onValueChange={(value) => handleSelectChange('target_market', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select market" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKET_SEGMENTS.map(segment => (
                        <SelectItem key={segment.value} value={segment.value}>
                          {segment.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Strategy Type
                  </label>
                  <Select
                    value={formData.strategy_type || 'value-based'}
                    onValueChange={(value) => handleSelectChange('strategy_type', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {STRATEGY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-lg text-gray-900">{strategy.name}</h3>
              <div className="flex gap-2 flex-wrap mt-1">
                <div style={getMarketBadgeStyle()}>
                  <Building className="h-3 w-3" />
                  {formatMarketSegment(strategy.target_market)}
                </div>
                {strategy.strategy_type && getStrategyTypeBadge()}
              </div>
            </>
          )}
      </CardHeader>
      
        <CardContent className={`flex-1 ${isEditing ? 'pt-2' : 'pt-4'}`}>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Strategy description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Price Range
                </label>
                <div className="flex gap-2 items-center">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    value={typeof formData.target_price_range === 'object' ? formData.target_price_range.min : 0}
                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                    className="w-full"
                    placeholder="Min price"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="number"
                    value={typeof formData.target_price_range === 'object' ? formData.target_price_range.max : 0}
                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                    className="w-full"
                    placeholder="Max price"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Considerations
                </label>
                <Textarea
                  name="considerations"
                  value={formData.considerations}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Key considerations for this strategy"
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center mb-3">
                <Badge className="bg-emerald-100 text-emerald-800 border-0 px-2 py-1">
                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                  {formatPriceRange(strategy.target_price_range)}
                </Badge>
          </div>
            
              <div className="space-y-3">
                {strategy.description && (
                  <div>
                    <p className="text-sm text-gray-700">{strategy.description}</p>
                  </div>
                )}
          
          {strategy.considerations && (
                <div>
                    <h4 className="text-xs uppercase font-semibold text-gray-500 mb-1">Key Considerations</h4>
                    <p className="text-sm text-gray-700">{strategy.considerations}</p>
                </div>
                )}
              </div>
            </>
          )}
      </CardContent>
      
        <CardFooter className={`border-t pt-3 flex ${isEditing ? 'justify-between' : 'justify-end'}`}>
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              
              <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4 mr-1" />
                  {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
              </div>
            </>
          ) : (
            <div className="text-xs text-gray-500">
              {strategy.updated_at && `Updated ${formatDate(strategy.updated_at)}`}
            </div>
          )}
      </CardFooter>
    </Card>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Pricing Strategy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{strategy.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 