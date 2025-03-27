import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Target, Calculator, MousePointerClick } from 'lucide-react';
import { MarketSizingCalculator } from './MarketSizingCalculator';
import { MarketSize } from '../types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MarketSizingModalProps {
  initialData?: MarketSize;
  onSave: (data: MarketSize) => void;
  trigger?: React.ReactNode; // Custom trigger element
}

export function MarketSizingModal({ initialData, onSave, trigger }: MarketSizingModalProps) {
  const [open, setOpen] = React.useState(false);

  const handleSave = (data: MarketSize) => {
    onSave(data);
    // We keep the modal open because the calculator already saves on every change
    // This allows users to continue refining their estimates
  };

  const handleClose = () => {
    setOpen(false);
  };

  // Default trigger button if none provided
  const defaultTrigger = (
    <Button 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2"
      onClick={() => setOpen(true)}
    >
      <Calculator className="h-4 w-4" />
      <span>Open Market Size Calculator</span>
    </Button>
  );

  return (
    <>
      {/* Render custom trigger or default button */}
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        defaultTrigger
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-primary" />
              Market Size Calculator
            </DialogTitle>
            <DialogDescription>
              Calculate your Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM)
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-blue-50 border-blue-200 text-blue-800 mb-4">
            <div className="flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                Pro tip: Follow the guided 3-step process and interact directly with the funnel visualization by clicking on SAM or SOM sections.
              </AlertDescription>
            </div>
          </Alert>

          <div className="py-4">
            <MarketSizingCalculator 
              initialData={initialData} 
              onSave={handleSave}
              isModal={true}
            />
          </div>

          <DialogFooter>
            <Button 
              onClick={handleClose} 
              className="mt-4"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 