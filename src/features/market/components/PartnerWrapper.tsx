import React from 'react';
import { PartnerAnalysis } from './PartnerAnalysis';
import { MarketPartner, PartnerFormValues } from '../types';
import { useToast } from '@/components/ui/use-toast';

interface PartnerWrapperProps {
  partners: MarketPartner[];
  addPartner?: (partner: Omit<MarketPartner, 'id'>) => Promise<MarketPartner | null>;
  updatePartner?: (params: { id: string; data: Partial<Omit<MarketPartner, 'id'>> }) => Promise<MarketPartner | null>;
  deletePartner?: (id: string) => Promise<boolean>;
  readOnly?: boolean;
}

export function PartnerWrapper({
  partners,
  addPartner,
  updatePartner,
  deletePartner,
  readOnly = false
}: PartnerWrapperProps) {
  const { toast } = useToast();
  
  // Adapter functions to convert our hook API to the expected PartnerAnalysis API
  const handleAddPartner = async (partner: PartnerFormValues): Promise<void> => {
    if (!addPartner) return;
    
    try {
      await addPartner(partner);
      toast({
        title: 'Success',
        description: 'Partner added successfully',
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add partner',
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdatePartner = async (id: string, data: Partial<PartnerFormValues>): Promise<void> => {
    if (!updatePartner) return;
    
    try {
      await updatePartner({ id, data });
      toast({
        title: 'Success',
        description: 'Partner updated successfully',
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update partner',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeletePartner = async (id: string): Promise<void> => {
    if (!deletePartner) return;
    
    try {
      await deletePartner(id);
      toast({
        title: 'Success',
        description: 'Partner deleted successfully',
        variant: 'default',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete partner',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <PartnerAnalysis
      partners={partners}
      onAddPartner={readOnly ? undefined : handleAddPartner}
      onUpdatePartner={readOnly ? undefined : handleUpdatePartner}
      onDeletePartner={readOnly ? undefined : handleDeletePartner}
      readOnly={readOnly}
    />
  );
} 