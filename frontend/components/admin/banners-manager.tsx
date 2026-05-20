"use client";

import { useEffect, useState } from "react";
import { Edit2, Megaphone, Plus, Save, Trash2, X } from "lucide-react";

import { AnnouncementBarManager } from "@/components/admin/announcement-bar-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Banner, BannerPlacement } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const PLACEMENTS: { id: BannerPlacement; label: string }[] = [
  { id: "top-bar", label: "Top Announcement Bar" },
  { id: "homepage-hero", label: "Homepage Hero" },
  { id: "product-page", label: "Product Page" },
  { id: "checkout", label: "Checkout" },
];

function placementColor(p: BannerPlacement) {
  switch (p) {
    case "top-bar": return "bg-blue-100 text-blue-800";
    case "homepage-hero": return "bg-amber-100 text-amber-800";
    case "product-page": return "bg-purple-100 text-purple-800";
    case "checkout": return "bg-green-100 text-green-800";
  }
}

function EmptyBanner(): Partial<Banner> {
  return {
    text: "",
    imageUrl: "",
    placement: "top-bar",
    isEnabled: true,
  };
}

export function BannersManager() {
  const [tab, setTab] = useState<"announcement" | "legacy">("announcement");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [saving, setSaving] = useState(false);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      const data = (await res.json()) as { banners: Banner[] };
      setBanners(data.banners ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBanners();
  }, []);

  const saveBanner = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      const data = (await res.json()) as { banners: Banner[] };
      setBanners(data.banners ?? []);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    const res = await fetch(`/api/admin/banners?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { banners: Banner[] };
    setBanners(data.banners ?? []);
  };

  const toggleEnabled = async (banner: Banner) => {
    const updated = { ...banner, isEnabled: !banner.isEnabled };
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const data = (await res.json()) as { banners: Banner[] };
    setBanners(data.banners ?? []);
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">
            {editing.id ? "Edit Banner" : "New Banner"}
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full gap-2" onClick={() => setEditing(null)}>
              <X className="size-4" /> Cancel
            </Button>
            <Button variant="gold" className="rounded-full gap-2 shadow-gold" onClick={saveBanner} disabled={saving}>
              <Save className="size-4" />
              {saving ? "Saving..." : "Save Banner"}
            </Button>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md space-y-4">
          <div className="space-y-1.5">
            <Label>Banner Text (Arabic or French)</Label>
            <Input
              value={editing.text ?? ""}
              onChange={(e) => setEditing((s) => s && { ...s, text: e.target.value })}
              dir="rtl"
              placeholder="توصيل مجاني للطلبات فوق 349 درهم 🚚"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Image URL (optional)</Label>
            <Input
              value={editing.imageUrl ?? ""}
              onChange={(e) => setEditing((s) => s && { ...s, imageUrl: e.target.value })}
              placeholder="https://... or /images/..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Placement</Label>
            <div className="flex flex-wrap gap-2">
              {PLACEMENTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setEditing((s) => s && { ...s, placement: p.id })}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold border transition-all",
                    editing.placement === p.id
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-accent/40",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={editing.isEnabled ?? true}
                onChange={(e) => setEditing((s) => s && { ...s, isEnabled: e.target.checked })}
                className="h-4 w-4 rounded"
              />
              Banner is active / enabled
            </label>
          </div>

          {editing.text && (
            <div className="rounded-xl bg-secondary/30 p-4">
              <p className="text-xs font-bold text-muted-foreground mb-2">Preview</p>
              <div className="rounded-lg bg-accent/10 px-4 py-2 text-center text-sm font-medium" dir="rtl">
                {editing.text}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border/60 pb-1">
        <button
          type="button"
          onClick={() => setTab("announcement")}
          className={cn(
            "rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors",
            tab === "announcement"
              ? "bg-accent/10 text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Announcement Bar
        </button>
        <button
          type="button"
          onClick={() => setTab("legacy")}
          className={cn(
            "rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors",
            tab === "legacy"
              ? "bg-accent/10 text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Site Banners
        </button>
      </div>

      {tab === "announcement" ? (
        <AnnouncementBarManager />
      ) : (
        <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Site Banners</h2>
          <p className="text-sm text-muted-foreground">
            Manage promotional banners across the storefront.
          </p>
        </div>
        <Button
          variant="gold"
          className="rounded-full gap-2 shadow-gold"
          onClick={() => setEditing(EmptyBanner())}
        >
          <Plus className="size-4" /> New Banner
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading banners...</p>
      ) : banners.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/60 p-10 text-center">
          <Megaphone className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 font-semibold text-foreground">No banners yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a promotional banner to display on your storefront.
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-full gap-2"
            onClick={() => setEditing(EmptyBanner())}
          >
            <Plus className="size-4" /> Create First Banner
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={cn(
                "flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-warm-md",
                !banner.isEnabled && "opacity-50",
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50">
                <Megaphone className="size-5 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground" dir="rtl">
                    {banner.text || "No text"}
                  </p>
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", placementColor(banner.placement))}>
                    {PLACEMENTS.find((p) => p.id === banner.placement)?.label ?? banner.placement}
                  </span>
                  {!banner.isEnabled && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
                      disabled
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => toggleEnabled(banner)}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                    banner.isEnabled ? "bg-accent" : "bg-border",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform",
                      banner.isEnabled ? "translate-x-4" : "translate-x-0",
                    )}
                  />
                </button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => setEditing(banner)}
                  title="Edit"
                >
                  <Edit2 className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full text-destructive hover:text-destructive"
                  onClick={() => deleteBanner(banner.id)}
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
      )}
    </div>
  );
}
