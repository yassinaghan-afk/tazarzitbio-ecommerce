"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Save, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_SHIPPING_SETTINGS,
  FREE_SHIPPING_MARKETING_AR,
  FREE_SHIPPING_THRESHOLD_MAD,
  type ShippingSettings,
} from "@/lib/shipping/settings";
import {
  loadShippingSettings,
  resetShippingSettings,
  saveShippingSettings,
} from "@/lib/shipping/settings-storage";

export function ShippingSettingsForm() {
  const [settings, setSettings] = useState<ShippingSettings>(
    DEFAULT_SHIPPING_SETTINGS,
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadShippingSettings());
  }, []);

  const update = (field: keyof ShippingSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveShippingSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    resetShippingSettings();
    setSettings(DEFAULT_SHIPPING_SETTINGS);
    setSaved(false);
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
            Flat delivery fee per order. Free shipping when cart subtotal reaches the
            minimum amount ({FREE_SHIPPING_MARKETING_AR}).
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="defaultShippingPrice">Default Shipping Fee (MAD)</Label>
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
          <p className="mt-1 text-2xs text-muted-foreground">
            Applied when subtotal is below {settings.freeShippingMinimumAmount} د.م.
          </p>
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
          <p className="mt-1 text-2xs text-muted-foreground">
            Default: {FREE_SHIPPING_THRESHOLD_MAD} د.م. — subtotal ≥ this = free shipping
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="gold" className="gap-2 rounded-full" onClick={handleSave}>
          <Save className="size-4" />
          Save Shipping Settings
        </Button>
        <Button
          variant="outline"
          className="gap-2 rounded-full"
          onClick={handleReset}
        >
          <RotateCcw className="size-4" />
          Reset to Defaults
        </Button>
        {saved && (
          <span className="text-sm font-medium text-emerald-600">Saved ✓</span>
        )}
      </div>
    </div>
  );
}
