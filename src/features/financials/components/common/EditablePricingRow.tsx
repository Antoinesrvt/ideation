import React from 'react';
import { EditableTableRow } from './EditableTableRow';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { formatCurrency } from "../../utils/dataProcessing";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { parseJsonbField } from '@/lib/utils';

// Define the pricing strategy type
export interface PricingStrategy {
  id: string;
  name: string;
  description: string;
  target_market: string;
  target_price_range: { min: number; max: number } | string;
  considerations: string;
  project_id?: string;
}

// Default pricing strategy for new entries
export const defaultPricingStrategy: PricingStrategy = {
  id: '',
  name: '',
  description: '',
  target_market: '',
  target_price_range: { min: 0, max: 0 },
  considerations: ''
};

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

interface EditablePricingRowProps {
  strategy: PricingStrategy;
  isNewRow?: boolean;
  isEmptyRow?: boolean;
  onSave: (strategy: PricingStrategy) => Promise<void>;
  onDelete?: (strategy: PricingStrategy) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
}

export function EditablePricingRow({
  strategy,
  isNewRow = false,
  isEmptyRow = false,
  onSave,
  onDelete,
  onCancel,
  readOnly = false
}: EditablePricingRowProps) {
  // Helper to get price range
  const getPriceRange = (priceRange: { min: number; max: number } | string) => {
    if (typeof priceRange === 'string') {
      return parseJsonbField<{ min: number; max: number }>(priceRange, { min: 0, max: 0 });
    }
    return priceRange;
  };

  // Calculate average price
  const getAveragePrice = (priceRange: { min: number; max: number } | string) => {
    const range = getPriceRange(priceRange);
    return (range.min + range.max) / 2;
  };
  
  // Format price range for display
  const formatPriceRange = (priceRange: { min: number; max: number } | string) => {
    const range = getPriceRange(priceRange);
    if (range.min === range.max) {
      return formatCurrency(range.min);
    }
    return `${formatCurrency(range.min)} - ${formatCurrency(range.max)}`;
  };

  // Define columns for the EditableTableRow
  const columns = [
    {
      key: 'name' as keyof PricingStrategy,
      title: 'Strategy',
      renderViewMode: (value: string, data: PricingStrategy) => (
        <div className="space-y-1">
          <div className="font-medium">{value || 'Unnamed Strategy'}</div>
          {data.description && (
            <div className="text-xs text-gray-600 line-clamp-2">
              {data.description}
            </div>
          )}
        </div>
      ),
      renderEditMode: (value: string, onChange: (key: keyof PricingStrategy, value: any) => void, data: PricingStrategy, ref?: React.RefObject<HTMLInputElement>) => (
        <div className="space-y-2">
          <div>
            <Label htmlFor="name" className="sr-only">Name</Label>
            <Input
              id="name"
              value={value}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Strategy name"
              className="h-9"
              ref={ref}
            />
          </div>
          <div>
            <Label htmlFor="description" className="sr-only">Description</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Describe this pricing strategy"
              className="min-h-[40px] max-h-[80px]"
            />
          </div>
        </div>
      ),
      validate: (value: string) => !value ? 'Name is required' : null
    },
    {
      key: 'target_price_range' as keyof PricingStrategy,
      title: 'Price',
      renderViewMode: (value: { min: number; max: number } | string) => (
        <div className="font-medium">{formatPriceRange(value)}</div>
      ),
      renderEditMode: (value: { min: number; max: number } | string, onChange: (key: keyof PricingStrategy, value: any) => void, data: PricingStrategy) => {
        const range = getPriceRange(value);
        
        return (
          <div className="space-y-2">
            <div>
              <Label htmlFor="price_min">Min Price</Label>
              <Input
                id="price_min"
                type="number"
                value={range.min}
                onChange={(e) => {
                  const min = parseFloat(e.target.value) || 0;
                  onChange('target_price_range', { min, max: range.max });
                }}
                placeholder="0.00"
                className="h-9"
                min={0}
                step={0.01}
              />
            </div>
            <div>
              <Label htmlFor="price_max">Max Price</Label>
              <Input
                id="price_max"
                type="number"
                value={range.max}
                onChange={(e) => {
                  const max = parseFloat(e.target.value) || 0;
                  onChange('target_price_range', { min: range.min, max });
                }}
                placeholder="0.00"
                className="h-9"
                min={0}
                step={0.01}
              />
            </div>
          </div>
        );
      },
      validate: (value: { min: number; max: number } | string, data: PricingStrategy) => {
        const range = getPriceRange(value);
        if (range.min < 0 || range.max < 0) {
          return 'Prices cannot be negative';
        }
        if (range.max < range.min) {
          return 'Max price cannot be less than min price';
        }
        return null;
      }
    },
    {
      key: 'target_market' as keyof PricingStrategy,
      title: 'Target Market',
      renderViewMode: (value: string) => (
        <div>{value || 'General'}</div>
      ),
      renderEditMode: (value: string, onChange: (key: keyof PricingStrategy, value: any) => void) => (
        <div className="space-y-2">
          <div>
            <Label htmlFor="target_market" className="sr-only">Target Market</Label>
            <Select
              value={value}
              onValueChange={(newValue) => onChange('target_market', newValue)}
            >
              <SelectTrigger id="target_market" className="h-9">
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
            <Label htmlFor="considerations" className="sr-only">Considerations</Label>
            <Textarea
              id="considerations"
              value={strategy.considerations}
              onChange={(e) => onChange('considerations', e.target.value)}
              placeholder="Additional considerations"
              className="min-h-[40px] max-h-[80px]"
            />
          </div>
        </div>
      )
    }
  ];

  return (
    <EditableTableRow
      data={strategy}
      initialData={defaultPricingStrategy}
      isNewRow={isNewRow}
      isEmptyRow={isEmptyRow}
      emptyRowMessage="Add new pricing strategy..."
      columns={columns}
      onSave={onSave}
      onDelete={onDelete}
      onCancel={onCancel}
      entityName="pricing strategy"
      readOnly={readOnly}
    />
  );
} 