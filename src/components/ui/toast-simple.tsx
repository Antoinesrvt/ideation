import React, { useEffect, useState } from 'react';
import { useToast, dismissToast } from './use-toast';
import { Check, AlertTriangle, X, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  // Create a portal for the toasts
  return createPortal(
    <div className="fixed top-0 right-0 p-4 w-full md:max-w-[420px] z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <SimpleToast 
          key={toast.id} 
          id={toast.id}
          title={toast.title} 
          description={toast.description} 
          variant={toast.variant as 'default' | 'destructive' | 'success'} 
        />
      ))}
    </div>,
    document.body
  );
};

interface SimpleToastProps {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

const SimpleToast: React.FC<SimpleToastProps> = ({ id, title, description, variant = 'default' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-white border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'success':
        return <Check className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div
      className={`rounded-lg border px-4 py-3 shadow-md ${getVariantStyles()} animate-in fade-in slide-in-from-top-1 duration-300`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="shrink-0 mr-2">
          {getIcon()}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && <p className="text-xs mt-1">{description}</p>}
        </div>
        <button 
          onClick={() => dismissToast(id)}
          className="ml-4 shrink-0 inline-flex h-5 w-5 items-center justify-center rounded-md text-gray-400 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
}; 