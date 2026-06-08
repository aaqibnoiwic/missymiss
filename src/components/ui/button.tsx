import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gold-deep)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,var(--color-gold),var(--color-gold-deep))] px-6 text-[color:var(--color-charcoal)] shadow-[0_14px_35px_rgba(200,155,60,0.25)] hover:brightness-105",
        outline:
          "border border-[color:var(--color-border-strong)] bg-white/80 px-6 text-[color:var(--color-charcoal)] hover:bg-[color:var(--color-paper)]",
        ghost:
          "px-2 text-[color:var(--color-charcoal)] hover:text-[color:var(--color-gold-deep)]",
      },
      size: {
        default: "h-11",
        lg: "h-[3.25rem] px-7 text-sm",
        sm: "h-9 px-4 text-xs",
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
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  ),
);

Button.displayName = "Button";
