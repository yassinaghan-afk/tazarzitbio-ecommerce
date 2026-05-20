"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCcw, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loadPricingOverrides,
  resetPricingOverrides,
  savePricingOverrides,
  type PricingOverrides,
} from "@/lib/products/admin-storage";
import { buildCatalog, getAllVariants } from "@/lib/products";
import { buildPricingEconomics } from "@/lib/products/pricing";

type RowState = {
  rowKey: string;
  variantId: string;
  productId: string;
  productName: string;
  label: string;
  sku: string;
  costPrice: number;
  salePrice: number;
  estimatedDeliveryCost: number;
  estimatedAdsCost: number;
};

export function PricingDashboard() {
  const [rows, setRows] = useState<RowState[]>([]);
  const [saved, setSaved] = useState(false);

  const loadRows = useCallback(() => {
    const overrides = loadPricingOverrides();
    const variants = getAllVariants(buildCatalog(overrides));
    setRows(
      variants.map((v, i) => ({
        rowKey: v.variantId
          ? `${v.productId ?? "p"}-${v.variantId}`
          : `${v.productId ?? "p"}-${v.label ?? ""}-${i}`,
        variantId: v.variantId ?? `${v.productId ?? "p"}-${i}`,
        productId: v.productId ?? "",
        productName: v.productName,
        label: v.label,
        sku: v.sku,
        costPrice: v.economics.costPrice,
        salePrice: v.economics.salePrice,
        estimatedDeliveryCost: v.economics.estimatedDeliveryCost,
        estimatedAdsCost: v.economics.estimatedAdsCost,
      })),
    );
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const computed = useMemo(
    () =>
      rows.map((row) => {
        const e = buildPricingEconomics({
          costPrice: row.costPrice,
          salePrice: row.salePrice,
          estimatedDeliveryCost: row.estimatedDeliveryCost,
          estimatedAdsCost: row.estimatedAdsCost,
        });
        return { ...row, economics: e };
      }),
    [rows],
  );

  const updateRow = (rowKey: string, patch: Partial<RowState>) => {
    setRows((prev) =>
      prev.map((r) => (r.rowKey === rowKey ? { ...r, ...patch } : r)),
    );
    setSaved(false);
  };

  const handleSave = () => {
    const overrides: PricingOverrides = {};
    for (const row of rows) {
      overrides[row.variantId] = {
        costPrice: row.costPrice,
        salePrice: row.salePrice,
        estimatedDeliveryCost: row.estimatedDeliveryCost,
        estimatedAdsCost: row.estimatedAdsCost,
      };
    }
    savePricingOverrides(overrides);
    setSaved(true);
    loadRows();
  };

  const handleReset = () => {
    if (!confirm("Reset all prices to default values?")) return;
    resetPricingOverrides();
    loadRows();
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Internal pricing data — never shown to customers.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleReset}>
            <RotateCcw className="size-4" />
            Reset Defaults
          </Button>
          <Button variant="gold" className="gap-2 shadow-gold" onClick={handleSave}>
            <Save className="size-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {saved && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
          Saved — prices updated successfully.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-warm-md">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-start">
              <th className="p-3 font-bold">Product</th>
              <th className="p-3 font-bold">Size</th>
              <th className="p-3 font-bold">SKU</th>
              <th className="p-3 font-bold">Cost</th>
              <th className="p-3 font-bold">Sale Price</th>
              <th className="p-3 font-bold">Delivery</th>
              <th className="p-3 font-bold">Ads</th>
              <th className="p-3 font-bold">Gross Profit</th>
              <th className="p-3 font-bold">Net (Est.)</th>
              <th className="p-3 font-bold">Margin %</th>
            </tr>
          </thead>
          <tbody>
            {computed.map((row) => (
              <tr key={row.rowKey} className="border-b border-border/50">
                <td className="p-3 font-medium">{row.productName}</td>
                <td className="p-3">{row.label}</td>
                <td className="p-3 font-mono text-xs text-muted-foreground">
                  {row.sku}
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    step="0.5"
                    className="h-9 w-24"
                    value={row.costPrice}
                    onChange={(e) =>
                      updateRow(row.rowKey, {
                        costPrice: Number(e.target.value),
                      })
                    }
                  />
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    step="1"
                    className="h-9 w-24"
                    value={row.salePrice}
                    onChange={(e) =>
                      updateRow(row.rowKey, {
                        salePrice: Number(e.target.value),
                      })
                    }
                  />
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    className="h-9 w-20"
                    value={row.estimatedDeliveryCost}
                    onChange={(e) =>
                      updateRow(row.rowKey, {
                        estimatedDeliveryCost: Number(e.target.value),
                      })
                    }
                  />
                </td>
                <td className="p-3">
                  <Input
                    type="number"
                    className="h-9 w-20"
                    value={row.estimatedAdsCost}
                    onChange={(e) =>
                      updateRow(row.rowKey, {
                        estimatedAdsCost: Number(e.target.value),
                      })
                    }
                  />
                </td>
                <td className="p-3 tabular-nums">{row.economics.grossProfit}</td>
                <td className="p-3 tabular-nums font-semibold text-primary">
                  {row.economics.estimatedNetProfit}
                </td>
                <td className="p-3 tabular-nums">{row.economics.profitMarginPercent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
