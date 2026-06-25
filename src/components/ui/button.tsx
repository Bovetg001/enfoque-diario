import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 select-none active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 shadow-sm",
        secondary:
          "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:opacity-80",
        outline:
          "border border-[var(--border)] bg-transparent hover:bg-[var(--muted)] text-[var(--foreground)]",
        ghost:
          "hover:bg-[var(--muted)] text-[var(--foreground)]",
        destructive:
          "bg-[var(--error)] text-white hover:opacity-90",
        success:
          "bg-[var(--success)] text-white hover:opacity-90",
        link:
          "text-[var(--primary)] underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3 text-xs",
        lg: "h-14 px-7 text-base",
        xl: "h-16 px-8 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
