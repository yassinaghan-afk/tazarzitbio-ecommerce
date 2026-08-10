"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Save, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_SHIPPING_SETTINGS,
  type ShippingSettings,
} from "@/lib/shipping/settings";
import { saveShippingSettings } from "@/lib/shipping/settings-storage";

function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-background/50 p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded"
      />
      <span>
        <span className="block text-sm font-semibold text-foreground">{label}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      </span>
    </label>
  );
}

export function ShippingSettingsForm() {
  const [settings, setSettings] = useState<ShippingSettings>(
    DEFAULT_SHIPPING_SETTINGS,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  useEffect(() => {
    fetch("/api/admin/shipping", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { shippingSettings?: ShippingSettings } | null) => {
        if (data?.shippingSettings) setSettings(data.shippingSettings);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof ShippingSettings>(
    field: K,
    value: ShippingSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const persist = async (next: ShippingSettings) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setMessage({ ok: false, text: data?.error ?? "Save failed" });
        return;
      }
      const data = (await res.json()) as { shippingSettings: ShippingSettings };
      setSettings(data.shippingSettings);
      // keep this browser's cart preview in sync immediately
      saveShippingSettings(data.shippingSettings);
      setMessage({ ok: true, text: "Saved — live on the website" });
    } catch {
      setMessage({ ok: false, text: "Network error while saving" });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => void persist(settings);
  const handleReset = () => {
    setSettings(DEFAULT_SHIPPING_SETTINGS);
    void persist(DEFAULT_SHIPPING_SETTINGS);
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-warm-md">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10">
          <Truck className="size-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Shipping Settings — Morocco</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Flat delivery fee per order. These rules are stored on the server and
            used by every customer&apos;s cart and checkout.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label htmlFor="defaultShippingPrice">Shipping Fee (MAD / order)</Label>
              <Input
                id="defaultShippingPrice"
                type="number"
                min={0}
                step={1}
                value={settings.defaultShippingPrice}
                onChange={(e) =>
                  update("defaultShippingPrice", Number(e.target.value) || 0)
                }
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="freeShippingMinimumAmount">
                Free Shipping Min. Subtotal (MAD)
              </Label>
              <Input
                id="freeShippingMinimumAmount"
                type="number"
                min={0}
                step={1}
                value={settings.freeShippingMinimumAmount}
                onChange={(e) =>
                  update("freeShippingMinimumAmount", Number(e.target.value) || 0)
                }
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="freeShippingMinimumProducts">
                Free Shipping Min. Products
              </Label>
              <Input
                id="freeShippingMinimumProducts"
                type="number"
                min={1}
                step={1}
                value={settings.freeShippingMinimumProducts}
                onChange={(e) =>
                  update(
                    "freeShippingMinimumProducts",
                    Math.max(1, Number(e.target.value) || 1),
                  )
                }
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Toggle
              checked={settings.freeShippingByAmountEnabled}
              onChange={(v) => update("freeShippingByAmountEnabled", v)}
              label="Free shipping by amount"
              hint={`Subtotal ≥ ${settings.freeShippingMinimumAmount} MAD → free shipping`}
            />
            <Toggle
              checked={settings.freeShippingByQuantityEnabled}
              onChange={(v) => update("freeShippingByQuantityEnabled", v)}
              label="Free shipping by quantity"
              hint={`${settings.freeShippingMinimumProducts}+ products in cart → free shipping`}
            />
            <Toggle
              checked={settings.bundleFreeShippingEnabled}
              onChange={(v) => update("bundleFreeShippingEnabled", v)}
              label="Bundles ship free"
              hint="Cart containing a pack/bundle → free shipping"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button
              variant="gold"
              className="gap-2 rounded-full"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="size-4" />
              {saving ? "Saving…" : "Save Shipping Settings"}
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-full"
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw className="size-4" />
              Reset to Defaults
            </Button>
            {message && (
              <span
                className={
                  message.ok
                    ? "text-sm font-medium text-emerald-600"
                    : "text-sm font-medium text-destructive"
                }
              >
                {message.text}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
