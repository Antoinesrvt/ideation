"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const separatorVariants = cva(
  "shrink-0",
  {
    variants: {
      variant: {
        default: "bg-border",
        primary: "bg-primary-200",
        secondary: "bg-secondary-200",
        accent: "bg-accent-200",
        muted: "bg-muted",
        ghost: "bg-gray-100",
      },
      size: {
        default: "",
        thin: "",
        medium: "",
        thick: "",
      },
      orientation: {
        horizontal: "",
        vertical: "",
      },
      contentPosition: {
        none: "",
        center: "flex items-center justify-center",
        left: "flex items-center justify-start",
        right: "flex items-center justify-end",
      },
      withLabel: {
        true: "relative",
        false: "",
      },
      gradient: {
        none: "",
        fade: "bg-gradient-to-r",
        primary: "bg-gradient-to-r from-transparent via-primary-300 to-transparent",
        secondary: "bg-gradient-to-r from-transparent via-secondary-300 to-transparent",
        accent: "bg-gradient-to-r from-transparent via-accent-300 to-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      orientation: "horizontal",
      contentPosition: "none",
      withLabel: false,
      gradient: "none",
    },
    compoundVariants: [
      {
        orientation: "vertical",
        size: "default",
        className: "h-full w-[1px]",
      },
      {
        orientation: "vertical",
        size: "thin",
        className: "h-full w-px",
      },
      {
        orientation: "vertical",
        size: "medium",
        className: "h-full w-0.5",
      },
      {
        orientation: "vertical",
        size: "thick",
        className: "h-full w-1",
      },
      {
        orientation: "horizontal",
        size: "default",
        className: "h-[1px] w-full",
      },
      {
        orientation: "horizontal",
        size: "thin",
        className: "h-px w-full",
      },
      {
        orientation: "horizontal",
        size: "medium",
        className: "h-0.5 w-full",
      },
      {
        orientation: "horizontal",
        size: "thick",
        className: "h-1 w-full",
      },
    ]
  }
)

export interface SeparatorProps extends
  Omit<React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>, "orientation">,
  VariantProps<typeof separatorVariants> {
  label?: React.ReactNode;
  labelClassName?: string;
  orientation?: "horizontal" | "vertical";
}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    { 
      className, 
      orientation = "horizontal", 
      decorative = true, 
      variant,
      size,
      contentPosition,
      withLabel = false,
      gradient,
      label,
      labelClassName,
      ...props 
    },
    ref
  ) => (
    <div className={cn(
      contentPosition !== "none" || withLabel ? "relative flex items-center w-full" : "",
      orientation === "vertical" ? "flex-col h-full" : ""
    )}>
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        className={cn(
          separatorVariants({ 
            variant, 
            size, 
            orientation,
            contentPosition,
            withLabel,
            gradient,
          }),
          className
        )}
        {...props}
      />
      {withLabel && label && (
        <div 
          className={cn(
            "absolute px-2 text-xs text-gray-500 bg-background",
            contentPosition === "center" ? "left-1/2 -translate-x-1/2" : 
            contentPosition === "left" ? "left-0" : 
            contentPosition === "right" ? "right-0" : 
            "left-1/2 -translate-x-1/2",
            labelClassName
          )}
        >
          {label}
        </div>
      )}
    </div>
  )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
