import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-xl border transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200 shadow-sm hover:shadow-md",
        elevated: "bg-white border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1",
        gradient: "bg-gradient-to-br from-primary-100 to-white border-primary-200 shadow-md hover:shadow-lg",
        glass: "bg-white/80 backdrop-blur-sm border-white/20 shadow-md hover:shadow-lg",
        outline: "bg-transparent border-2 border-primary-300 shadow-sm",
        feature: "bg-white border-gray-200 shadow-lg rounded-2xl hover:shadow-xl hover:-translate-y-1",
      },
      radius: {
        default: "rounded-lg",
        sm: "rounded-lg",
        lg: "rounded-2xl",
        full: "rounded-3xl",
      },
      animation: {
        none: "",
        hover: "hover:-translate-y-1 hover:shadow-lg",
        pulse: "hover:animate-pulse",
        glow: "after:absolute after:inset-0 after:rounded-xl after:bg-primary-500/5 hover:after:bg-primary-500/10 after:animate-pulse after:z-[-1]",
      }
    },
    defaultVariants: {
      variant: "default",
      radius: "default",
      animation: "none",
    },
  }
)

export interface CardProps 
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  hoverable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, radius, animation, hoverable = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ 
          variant, 
          radius, 
          animation: hoverable ? "hover" : animation 
        }),
        "relative",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-heading font-semibold leading-tight tracking-tight text-primary-800", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-dark-500", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
