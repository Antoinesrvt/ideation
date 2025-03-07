"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-white border border-gray-200",
        primary: "bg-primary-100 border border-primary-200",
        secondary: "bg-secondary-100 border border-secondary-200",
        accent: "bg-accent-100 border border-accent-200",
        outline: "bg-white border-2 border-primary-300",
        glass: "bg-white/40 backdrop-blur-sm border-white/20",
        gradient: "bg-gradient-to-br from-primary-100 to-primary-50 border border-primary-200",
      },
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        default: "h-10 w-10",
        lg: "h-12 w-12 text-lg",
        xl: "h-16 w-16 text-xl",
        '2xl': "h-24 w-24 text-2xl",
      },
      shape: {
        default: "rounded-full",
        square: "rounded-md",
        squircle: "rounded-xl",
      },
      border: {
        none: "",
        thin: "border",
        thick: "border-2",
      },
      shadow: {
        none: "",
        sm: "shadow-sm",
        default: "shadow",
        md: "shadow-md",
        lg: "shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
      border: "thin",
      shadow: "none",
    }
  }
)

export interface AvatarProps 
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, variant, size, shape, border, shadow, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      avatarVariants({ variant, size, shape, border, shadow }),
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const fallbackVariants = cva(
  "flex h-full w-full items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-600",
        primary: "bg-primary-100 text-primary-700",
        secondary: "bg-secondary-100 text-secondary-700",
        accent: "bg-accent-100 text-accent-700",
        outline: "bg-white text-primary-700",
        glass: "bg-white/40 text-dark-700 backdrop-blur-sm",
        gradient: "bg-gradient-to-br from-primary-100 to-primary-50 text-primary-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>,
    Pick<VariantProps<typeof fallbackVariants>, "variant"> {}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, variant, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      fallbackVariants({ variant }),
      "font-medium",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
