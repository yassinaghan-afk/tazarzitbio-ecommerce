"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold",
    "transition-all duration-200 ease-out cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Deep olive — primary UI actions */
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]",

        /** Argan gold — hero CTA, conversion */
        gold:
          "bg-gold-gradient text-foreground shadow-gold ring-1 ring-amber-900/10 hover:brightness-105 hover:shadow-warm-lg active:scale-[0.98]",

        /** Outlined — secondary */
        outline:
          "border border-foreground/12 bg-card/40 text-foreground backdrop-blur-sm hover:border-accent/30 hover:bg-card/80 active:scale-[0.98]",

        /** Ghost — low emphasis */
        ghost:
          "bg-transparent text-foreground hover:bg-secondary active:scale-[0.98]",

        /** Destructive */
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98]",

        /** Light — on dark backgrounds */
        light:
          "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm active:scale-[0.98]",

        /** Link style */
        link: "text-accent underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        xs:      "h-8  px-3 text-xs rounded-md",
        sm:      "h-9  px-4 text-sm rounded-md",
        default: "h-11 px-5 text-sm rounded-lg",
        lg:      "h-12 px-7 text-base rounded-lg",
        xl:      "h-14 px-9 text-lg rounded-xl",
        icon:    "h-10 w-10 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
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
