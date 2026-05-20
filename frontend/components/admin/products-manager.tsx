"use client";

import { useEffect, useState } from "react";
import { Edit2, Eye, EyeOff, Package, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminProductData } from "@/lib/admin/types";
import { buildCatalog } from "@/lib/products";
import { cn } from "@/lib/utils";

type ProductRow = {
  id: string;
  nameAr: string;
  slug: string;
  category: string;
  offers: { id: string; label: string; sku: string; salePrice: number; costPrice: number }[];
  isVisible: boolean;
  isBundle: boolean;
  badges: string[];
};

function buildProductRows(): ProductRow[] {
  const catalog = buildCatalog();
  const seenIds = new Set<string>();
  const rows: ProductRow[] = [];
  for (const product of catalog) {
    if (seenIds.has(product.id)) continue;
    seenIds.add(product.id);
    rows.push({
      id: product.id,
      nameAr: product.nameAr,
      slug: product.slug,
      category: product.category,
      offers: product.offers.map((o) => ({
        id: o.id,
        label: o.label,
        sku: o.sku,
        salePrice: o.economics.salePrice,
        costPrice: o.economics.costPrice,
      })),
      isVisible: true,
      isBundle: product.badges.includes("bestseller") ? false : false,
      badges: product.badges,
    });
  }
  return rows;
}

function badgeColor(badge: string) {
  switch (badge) {
    case "bestseller": return "bg-amber-100 text-amber-800";
    case "new": return "bg-blue-100 text-blue-800";
    case "natural": return "bg-green-100 text-green-800";
    case "limited": return "bg-rose-100 text-rose-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

type EditState = {
  id: string;
  nameAr: string;
  slug: string;
  shortDescription: string;
  description: string;
  isVisible: boolean;
  isBundle: boolean;
  badges: string[];
  ingredients: string;
  benefits: string;
  variantEdits: { id: string; label: string; salePrice: number; costPrice: number; stock: number }[];
};

export function ProductsManager() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [overrides, setOverrides] = useState<AdminProductData[]>([]);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const rows = buildProductRows();
    setProducts(rows);
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d: { productOverrides: AdminProductData[] }) => {
        setOverrides(d.productOverrides ?? []);
      })
      .catch(() => null);
  }, []);

  const getOverride = (id: string) => overrides.find((o) => o.id === id);

  const startEdit = (p: ProductRow) => {
    const override = getOverride(p.id);
    setEditing({
      id: p.id,
      nameAr: override?.nameAr ?? p.nameAr,
      slug: override?.slug ?? p.slug,
      shortDescription: override?.shortDescription ?? "",
      description: override?.description ?? "",
      isVisible: override?.isVisible ?? true,
      isBundle: override?.isBundle ?? false,
      badges: override?.badges ?? p.badges,
      ingredients: (override?.ingredients ?? []).join(", "),
      benefits: (override?.benefits ?? []).join(", "),
      variantEdits: p.offers.map((o) => {
        const vOv = override?.variantOverrides?.find((v) => v.id === o.id);
        return {
          id: o.id,
          label: vOv?.label ?? o.label,
          salePrice: vOv?.salePrice ?? o.salePrice,
          costPrice: vOv?.costPrice ?? o.costPrice,
          stock: vOv?.stock ?? 0,
        };
      }),
    });
    setSaved(false);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: AdminProductData = {
        id: editing.id,
        nameAr: editing.nameAr,
        slug: editing.slug,
        shortDescription: editing.shortDescription,
        description: editing.description,
        isVisible: editing.isVisible,
        isBundle: editing.isBundle,
        badges: editing.badges,
        ingredients: editing.ingredients.split(",").map((s) => s.trim()).filter(Boolean),
        benefits: editing.benefits.split(",").map((s) => s.trim()).filter(Boolean),
        variantOverrides: editing.variantEdits.map((v) => ({
          id: v.id,
          label: v.label,
          salePrice: v.salePrice,
          costPrice: v.costPrice,
          stock: v.stock,
        })),
      };
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { productOverrides: AdminProductData[] };
      setOverrides(data.productOverrides ?? []);
      setSaved(true);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (id: string) => {
    const override = getOverride(id);
    const isVisible = !(override?.isVisible ?? true);
    const payload: AdminProductData = { id, isVisible };
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { productOverrides: AdminProductData[] };
    setOverrides(data.productOverrides ?? []);
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-foreground">Edit Product</h2>
            <p className="text-sm text-muted-foreground font-mono">{editing.id}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full gap-2" onClick={() => setEditing(null)}>
              <X className="size-4" /> Cancel
            </Button>
            <Button variant="gold" className="rounded-full gap-2 shadow-gold" onClick={saveEdit} disabled={saving}>
              <Save className="size-4" />
              {saving ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Product Name (Arabic)</Label>
              <Input value={editing.nameAr} onChange={(e) => setEditing((s) => s && ({ ...s, nameAr: e.target.value }))} dir="rtl" />
            </div>
            <div className="space-y-1.5">
              <Label>URL Slug</Label>
              <Input value={editing.slug} onChange={(e) => setEditing((s) => s && ({ ...s, slug: e.target.value }))} className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label>Short Description (Arabic)</Label>
              <Input value={editing.shortDescription} onChange={(e) => setEditing((s) => s && ({ ...s, shortDescription: e.target.value }))} dir="rtl" />
            </div>
            <div className="space-y-1.5">
              <Label>Ingredients (comma-separated, Arabic)</Label>
              <Input value={editing.ingredients} onChange={(e) => setEditing((s) => s && ({ ...s, ingredients: e.target.value }))} dir="rtl" placeholder="لوز محلي, عسل طبيعي, زيت أركان" />
            </div>
            <div className="space-y-1.5">
              <Label>Benefits (comma-separated, Arabic)</Label>
              <Input value={editing.benefits} onChange={(e) => setEditing((s) => s && ({ ...s, benefits: e.target.value }))} dir="rtl" placeholder="طعم غني, مثالي للفطور" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={editing.isVisible}
                  onChange={(e) => setEditing((s) => s && ({ ...s, isVisible: e.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                Visible on storefront
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={editing.isBundle}
                  onChange={(e) => setEditing((s) => s && ({ ...s, isBundle: e.target.checked }))}
                  className="h-4 w-4 rounded"
                />
                Bundle / Pack (free shipping)
              </label>
            </div>

            <div className="space-y-1.5">
              <Label>Badges</Label>
              <div className="flex flex-wrap gap-2">
                {(["bestseller", "new", "natural", "limited"] as const).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() =>
                      setEditing((s) => {
                        if (!s) return s;
                        const badges = s.badges.includes(b)
                          ? s.badges.filter((x) => x !== b)
                          : [...s.badges, b];
                        return { ...s, badges };
                      })
                    }
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold transition-opacity",
                      badgeColor(b),
                      !editing.badges.includes(b) && "opacity-30",
                    )}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Variant Pricing</Label>
              {editing.variantEdits.map((v, i) => (
                <div key={v.id} className="rounded-xl border border-border/50 bg-secondary/20 p-3 space-y-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase">{v.label} — {v.id}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Sale Price</Label>
                      <Input
                        type="number"
                        step="1"
                        className="h-8 text-sm"
                        value={v.salePrice}
                        onChange={(e) =>
                          setEditing((s) => {
                            if (!s) return s;
                            const variantEdits = s.variantEdits.map((ve, idx) =>
                              idx === i ? { ...ve, salePrice: Number(e.target.value) } : ve
                            );
                            return { ...s, variantEdits };
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Cost Price</Label>
                      <Input
                        type="number"
                        step="0.5"
                        className="h-8 text-sm"
                        value={v.costPrice}
                        onChange={(e) =>
                          setEditing((s) => {
                            if (!s) return s;
                            const variantEdits = s.variantEdits.map((ve, idx) =>
                              idx === i ? { ...ve, costPrice: Number(e.target.value) } : ve
                            );
                            return { ...s, variantEdits };
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Stock</Label>
                      <Input
                        type="number"
                        step="1"
                        className="h-8 text-sm"
                        value={v.stock}
                        onChange={(e) =>
                          setEditing((s) => {
                            if (!s) return s;
                            const variantEdits = s.variantEdits.map((ve, idx) =>
                              idx === i ? { ...ve, stock: Number(e.target.value) } : ve
                            );
                            return { ...s, variantEdits };
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Products</h2>
          <p className="text-sm text-muted-foreground">
            Manage product visibility, pricing, and content.
          </p>
        </div>
      </div>

      {saved && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
          Product saved successfully.
        </p>
      )}

      <div className="space-y-3">
        {products.map((p) => {
          const override = getOverride(p.id);
          const isVisible = override?.isVisible ?? true;
          return (
            <div
              key={p.id}
              className={cn(
                "flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-warm-md",
                !isVisible && "opacity-50",
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50">
                <Package className="size-5 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-foreground" dir="rtl">
                    {override?.nameAr ?? p.nameAr}
                  </p>
                  {p.badges.map((b) => (
                    <span key={b} className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", badgeColor(b))}>
                      {b}
                    </span>
                  ))}
                  {!isVisible && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                      hidden
                    </span>
                  )}
                </div>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  /{p.slug} · {p.category}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.offers.map((o) => (
                    <span key={o.id} className="rounded-lg bg-secondary/60 px-2 py-0.5 text-xs text-muted-foreground">
                      {o.label}: {o.salePrice} MAD
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => toggleVisibility(p.id)}
                  title={isVisible ? "Hide product" : "Show product"}
                >
                  {isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => startEdit(p)}
                  title="Edit product"
                >
                  <Edit2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-dashed border-border/60 p-6 text-center">
        <Package className="mx-auto size-8 text-muted-foreground/40" />
        <p className="mt-2 text-sm font-semibold text-foreground">Add New Product</p>
        <p className="mt-1 text-xs text-muted-foreground">
          New products are defined in the catalog file. Override pricing and visibility here.
        </p>
      </div>
    </div>
  );
}
