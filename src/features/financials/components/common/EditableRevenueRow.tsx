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

// Define the revenue stream type
export interface RevenueStream {
  id: string;
  name: string;
  description: string;
  type: string;
  pricing_model: string;
  unit_price: number;
  volume: number;
  frequency: string;
  growth_rate: number;
  assumptions: string;
  project_id?: string;
}

// Revenue types and pricing models
export const REVENUE_TYPES = [
  { value: 'subscription', label: 'Subscription' },
  { value: 'one-time', label: 'One-time Purchase' },
  { value: 'usage', label: 'Usage-based' },
  { value: 'licensing', label: 'Licensing' },
  { value: 'advertising', label: 'Advertising' },
  { value: 'commission', label: 'Commission' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'other', label: 'Other' }
];

export const PRICING_MODELS = [
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'tiered', label: 'Tiered Pricing' },
  { value: 'per_user', label: 'Per User' },
  { value: 'per_feature', label: 'Per Feature' },
  { value: 'value_based', label: 'Value-based' },
  { value: 'cost_plus', label: 'Cost-plus' },
  { value: 'other', label: 'Other' }
];

export const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
  { value: 'one-time', label: 'One-time' }
];

// Default revenue stream for new entries
export const defaultRevenueStream: RevenueStream = {
  id: '',
  name: '',
  description: '',
  type: 'subscription',
  pricing_model: 'fixed',
  unit_price: 0,
  volume: 0,
  frequency: 'monthly',
  growth_rate: 0,
  assumptions: ''
};

interface EditableRevenueRowProps {
  stream: RevenueStream;
  isNewRow?: boolean;
  isEmptyRow?: boolean;
  onSave: (stream: RevenueStream) => Promise<void>;
  onDelete?: (stream: RevenueStream) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
}

export function EditableRevenueRow({
  stream,
  isNewRow = false,
  isEmptyRow = false,
  onSave,
  onDelete,
  onCancel,
  readOnly = false
}: EditableRevenueRowProps) {
  // Calculate the monthly revenue for this stream
  const monthlyRevenue = (stream.unit_price || 0) * (stream.volume || 0);

  // Define columns for the EditableTableRow
  const columns = [
    {
      key: 'name' as keyof RevenueStream,
      title: 'Name',
      renderViewMode: (value: string, data: RevenueStream) => (
        <div className="space-y-1">
          <div className="font-medium">{value || 'Unnamed Stream'}</div>
          {data.type && (
            <div className="text-xs text-gray-500">
              Type: {data.type.replace('-', ' ')}
            </div>
          )}
        </div>
      ),
      renderEditMode: (value: string, onChange: (key: keyof RevenueStream, value: any) => void, data: RevenueStream, ref?: React.RefObject<HTMLInputElement>) => (
        <div className="space-y-2">
          <div>
            <Label htmlFor="name" className="sr-only">Name</Label>
            <Input
              id="name"
              value={value}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Revenue stream name"
              className="h-9"
              ref={ref}
            />
          </div>
          <div>
            <Label htmlFor="type" className="sr-only">Type</Label>
            <Select
              value={data.type}
              onValueChange={(newValue) => onChange('type', newValue)}
            >
              <SelectTrigger id="type" className="h-9">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {REVENUE_TYPES.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      validate: (value: string) => !value ? 'Name is required' : null
    },
    {
      key: 'description' as keyof RevenueStream,
      title: 'Description',
      renderViewMode: (value: string) => (
        <div className="text-sm line-clamp-2">{value || 'No description'}</div>
      ),
      renderEditMode: (value: string, onChange: (key: keyof RevenueStream, value: any) => void) => (
        <div className="space-y-1">
          <Label htmlFor="description" className="sr-only">Description</Label>
          <Textarea
            id="description"
            value={value}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Describe this revenue stream"
            className="min-h-[60px] max-h-[120px]"
          />
        </div>
      )
    },
    {
      key: 'pricing_model' as keyof RevenueStream,
      title: 'Pricing',
      renderViewMode: (value: string, data: RevenueStream) => (
        <div className="space-y-1">
          <div>{formatCurrency(data.unit_price || 0)}</div>
          <div className="text-xs text-gray-500">
            {value.replace('_', ' ')}
          </div>
        </div>
      ),
      renderEditMode: (value: string, onChange: (key: keyof RevenueStream, value: any) => void, data: RevenueStream) => (
        <div className="space-y-2">
          <div>
            <Label htmlFor="unit_price" className="sr-only">Price</Label>
            <Input
              id="unit_price"
              type="number"
              value={data.unit_price}
              onChange={(e) => onChange('unit_price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="h-9"
              min={0}
              step={0.01}
            />
          </div>
          <div>
            <Label htmlFor="pricing_model" className="sr-only">Model</Label>
            <Select
              value={value}
              onValueChange={(newValue) => onChange('pricing_model', newValue)}
            >
              <SelectTrigger id="pricing_model" className="h-9">
                <SelectValue placeholder="Select pricing model" />
              </SelectTrigger>
              <SelectContent>
                {PRICING_MODELS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
      validate: (value: string, data: RevenueStream) => 
        !data.unit_price || data.unit_price <= 0 ? 'Price must be greater than 0' : null
    },
    {
      key: 'volume' as keyof RevenueStream,
      title: 'Volume',
      renderViewMode: (value: number) => <div>{value}</div>,
      renderEditMode: (value: number, onChange: (key: keyof RevenueStream, value: any) => void) => (
        <div className="space-y-1">
          <Label htmlFor="volume" className="sr-only">Volume</Label>
          <Input
            id="volume"
            type="number"
            value={value}
            onChange={(e) => onChange('volume', parseInt(e.target.value) || 0)}
            placeholder="0"
            className="h-9"
            min={0}
            step={1}
          />
        </div>
      ),
      validate: (value: number) => value <= 0 ? 'Volume must be greater than 0' : null
    },
    {
      key: 'frequency' as keyof RevenueStream,
      title: 'Frequency',
      renderViewMode: (value: string) => (
        <div className="capitalize">{value}</div>
      ),
      renderEditMode: (value: string, onChange: (key: keyof RevenueStream, value: any) => void) => (
        <div className="space-y-1">
          <Label htmlFor="frequency" className="sr-only">Frequency</Label>
          <Select
            value={value}
            onValueChange={(newValue) => onChange('frequency', newValue)}
          >
            <SelectTrigger id="frequency" className="h-9">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      key: 'unit_price' as keyof RevenueStream,
      title: 'Revenue',
      renderViewMode: (value: number, data: RevenueStream) => (
        <div className="font-medium text-right">
          {formatCurrency(monthlyRevenue)}
          {data.frequency !== 'monthly' && (
            <div className="text-xs text-gray-500">
              per {data.frequency === 'annually' ? 'year' : data.frequency}
            </div>
          )}
        </div>
      ),
      renderEditMode: (value: number, onChange: (key: keyof RevenueStream, value: any) => void, data: RevenueStream) => (
        <div className="p-2 bg-muted/50 rounded text-center">
          <div className="font-medium">{formatCurrency(data.unit_price * data.volume)}</div>
          <div className="text-xs text-gray-500">Calculated</div>
        </div>
      )
    }
  ];

  return (
    <EditableTableRow
      data={stream}
      initialData={defaultRevenueStream}
      isNewRow={isNewRow}
      isEmptyRow={isEmptyRow}
      emptyRowMessage="Add new revenue stream..."
      columns={columns}
      onSave={onSave}
      onDelete={onDelete}
      onCancel={onCancel}
      entityName="revenue stream"
      readOnly={readOnly}
    />
  );
} 