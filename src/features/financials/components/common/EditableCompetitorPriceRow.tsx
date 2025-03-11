import React from 'react';
import { EditableTableRow } from './EditableTableRow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from "../../utils/dataProcessing";

// Define the competitor price type that aligns with both UI and DB needs
export interface CompetitorPrice {
  id: string;
  competitor: string;
  price: number;
  notes: string;
  project_id?: string;
}

// Default values for a new competitor price entry
export const defaultCompetitorPrice: CompetitorPrice = {
  id: '',
  competitor: '',
  price: 0,
  notes: ''
};

interface EditableCompetitorPriceRowProps {
  competitorPrice: CompetitorPrice;
  isNewRow?: boolean;
  isEmptyRow?: boolean;
  onSave: (competitorPrice: CompetitorPrice) => Promise<void>;
  onDelete?: (competitorPrice: CompetitorPrice) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
}

export function EditableCompetitorPriceRow({
  competitorPrice,
  isNewRow = false,
  isEmptyRow = false,
  onSave,
  onDelete,
  onCancel,
  readOnly = false
}: EditableCompetitorPriceRowProps) {
  // Define columns for the EditableTableRow
  const columns = [
    {
      key: 'competitor' as keyof CompetitorPrice,
      title: 'Competitor',
      renderViewMode: (value: string) => (
        <div className="font-medium">{value || 'Unnamed Competitor'}</div>
      ),
      renderEditMode: (value: string, onChange: (key: keyof CompetitorPrice, value: any) => void, data: CompetitorPrice, ref?: React.RefObject<HTMLInputElement>) => (
        <div className="space-y-1">
          <Label htmlFor="competitor" className="sr-only">Competitor Name</Label>
          <Input
            id="competitor"
            value={value}
            onChange={(e) => onChange('competitor', e.target.value)}
            placeholder="Competitor name"
            className="h-9"
            ref={ref}
          />
        </div>
      ),
      validate: (value: string) => !value ? 'Competitor name is required' : null
    },
    {
      key: 'price' as keyof CompetitorPrice,
      title: 'Price',
      renderViewMode: (value: number) => (
        <div className="font-medium">{formatCurrency(value)}</div>
      ),
      renderEditMode: (value: number, onChange: (key: keyof CompetitorPrice, value: any) => void) => (
        <div className="space-y-1">
          <Label htmlFor="price" className="sr-only">Price</Label>
          <Input
            id="price"
            type="number"
            value={value}
            onChange={(e) => onChange('price', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="h-9"
            min={0}
            step={0.01}
          />
        </div>
      ),
      validate: (value: number) => value < 0 ? 'Price cannot be negative' : null
    },
    {
      key: 'notes' as keyof CompetitorPrice,
      title: 'Notes',
      renderViewMode: (value: string) => (
        <div className="text-sm text-gray-600 line-clamp-2">{value || 'No notes'}</div>
      ),
      renderEditMode: (value: string, onChange: (key: keyof CompetitorPrice, value: any) => void) => (
        <div className="space-y-1">
          <Label htmlFor="notes" className="sr-only">Notes</Label>
          <Textarea
            id="notes"
            value={value}
            onChange={(e) => onChange('notes', e.target.value)}
            placeholder="Add notes about competitor pricing"
            className="min-h-[80px] max-h-[120px]"
          />
        </div>
      )
    }
  ];

  return (
    <EditableTableRow
      data={competitorPrice}
      initialData={defaultCompetitorPrice}
      isNewRow={isNewRow}
      isEmptyRow={isEmptyRow}
      emptyRowMessage="Add new competitor price..."
      columns={columns}
      onSave={onSave}
      onDelete={onDelete}
      onCancel={onCancel}
      entityName="competitor price"
      readOnly={readOnly}
    />
  );
} 