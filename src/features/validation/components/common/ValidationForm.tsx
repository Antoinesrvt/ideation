import React, { ReactNode } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UseFormReturn, FieldValues, FormProvider } from 'react-hook-form';

interface ValidationFormProps<T extends FieldValues> {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void;
  children: ReactNode;
  submitLabel?: string;
}

export function ValidationForm<T extends FieldValues>({ 
  title,
  open,
  onOpenChange,
  form,
  onSubmit,
  children,
  submitLabel = 'Save'
}: ValidationFormProps<T>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {children}
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">{submitLabel}</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
} 