"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WebhookEvent = {
  id: string;
  at: string;
  packageId: string;
  notifType: string;
  deliveryStatusId?: string;
  deliveryStatusName?: string;
  eventTime?: string;
  orderId?: string;
  processStatus: "processed" | "duplicate" | "ignored" | "failed" | "unmatched";
  resolvedInternalStatus?: string;
  errorCode?: string;
  message?: string;
};

const STATUS_STYLE: Record<WebhookEvent["processStatus"], string> = {
  processed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  duplicate: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  ignored: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  failed: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
  unmatched: "bg-orange-100 text-orange-900 dark:bg-orange-950/40 dark:text-orange-300",
};

export function EliteWebhookLogsPanel({ locale = "en" }: { locale?: "en" | "ar" }) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fallbackMsg, setFallbackMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/delivery?view=webhooks", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("fail");
      const data = (await res.json()) as {
        events: WebhookEvent[];
        webhookPathHint?: string;
      };
      setEvents(Array.isArray(data.events) ? data.events : []);
      if (data.webhookPathHint) setHint(data.webhookPathHint);
    } catch {
      setError(
        locale === "ar"
          ? "تعذر تحميل أحداث الويب هوك"
          : "Failed to load webhook events",
      );
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void load();
  }, [load]);

  const runFallback = async () => {
    setFallbackMsg("");
    try {
      const res = await fetch("/api/admin/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fallback_sync" }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        scanned?: number;
        updated?: number;
        delayed?: number;
        error?: string;
      };
      if (!res.ok) {
        setFallbackMsg(data.error || t("Fallback sync failed", "فشل المزامنة الاحتياطية"));
        return;
      }
      setFallbackMsg(
        t(
          `Fallback sync: scanned ${data.scanned ?? 0}, updated ${data.updated ?? 0}, delayed ${data.delayed ?? 0}`,
          `مزامنة احتياطية: فحص ${data.scanned ?? 0}، تحديث ${data.updated ?? 0}، متأخر ${data.delayed ?? 0}`,
        ),
      );
      await load();
    } catch {
      setFallbackMsg(t("Fallback sync failed", "فشل المزامنة الاحتياطية"));
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-extrabold text-foreground">
            {t("Elite Webhooks", "ويب هوك Elite")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "Real-time package events from Elite Delivery. Unmatched packages are recorded — not auto-created.",
              "أحداث الطرود من Elite في الوقت الحقيقي. الطرود غير المطابقة تُسجَّل ولا تُنشأ تلقائياً.",
            )}
          </p>
          {hint && (
            <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground" dir="ltr">
              {hint}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
            {loading ? t("Loading…", "جاري التحميل…") : t("Refresh", "تحديث")}
          </Button>
          <Button size="sm" variant="outline" onClick={() => void runFallback()}>
            {t("Fallback sync", "مزامنة احتياطية")}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-rose-700">{error}</p>}
      {fallbackMsg && <p className="text-sm text-muted-foreground">{fallbackMsg}</p>}

      <div className="overflow-x-auto rounded-xl border border-border/40">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-secondary/40 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-start">{t("Received", "الاستلام")}</th>
              <th className="px-3 py-2 text-start">{t("Package", "الطرد")}</th>
              <th className="px-3 py-2 text-start">{t("Notif", "النوع")}</th>
              <th className="px-3 py-2 text-start">{t("Elite status", "حالة Elite")}</th>
              <th className="px-3 py-2 text-start">{t("Order", "الطلب")}</th>
              <th className="px-3 py-2 text-start">{t("Result", "النتيجة")}</th>
              <th className="px-3 py-2 text-start">{t("Message", "الرسالة")}</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                  {loading
                    ? t("Loading…", "جاري التحميل…")
                    : t("No webhook events yet", "لا توجد أحداث بعد")}
                </td>
              </tr>
            )}
            {events.map((e) => (
              <tr key={e.id} className="border-t border-border/40">
                <td className="px-3 py-2 text-xs whitespace-nowrap">
                  {new Date(e.at).toLocaleString()}
                </td>
                <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                  {e.packageId}
                </td>
                <td className="px-3 py-2 text-xs font-semibold">{e.notifType}</td>
                <td className="px-3 py-2 text-xs">
                  <span className="font-mono" dir="ltr">
                    {e.deliveryStatusId ?? "—"}
                  </span>
                  {e.deliveryStatusName ? (
                    <span className="ms-1 text-muted-foreground">
                      {e.deliveryStatusName}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 font-mono text-xs" dir="ltr">
                  {e.orderId || "—"}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize",
                      STATUS_STYLE[e.processStatus],
                    )}
                  >
                    {e.processStatus}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-muted-foreground max-w-[220px]">
                  {e.message || e.errorCode || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
