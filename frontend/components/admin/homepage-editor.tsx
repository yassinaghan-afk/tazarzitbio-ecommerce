"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_HOMEPAGE_CONTENT,
  type HomepageContent,
} from "@/lib/admin/types";

export function HomepageEditor() {
  const [content, setContent] = useState<HomepageContent>(DEFAULT_HOMEPAGE_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/homepage")
      .then((r) => r.json())
      .then((d: { homepageContent: HomepageContent }) => {
        if (d.homepageContent) setContent(d.homepageContent);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof HomepageContent>(key: K, value: HomepageContent[K]) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (!confirm("Reset homepage content to defaults?")) return;
    setContent(DEFAULT_HOMEPAGE_CONTENT);
    setSaved(false);
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading homepage settings...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Homepage Content</h2>
          <p className="text-sm text-muted-foreground">
            Edit the headline, CTAs, and section titles shown on the homepage.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full gap-2" onClick={reset}>
            <RotateCcw className="size-4" /> Reset
          </Button>
          <Button variant="gold" className="rounded-full gap-2 shadow-gold" onClick={save} disabled={saving}>
            <Save className="size-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {saved && (
        <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
          Homepage content saved successfully.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hero Section */}
        <div className="space-y-4 rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
          <p className="text-sm font-bold text-foreground uppercase tracking-wide">Hero Section</p>
          <div className="space-y-1.5">
            <Label>Headline (Arabic)</Label>
            <Input value={content.heroHeadline} onChange={(e) => update("heroHeadline", e.target.value)} dir="rtl" />
          </div>
          <div className="space-y-1.5">
            <Label>Subtitle (Arabic)</Label>
            <Input value={content.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} dir="rtl" />
          </div>
          <div className="space-y-1.5">
            <Label>CTA Button Text</Label>
            <Input value={content.heroCta} onChange={(e) => update("heroCta", e.target.value)} dir="rtl" />
          </div>
          <div className="space-y-1.5">
            <Label>Banner Image URL</Label>
            <Input value={content.heroBannerUrl} onChange={(e) => update("heroBannerUrl", e.target.value)} placeholder="https://... or /images/..." />
          </div>
        </div>

        {/* Section Titles */}
        <div className="space-y-4 rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
          <p className="text-sm font-bold text-foreground uppercase tracking-wide">Section Titles</p>
          <div className="space-y-1.5">
            <Label>Best Sellers Title</Label>
            <Input value={content.bestSellersTitle} onChange={(e) => update("bestSellersTitle", e.target.value)} dir="rtl" />
          </div>
          <div className="space-y-1.5">
            <Label>Family Pack Title</Label>
            <Input value={content.familyPackTitle} onChange={(e) => update("familyPackTitle", e.target.value)} dir="rtl" />
          </div>
          <div className="space-y-1.5">
            <Label>Reviews Title</Label>
            <Input value={content.reviewsTitle} onChange={(e) => update("reviewsTitle", e.target.value)} dir="rtl" />
          </div>
          <div className="space-y-1.5">
            <Label>FAQ Title</Label>
            <Input value={content.faqTitle} onChange={(e) => update("faqTitle", e.target.value)} dir="rtl" />
          </div>
        </div>

        {/* Final CTA */}
        <div className="space-y-4 rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
          <p className="text-sm font-bold text-foreground uppercase tracking-wide">Final CTA Section</p>
          <div className="space-y-1.5">
            <Label>Title (Arabic)</Label>
            <Input value={content.finalCtaTitle} onChange={(e) => update("finalCtaTitle", e.target.value)} dir="rtl" />
          </div>
          <div className="space-y-1.5">
            <Label>Subtitle (Arabic)</Label>
            <Input value={content.finalCtaText} onChange={(e) => update("finalCtaText", e.target.value)} dir="rtl" />
          </div>
          <div className="space-y-1.5">
            <Label>Button Text</Label>
            <Input value={content.finalCtaButton} onChange={(e) => update("finalCtaButton", e.target.value)} dir="rtl" />
          </div>
        </div>

        {/* Trust Badges */}
        <div className="space-y-4 rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
          <p className="text-sm font-bold text-foreground uppercase tracking-wide">Trust Badges</p>
          {content.trustBadges.map((badge, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={badge.icon}
                onChange={(e) => {
                  const trustBadges = content.trustBadges.map((b, idx) =>
                    idx === i ? { ...b, icon: e.target.value } : b
                  );
                  update("trustBadges", trustBadges);
                }}
                placeholder="icon"
                className="w-24 font-mono text-xs"
              />
              <Input
                value={badge.text}
                onChange={(e) => {
                  const trustBadges = content.trustBadges.map((b, idx) =>
                    idx === i ? { ...b, text: e.target.value } : b
                  );
                  update("trustBadges", trustBadges);
                }}
                dir="rtl"
                placeholder="badge text..."
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
