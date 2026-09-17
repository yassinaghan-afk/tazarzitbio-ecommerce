"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Eye, RefreshCw, Search, Send, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/admin/money";
import type { ConfirmationStatus } from "@/lib/admin/ops-types";
import { CONFIRMATION_STATUSES } from "@/lib/admin/ops-types";
import type { OrderRecord, OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUSES } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function formatMAD(n: number) {
  return formatMoney(n);
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  contacted: "bg-orange-100 text-orange-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-sky-100 text-sky-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
  returned: "bg-zinc-100 text-zinc-700",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "New",
  contacted: "Contacted",
  confirmed: "Confirmed",
  preparing: "Preparing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

export function OrdersTable({
  orders,
  loading,
  onRefresh,
}: {
  orders: OrderRecord[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<OrderRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [confirmNote, setConfirmNote] = useState("");

  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");

  useEffect(() => {
    void fetch("/api/admin/orders?pageSize=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { agents?: { id: string; name: string }[] }) => {
        if (Array.isArray(d.agents)) setAgents(d.agents);
      })
      .catch(() => null);
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") {
      list = list.filter((o) => o.orderStatus === statusFilter);
    }
    if (deliveryFilter !== "all") {
      list = list.filter(
        (o) =>
          o.deliveryStatus === deliveryFilter ||
          o.shipment?.internalStatus === deliveryFilter,
      );
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.orderId.toLowerCase().includes(q) ||
          o.address.toLowerCase().includes(q) ||
          (o.shipment?.trackingNumber || "").toLowerCase().includes(q) ||
          (o.shipment?.externalShipmentId || "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [orders, query, statusFilter, deliveryFilter]);

  const updateStatus = async (orderId: string, orderStatus: OrderStatus) => {
    setBusyId(orderId);
    try {
      await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus }),
      });
      await onRefresh();
    } finally {
      setBusyId(null);
    }
  };

  const patchOrder = async (orderId: string, body: Record<string, unknown>) => {
    setBusyId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = (await res.json()) as { order: OrderRecord };
        setSelected(data.order);
        await onRefresh();
      }
    } finally {
      setBusyId(null);
    }
  };

  const deliveryAction = async (orderId: string, action: "send" | "refresh") => {
    setBusyId(orderId);
    setDeliveryMsg("");
    try {
      const res = await fetch("/api/admin/delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, orderId, providerId: "elite" }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        errorMessage?: string;
        alreadyExists?: boolean;
      };
      if (!res.ok || !data.ok) {
        setDeliveryMsg(
          action === "refresh"
            ? `✕ ${data.errorMessage || "Sync failed"}`
            : data.errorMessage || "تعذر الاتصال بشركة التوصيل",
        );
      } else {
        setDeliveryMsg(
          action === "refresh"
            ? "✓ Synced successfully"
            : data.alreadyExists
              ? "الشحنة موجودة مسبقاً — لم يتم إنشاء شحنة مكررة"
              : "✓ تم إنشاء Nouveau colis على Elite Delivery",
        );
        await onRefresh();
        const detail = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`);
        if (detail.ok) {
          const d = (await detail.json()) as { order: OrderRecord };
          setSelected(d.order);
        }
      }
    } catch {
      setDeliveryMsg("تعذر الاتصال بشركة التوصيل");
    } finally {
      setBusyId(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("Permanently delete this order?")) return;
    setBusyId(orderId);
    try {
      await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      });
      await onRefresh();
      if (selected?.orderId === orderId) setSelected(null);
    } finally {
      setBusyId(null);
    }
  };

  const exportCSV = () => {
    const header = ["Order ID", "Customer", "Phone", "Address", "Products", "Subtotal", "Shipping", "Total", "Status", "Date"];
    const rows = filtered.map((o) => [
      o.orderId,
      o.customerName,
      o.phone,
      `"${o.address.replace(/"/g, '""')}"`,
      `"${o.products.map((p) => `${p.nameAr}×${p.quantity}`).join(", ").replace(/"/g, '""')}"`,
      o.subtotal,
      o.shippingPrice,
      o.total,
      o.orderStatus,
      o.createdAt,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Orders</h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {orders.length} orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-full gap-2"
            onClick={exportCSV}
            disabled={filtered.length === 0}
          >
            <Download className="size-4" /> Export CSV
          </Button>
          <Button
            variant="outline"
            className="rounded-full gap-2"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, order ID, tracking…"
            className="pl-9 rounded-full"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["all", ...ORDER_STATUSES.map((s) => s.id)] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s as OrderStatus | "all")}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors border",
                statusFilter === s
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border/60 text-muted-foreground hover:border-accent/40",
              )}
            >
              {s === "all" ? "All" : STATUS_LABELS[s as OrderStatus]}
            </button>
          ))}
        </div>
        <select
          className="h-9 rounded-full border border-border bg-card px-3 text-xs font-semibold"
          value={deliveryFilter}
          onChange={(e) => setDeliveryFilter(e.target.value)}
        >
          <option value="all">All delivery</option>
          {CONFIRMATION_STATUSES.length >= 0 &&
            [
              "new",
              "confirmed",
              "preparing",
              "shipped",
              "in_transit",
              "delivered",
              "returned",
              "failed_delivery",
              "refused",
              "cancelled",
            ].map((s) => (
              <option key={s} value={s}>
                Delivery: {s}
              </option>
            ))}
        </select>
      </div>

      {/* Table */}
      {deliveryMsg && (
        <p
          className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900"
          role="status"
        >
          {deliveryMsg}
        </p>
      )}
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-warm-md">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead className="bg-secondary/50 text-xs font-bold text-muted-foreground uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-start">Customer</th>
                <th className="px-4 py-3 text-start">Phone</th>
                <th className="px-4 py-3 text-start">Total</th>
                <th className="px-4 py-3 text-start">Status</th>
                <th className="px-4 py-3 text-start">Local delivery</th>
                <th className="px-4 py-3 text-start">Elite status</th>
                <th className="px-4 py-3 text-start">Payment</th>
                <th className="px-4 py-3 text-start">Package</th>
                <th className="px-4 py-3 text-start">Sync</th>
                <th className="px-4 py-3 text-start">Date</th>
                <th className="px-4 py-3 text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                    {loading ? "Loading orders…" : query || statusFilter !== "all" || deliveryFilter !== "all" ? "No orders match your filters." : "No orders yet."}
                  </td>
                </tr>
              )}
              {filtered.map((o) => {
                const dStatus = o.shipment?.internalStatus || o.deliveryStatus || "—";
                const dBadge =
                  dStatus === "delivered"
                    ? "bg-emerald-100 text-emerald-800"
                    : dStatus === "in_transit" || dStatus === "shipped"
                      ? "bg-amber-100 text-amber-800"
                      : dStatus === "returned" || dStatus === "failed_delivery" || dStatus === "refused"
                        ? "bg-rose-100 text-rose-800"
                        : dStatus === "confirmed" || dStatus === "preparing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-zinc-100 text-zinc-700";
                const sync = o.shipment?.syncState;
                const syncLabel =
                  !o.shipment?.externalShipmentId
                    ? "Not linked"
                    : sync === "error"
                      ? "✕ Error"
                      : sync === "delayed"
                        ? "⚠ Delayed"
                        : sync === "synced" || o.shipment?.lastSyncAt
                          ? "✓ Synced"
                          : "Pending";
                const pay =
                  o.shipment?.elitePaymentStatus === "paid" ||
                  o.paymentCollectionStatus === "paid_to_company"
                    ? "Paid"
                    : o.shipment?.elitePaymentStatus === "unpaid"
                      ? "Unpaid"
                      : o.shipment?.payoutStatus === "paid"
                        ? "Paid"
                        : o.shipment
                          ? "Unpaid"
                          : "—";
                return (
                <tr key={o.orderId} className="border-t border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {o.customerName}
                    <span className="block font-mono text-xs text-muted-foreground">{o.orderId.slice(0, 12)}…</span>
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-muted-foreground">
                    {o.phone}
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums text-accent">
                    {formatMAD(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <select
                        className={cn(
                          "h-9 rounded-xl border border-border bg-card/80 px-2 text-xs font-semibold",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          STATUS_COLORS[o.orderStatus],
                        )}
                        value={o.orderStatus}
                        disabled={busyId === o.orderId}
                        onChange={(e) => updateStatus(o.orderId, e.target.value as OrderStatus)}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {STATUS_LABELS[s.id]}
                          </option>
                        ))}
                      </select>
                      {o.shipment?.externalShipmentId ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Elite · Nouveau colis ✓
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="gold"
                          className="h-8 rounded-full px-2.5 text-[11px]"
                          disabled={busyId === o.orderId}
                          onClick={() => void deliveryAction(o.orderId, "send")}
                          title="إرسال الطرد إلى Elite Delivery (Nouveau colis)"
                        >
                          <Send className="size-3.5" aria-hidden />
                          إرسال Elite
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-bold", dBadge)}>
                      {dStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px]">
                    <span className="font-semibold text-foreground">
                      {o.shipment?.externalStatusName || o.shipment?.externalStatus || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold">{pay}</td>
                  <td className="px-4 py-3 font-mono text-[11px]" dir="ltr">
                    {o.shipment?.externalShipmentId || "—"}
                  </td>
                  <td className="px-4 py-3 text-[11px] font-semibold whitespace-nowrap">{syncLabel}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="rounded-full"
                        onClick={() => setSelected(selected?.orderId === o.orderId ? null : o)}
                        aria-label="View"
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="rounded-full text-destructive hover:text-destructive"
                        onClick={() => deleteOrder(o.orderId)}
                        aria-label="Delete"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Panel */}
      {selected && (
        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-accent">Order Details</p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{selected.orderId}</p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={() => setSelected(null)}>
              Close
            </Button>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Customer</p>
                <p className="mt-1 font-bold text-foreground">{selected.customerName}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Phone</p>
                <p className="mt-1 font-mono tabular-nums text-foreground">{selected.phone}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Address</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground">{selected.address}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">
                  المدينة (Elite)
                </p>
                <Input
                  className="mt-1 h-9 rounded-xl text-sm"
                  dir="rtl"
                  placeholder="مثال: أكادير / Casablanca"
                  defaultValue={selected.city ?? ""}
                  key={`city-${selected.orderId}-${selected.city ?? ""}`}
                  disabled={busyId === selected.orderId}
                  onBlur={(e) => {
                    const next = e.target.value.trim();
                    if (next === (selected.city ?? "").trim()) return;
                    void patchOrder(selected.orderId, { city: next });
                  }}
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  ضرورية لإنشاء Nouveau colis — يمكن استخراجها من العنوان تلقائياً عند الإرسال.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Confirmation</p>
                <select
                  className="mt-1 h-9 w-full rounded-xl border border-border bg-card px-2 text-xs font-semibold"
                  value={selected.confirmationStatus ?? "pending_confirmation"}
                  disabled={busyId === selected.orderId}
                  onChange={(e) =>
                    void patchOrder(selected.orderId, {
                      confirmationStatus: e.target.value as ConfirmationStatus,
                      confirmationNotes: confirmNote || undefined,
                    })
                  }
                >
                  {CONFIRMATION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Input
                  className="mt-2"
                  placeholder="Call note (Arabic ok)"
                  value={confirmNote}
                  onChange={(e) => setConfirmNote(e.target.value)}
                />
              </div>
              {agents.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Assigned agent</p>
                  <select
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-card px-2 text-xs font-semibold"
                    value={selected.assignedAgentId ?? ""}
                    disabled={busyId === selected.orderId}
                    onChange={(e) =>
                      void patchOrder(selected.orderId, {
                        assignedAgentId: e.target.value || null,
                      })
                    }
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {selected.timeline && selected.timeline.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Timeline</p>
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs">
                    {selected.timeline.slice(0, 20).map((t) => (
                      <li key={t.id} className="border-b border-border/40 py-1">
                        <span className="font-semibold">{t.action}</span>
                        {t.note ? ` — ${t.note}` : ""}
                        <span className="block text-muted-foreground">
                          {t.userName} · {formatDate(t.at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl border border-border/60 bg-secondary/30 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-accent">Elite Delivery</p>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Package ID</dt>
                    <dd className="font-mono text-xs" dir="ltr">
                      {selected.shipment?.externalShipmentId || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Internal ID</dt>
                    <dd className="font-mono text-xs" dir="ltr">
                      {selected.shipment?.internalId || selected.orderId}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Local status</dt>
                    <dd className="font-semibold">
                      {selected.shipment?.internalStatus ||
                        selected.deliveryStatus ||
                        "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Elite status</dt>
                    <dd className="text-end text-xs font-semibold">
                      {selected.shipment?.externalStatusName || "—"}
                      {selected.shipment?.externalStatus ? (
                        <span className="ms-1 font-mono text-muted-foreground" dir="ltr">
                          ({selected.shipment.externalStatus})
                        </span>
                      ) : null}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Payment</dt>
                    <dd className="font-semibold">
                      {selected.shipment?.elitePaymentStatus === "paid" ||
                      selected.paymentCollectionStatus === "paid_to_company"
                        ? "Paid"
                        : selected.shipment?.elitePaymentStatus === "unpaid"
                          ? "Unpaid"
                          : selected.shipment
                            ? "Unpaid / pending"
                            : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Last Elite event</dt>
                    <dd className="text-xs">
                      {selected.shipment?.eliteLastEventAt
                        ? formatDate(selected.shipment.eliteLastEventAt)
                        : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Last sync</dt>
                    <dd className="text-xs">
                      {selected.shipment?.lastSyncAt
                        ? formatDate(selected.shipment.lastSyncAt)
                        : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">Sync state</dt>
                    <dd className="text-xs font-semibold">
                      {!selected.shipment?.externalShipmentId
                        ? "Not linked"
                        : selected.shipment.syncState || "—"}
                    </dd>
                  </div>
                </dl>
                {selected.deliveryHistory && selected.deliveryHistory.length > 0 && (
                  <div className="mt-3 border-t border-border/40 pt-3">
                    <p className="text-[11px] font-bold uppercase text-muted-foreground">
                      Status history
                    </p>
                    <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-xs">
                      {selected.deliveryHistory.slice(0, 25).map((h) => (
                        <li key={h.id} className="border-b border-border/30 py-1">
                          <span className="font-semibold">
                            {h.internalStatus || h.externalStatus || "update"}
                          </span>
                          {h.note ? ` — ${h.note}` : ""}
                          <span className="block text-muted-foreground">
                            {h.source} · {formatDate(h.at)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="gold"
                    className="rounded-full"
                    disabled={busyId === selected.orderId}
                    onClick={() => void deliveryAction(selected.orderId, "send")}
                  >
                    إرسال Elite · Nouveau colis
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    disabled={busyId === selected.orderId || !selected.shipment?.externalShipmentId}
                    onClick={() => void deliveryAction(selected.orderId, "refresh")}
                  >
                    Sync with Elite
                  </Button>
                  {selected.shipment?.trackingUrl && (
                    <Button size="sm" variant="outline" className="rounded-full" asChild>
                      <a href={selected.shipment.trackingUrl} target="_blank" rel="noreferrer">
                        تتبع
                      </a>
                    </Button>
                  )}
                </div>
                {deliveryMsg && (
                  <p className="mt-2 text-xs font-semibold text-amber-800 dark:text-amber-300" role="status">
                    {deliveryMsg}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Status</p>
                <span
                  className={cn(
                    "mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    STATUS_COLORS[selected.orderStatus],
                  )}
                >
                  {STATUS_LABELS[selected.orderStatus]}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Date</p>
                <p className="mt-1 text-sm text-foreground">{formatDate(selected.createdAt)}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase">Items</p>
              <ul className="mt-2 space-y-2">
                {selected.products.map((p) => (
                  <li key={`${p.slug}-${p.offerId}`} className="flex justify-between gap-3 text-sm">
                    <span>
                      <span className="font-semibold text-foreground" dir="rtl">{p.nameAr}</span>
                      <span className="ml-1 text-muted-foreground">× {p.quantity}</span>
                      <span className="block text-xs text-muted-foreground">{p.offerLabel}</span>
                    </span>
                    <span className="shrink-0 font-bold tabular-nums text-accent">
                      {formatMAD(p.unitPrice * p.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-2 border-t border-border/50 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold tabular-nums">{formatMAD(selected.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold tabular-nums">{formatMAD(selected.shippingPrice)}</span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-2 text-base font-bold">
                  <span>Total</span>
                  <span className="text-accent">{formatMAD(selected.total)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Payment</span>
                  <span className="font-semibold">Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
