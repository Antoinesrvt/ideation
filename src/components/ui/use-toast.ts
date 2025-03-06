import { useState, useEffect } from "react";

type ToastVariant = "default" | "destructive" | "success";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

// Store for toasts
let toasts: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

// Notify all listeners of changes
const notifyListeners = () => {
  listeners.forEach(listener => listener([...toasts]));
};

// Add a toast
const toast = (options: ToastOptions) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: Toast = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant || "default",
    duration: options.duration || 5000,
  };
  
  toasts = [...toasts, newToast];
  notifyListeners();
  
  // Auto dismiss
  setTimeout(() => {
    dismissToast(id);
  }, newToast.duration);
  
  return id;
};

// Dismiss a toast
export const dismissToast = (id: string) => {
  toasts = toasts.filter(t => t.id !== id);
  notifyListeners();
};

// Hook to use toasts
export const useToast = () => {
  const [localToasts, setLocalToasts] = useState<Toast[]>([]);
  
  useEffect(() => {
    // Add listener
    const handleChange = (updatedToasts: Toast[]) => {
      setLocalToasts(updatedToasts);
    };
    
    listeners.push(handleChange);
    setLocalToasts([...toasts]); // Initial state
    
    // Cleanup
    return () => {
      listeners = listeners.filter(l => l !== handleChange);
    };
  }, []);
  
  return {
    toasts: localToasts,
    toast,
    dismiss: dismissToast
  };
};

// Export the toast function for direct usage
export { toast }; 