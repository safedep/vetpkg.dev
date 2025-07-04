import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-code",
  {
    variants: {
      variant: {
        default:
          "btn-primary text-white shadow-dev hover:shadow-dev-lg hover:scale-[1.02] active:scale-100",
        destructive:
          "bg-status-error text-white shadow-dev-sm hover:bg-status-error/90 hover:shadow-dev",
        outline:
          "border border-surface-border bg-surface text-interactive shadow-dev-sm hover:bg-interactive-hover hover:text-interactive-text-hover hover:shadow-dev hover:scale-[1.02]",
        secondary:
          "bg-surface text-interactive shadow-dev-sm hover:bg-interactive-hover hover:text-interactive-text-hover hover:shadow-dev hover:scale-[1.02]",
        ghost:
          "text-interactive hover:bg-interactive-hover hover:text-interactive-text-hover transition-all hover:scale-105",
        link: "text-accent underline-offset-4 hover:underline hover:text-accent-hover",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
