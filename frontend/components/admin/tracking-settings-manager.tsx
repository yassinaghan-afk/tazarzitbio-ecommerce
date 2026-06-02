"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bug,
  CheckCircle2,
  Eye,
  Loader2,
  Megaphone,
  Radar,
  Save,
  ScanLine,
  Tag,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  countActivePlatforms,
  DEFAULT_TRACKING_SETTINGS,
  isProductionEnvironment,
  normalizeTrackingSettings,
} from "@/lib/tracking/settings";
import type { TrackingPlatformKey, TrackingSettings } from "@/lib/tracking/types";
import { cn } from "@/lib/utils";

const PLATFORMS: {
  key: TrackingPlatformKey;
  labelAr: string;
  labelEn: string;
  placeholder: string;
  hint: string;
  icon: React.ElementType;
}[] = [
  {
    key: "facebook",
    labelAr: "Meta Pixel (فيسبوك / إنستغرام)",
    labelEn: "Facebook Pixel ID",
    placeholder: "123456789012345",
    hint: "إعلانات Meta وإعادة الاستهداف",
    icon: Megaphone,
  },
  {
    key: "tiktok",
    labelAr: "TikTok Pixel",
    labelEn: "TikTok Pixel ID",
    placeholder: "CXXXXXXXXXXXXXXXXX",
    hint: "حملات TikTok Ads",
    icon: ScanLine,
  },
  {
    key: "snapchat",
    labelAr: "Snapchat Pixel",
    labelEn: "Snapchat Pixel ID",
    placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    hint: "إعلانات Snapchat",
    icon: Radar,
  },
  {
    key: "googleAnalytics",
    labelAr: "Google Analytics 4",
    labelEn: "GA4 Measurement ID",
    placeholder: "G-XXXXXXXXXX",
    hint: "تحليل الزوار والمبيعات",
    icon: BarChart3,
  },
  {
    key: "googleTagManager",
    labelAr: "Google Tag Manager",
    labelEn: "GTM Container ID",
    placeholder: "GTM-XXXXXXX",
    hint: "إدارة العلامات المركزية",
    icon: Tag,
  },
  {
    key: "microsoftClarity",
    labelAr: "Microsoft Clarity",
    labelEn: "Clarity Project ID",
    placeholder: "abcdefghij",
    hint: "تسجيل الجلسات وخرائط الحرارة",
    icon: Eye,
  },
];

interface TrackingSettingsManagerProps {
  showBackLink?: boolean;
}

export function TrackingSettingsManager({
  showBackLink = false,
}: TrackingSettingsManagerProps) {
  const [settings, setSettings] = useState<TrackingSettings>(
    DEFAULT_TRACKING_SETTINGS,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tracking");
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { tracking: TrackingSettings };
      setSettings(normalizeTrackingSettings(data.tracking));
    } catch {
      setError("تعذّر تحميل إعدادات التتبع. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const updatePlatform = (
    key: TrackingPlatformKey,
    patch: Partial<{ id: string; enabled: boolean }>,
  ) => {
    setSettings((prev) => {
      const next = { ...prev[key], ...patch };
      if (patch.id !== undefined) {
        next.id = patch.id.trim();
        if (!next.id) next.enabled = false;
      }
      return {
        ...prev,
        [key]: next,
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const payload = normalizeTrackingSettings(settings);
      const res = await fetch("/api/admin/tracking", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { tracking: TrackingSettings };
      setSettings(normalizeTrackingSettings(data.tracking));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 4000);
    } catch {
      setError("تعذّر حفظ الإعدادات. تحقق من اتصالك وحاول مجدداً.");
    } finally {
      setSaving(false);
    }
  };

  const activeCount = countActivePlatforms(settings);
  const isProd = isProductionEnvironment();

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-border/60 bg-card/60">
        <Loader2 className="size-9 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {showBackLink && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" size="sm" className="gap-2 rounded-full" asChild>
            <Link href="/admin">
              <ArrowRight className="size-4" />
              العودة للوحة الإدارة
            </Link>
          </Button>
          <BrandLogo variant="checkout" className="opacity-80" />
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/10 via-card to-card/90 shadow-warm-lg">
        <div className="flex flex-wrap items-start justify-between gap-6 p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">
              Marketing & Analytics
            </p>
            <h1 className="mt-2 text-2xl font-extrabold text-foreground sm:text-3xl">
              إعدادات التتبع والإعلانات
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              فعّل منصات التتبع، أدخل المعرّفات، واحفظ. السكربتات تُحمَّل
              تلقائياً في{" "}
              <strong className="text-foreground">بيئة الإنتاج فقط</strong>.
              استخدم وضع الاختبار لمراجعة الأحداث في Console.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl border border-border/60 bg-background/90 px-5 py-4 text-center shadow-warm-sm">
              <p className="text-3xl font-extrabold tabular-nums text-accent">
                {activeCount}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                منصة نشطة
              </p>
            </div>
            <div
              className={cn(
                "rounded-2xl border px-5 py-4 text-center shadow-warm-sm",
                isProd
                  ? "border-emerald-200/80 bg-emerald-50/80"
                  : "border-amber-200/80 bg-amber-50/80",
              )}
            >
              <p
                className={cn(
                  "text-sm font-bold",
                  isProd ? "text-emerald-700" : "text-amber-800",
                )}
              >
                {isProd ? "Production" : "Development"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isProd ? "سكربتات مفعّلة" : "سكربتات متوقفة"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-violet-100">
              <Bug className="size-5 text-violet-700" />
            </div>
            <div>
              <Label htmlFor="test-mode" className="text-base font-bold">
                وضع الاختبار (Test Mode)
              </Label>
              <p className="text-xs text-muted-foreground">
                يطبع الأحداث في Console: PageView, ViewContent, AddToCart…
              </p>
            </div>
          </div>
          <Switch
            id="test-mode"
            checked={settings.testMode}
            onCheckedChange={(checked) =>
              setSettings((prev) => ({ ...prev, testMode: checked }))
            }
            aria-label="تفعيل وضع الاختبار"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {PLATFORMS.map(
          ({ key, labelAr, labelEn, placeholder, hint, icon: Icon }) => {
            const platform = settings[key];
            const hasId = platform.id.length > 0;
            const isActive = platform.enabled && hasId;

            return (
              <div
                key={key}
                className={cn(
                  "rounded-3xl border p-5 shadow-warm-md transition-colors",
                  isActive
                    ? "border-accent/40 bg-card/90 ring-1 ring-accent/20"
                    : "border-border/60 bg-card/50",
                )}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-11 items-center justify-center rounded-2xl",
                        isActive ? "bg-accent/15" : "bg-secondary/80",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-5",
                          isActive ? "text-accent" : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{labelAr}</p>
                      <p className="text-xs text-muted-foreground">{labelEn}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Switch
                      checked={platform.enabled}
                      disabled={!hasId}
                      onCheckedChange={(checked) =>
                        updatePlatform(key, { enabled: checked })
                      }
                      aria-label={`تفعيل ${labelAr}`}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wide",
                        isActive ? "text-emerald-600" : "text-muted-foreground",
                      )}
                    >
                      {isActive ? "ON" : "OFF"}
                    </span>
                  </div>
                </div>

                <Input
                  dir="ltr"
                  className="font-mono text-sm"
                  placeholder={placeholder}
                  value={platform.id}
                  onChange={(e) => updatePlatform(key, { id: e.target.value })}
                />
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {hint}
                </p>
                {!hasId && (
                  <p className="mt-2 text-xs text-amber-700/90">
                    أدخل المعرّف لتفعيل المنصة
                  </p>
                )}
              </div>
            );
          },
        )}
      </div>

      <div className="rounded-3xl border border-dashed border-border/70 bg-secondary/20 p-5 sm:p-6">
        <p className="font-bold text-foreground">الأحداث المتتبعة تلقائياً</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "PageView",
            "ViewContent",
            "AddToCart",
            "InitiateCheckout",
            "Purchase",
          ].map((event) => (
            <div
              key={event}
              className="flex items-center gap-2 rounded-xl bg-background/60 px-3 py-2 text-sm"
            >
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span className="font-medium text-foreground">{event}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          العملة: MAD · التخزين: data/store.json (جاهز للربط بقاعدة بيانات لاحقاً)
        </p>
      </div>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-background/95 p-4 shadow-warm-lg backdrop-blur-md">
        <Button
          variant="gold"
          size="lg"
          className="gap-2 rounded-full px-8"
          onClick={() => void handleSave()}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          حفظ الإعدادات
        </Button>
        {saved && (
          <span className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <CheckCircle2 className="size-4" />
            تم الحفظ — التغييرات سارية على الموقع
          </span>
        )}
      </div>
    </div>
  );
}
