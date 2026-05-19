import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[88px] w-full resize-y rounded-xl border bg-card/80 px-4 py-3 text-sm text-foreground",
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
Textarea.displayName = "Textarea";

export { Textarea };
