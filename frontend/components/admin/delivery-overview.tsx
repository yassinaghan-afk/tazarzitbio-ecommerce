"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

function mad(n: number) {
  return `${Math.round(n).toLocaleString()} DH`;
}

type Overview = {
  totalShipments: number;
  pending: number;
  inTransit: number;
  delivered: number;
  returned: number;
  failed: number;
  codPending: number;
  codReceived: number;
  deliveryCosts: number;
};

const PRESETS = [
  { id: "today", label: "Today" },
  { id: "this_week", label: "This Week" },
  { id: "this_month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
] as const;

export function DeliveryOverviewPanel() {
  const [preset, setPreset] = useState("this_month");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch(`/api/admin/delivery?view=overview&preset=${preset}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("fail");
      const data = (await res.json()) as { overview: Overview };
      setOverview(data.overview);
    } catch {
      setError("Failed to load delivery overview");
    }
  }, [preset]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-extrabold">Delivery Overview</h3>
        <div className="ms-auto flex flex-wrap gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                preset === p.id ? "bg-foreground text-background" : "bg-secondary"
              }`}
            >
              {p.label}
            </button>
          ))}
          <Button size="sm" variant="outline" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-rose-700">{error}</p>}
      {overview && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Total shipments", overview.totalShipments],
            ["Pending", overview.pending],
            ["In transit", overview.inTransit],
            ["Delivered", overview.delivered],
            ["Returned", overview.returned],
            ["Failed", overview.failed],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-border/60 bg-card/70 p-4">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-extrabold tabular-nums">{value}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">COD pending</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-amber-700">
              {mad(overview.codPending)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">COD received</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-700">
              {mad(overview.codReceived)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">Delivery costs</p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">{mad(overview.deliveryCosts)}</p>
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Delivered ≠ cash received. COD payout fields populate when Elite API/docs provide them.
      </p>
    </div>
  );
}
