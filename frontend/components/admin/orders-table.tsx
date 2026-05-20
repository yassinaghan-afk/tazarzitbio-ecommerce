"use client";

import { useMemo, useState } from "react";
import { Download, Eye, RefreshCw, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  return `${Math.round(n)} MAD`;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
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

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== "all") {
      list = list.filter((o) => o.orderStatus === statusFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.orderId.toLowerCase().includes(q) ||
          o.address.toLowerCase().includes(q),
      );
    }
    return list;
  }, [orders, query, statusFilter]);

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
            placeholder="Search by name, phone, or order ID…"
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
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-warm-md">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-secondary/50 text-xs font-bold text-muted-foreground uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-start">Customer</th>
                <th className="px-4 py-3 text-start">Phone</th>
                <th className="px-4 py-3 text-start">Address</th>
                <th className="px-4 py-3 text-start">Products</th>
                <th className="px-4 py-3 text-start">Total</th>
                <th className="px-4 py-3 text-start">Status</th>
                <th className="px-4 py-3 text-start">Date</th>
                <th className="px-4 py-3 text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    {loading ? "Loading orders…" : query || statusFilter !== "all" ? "No orders match your filters." : "No orders yet."}
                  </td>
                </tr>
              )}
              {filtered.map((o) => (
                <tr key={o.orderId} className="border-t border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {o.customerName}
                    <span className="block font-mono text-xs text-muted-foreground">{o.orderId.slice(0, 12)}…</span>
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-muted-foreground">
                    {o.phone}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="line-clamp-2 max-w-[200px]">{o.address}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="line-clamp-2 max-w-[240px]">
                      {o.products.slice(0, 2).map((p) => `${p.nameAr}×${p.quantity}`).join(", ")}
                      {o.products.length > 2 ? "…" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums text-accent">
                    {formatMAD(o.total)}
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
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
              ))}
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
