import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, type = "text", ...props }, ref) => (
    <div className="w-full">
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl border bg-card/80 px-4 text-sm text-foreground",
          "placeholder:text-muted-foreground/70",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          error
            ? "border-destructive/60 focus-visible:ring-destructive/40"
            : "border-border hover:border-accent/30",
          className,
        )}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  ),
);
Input.displayName = "Input";

export { Input };
