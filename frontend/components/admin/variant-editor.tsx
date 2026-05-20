"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createEmptyVariant,
  PRESET_VARIANTS,
  type CmsProductVariant,
} from "@/lib/admin/product-types";
import { buildPricingEconomics } from "@/lib/products/pricing";

interface VariantEditorProps {
  productId: string;
  variants: CmsProductVariant[];
  onChange: (variants: CmsProductVariant[]) => void;
}

export function VariantEditor({ productId, variants, onChange }: VariantEditorProps) {
  const updateVariant = (index: number, patch: Partial<CmsProductVariant>) => {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) return;
    onChange(variants.filter((_, i) => i !== index));
  };

  const addPreset = (label: string, weight: string) => {
    if (variants.some((v) => v.label === label)) return;
    onChange([
      ...variants,
      createEmptyVariant(productId, label, weight, variants.length),
    ]);
  };

  const addCustom = () => {
    onChange([
      ...variants,
      createEmptyVariant(productId, "Custom", "—", variants.length),
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-sm font-bold">Variants & Pricing</Label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_VARIANTS.map((p) => (
            <Button
              key={p.label}
              type="button"
              variant="outline"
              size="sm"
              className="h-7 rounded-full text-xs"
              onClick={() => addPreset(p.label, p.weight)}
              disabled={variants.some((v) => v.label === p.label)}
            >
              + {p.label}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 rounded-full text-xs gap-1"
            onClick={addCustom}
          >
            <Plus className="size-3" /> Custom
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {variants.map((variant, index) => {
          const economics = buildPricingEconomics({
            costPrice: variant.costPrice,
            salePrice: variant.salePrice,
          });

          return (
            <div
              key={variant.id}
              className="rounded-2xl border border-border/60 bg-secondary/20 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Label</Label>
                    <Input
                      value={variant.label}
                      onChange={(e) => updateVariant(index, { label: e.target.value })}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Weight (display)</Label>
                    <Input
                      value={variant.weight}
                      onChange={(e) => updateVariant(index, { weight: e.target.value })}
                      className="h-9"
                      dir="rtl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SKU</Label>
                    <Input
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, { sku: e.target.value })}
                      className="h-9 font-mono text-xs"
                      placeholder="AML-ALM-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Stock</Label>
                    <Input
                      type="number"
                      min={0}
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(index, { stock: Number(e.target.value) || 0 })
                      }
                      className="h-9"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="shrink-0 rounded-full text-destructive hover:text-destructive"
                  onClick={() => removeVariant(index)}
                  disabled={variants.length <= 1}
                  aria-label="Remove variant"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-xs">Sale Price (MAD)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    value={variant.salePrice}
                    onChange={(e) =>
                      updateVariant(index, { salePrice: Number(e.target.value) || 0 })
                    }
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cost Price (MAD)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.5}
                    value={variant.costPrice}
                    onChange={(e) =>
                      updateVariant(index, { costPrice: Number(e.target.value) || 0 })
                    }
                    className="h-9"
                  />
                </div>
                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-emerald-700">
                    Gross Profit
                  </p>
                  <p className="text-lg font-extrabold tabular-nums text-emerald-800">
                    {economics.grossProfit} MAD
                  </p>
                </div>
                <div className="rounded-xl bg-accent/10 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase text-accent">
                    Net Est. / Margin
                  </p>
                  <p className="text-lg font-extrabold tabular-nums text-foreground">
                    {economics.estimatedNetProfit} MAD
                    <span className="ml-1 text-xs font-semibold text-muted-foreground">
                      ({economics.profitMarginPercent}%)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
