"use client"

import * as React from "react"
import {
  CaretSortIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const selectTriggerVariants = cva(
  "flex w-full items-center justify-between whitespace-nowrap rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-input shadow-sm focus-visible:ring-1 focus-visible:ring-primary-500",
        outline: "border-gray-200 hover:border-primary-300 focus-visible:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500/20",
        filled: "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-primary-300 focus-visible:border-primary-500 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-primary-500/20",
        ghost: "border-transparent hover:bg-gray-100 focus-visible:bg-white focus-visible:border-primary-300 focus-visible:ring-2 focus-visible:ring-primary-500/20",
        material: "border-b border-t-0 border-l-0 border-r-0 rounded-none border-gray-300 px-1 py-1 hover:border-primary-400 focus-visible:border-primary-500 focus-visible:ring-0",
        glass: "border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 focus-visible:bg-white/30 focus-visible:border-white/40 focus-visible:ring-2 focus-visible:ring-white/20",
      },
      size: {
        default: "h-10",
        sm: "h-8 px-2 py-1 text-xs",
        lg: "h-12 px-4 py-3 text-base",
        xl: "h-14 px-5 py-4 text-lg",
      },
      radius: {
        default: "rounded-md",
        sm: "rounded",
        lg: "rounded-lg",
        none: "rounded-none",
      },
      isError: {
        true: "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500/20",
        false: "",
      },
      isSuccess: {
        true: "border-green-300 focus-visible:border-green-500 focus-visible:ring-green-500/20",
        false: "",
      },
      width: {
        auto: "w-auto",
        full: "w-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "default",
      isError: false,
      isSuccess: false,
      width: "full",
    },
  }
)

export interface SelectTriggerProps 
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {
  iconClassName?: string;
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ 
  className, 
  children, 
  variant,
  size,
  radius,
  isError,
  isSuccess,
  width,
  iconClassName,
  ...props 
}, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      selectTriggerVariants({ 
        variant, 
        size, 
        radius, 
        isError, 
        isSuccess,
        width
      }),
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <CaretSortIcon className={cn(
        "h-4 w-4 opacity-50 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180",
        iconClassName
      )} />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1 text-primary-600 hover:text-primary-700",
      className
    )}
    {...props}
  >
    <ChevronUpIcon className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1 text-primary-600 hover:text-primary-700",
      className
    )}
    {...props}
  >
    <ChevronDownIcon className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const selectContentVariants = cva(
  "relative z-50 max-h-96 min-w-[8rem] overflow-hidden border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-white",
        glass: "bg-white/90 backdrop-blur-md border-white/20",
        minimal: "bg-white border-gray-200 shadow-xl",
        elevated: "bg-white border-gray-100 shadow-xl",
        floating: "bg-white border-none shadow-2xl",
      },
      radius: {
        default: "rounded-md",
        sm: "rounded",
        lg: "rounded-lg",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      radius: "default",
    },
  }
)

export interface SelectContentProps 
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>,
    VariantProps<typeof selectContentVariants> {}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(({ className, children, position = "popper", variant, radius, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        selectContentVariants({ variant, radius }),
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-medium text-dark-600", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const selectItemVariants = cva(
  "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "focus:bg-gray-100 focus:text-dark-800 hover:bg-gray-50",
        primary: "focus:bg-primary-100 focus:text-primary-800 hover:bg-primary-50",
        secondary: "focus:bg-secondary-100 focus:text-secondary-800 hover:bg-secondary-50",
        accent: "focus:bg-accent-100 focus:text-accent-800 hover:bg-accent-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface SelectItemProps 
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>,
    VariantProps<typeof selectItemVariants> {
  indicatorClassName?: string;
}

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  SelectItemProps
>(({ className, children, variant, indicatorClassName, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      selectItemVariants({ variant }),
      className
    )}
    {...props}
  >
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className={cn(
          "h-4 w-4 text-primary-600",
          indicatorClassName
        )} />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
