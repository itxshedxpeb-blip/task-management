import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg min-h-[48px]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 min-h-[48px]",
        outline:
          "border-2 border-input bg-background shadow-sm hover:bg-accent hover:border-ring/50 min-h-[48px]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 min-h-[48px]",
        ghost: "hover:bg-accent/50 min-h-[48px]",
        link: "text-primary underline-offset-4 hover:underline min-h-[48px]",
        fab: "h-14 w-14 rounded-full shadow-lg hover:shadow-xl min-h-[56px]",
      },
      size: {
        default: "h-12 px-5 py-3 min-h-[48px]",
        sm: "h-10 rounded-lg px-4 text-xs min-h-[40px]",
        lg: "h-14 rounded-xl px-8 min-h-[56px]",
        icon: "h-12 w-12 min-h-[48px]",
        "icon-sm": "h-10 w-10 min-h-[40px]",
        "icon-lg": "h-14 w-14 min-h-[56px]",
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
