"use client";

import { useEffect, useState } from "react";
import { Edit2, Eye, Globe, Plus, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LandingPage } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const PRODUCT_SLUGS = [
  "almond-amlou",
  "pistachio-amlou",
  "argan-oil",
  "mixed-nuts-honey",
  "premium-family-pack",
];

function EmptyEdit(): LandingPage {
  return {
    id: "",
    slug: "",
    featuredProductSlug: PRODUCT_SLUGS[0],
    headline: "",
    subheadline: "",
    ctaText: "Order Now",
    sections: [],
    isEnabled: false,
    createdAt: new Date().toISOString(),
  };
}

export function LandingPagesManager() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LandingPage | null>(null);
  const [saving, setSaving] = useState(false);

  const loadPages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/landing-pages");
      const data = (await res.json()) as { landingPages: LandingPage[] };
      setPages(data.landingPages ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPages();
  }, []);

  const savePage = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = (await res.json()) as { landingPages: LandingPage[] };
      setPages(data.landingPages ?? []);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete this landing page?")) return;
    const res = await fetch(`/api/admin/landing-pages?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { landingPages: LandingPage[] };
    setPages(data.landingPages ?? []);
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">
            {editing.id ? "Edit Landing Page" : "New Landing Page"}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full gap-2" onClick={() => setEditing(null)}>
              <X className="size-4" /> Cancel
            </Button>
            <Button variant="gold" className="rounded-full gap-2 shadow-gold" onClick={savePage} disabled={saving}>
              <Save className="size-4" />
              {saving ? "Saving..." : "Save Page"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>URL Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/</span>
                <Input
                  value={editing.slug}
                  onChange={(e) => setEditing((s) => s && { ...s, slug: e.target.value })}
                  placeholder="almond-promo"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Featured Product</Label>
              <select
                value={editing.featuredProductSlug}
                onChange={(e) => setEditing((s) => s && { ...s, featuredProductSlug: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-card/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PRODUCT_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>{slug}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Headline (Arabic)</Label>
              <Input
                value={editing.headline}
                onChange={(e) => setEditing((s) => s && { ...s, headline: e.target.value })}
                dir="rtl"
                placeholder="أملو باللوز الأصيل..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subheadline (Arabic)</Label>
              <Input
                value={editing.subheadline}
                onChange={(e) => setEditing((s) => s && { ...s, subheadline: e.target.value })}
                dir="rtl"
                placeholder="من قلب سوس..."
              />
            </div>
            <div className="space-y-1.5">
              <Label>CTA Button Text</Label>
              <Input
                value={editing.ctaText}
                onChange={(e) => setEditing((s) => s && { ...s, ctaText: e.target.value })}
                placeholder="اطلب الآن"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={editing.isEnabled}
                  onChange={(e) => setEditing((s) => s && { ...s, isEnabled: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                Page is live / enabled
              </label>
            </div>

            {editing.slug && (
              <div className="rounded-xl bg-secondary/30 p-4">
                <p className="text-xs font-bold text-muted-foreground">Preview URL</p>
                <p className="mt-1 font-mono text-sm text-foreground">/{editing.slug}</p>
                <Button
                  variant="outline"
                  className="mt-3 rounded-full gap-2 text-xs"
                  onClick={() => window.open(`/${editing.slug}`, "_blank")}
                >
                  <Eye className="size-3.5" /> Open Preview
                </Button>
              </div>
            )}

            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-800">Sections</p>
              <p className="mt-1 text-xs text-amber-700">
                Custom sections (hero, features, reviews, FAQ, CTA) will be configurable in the next version. 
                Currently the featured product page is used as the landing page.
              </p>
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
          <h2 className="text-xl font-bold text-foreground">Landing Pages</h2>
          <p className="text-sm text-muted-foreground">
            Create custom promotional landing pages.
          </p>
        </div>
        <Button
          variant="gold"
          className="rounded-full gap-2 shadow-gold"
          onClick={() => setEditing(EmptyEdit())}
        >
          <Plus className="size-4" /> New Page
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : pages.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/60 p-10 text-center">
          <Globe className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 font-semibold text-foreground">No landing pages yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a custom page for a product promotion or campaign.
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-full gap-2"
            onClick={() => setEditing(EmptyEdit())}
          >
            <Plus className="size-4" /> Create First Page
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page.id}
              className={cn(
                "flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-warm-md",
                !page.isEnabled && "opacity-60",
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50">
                <Globe className="size-5 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-foreground font-mono">/{page.slug}</p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      page.isEnabled
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-gray-100 text-gray-600",
                    )}
                  >
                    {page.isEnabled ? "live" : "draft"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground" dir="rtl">
                  {page.headline || "No headline set"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Product: {page.featuredProductSlug}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => window.open(`/${page.slug}`, "_blank")}
                  title="Preview"
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => setEditing(page)}
                  title="Edit"
                >
                  <Edit2 className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full text-destructive hover:text-destructive"
                  onClick={() => deletePage(page.id)}
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
