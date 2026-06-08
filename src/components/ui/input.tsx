import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-12 w-full rounded-2xl border border-[color:var(--color-border-strong)] bg-white px-4 text-sm text-[color:var(--color-charcoal)] outline-none transition placeholder:text-[color:var(--color-muted-foreground)] focus:border-[color:var(--color-gold-deep)] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";
