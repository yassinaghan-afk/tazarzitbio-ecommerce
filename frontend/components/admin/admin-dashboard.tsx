"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  LogOut,
  PackageSearch,
  Settings2,
  ShoppingBag,
} from "lucide-react";

import { OrdersTable } from "@/components/admin/orders-table";
import { PricingDashboard } from "@/components/admin/pricing-dashboard";
import { ShippingSettingsForm } from "@/components/admin/shipping-settings-form";
import { Button } from "@/components/ui/button";
import type { OrderRecord } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

type AdminSection = "overview" | "orders" | "products" | "shipping" | "analytics";

const NAV: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "نظرة عامة", icon: BarChart3 },
  { id: "orders", label: "الطلبات", icon: ShoppingBag },
  { id: "products", label: "المنتجات", icon: Boxes },
  { id: "shipping", label: "التوصيل", icon: Settings2 },
  { id: "analytics", label: "تحليلات", icon: PackageSearch },
];

function formatMAD(n: number) {
  return `${Math.round(n)} د.م.`;
}

export function AdminDashboard() {
  const [section, setSection] = useState<AdminSection>("overview");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = (await res.json()) as { orders: OrderRecord[] };
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshOrders();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const revenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
    const pending = orders.filter((o) => o.orderStatus === "pending").length;
    const delivered = orders.filter((o) => o.orderStatus === "delivered").length;
    const cancelled = orders.filter((o) => o.orderStatus === "cancelled").length;
    const aov = totalOrders ? revenue / totalOrders : 0;
    return { totalOrders, revenue, pending, delivered, cancelled, aov };
  }, [orders]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-3xl border border-border/60 bg-card/60 p-4 shadow-warm-md">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">
            إدارة تازارزيت بيو
          </p>
          <h1 className="text-display mt-2 text-2xl text-foreground">
            لوحة التشغيل
          </h1>
        </div>

        <nav className="space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors",
                section === id
                  ? "bg-accent/10 text-foreground ring-1 ring-accent/20"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4 text-accent" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-5 border-t border-border/60 pt-4">
          <Button
            variant="outline"
            className="w-full justify-center gap-2 rounded-full"
            onClick={logout}
          >
            <LogOut className="size-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      <div className="space-y-6">
        {section === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
              <p className="text-xs font-bold text-muted-foreground">إجمالي الطلبات</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-foreground">
                {stats.totalOrders}
              </p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
              <p className="text-xs font-bold text-muted-foreground">إجمالي المداخيل</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-accent">
                {formatMAD(stats.revenue)}
              </p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
              <p className="text-xs font-bold text-muted-foreground">متوسط قيمة الطلب</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-foreground">
                {formatMAD(stats.aov)}
              </p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
              <p className="text-xs font-bold text-muted-foreground">قيد المراجعة</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-foreground">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
              <p className="text-xs font-bold text-muted-foreground">تم التسليم</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-emerald-700">
                {stats.delivered}
              </p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
              <p className="text-xs font-bold text-muted-foreground">ملغي</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums text-destructive">
                {stats.cancelled}
              </p>
            </div>
          </div>
        )}

        {section === "orders" && (
          <OrdersTable
            orders={orders}
            loading={loading}
            onRefresh={refreshOrders}
          />
        )}

        {section === "products" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
              <p className="text-sm font-bold text-foreground">إدارة المنتجات</p>
              <p className="mt-1 text-sm text-muted-foreground">
                يمكنك تعديل أسعار البيع والتكلفة من هنا (بيانات داخلية للإدارة فقط).
              </p>
            </div>
            <PricingDashboard />
          </div>
        )}

        {section === "shipping" && (
          <div className="space-y-6">
            <ShippingSettingsForm />
          </div>
        )}

        {section === "analytics" && (
          <div className="rounded-3xl border border-border/60 bg-card/60 p-8 text-center shadow-warm-md">
            <p className="text-lg font-bold text-foreground">تحليلات</p>
            <p className="mt-2 text-sm text-muted-foreground">
              سيتم توسيع لوحة التحليلات (أفضل المنتجات، الربح التقريبي، AOV...) بناءً على الطلبات المخزنة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

