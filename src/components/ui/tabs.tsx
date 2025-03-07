"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const tabsListVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-muted rounded-md",
        outline: "border border-gray-200 rounded-md bg-transparent",
        pills: "bg-transparent gap-1",
        underline: "bg-transparent border-b border-gray-200 rounded-none w-full",
        cards: "bg-transparent gap-2",
        minimal: "bg-transparent",
      },
      size: {
        default: "h-9",
        sm: "h-8 text-xs",
        lg: "h-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TabsListProps 
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      tabsListVariants({ variant, size }),
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "data-[state=active]:bg-white data-[state=active]:text-primary-800 data-[state=active]:shadow-sm rounded-md text-dark-500",
        outline: "data-[state=active]:bg-white data-[state=active]:text-primary-800 data-[state=active]:border-primary-200 data-[state=active]:border-b-0 border border-transparent rounded-t-md text-dark-500",
        pills: "data-[state=active]:bg-primary-600 data-[state=active]:text-white rounded-md text-dark-500 hover:bg-gray-100 data-[state=active]:hover:bg-primary-700",
        underline: "data-[state=active]:border-b-2 data-[state=active]:border-primary-600 data-[state=active]:text-primary-800 rounded-none pb-2 text-dark-500",
        cards: "data-[state=active]:bg-white data-[state=active]:text-primary-800 data-[state=active]:shadow-md data-[state=active]:scale-105 rounded-md text-dark-500 hover:bg-gray-100 data-[state=active]:hover:bg-white px-4 py-2",
        minimal: "data-[state=active]:text-primary-700 data-[state=active]:font-semibold rounded-md text-dark-500",
      },
      size: {
        default: "h-8 px-3 py-1",
        sm: "h-7 px-2 py-0.5 text-xs",
        lg: "h-9 px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default", 
    },
  }
)

export interface TabsTriggerProps 
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof tabsTriggerVariants> {}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      tabsTriggerVariants({ variant, size }),
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const tabsContentVariants = cva(
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 transition-opacity",
  {
    variants: {
      variant: {
        default: "mt-2",
        outline: "p-4 border border-gray-200 rounded-b-md -mt-px",
        pills: "mt-3",
        underline: "mt-3",
        cards: "mt-3",
        minimal: "mt-2",
      },
      animated: {
        true: "data-[state=inactive]:opacity-0 data-[state=active]:animate-fade-in",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      animated: true,
    },
  }
)

export interface TabsContentProps 
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>,
    VariantProps<typeof tabsContentVariants> {}

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, variant, animated, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      tabsContentVariants({ variant, animated }),
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
