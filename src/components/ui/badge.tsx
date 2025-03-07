import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border px-2.5 py-0.5 text-xs font-medium transition-all gap-1",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-600 text-white shadow hover:bg-primary-700",
        secondary:
          "border-transparent bg-secondary-500 text-white hover:bg-secondary-600",
        accent:
          "border-transparent bg-accent-600 text-white hover:bg-accent-700",
        destructive:
          "border-transparent bg-red-500 text-white shadow hover:bg-red-600",
        success:
          "border-transparent bg-green-500 text-white shadow hover:bg-green-600",
        warning:
          "border-transparent bg-yellow-500 text-white shadow hover:bg-yellow-600",
        info:
          "border-transparent bg-blue-500 text-white shadow hover:bg-blue-600",
        outline: "border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50",
        "outline-primary": "border-primary-200 text-primary-700 hover:border-primary-300 hover:bg-primary-50",
        "outline-secondary": "border-secondary-200 text-secondary-700 hover:border-secondary-300 hover:bg-secondary-50",
        "outline-accent": "border-accent-200 text-accent-700 hover:border-accent-300 hover:bg-accent-50",
        ghost: "border-transparent bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700",
        subtle: "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200",
        "subtle-primary": "border-transparent bg-primary-100/70 text-primary-700 hover:bg-primary-100",
        "subtle-secondary": "border-transparent bg-secondary-100/70 text-secondary-700 hover:bg-secondary-100",
        "subtle-accent": "border-transparent bg-accent-100/70 text-accent-700 hover:bg-accent-100",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-3 py-1 text-sm",
      },
      rounded: {
        default: "rounded-md",
        sm: "rounded",
        full: "rounded-full",
      },
      withDot: {
        true: "pl-2",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
      withDot: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dotColor?: string;
}

function Badge({ className, variant, size, rounded, withDot, dotColor, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, rounded, withDot }), className)} {...props}>
      {withDot && (
        <span 
          className={cn(
            "w-1.5 h-1.5 rounded-full mr-1", 
            dotColor || (
              variant === "outline" ? "bg-gray-500" :
              variant === "outline-primary" ? "bg-primary-500" :
              variant === "outline-secondary" ? "bg-secondary-500" :
              variant === "outline-accent" ? "bg-accent-500" :
              variant === "subtle" ? "bg-gray-500" :
              variant === "subtle-primary" ? "bg-primary-500" :
              variant === "subtle-secondary" ? "bg-secondary-500" :
              variant === "subtle-accent" ? "bg-accent-500" :
              variant === "secondary" ? "bg-white" :
              variant === "accent" ? "bg-white" :
              variant === "destructive" ? "bg-white" :
              variant === "success" ? "bg-white" :
              variant === "warning" ? "bg-white" :
              variant === "info" ? "bg-white" :
              variant === "ghost" ? "bg-gray-500" :
              "bg-white"
            )
          )} 
        />
      )}
      {props.children}
    </div>
  )
}

export { Badge, badgeVariants }
