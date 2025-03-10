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
import { FinancialCostStructure } from '@/store/types';

// Define the cost item type
export interface CostItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annually" | "one-time";
  type: "fixed" | "variable";
}

// Default cost item for new entries
export const defaultCostItem: CostItem = {
  id: '',
  category: '',
  description: '',
  amount: 0,
  frequency: 'monthly',
  type: 'fixed'
};

interface EditableCostRowProps {
  cost: CostItem;
  isNewRow?: boolean;
  isEmptyRow?: boolean;
  onSave: (cost: CostItem) => Promise<void>;
  onDelete?: (cost: CostItem) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
}

export function EditableCostRow({
  cost,
  isNewRow = false,
  isEmptyRow = false,
  onSave,
  onDelete,
  onCancel,
  readOnly = false
}: EditableCostRowProps) {
  // Define categories for dropdown selection
  const costCategories = [
    'Rent',
    'Utilities',
    'Salaries',
    'Marketing',
    'Software',
    'Hardware',
    'Insurance',
    'Taxes',
    'Raw Materials',
    'Shipping',
    'Manufacturing',
    'Other'
  ];

  // Define columns for the EditableTableRow
  const columns = [
    {
      key: 'category' as keyof CostItem,
      title: 'Category',
      renderViewMode: (value: string) => (
        <span className="font-medium">{value || 'Uncategorized'}</span>
      ),
      renderEditMode: (
        value: string, 
        onChange: (key: keyof CostItem, value: any) => void, 
        data: CostItem,
        ref?: React.RefObject<HTMLInputElement>
      ) => (
        <div className="space-y-1">
          <Label htmlFor="category" className="sr-only">Category</Label>
          <Select
            value={value}
            onValueChange={(newValue) => onChange('category', newValue)}
          >
            <SelectTrigger id="category" className="h-9">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {costCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
      validate: (value: string) => !value ? 'Category is required' : null
    },
    {
      key: 'description' as keyof CostItem,
      title: 'Description',
      renderViewMode: (value: string) => <span>{value}</span>,
      renderEditMode: (
        value: string, 
        onChange: (key: keyof CostItem, value: any) => void, 
        data: CostItem,
        ref?: React.RefObject<HTMLInputElement>
      ) => (
        <div className="space-y-1">
          <Label htmlFor="description" className="sr-only">Description</Label>
          <Input
            id="description"
            value={value}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Enter description"
            className="h-9"
            ref={ref}
          />
        </div>
      ),
      validate: (value: string) => !value ? 'Description is required' : null
    },
    {
      key: 'amount' as keyof CostItem,
      title: 'Amount',
      renderViewMode: (value: number) => <span>{formatCurrency(value)}</span>,
      renderEditMode: (
        value: number, 
        onChange: (key: keyof CostItem, value: any) => void, 
        data: CostItem
      ) => (
        <div className="space-y-1">
          <Label htmlFor="amount" className="sr-only">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={value}
            onChange={(e) => onChange('amount', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="h-9"
            min={0}
            step={0.01}
          />
        </div>
      ),
      validate: (value: number) => value <= 0 ? 'Amount must be greater than 0' : null
    },
    {
      key: 'frequency' as keyof CostItem,
      title: 'Frequency',
      renderViewMode: (value: string) => <span className="capitalize">{value}</span>,
      renderEditMode: (
        value: string, 
        onChange: (key: keyof CostItem, value: any) => void, 
        data: CostItem
      ) => (
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
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annually">Annually</SelectItem>
              <SelectItem value="one-time">One-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      key: 'type' as keyof CostItem,
      title: 'Type',
      renderViewMode: (value: string) => (
        <span className={`inline-flex items-center justify-center h-6 px-2 rounded-full text-xs font-medium ${
          value === 'fixed' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-amber-100 text-amber-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
      renderEditMode: (
        value: string, 
        onChange: (key: keyof CostItem, value: any) => void, 
        data: CostItem
      ) => (
        <div className="space-y-1">
          <Label htmlFor="type" className="sr-only">Type</Label>
          <Select
            value={value}
            onValueChange={(newValue) => onChange('type', newValue)}
          >
            <SelectTrigger id="type" className="h-9">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="variable">Variable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    }
  ];

  return (
    <EditableTableRow
      data={cost}
      initialData={defaultCostItem}
      isNewRow={isNewRow}
      isEmptyRow={isEmptyRow}
      emptyRowMessage="Add new cost item..."
      columns={columns}
      onSave={onSave}
      onDelete={onDelete}
      onCancel={onCancel}
      entityName="cost"
      readOnly={readOnly}
    />
  );
} 