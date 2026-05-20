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
  variantId: string;
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
      variants.map((v) => ({
        variantId: v.variantId,
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

  const updateRow = (variantId: string, patch: Partial<RowState>) => {
    setRows((prev) =>
      prev.map((r) => (r.variantId === variantId ? { ...r, ...patch } : r)),
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
    if (!confirm("إعادة جميع الأسعار إلى القيم الافتراضية؟")) return;
    resetPricingOverrides();
    loadRows();
    setSaved(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          هذه البيانات للإدارة فقط — لا تظهر للزوار.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleReset}>
            <RotateCcw className="size-4" />
            إعادة الافتراضي
          </Button>
          <Button variant="gold" className="gap-2 shadow-gold" onClick={handleSave}>
            <Save className="size-4" />
            حفظ التعديلات
          </Button>
        </div>
      </div>

      {saved && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
          تم الحفظ — ستنعكس الأسعار على المتجر فوراً.
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-warm-md">
        <table className="w-full min-w-[960px] text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-start">
              <th className="p-3 font-bold">المنتج</th>
              <th className="p-3 font-bold">الحجم</th>
              <th className="p-3 font-bold">SKU</th>
              <th className="p-3 font-bold">تكلفة</th>
              <th className="p-3 font-bold">سعر البيع</th>
              <th className="p-3 font-bold">توصيل</th>
              <th className="p-3 font-bold">إعلانات</th>
              <th className="p-3 font-bold">ربح إجمالي</th>
              <th className="p-3 font-bold">صافي تقديري</th>
              <th className="p-3 font-bold">هامش %</th>
            </tr>
          </thead>
          <tbody>
            {computed.map((row) => (
              <tr key={row.variantId} className="border-b border-border/50">
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
                      updateRow(row.variantId, {
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
                      updateRow(row.variantId, {
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
                      updateRow(row.variantId, {
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
                      updateRow(row.variantId, {
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
