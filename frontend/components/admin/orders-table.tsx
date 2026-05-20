"use client";

import { useMemo, useState } from "react";
import { Eye, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { OrderRecord, OrderStatus } from "@/lib/orders/types";
import { ORDER_STATUSES } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("fr-MA", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function formatMAD(n: number) {
  return `${Math.round(n)} د.م.`;
}

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

  const rows = useMemo(() => orders, [orders]);

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
    const ok = confirm("حذف الطلب نهائياً؟");
    if (!ok) return;
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-display text-2xl text-foreground">الطلبات</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة حالات الطلبات الخاصة بالدفع عند الاستلام
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={onRefresh}
          disabled={loading}
        >
          تحديث
        </Button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-warm-md">
        <div className="overflow-x-auto">
          <table className="min-w-[880px] w-full text-sm">
            <thead className="bg-secondary/50 text-xs font-bold text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start">الزبون</th>
                <th className="px-4 py-3 text-start">الهاتف</th>
                <th className="px-4 py-3 text-start">العنوان</th>
                <th className="px-4 py-3 text-start">المنتجات</th>
                <th className="px-4 py-3 text-start">المجموع</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-start">التاريخ</th>
                <th className="px-4 py-3 text-start">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {loading ? "جاري تحميل الطلبات..." : "لا توجد طلبات بعد"}
                  </td>
                </tr>
              )}
              {rows.map((o) => (
                <tr
                  key={o.orderId}
                  className="border-t border-border/50 hover:bg-secondary/20"
                >
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {o.customerName}
                  </td>
                  <td className="px-4 py-3 font-mono tabular-nums text-muted-foreground">
                    {o.phone}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="line-clamp-2 max-w-[220px]">{o.address}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <span className="line-clamp-2 max-w-[260px]">
                      {o.products
                        .slice(0, 2)
                        .map((p) => `${p.nameAr}×${p.quantity}`)
                        .join("، ")}
                      {o.products.length > 2 ? "…" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold tabular-nums text-accent">
                    {formatMAD(o.total)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className={cn(
                        "h-10 rounded-xl border border-border bg-card/80 px-3 text-sm font-semibold text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                      value={o.orderStatus}
                      disabled={busyId === o.orderId}
                      onChange={(e) =>
                        updateStatus(o.orderId, e.target.value as OrderStatus)
                      }
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.labelAr}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="rounded-full"
                        onClick={() => setSelected(o)}
                        aria-label="عرض"
                      >
                        <Eye />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="rounded-full text-destructive hover:text-destructive"
                        onClick={() => deleteOrder(o.orderId)}
                        aria-label="حذف"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-accent">
                تفاصيل الطلب
              </p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {selected.orderId}
              </p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={() => setSelected(null)}>
              إغلاق
            </Button>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-bold text-muted-foreground">الزبون</p>
              <p className="mt-1 font-bold text-foreground">{selected.customerName}</p>
              <p className="mt-2 text-xs font-bold text-muted-foreground">الهاتف</p>
              <p className="mt-1 font-mono text-sm tabular-nums text-foreground">
                {selected.phone}
              </p>
              <p className="mt-2 text-xs font-bold text-muted-foreground">العنوان</p>
              <p className="mt-1 text-sm leading-relaxed text-foreground">
                {selected.address}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground">المنتجات</p>
              <ul className="mt-2 space-y-2 text-sm">
                {selected.products.map((p) => (
                  <li key={`${p.slug}-${p.offerId}`} className="flex justify-between gap-3">
                    <span className="font-semibold text-foreground">
                      {p.nameAr} × {p.quantity}
                      <span className="block text-xs text-muted-foreground">
                        {p.offerLabel}
                      </span>
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
                  <span className="font-bold tabular-nums">{formatMAD(selected.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-bold tabular-nums">{formatMAD(selected.shippingPrice)}</span>
                </div>
                <div className="flex justify-between border-t border-border/40 pt-2 text-base font-bold">
                  <span>Total</span>
                  <span className="text-accent">{formatMAD(selected.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

