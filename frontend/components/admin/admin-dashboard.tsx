"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  Globe,
  Home,
  LogOut,
  Megaphone,
  Settings2,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { BannersManager } from "@/components/admin/banners-manager";
import { HomepageEditor } from "@/components/admin/homepage-editor";
import { LandingPagesManager } from "@/components/admin/landing-pages-manager";
import { OrdersTable } from "@/components/admin/orders-table";
import { PricingDashboard } from "@/components/admin/pricing-dashboard";
import { ProductsManager } from "@/components/admin/products-manager";
import { ShippingSettingsForm } from "@/components/admin/shipping-settings-form";
import { Button } from "@/components/ui/button";
import type { OrderRecord, OrderStatus } from "@/lib/orders/types";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/brand-logo";

type AdminSection =
  | "overview"
  | "orders"
  | "products"
  | "landing-pages"
  | "homepage"
  | "banners"
  | "shipping"
  | "analytics";

const NAV: { id: AdminSection; label: string; icon: React.ElementType; group?: string }[] = [
  { id: "overview", label: "Overview", icon: BarChart3, group: "main" },
  { id: "orders", label: "Orders", icon: ShoppingBag, group: "main" },
  { id: "products", label: "Products", icon: Boxes, group: "content" },
  { id: "landing-pages", label: "Landing Pages", icon: Globe, group: "content" },
  { id: "homepage", label: "Homepage", icon: Home, group: "content" },
  { id: "banners", label: "Banners", icon: Megaphone, group: "content" },
  { id: "shipping", label: "Shipping", icon: Settings2, group: "settings" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, group: "settings" },
];

function formatMAD(n: number) {
  return `${Math.round(n).toLocaleString()} MAD`;
}

function StatCard({
  label,
  value,
  color = "default",
  sub,
}: {
  label: string;
  value: string | number;
  color?: "default" | "green" | "amber" | "red" | "blue";
  sub?: string;
}) {
  const valueClass = {
    default: "text-foreground",
    green: "text-emerald-700",
    amber: "text-accent",
    red: "text-destructive",
    blue: "text-blue-700",
  }[color];

  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("mt-2 text-3xl font-extrabold tabular-nums", valueClass)}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
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
    const confirmed = orders.filter((o) => o.orderStatus === "confirmed").length;
    const shipped = orders.filter((o) => o.orderStatus === "shipped").length;
    const delivered = orders.filter((o) => o.orderStatus === "delivered").length;
    const cancelled = orders.filter((o) => o.orderStatus === "cancelled").length;
    const aov = totalOrders ? revenue / totalOrders : 0;
    const pendingRevenue = orders
      .filter((o) => o.orderStatus === "pending")
      .reduce((s, o) => s + o.total, 0);
    return { totalOrders, revenue, pending, confirmed, shipped, delivered, cancelled, aov, pendingRevenue };
  }, [orders]);

  const topProducts = useMemo(() => {
    const counts: Record<string, { nameAr: string; qty: number; revenue: number }> = {};
    for (const o of orders) {
      for (const p of o.products) {
        if (!counts[p.productId]) counts[p.productId] = { nameAr: p.nameAr, qty: 0, revenue: 0 };
        counts[p.productId].qty += p.quantity;
        counts[p.productId].revenue += p.unitPrice * p.quantity;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5);
  }, [orders]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  const groups = [
    { label: "Main", ids: NAV.filter((n) => n.group === "main") },
    { label: "Content", ids: NAV.filter((n) => n.group === "content") },
    { label: "Settings", ids: NAV.filter((n) => n.group === "settings") },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]" dir="ltr">
      {/* Sidebar */}
      <aside className="rounded-3xl border border-border/60 bg-card/60 p-4 shadow-warm-md h-fit lg:sticky lg:top-6">
        <div className="mb-5">
          <BrandLogo variant="admin" className="mb-3" />
          <h1 className="text-xl font-extrabold text-foreground">Admin Panel</h1>
        </div>

        <nav className="space-y-4">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {g.label}
              </p>
              <div className="space-y-0.5">
                {g.ids.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSection(id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                      section === id
                        ? "bg-accent/10 text-foreground ring-1 ring-accent/20"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-accent" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-5 border-t border-border/60 pt-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 rounded-xl"
            onClick={logout}
          >
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-w-0 space-y-6">
        {/* Overview */}
        {section === "overview" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-foreground">Overview</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {loading ? "Loading..." : `${stats.totalOrders} total orders`}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Total Orders" value={stats.totalOrders} />
              <StatCard label="Total Revenue" value={formatMAD(stats.revenue)} color="amber" />
              <StatCard label="Avg. Order Value" value={formatMAD(stats.aov)} />
              <StatCard label="Pending" value={stats.pending} color="amber" sub={`${formatMAD(stats.pendingRevenue)} at risk`} />
              <StatCard label="Delivered" value={stats.delivered} color="green" />
              <StatCard label="Cancelled" value={stats.cancelled} color="red" />
            </div>

            {/* Recent Orders Quick View */}
            {orders.length > 0 && (
              <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-bold text-foreground">Recent Orders</p>
                  <button
                    type="button"
                    onClick={() => setSection("orders")}
                    className="text-xs text-accent font-semibold hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-2">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.orderId} className="flex items-center justify-between gap-3 text-sm py-2 border-b border-border/40 last:border-0">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{o.customerName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{o.phone}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold tabular-nums text-accent">{formatMAD(o.total)}</span>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", {
                          "bg-amber-100 text-amber-800": o.orderStatus === "pending",
                          "bg-blue-100 text-blue-800": o.orderStatus === "confirmed",
                          "bg-emerald-100 text-emerald-800": o.orderStatus === "delivered",
                          "bg-rose-100 text-rose-800": o.orderStatus === "cancelled",
                          "bg-indigo-100 text-indigo-800": o.orderStatus === "shipped",
                        })}>
                          {o.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {section === "orders" && (
          <OrdersTable orders={orders} loading={loading} onRefresh={refreshOrders} />
        )}

        {section === "products" && (
          <div className="space-y-6">
            <ProductsManager />
            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
              <p className="text-sm font-bold text-foreground">Internal Pricing (Admin Only)</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Cost prices and profit margins — never visible to customers.
              </p>
              <PricingDashboard />
            </div>
          </div>
        )}

        {section === "landing-pages" && <LandingPagesManager />}

        {section === "homepage" && <HomepageEditor />}

        {section === "banners" && <BannersManager />}

        {section === "shipping" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Shipping Settings</h2>
              <p className="text-sm text-muted-foreground">
                Configure shipping fees and free shipping thresholds for Morocco.
              </p>
            </div>
            <ShippingSettingsForm />
          </div>
        )}

        {section === "analytics" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Analytics</h2>
              <p className="text-sm text-muted-foreground">
                Sales performance based on stored orders.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Total COD Value" value={formatMAD(stats.revenue)} color="amber" />
              <StatCard label="Avg. Order Value" value={formatMAD(stats.aov)} />
              <StatCard label="Delivered Orders" value={stats.delivered} color="green" sub="completed revenue" />
            </div>

            {topProducts.length > 0 && (
              <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
                <p className="font-bold text-foreground mb-4">Best-Selling Products</p>
                <div className="space-y-3">
                  {topProducts.map(([productId, data], i) => (
                    <div key={productId} className="flex items-center gap-4">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground" dir="rtl">{data.nameAr}</p>
                        <p className="text-xs text-muted-foreground">{data.qty} units sold</p>
                      </div>
                      <span className="shrink-0 font-bold tabular-nums text-accent">
                        {formatMAD(data.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {orders.length > 0 && (
              <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-warm-md">
                <p className="font-bold text-foreground mb-4">Order Status Breakdown</p>
                <div className="space-y-2">
                  {([
                    { status: "pending" as OrderStatus, label: "Pending", color: "bg-amber-400" },
                    { status: "confirmed" as OrderStatus, label: "Confirmed", color: "bg-blue-400" },
                    { status: "shipped" as OrderStatus, label: "Shipped", color: "bg-indigo-400" },
                    { status: "delivered" as OrderStatus, label: "Delivered", color: "bg-emerald-400" },
                    { status: "cancelled" as OrderStatus, label: "Cancelled", color: "bg-rose-400" },
                  ] satisfies { status: OrderStatus; label: string; color: string }[]).map(({ status, label, color }) => {
                    const count = orders.filter((o) => o.orderStatus === status).length;
                    const pct = stats.totalOrders ? Math.round((count / stats.totalOrders) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center gap-3 text-sm">
                        <span className="w-20 text-muted-foreground">{label}</span>
                        <div className="flex-1 rounded-full bg-secondary/60 h-2 overflow-hidden">
                          <div className={cn("h-2 rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-end text-xs font-bold tabular-nums text-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {orders.length === 0 && !loading && (
              <div className="rounded-3xl border border-dashed border-border/60 p-10 text-center">
                <TrendingUp className="mx-auto size-10 text-muted-foreground/40" />
                <p className="mt-3 font-semibold text-foreground">No analytics data yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Analytics will appear once orders start coming in.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
