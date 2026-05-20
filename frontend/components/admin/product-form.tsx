"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";

import { VariantEditor } from "@/components/admin/variant-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CMS_BADGES,
  CMS_CATEGORIES,
  slugify,
  type CmsProductRecord,
} from "@/lib/admin/product-types";
import { cn } from "@/lib/utils";

function splitLines(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function joinLines(items: string[]): string {
  return items.join("\n");
}

interface ProductFormProps {
  product: CmsProductRecord;
  onChange: (product: CmsProductRecord) => void;
  isNew?: boolean;
}

export function ProductForm({ product, onChange, isNew }: ProductFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const patch = (updates: Partial<CmsProductRecord>) => {
    onChange({ ...product, ...updates });
  };

  const toggleBadge = (badge: (typeof CMS_BADGES)[number]["id"]) => {
    const badges = product.badges.includes(badge)
      ? product.badges.filter((b) => b !== badge)
      : [...product.badges, badge];
    patch({ badges });
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Upload failed");
        return;
      }
      patch({ images: [...product.images, data.url] });
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = (url: string) => {
    if (!url.trim()) return;
    patch({ images: [...product.images, url.trim()] });
  };

  const removeImage = (index: number) => {
    patch({ images: product.images.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <section className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
          Basic Information
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Product Name (Arabic) *</Label>
            <Input
              value={product.nameAr}
              onChange={(e) => {
                const nameAr = e.target.value;
                const updates: Partial<CmsProductRecord> = { nameAr };
                if (isNew && !product.slug) {
                  updates.slug = slugify(product.nameFr || nameAr);
                }
                patch(updates);
              }}
              dir="rtl"
              placeholder="أملو باللوز"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Product Name (French)</Label>
            <Input
              value={product.nameFr ?? ""}
              onChange={(e) => {
                const nameFr = e.target.value;
                const updates: Partial<CmsProductRecord> = { nameFr };
                if (isNew && !product.slug) {
                  updates.slug = slugify(nameFr || product.nameAr);
                }
                patch(updates);
              }}
              placeholder="Amlou aux amandes"
            />
          </div>
          <div className="space-y-1.5">
            <Label>URL Slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/products/</span>
              <Input
                value={product.slug}
                onChange={(e) => patch({ slug: slugify(e.target.value) })}
                className="font-mono"
                placeholder="almond-amlou"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <select
              value={product.category}
              onChange={(e) =>
                patch({
                  category: e.target.value as CmsProductRecord["category"],
                })
              }
              className="h-10 w-full rounded-xl border border-border bg-card/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {CMS_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Short Description (Arabic)</Label>
          <Textarea
            value={product.shortDescription}
            onChange={(e) => patch({ shortDescription: e.target.value })}
            dir="rtl"
            rows={2}
            placeholder="وصف قصير يظهر في بطاقة المنتج..."
          />
        </div>
        <div className="space-y-1.5">
          <Label>Long Description (Arabic)</Label>
          <Textarea
            value={product.description}
            onChange={(e) => patch({ description: e.target.value })}
            dir="rtl"
            rows={4}
            placeholder="وصف تفصيلي لصفحة المنتج..."
          />
        </div>
      </section>

      {/* Toggles & Badges */}
      <section className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
          Visibility & Flags
        </h3>
        <div className="flex flex-wrap gap-4">
          {[
            { key: "isVisible" as const, label: "Visible on storefront" },
            { key: "isFeatured" as const, label: "Featured on homepage" },
            { key: "isBestseller" as const, label: "Bestseller" },
            { key: "isBundle" as const, label: "Bundle / Pack (free shipping)" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-border/50 bg-secondary/20 px-4 py-2.5 text-sm font-medium"
            >
              <input
                type="checkbox"
                checked={product[key]}
                onChange={(e) => patch({ [key]: e.target.checked })}
                className="size-4 rounded accent-accent"
              />
              {label}
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <Label>Product Badges</Label>
          <div className="flex flex-wrap gap-2">
            {CMS_BADGES.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => toggleBadge(b.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold border transition-all",
                  product.badges.includes(b.id)
                    ? "border-accent bg-accent/15 text-foreground"
                    : "border-border/60 text-muted-foreground opacity-60 hover:opacity-100",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content lists */}
      <section className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
          Content Details
        </h3>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Ingredients (one per line)</Label>
            <Textarea
              value={joinLines(product.ingredients)}
              onChange={(e) => patch({ ingredients: splitLines(e.target.value) })}
              dir="rtl"
              rows={4}
              placeholder={"لوز محلي\nعسل طبيعي\nزيت أركان"}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Benefits (one per line)</Label>
            <Textarea
              value={joinLines(product.benefits)}
              onChange={(e) => patch({ benefits: splitLines(e.target.value) })}
              dir="rtl"
              rows={4}
              placeholder={"طعم غني\nمثالي للفطور"}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Usage Suggestions (one per line)</Label>
            <Textarea
              value={joinLines(product.usageSuggestions)}
              onChange={(e) =>
                patch({ usageSuggestions: splitLines(e.target.value) })
              }
              dir="rtl"
              rows={4}
              placeholder={"مع الفطور\nمع الشاي المغربي"}
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
          Product Images
        </h3>

        {product.images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {product.images.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative size-24 overflow-hidden rounded-xl border border-border/60 bg-secondary/30"
              >
                <Image src={src} alt="" fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
                  aria-label="Remove image"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-end gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadImage(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="rounded-full gap-2"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ImagePlus className="size-4" />
            )}
            Upload Image
          </Button>
          <div className="flex flex-1 min-w-[200px] items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Or paste image URL</Label>
              <Input
                id="image-url-input"
                placeholder="/images/products/..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImageUrl((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="rounded-full shrink-0"
              onClick={() => {
                const input = document.getElementById(
                  "image-url-input",
                ) as HTMLInputElement | null;
                if (input) {
                  addImageUrl(input.value);
                  input.value = "";
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
        {uploadError && (
          <p className="text-sm font-medium text-destructive">{uploadError}</p>
        )}
      </section>

      {/* Variants */}
      <section className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md">
        <VariantEditor
          productId={product.id}
          variants={product.offers}
          onChange={(offers) => patch({ offers })}
        />
      </section>

      {/* SEO */}
      <section className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">SEO</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <Label>SEO Title</Label>
            <Input
              value={product.seoTitle ?? ""}
              onChange={(e) => patch({ seoTitle: e.target.value })}
              placeholder={product.nameAr || "Product title for search engines"}
            />
          </div>
          <div className="space-y-1.5 lg:col-span-2">
            <Label>SEO Description</Label>
            <Textarea
              value={product.seoDescription ?? ""}
              onChange={(e) => patch({ seoDescription: e.target.value })}
              rows={2}
              placeholder="Meta description for Google and social sharing..."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
