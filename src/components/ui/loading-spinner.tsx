import React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  "relative inline-block animate-spin rounded-full",
  {
    variants: {
      variant: {
        default: "border-t-transparent border-primary-600",
        primary: "border-t-transparent border-primary-600",
        secondary: "border-t-transparent border-secondary-600",
        accent: "border-t-transparent border-accent-600",
        success: "border-t-transparent border-green-600",
        warning: "border-t-transparent border-yellow-600",
        danger: "border-t-transparent border-red-600",
        info: "border-t-transparent border-blue-600",
        white: "border-t-transparent border-white",
        dark: "border-t-transparent border-gray-900",
      },
      size: {
        xs: "h-3 w-3 border-[1.5px]",
        sm: "h-4 w-4 border-2",
        md: "h-8 w-8 border-[3px]",
        lg: "h-12 w-12 border-4",
        xl: "h-16 w-16 border-[6px]",
      },
      speed: {
        slow: "animate-spin-slow",
        default: "animate-spin",
        fast: "animate-spin-fast",
      },
      withText: {
        true: "mr-2",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      speed: "default",
      withText: false,
    },
  }
);

export interface LoadingSpinnerProps extends 
  React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof spinnerVariants> {
  label?: string;
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  variant,
  size,
  speed,
  withText,
  label,
  labelPosition = 'right',
  className,
  ...props
}) => {
  const spinner = (
    <div 
      className={cn(
        spinnerVariants({ variant, size, speed, withText }),
        className
      )}
      {...props}
    >
      {size === 'lg' || size === 'xl' ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "h-1/3 w-1/3 rounded-full",
            variant === 'white' ? 'bg-gray-100/20' : 'bg-gray-50/20'
          )}></div>
        </div>
      ) : null}
    </div>
  );
  
  if (!label) return spinner;
  
  const labelClasses = "text-sm font-medium whitespace-nowrap";
  
  if (labelPosition === 'left') {
    return (
      <div className="inline-flex items-center">
        <span className={`${labelClasses} mr-2`}>{label}</span>
        {spinner}
      </div>
    );
  }
  
  if (labelPosition === 'right') {
    return (
      <div className="inline-flex items-center">
        {spinner}
        <span className={`${labelClasses} ml-2`}>{label}</span>
      </div>
    );
  }
  
  if (labelPosition === 'top') {
    return (
      <div className="inline-flex flex-col items-center">
        <span className={`${labelClasses} mb-2`}>{label}</span>
        {spinner}
      </div>
    );
  }
  
  return (
    <div className="inline-flex flex-col items-center">
      {spinner}
      <span className={`${labelClasses} mt-2`}>{label}</span>
    </div>
  );
};