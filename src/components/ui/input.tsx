import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "rounded-md border bg-transparent text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: 
          "border-gray-200 hover:border-primary-300 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20",
        filled: 
          "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-primary-300 focus-visible:border-primary-500 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary-500/20",
        outline: 
          "border-2 border-primary-200 hover:border-primary-300 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20",
        ghost: 
          "border-transparent hover:bg-gray-100 focus-visible:bg-white focus-visible:border-primary-300 focus-visible:ring-2 focus-visible:ring-primary-500/20",
        glass: 
          "border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 focus-visible:bg-white/30 focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-white/20",
      },
      inputSize: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1 text-xs rounded-md",
        lg: "h-12 px-5 py-3 text-base rounded-lg",
        xl: "h-14 px-6 py-4 text-lg rounded-lg",
      },
      radius: {
        default: "rounded-md",
        sm: "rounded",
        lg: "rounded-lg",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
      radius: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, radius, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputVariants({ variant, inputSize, radius }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input"

export { Input }
