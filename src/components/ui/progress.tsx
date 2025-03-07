"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-gray-100",
        primary: "bg-primary-100",
        secondary: "bg-secondary-100",
        accent: "bg-accent-100",
        dark: "bg-dark-100",
        glass: "bg-white/20 backdrop-blur-sm",
      },
      size: {
        sm: "h-1",
        default: "h-2",
        md: "h-3",
        lg: "h-4",
        xl: "h-5",
      },
      rounded: {
        default: "rounded-full",
        sm: "rounded-md",
        lg: "rounded-lg",
      },
      animated: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      animated: true,
    },
  }
)

const indicatorVariants = cva(
  "h-full w-full flex-1 transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary-600",
        primary: "bg-gradient-to-r from-primary-700 to-primary-500",
        secondary: "bg-gradient-to-r from-secondary-700 to-secondary-500",
        accent: "bg-gradient-to-r from-accent-700 to-accent-500",
        success: "bg-gradient-to-r from-green-600 to-green-500",
        warning: "bg-gradient-to-r from-yellow-600 to-yellow-500",
        danger: "bg-gradient-to-r from-red-600 to-red-500",
        rainbow: "bg-gradient-to-r from-primary-700 via-secondary-500 to-accent-600",
        glass: "bg-white/60",
      },
      animated: {
        true: "after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      animated: true,
    },
  }
)

export interface ProgressProps 
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
      indicatorVariant?: VariantProps<typeof indicatorVariants>["variant"];
      indicatorClassName?: string;
    }

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value, 
  variant, 
  size, 
  rounded,
  animated,
  indicatorVariant, 
  indicatorClassName, 
  ...props 
}, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      progressVariants({ variant, size, rounded, animated }),
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        indicatorVariants({ variant: indicatorVariant || variant as any, animated }),
        "relative",
        indicatorClassName
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      )}
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
