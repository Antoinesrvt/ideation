"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-5 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-white text-dark-800",
        primary: "border-primary-200 bg-primary-50/80 text-primary-900",
        secondary: "border-secondary-200 bg-secondary-50/80 text-secondary-900",
        accent: "border-accent-200 bg-accent-50/80 text-accent-900",
        success: "border-green-200 bg-green-50/80 text-green-900",
        warning: "border-yellow-200 bg-yellow-50/80 text-yellow-900",
        destructive: "border-red-200 bg-red-50/80 text-red-900",
        info: "border-blue-200 bg-blue-50/80 text-blue-900",
        glass: "border-white/20 bg-white/80 backdrop-blur-sm text-dark-800",
        elevated: "border-gray-100 bg-white shadow-xl text-dark-800",
        dark: "border-dark-700 bg-dark-800 text-white",
      },
      size: {
        default: "p-5 pr-8",
        sm: "p-4 pr-6 text-sm",
        lg: "p-6 pr-9",
      },
      animation: {
        default: "",
        slide: "animate-in slide-in-from-bottom-5",
        bounce: "animate-bounce",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, size, animation, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant, size, animation }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const toastActionVariants = cva(
  "inline-flex h-8 shrink-0 items-center justify-center rounded-md border font-medium ring-offset-background transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700",
        primary: "border-primary-300 bg-primary-100 hover:bg-primary-200 text-primary-800",
        secondary: "border-secondary-300 bg-secondary-100 hover:bg-secondary-200 text-secondary-800",
        accent: "border-accent-300 bg-accent-100 hover:bg-accent-200 text-accent-800",
        success: "border-green-300 bg-green-100 hover:bg-green-200 text-green-800",
        warning: "border-yellow-300 bg-yellow-100 hover:bg-yellow-200 text-yellow-800",
        destructive: "border-red-300 bg-red-100 hover:bg-red-200 text-red-800",
        glass: "border-white/30 bg-white/40 hover:bg-white/60 backdrop-blur-sm text-dark-800",
        dark: "border-dark-600 bg-dark-700 hover:bg-dark-600 text-white",
      },
      size: {
        default: "h-8 px-3 text-sm",
        sm: "h-7 px-2 text-xs",
        lg: "h-9 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> &
    VariantProps<typeof toastActionVariants>
>(({ className, variant, size, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(toastActionVariants({ variant, size }), className)}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-full p-1.5 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-heading font-medium leading-tight", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90 leading-normal", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
