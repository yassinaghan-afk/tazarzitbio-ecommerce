"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
}: QuantitySelectorProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="تقليل الكمية"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="size-4" />
      </Button>
      <span className="min-w-[2rem] text-center text-base font-bold tabular-nums">
        {value}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="زيادة الكمية"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
