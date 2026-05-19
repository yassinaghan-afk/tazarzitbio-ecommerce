import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary",
        gold:    "border-transparent bg-accent/15 text-accent-foreground",
        olive:   "border-transparent bg-primary/10 text-primary",
        sand:    "border-border bg-sand/60 text-foreground",
        outline: "border-border bg-transparent text-foreground",
        success: "border-transparent bg-emerald-50 text-emerald-700",
        premium: [
          "border border-accent/30",
          "bg-gradient-to-r from-accent/10 to-accent/5",
          "text-accent-foreground",
        ].join(" "),
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
