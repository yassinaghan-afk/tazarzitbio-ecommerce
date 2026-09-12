"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DeliveryStatus } from "@/lib/admin/ops-types";
import { DELIVERY_STATUSES } from "@/lib/admin/ops-types";

type ElitePublic = {
  providerId: string;
  displayName: string;
  enabled: boolean;
  accountId?: string;
  baseUrl?: string;
  apiKeyConfigured: boolean;
  webhookSecretConfigured: boolean;
  apiKeyHint?: string;
  statusMap: Record<string, DeliveryStatus>;
  updatedAt?: string;
};

export function EliteDeliverySettingsForm() {
  const [elite, setElite] = useState<ElitePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [webhookHint, setWebhookHint] = useState(
    "/api/webhooks/elite-delivery/<ELITE_DELIVERY_WEBHOOK_SECRET>",
  );
  const [form, setForm] = useState({
    enabled: false,
    baseUrl: "https://elitedelivery.ma",
    accountId: "",
    apiKey: "",
    webhookSecret: "",
    statusMapJson: "{}",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/delivery?view=settings", { cache: "no-store" });
      if (!res.ok) throw new Error("fail");
      const data = (await res.json()) as {
        elite: ElitePublic;
        webhookPathHint?: string;
      };
      setElite(data.elite);
      if (data.webhookPathHint) setWebhookHint(data.webhookPathHint);
      setForm({
        enabled: data.elite.enabled,
        baseUrl: data.elite.baseUrl || "https://elitedelivery.ma",
        accountId: data.elite.accountId || "",
        apiKey: "",
        webhookSecret: "",
        statusMapJson: JSON.stringify(data.elite.statusMap || {}, null, 2),
      });
    } catch {
      setError("Failed to load delivery settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    setError("");
    let statusMap: Record<string, string> = {};
    try {
      statusMap = JSON.parse(form.statusMapJson || "{}") as Record<string, string>;
    } catch {
      setError("Status map must be valid JSON");
      setSaving(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/delivery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: form.enabled,
          baseUrl: form.baseUrl,
          accountId: form.accountId,
          ...(form.apiKey.trim() ? { apiKey: form.apiKey.trim() } : {}),
          ...(form.webhookSecret.trim()
            ? { webhookSecret: form.webhookSecret.trim() }
            : {}),
          statusMap,
        }),
      });
      if (!res.ok) throw new Error("fail");
      const data = (await res.json()) as { elite: ElitePublic };
      setElite(data.elite);
      setForm((f) => ({ ...f, apiKey: "", webhookSecret: "" }));
      setMsg("Saved. Secrets stay server-side only.");
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function verifyConnection() {
    setVerifying(true);
    setMsg("");
    setError("");
    try {
      const res = await fetch("/api/admin/delivery?view=verify", { cache: "no-store" });
      const data = (await res.json()) as {
        ok?: boolean;
        storeId?: string;
        brandName?: string;
        errorMessage?: string;
      };
      if (data.ok) {
        setMsg(
          `Connected ✓ Store ${data.storeId ?? "?"} — ${data.brandName ?? "Elite"}`,
        );
      } else {
        setError(data.errorMessage || "Verification failed");
      }
    } catch {
      setError("Verification request failed");
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading Elite Delivery settings…</p>;
  }

  return (
    <div className="space-y-4 rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
      <div>
        <h3 className="text-lg font-extrabold">Elite Delivery</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Official API: stores / statuses / cities / batch. Credentials never reach the browser.
        </p>
      </div>

      {msg && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          {msg}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
          {error}
        </p>
      )}

      <form className="grid max-w-xl gap-3" onSubmit={(e) => void save(e)}>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          />
          Enable Elite Delivery integration
        </label>

        <div>
          <Label>API Base URL</Label>
          <Input
            value={form.baseUrl}
            onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
            placeholder="https://elitedelivery.ma"
            dir="ltr"
          />
        </div>

        <div>
          <Label>Store ID</Label>
          <Input
            value={form.accountId}
            onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            placeholder="e.g. 14757"
            dir="ltr"
          />
        </div>

        <div>
          <Label>
            API Token{" "}
            {elite?.apiKeyConfigured ? (
              <span className="text-emerald-700">(configured {elite.apiKeyHint})</span>
            ) : (
              <span className="text-muted-foreground">(not set)</span>
            )}
          </Label>
          <Input
            type="password"
            value={form.apiKey}
            onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
            placeholder="Leave blank to keep existing / env"
            autoComplete="new-password"
            dir="ltr"
          />
        </div>

        <div>
          <Label>
            Webhook Secret{" "}
            {elite?.webhookSecretConfigured ? (
              <span className="text-emerald-700">(configured)</span>
            ) : (
              <span className="text-muted-foreground">(not set)</span>
            )}
          </Label>
          <Input
            type="password"
            value={form.webhookSecret}
            onChange={(e) => setForm({ ...form, webhookSecret: e.target.value })}
            placeholder="Random secret for webhook URL path"
            autoComplete="new-password"
            dir="ltr"
          />
          <p className="mt-1 text-[11px] text-muted-foreground break-all" dir="ltr">
            Elite webhook URL: {webhookHint}
          </p>
        </div>

        <div>
          <Label>Status map overrides (optional JSON)</Label>
          <p className="mb-1 text-[11px] text-muted-foreground">
            Built-in map covers Elite status IDs. Override keys if needed. Values:{" "}
            {DELIVERY_STATUSES.join(", ")}
          </p>
          <textarea
            className="min-h-28 w-full rounded-xl border border-border bg-card px-3 py-2 font-mono text-xs"
            value={form.statusMapJson}
            onChange={(e) => setForm({ ...form, statusMapJson: e.target.value })}
            dir="ltr"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="gold" className="rounded-full" disabled={saving}>
            {saving ? "Saving…" : "Save Elite settings"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={verifying}
            onClick={() => void verifyConnection()}
          >
            {verifying ? "Verifying…" : "Verify connection"}
          </Button>
        </div>
      </form>

      <p className="text-xs text-muted-foreground">
        Production env (EasyPanel): <code>ELITE_DELIVERY_API_TOKEN</code>,{" "}
        <code>ELITE_DELIVERY_STORE_ID</code>, <code>ELITE_DELIVERY_WEBHOOK_SECRET</code>,{" "}
        <code>ELITE_DELIVERY_BASE_URL</code>
      </p>
    </div>
  );
}
