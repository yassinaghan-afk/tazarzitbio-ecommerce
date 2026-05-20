"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Edit2,
  Eye,
  EyeOff,
  Plus,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";

import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import {
  createEmptyProduct,
  type CmsProductRecord,
} from "@/lib/admin/product-types";
import { cn } from "@/lib/utils";

function badgeClass(badge: string) {
  switch (badge) {
    case "bestseller":
      return "bg-amber-100 text-amber-800";
    case "new":
      return "bg-blue-100 text-blue-800";
    case "natural":
      return "bg-green-100 text-green-800";
    case "limited":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function lowestPrice(product: CmsProductRecord): number {
  if (!product.offers.length) return 0;
  return Math.min(...product.offers.map((o) => o.salePrice));
}

export function ProductsManager() {
  const [products, setProducts] = useState<CmsProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CmsProductRecord | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const data = (await res.json()) as { products: CmsProductRecord[] };
      setProducts(data.products ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const startAdd = () => {
    setEditing(createEmptyProduct());
    setIsNew(true);
    setMessage(null);
  };

  const startEdit = (product: CmsProductRecord) => {
    setEditing({ ...product });
    setIsNew(product.source === "custom" && !product.nameAr);
    setMessage(null);
  };

  const saveProduct = async () => {
    if (!editing) return;
    if (!editing.nameAr.trim() || !editing.slug.trim()) {
      setMessage("Product name (Arabic) and slug are required.");
      return;
    }
    if (!editing.offers.length) {
      setMessage("Add at least one variant.");
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setMessage(err.error ?? "Failed to save product.");
        return;
      }
      setMessage("Product saved successfully.");
      setEditing(null);
      setIsNew(false);
      await loadProducts();
      window.dispatchEvent(new Event("tazarzit-catalog-updated"));
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: CmsProductRecord) => {
    const label =
      product.source === "custom"
        ? "Permanently delete this product?"
        : "Hide this catalog product from the storefront?";
    if (!confirm(label)) return;

    setBusyId(product.id);
    try {
      await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`, {
        method: "DELETE",
      });
      await loadProducts();
      window.dispatchEvent(new Event("tazarzit-catalog-updated"));
    } finally {
      setBusyId(null);
    }
  };

  const toggleVisibility = async (product: CmsProductRecord) => {
    setBusyId(product.id);
    try {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, isVisible: !product.isVisible }),
      });
      await loadProducts();
      window.dispatchEvent(new Event("tazarzit-catalog-updated"));
    } finally {
      setBusyId(null);
    }
  };

  const toggleFeatured = async (product: CmsProductRecord) => {
    setBusyId(product.id);
    try {
      await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, isFeatured: !product.isFeatured }),
      });
      await loadProducts();
    } finally {
      setBusyId(null);
    }
  };

  const moveProduct = async (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= products.length) return;
    const order = products.map((p) => p.id);
    [order[index], order[next]] = [order[next], order[index]];

    setProducts((prev) => {
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });

    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productOrder: order }),
    });
    window.dispatchEvent(new Event("tazarzit-catalog-updated"));
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/95 p-4 shadow-warm-md backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isNew ? "Add New Product" : "Edit Product"}
            </h2>
            <p className="text-sm text-muted-foreground font-mono">
              {editing.source === "catalog" ? "Catalog product" : "Custom product"} ·{" "}
              {editing.id}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-full gap-2"
              onClick={() => {
                setEditing(null);
                setIsNew(false);
              }}
            >
              <X className="size-4" /> Cancel
            </Button>
            <Button
              variant="gold"
              className="rounded-full gap-2 shadow-gold"
              onClick={saveProduct}
              disabled={saving}
            >
              <Save className="size-4" />
              {saving ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </div>

        {message && (
          <p
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold",
              message.includes("success")
                ? "bg-emerald-50 text-emerald-800"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {message}
          </p>
        )}

        <ProductForm
          product={editing}
          onChange={setEditing}
          isNew={isNew}
        />
      </div>
    );
  }

  const featuredCount = products.filter((p) => p.isFeatured).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Products CMS</h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading..."
              : `${products.length} products · ${featuredCount} featured on homepage`}
          </p>
        </div>
        <Button
          variant="gold"
          className="rounded-full gap-2 shadow-gold"
          onClick={startAdd}
        >
          <Plus className="size-4" />
          Add New Product
        </Button>
      </div>

      {message && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
          {message}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading products...</p>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/60 p-12 text-center">
          <p className="font-semibold text-foreground">No products yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first product with the button above.
          </p>
          <Button
            variant="gold"
            className="mt-4 rounded-full gap-2 shadow-gold"
            onClick={startAdd}
          >
            <Plus className="size-4" /> Add New Product
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => {
            const price = lowestPrice(product);
            const thumb = product.images[0];
            const totalStock = product.offers.reduce((s, o) => s + o.stock, 0);

            return (
              <div
                key={product.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-warm-md sm:flex-nowrap",
                  !product.isVisible && "opacity-55",
                )}
              >
                <div className="flex flex-col gap-0.5 shrink-0">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="size-7 rounded-lg"
                    disabled={index === 0}
                    onClick={() => moveProduct(index, -1)}
                    aria-label="Move up"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="size-7 rounded-lg"
                    disabled={index === products.length - 1}
                    onClick={() => moveProduct(index, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                </div>

                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-secondary/40">
                  {thumb ? (
                    <Image src={thumb} alt="" fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                      No img
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-foreground" dir="rtl">
                      {product.nameAr}
                    </p>
                    {product.nameFr && (
                      <span className="text-xs text-muted-foreground">{product.nameFr}</span>
                    )}
                    {product.isFeatured && (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        <Star className="size-3 fill-current" /> Featured
                      </span>
                    )}
                    {product.source === "custom" && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">
                        custom
                      </span>
                    )}
                    {!product.isVisible && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                        hidden
                      </span>
                    )}
                    {product.badges.map((b) => (
                      <span
                        key={b}
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          badgeClass(b),
                        )}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    /products/{product.slug} · {product.category}
                    {product.isBundle ? " · bundle" : ""}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                    <span className="font-bold text-accent">{price} MAD</span>
                    <span>·</span>
                    <span>{product.offers.length} variant(s)</span>
                    <span>·</span>
                    <span>Stock: {totalStock}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className={cn(
                      "rounded-full",
                      product.isFeatured && "border-amber-300 text-amber-700",
                    )}
                    onClick={() => toggleFeatured(product)}
                    disabled={busyId === product.id}
                    title="Toggle homepage featured"
                  >
                    <Star
                      className={cn("size-4", product.isFeatured && "fill-current")}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-full"
                    onClick={() => toggleVisibility(product)}
                    disabled={busyId === product.id}
                    title={product.isVisible ? "Hide product" : "Show product"}
                  >
                    {product.isVisible ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-full"
                    onClick={() => startEdit(product)}
                    title="Edit product"
                  >
                    <Edit2 className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-full text-destructive hover:text-destructive"
                    onClick={() => deleteProduct(product)}
                    disabled={busyId === product.id}
                    title="Delete / hide product"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
