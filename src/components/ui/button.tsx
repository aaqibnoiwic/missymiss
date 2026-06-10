"use client";

import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button-variants";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  pendingLabel?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, disabled, pendingLabel, type, variant, size, ...props }, ref) => {
    const { pending } = useFormStatus();
    const isPending = pending && type === "submit";

    return (
      <button
        ref={ref}
        aria-busy={isPending}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isPending}
        type={type}
        {...props}
      >
        {isPending ? <LoaderCircle className="size-4 animate-spin" /> : null}
        {isPending ? pendingLabel || "Please wait..." : children}
      </button>
    );
  },
);

Button.displayName = "Button";
