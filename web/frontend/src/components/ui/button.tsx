import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_rgba(var(--glow-rgb),0.35)] hover:shadow-[0_0_28px_-5px_rgba(var(--glow-rgb),0.45)] transition-all",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-[0_0_16px_-5px_rgba(239,68,68,0.3)] hover:shadow-[0_0_24px_-5px_rgba(239,68,68,0.4)] transition-all",
        outline:
          "border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm hover:bg-[var(--glass-bg-hover)] hover:border-[var(--glass-border-hover)] text-dark-100 hover:shadow-[0_0_12px_-4px_rgba(var(--glow-rgb),0.2)] transition-all",
        secondary:
          "bg-[var(--glass-bg)] backdrop-blur-sm text-secondary-foreground hover:bg-[var(--glass-bg-hover)] border border-[var(--glass-border)] hover:border-[var(--glass-border-hover)] hover:shadow-[0_0_12px_-4px_rgba(var(--glow-rgb),0.15)] transition-all",
        ghost: "hover:bg-[var(--glass-bg)] text-dark-100 transition-all",
        link: "text-primary-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
