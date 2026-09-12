"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Package,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  Timer,
  Truck,
  XCircle,
} from "lucide-react";

import type { OrderRecord } from "@/lib/orders/types";
import { cn } from "@/lib/utils";

const DATE_PRESETS = [
  { id: "today", labelEn: "Today", labelAr: "اليوم" },
  { id: "yesterday", labelEn: "Yesterday", labelAr: "أمس" },
  { id: "this_week", labelEn: "This Week", labelAr: "هذا الأسبوع" },
  { id: "this_month", labelEn: "This Month", labelAr: "هذا الشهر" },
  { id: "last_month", labelEn: "Last Month", labelAr: "الشهر الماضي" },
  { id: "this_year", labelEn: "This Year", labelAr: "هذه السنة" },
] as const;

type DatePreset = (typeof DATE_PRESETS)[number]["id"];

function formatMAD(n: number) {
  return `${Math.round(n).toLocaleString("fr-MA")} DH`;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color?: "default" | "green" | "amber" | "red" | "blue" | "indigo" | "violet";
  onClick?: () => void;
  badge?: string;
}

function KpiCard({ label, value, sub, icon: Icon, color = "default", onClick, badge }: KpiCardProps) {
  const colorMap = {
    default: { bg: "bg-muted/40", icon: "text-muted-foreground", val: "text-foreground" },
    green:   { bg: "bg-emerald-50", icon: "text-emerald-600", val: "text-emerald-700" },
    amber:   { bg: "bg-amber-50",   icon: "text-amber-600",   val: "text-amber-700" },
    red:     { bg: "bg-rose-50",    icon: "text-rose-600",    val: "text-rose-700" },
    blue:    { bg: "bg-blue-50",    icon: "text-blue-600",    val: "text-blue-700" },
    indigo:  { bg: "bg-indigo-50",  icon: "text-indigo-600",  val: "text-indigo-700" },
    violet:  { bg: "bg-violet-50",  icon: "text-violet-600",  val: "text-violet-700" },
  }[color];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full rounded-2xl border border-border/50 bg-card p-5 text-start shadow-sm transition-all duration-200",
        onClick && "hover:shadow-md hover:border-border cursor-pointer",
        !onClick && "cursor-default",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("rounded-xl p-2.5", colorMap.bg)}>
          <Icon className={cn("size-5", colorMap.icon)} />
        </div>
        {badge && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
            {badge}
          </span>
        )}
        {onClick && (
          <ArrowUpRight className="size-4 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
      <p className={cn("mt-3 text-2xl font-extrabold tabular-nums tracking-tight", colorMap.val)}>
        {value}
      </p>
      <p className="mt-0.5 text-sm font-medium text-muted-foreground">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground/70">{sub}</p>}
    </button>
  );
}

interface AttentionItem {
  label: string;
  count: number;
  color: "red" | "amber" | "blue";
  onClick: () => void;
}

function AttentionCard({ items }: { items: AttentionItem[] }) {
  const active = items.filter((i) => i.count > 0);
  if (active.length === 0) return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="size-4 text-amber-600" />
        <p className="text-sm font-bold text-amber-800">يحتاج اهتماماً / Needs Attention</p>
      </div>
      <div className="space-y-2">
        {active.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              item.color === "red"   && "bg-rose-100 text-rose-800 hover:bg-rose-200",
              item.color === "amber" && "bg-amber-100 text-amber-800 hover:bg-amber-200",
              item.color === "blue"  && "bg-blue-100 text-blue-800 hover:bg-blue-200",
            )}
          >
            <span>{item.label}</span>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold">
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RecentOrderRow({ order, locale }: { order: OrderRecord; locale: "en" | "ar" }) {
  const statusColors: Record<string, string> = {
    pending:    "bg-amber-100 text-amber-800",
    confirmed:  "bg-blue-100 text-blue-800",
    preparing:  "bg-indigo-100 text-indigo-800",
    shipped:    "bg-violet-100 text-violet-800",
    in_transit: "bg-cyan-100 text-cyan-800",
    delivered:  "bg-emerald-100 text-emerald-800",
    returned:   "bg-rose-100 text-rose-800",
    cancelled:  "bg-gray-100 text-gray-600",
  };
  const deliveryStatusBadge = {
    delivered:  "🟢",
    in_transit: "🟡",
    confirmed:  "🔵",
    returned:   "🔴",
    failed_delivery: "🔴",
  } as Record<string, string>;

  return (
    <div className="flex items-center gap-3 py-2.5 text-sm border-b border-border/30 last:border-0">
      <span className="font-mono text-xs text-muted-foreground min-w-[80px] shrink-0">
        #{order.orderId.slice(-6)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{order.customerName}</p>
        <p className="text-xs text-muted-foreground">{order.phone}</p>
      </div>
      <span className="font-bold tabular-nums text-accent shrink-0">{formatMAD(order.total)}</span>
      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0", statusColors[order.orderStatus] ?? "bg-gray-100 text-gray-600")}>
        {order.orderStatus}
      </span>
      {order.deliveryStatus && deliveryStatusBadge[order.deliveryStatus] && (
        <span className="text-base shrink-0">{deliveryStatusBadge[order.deliveryStatus]}</span>
      )}
    </div>
  );
}

interface DashSectionProps {
  orders: OrderRecord[];
  loading: boolean;
  locale: "en" | "ar";
  canFinance: boolean;
  onGoToOrders: (filter?: string) => void;
}

export function DashSection({ orders, loading, locale, canFinance, onGoToOrders }: DashSectionProps) {
  const [preset, setPreset] = useState<DatePreset>("this_month");
  const [financeKpis, setFinanceKpis] = useState<{
    totalRevenue: number;
    netProfit: number;
    totalExpenses: number;
    cashBalance: number;
  } | null>(null);

  useEffect(() => {
    if (!canFinance) return;
    fetch(`/api/admin/finance?preset=${preset}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { kpis?: typeof financeKpis }) => {
        if (d?.kpis) setFinanceKpis(d.kpis);
      })
      .catch(() => null);
  }, [preset, canFinance]);

  // Filter orders by date preset
  const filtered = useMemo(() => {
    const now = new Date();
    const startOf = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
    const endOf   = (d: Date) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

    let from: Date, to: Date;
    switch (preset) {
      case "today":
        from = startOf(now); to = endOf(now); break;
      case "yesterday": {
        const y = new Date(now); y.setDate(y.getDate() - 1);
        from = startOf(y); to = endOf(y); break;
      }
      case "this_week": {
        const d = new Date(now);
        d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        from = startOf(d); to = endOf(now); break;
      }
      case "this_month":
        from = new Date(now.getFullYear(), now.getMonth(), 1); to = endOf(now); break;
      case "last_month":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        to = endOf(new Date(now.getFullYear(), now.getMonth(), 0)); break;
      case "this_year":
        from = new Date(now.getFullYear(), 0, 1); to = endOf(now); break;
      default:
        from = new Date(0); to = endOf(now);
    }

    return orders.filter((o) => {
      const d = new Date(o.createdAt ?? "");
      return d >= from && d <= to;
    });
  }, [orders, preset]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const newOrders     = filtered.filter((o) => o.orderStatus === "pending").length;
    const confirmed     = filtered.filter((o) => ["confirmed", "preparing"].includes(o.orderStatus)).length;
    const inTransit     = filtered.filter((o) => ["shipped", "in_transit"].includes(o.orderStatus)).length;
    const delivered     = filtered.filter((o) => o.orderStatus === "delivered").length;
    const returned      = filtered.filter((o) => o.orderStatus === "returned").length;
    const cancelled     = filtered.filter((o) => o.orderStatus === "cancelled").length;
    const revenue       = filtered.reduce((s, o) => s + (o.total ?? 0), 0);
    const deliveryRate  = total ? Math.round((delivered / total) * 100) : 0;
    const returnRate    = total ? Math.round((returned / total) * 100) : 0;
    const confirmRate   = total ? Math.round(((confirmed + inTransit + delivered + returned) / total) * 100) : 0;
    // Attention
    const pendingConfirm   = orders.filter((o) => o.confirmationStatus === "pending_confirmation").length;
    const failedDelivery   = orders.filter((o) => o.deliveryStatus === "failed_delivery").length;
    const returnedOrders   = orders.filter((o) => o.orderStatus === "returned").length;
    const codPending       = orders.filter((o) => o.shipment?.payoutStatus === "pending").length;
    return {
      total, newOrders, confirmed, inTransit, delivered, returned, cancelled, revenue,
      deliveryRate, returnRate, confirmRate,
      pendingConfirm, failedDelivery, returnedOrders, codPending,
    };
  }, [filtered, orders]);

  const t = (en: string, ar: string) => locale === "ar" ? ar : en;

  return (
    <div className="space-y-6">
      {/* Header + date range */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">
            {t("Dashboard", "لوحة القيادة")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {loading ? t("Loading…", "جاري التحميل…") : t(`${stats.total} orders in period`, `${stats.total} طلب في الفترة`)}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DATE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                preset === p.id
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "bg-secondary/60 text-muted-foreground hover:bg-secondary",
              )}
            >
              {locale === "ar" ? p.labelAr : p.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Order KPIs */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
          {t("Orders", "الطلبات")}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard label={t("New Orders", "طلبات جديدة")} value={stats.newOrders} icon={ShoppingBag} color="amber"
            onClick={() => onGoToOrders("pending")} />
          <KpiCard label={t("Confirmed", "مؤكدة")} value={stats.confirmed} icon={CheckCircle2} color="blue"
            onClick={() => onGoToOrders("confirmed")} />
          <KpiCard label={t("In Transit", "في الطريق")} value={stats.inTransit} icon={Truck} color="indigo"
            onClick={() => onGoToOrders("shipped")} />
          <KpiCard label={t("Delivered", "تم التسليم")} value={stats.delivered} icon={Package} color="green"
            badge={stats.total > 0 ? `${stats.deliveryRate}%` : undefined}
            onClick={() => onGoToOrders("delivered")} />
          <KpiCard label={t("Returned", "مرتجعة")} value={stats.returned} icon={RotateCcw} color="red"
            badge={stats.total > 0 && stats.returned > 0 ? `${stats.returnRate}%` : undefined}
            onClick={() => onGoToOrders("returned")} />
        </div>
      </div>

      {/* Finance KPIs */}
      {canFinance && (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
            {t("Finance", "المالية")}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <KpiCard label={t("Sales (COD)", "المبيعات")} value={formatMAD(stats.revenue)} icon={ShoppingBag} color="amber" />
            <KpiCard label={t("Net Profit", "صافي الربح")} value={financeKpis ? formatMAD(financeKpis.netProfit) : "—"} icon={ArrowUpRight} color="green" />
            <KpiCard label={t("Total Expenses", "المصاريف")} value={financeKpis ? formatMAD(financeKpis.totalExpenses) : "—"} icon={XCircle} color="red" />
            <KpiCard label={t("Cash on Hand", "الصندوق")} value={financeKpis ? formatMAD(financeKpis.cashBalance) : "—"} icon={Timer} color="blue" />
          </div>
        </div>
      )}

      {/* Ops KPIs */}
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
          {t("Operations", "العمليات")}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border/50 bg-card p-4 text-center">
            <p className="text-2xl font-extrabold text-foreground">{stats.confirmRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{t("Confirmation Rate", "معدل التأكيد")}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-4 text-center">
            <p className="text-2xl font-extrabold text-emerald-700">{stats.deliveryRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{t("Delivery Rate", "معدل التوصيل")}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-card p-4 text-center">
            <p className="text-2xl font-extrabold text-rose-700">{stats.returnRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{t("Return Rate", "معدل الإرجاع")}</p>
          </div>
        </div>
      </div>

      {/* Attention center */}
      <AttentionCard
        items={[
          {
            label: t(`${stats.pendingConfirm} orders waiting for confirmation`, `${stats.pendingConfirm} طلب ينتظر التأكيد`),
            count: stats.pendingConfirm, color: "amber",
            onClick: () => onGoToOrders("pending_confirmation"),
          },
          {
            label: t(`${stats.failedDelivery} failed delivery attempts`, `${stats.failedDelivery} محاولة توصيل فاشلة`),
            count: stats.failedDelivery, color: "red",
            onClick: () => onGoToOrders("failed_delivery"),
          },
          {
            label: t(`${stats.returnedOrders} orders returned`, `${stats.returnedOrders} طلب مرتجع`),
            count: stats.returnedOrders, color: "red",
            onClick: () => onGoToOrders("returned"),
          },
          {
            label: t(`${stats.codPending} COD payouts pending`, `${stats.codPending} دفعة COD معلقة`),
            count: stats.codPending, color: "amber",
            onClick: () => onGoToOrders("cod_pending"),
          },
        ]}
      />

      {/* Recent orders */}
      {filtered.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-foreground text-sm">{t("Recent Orders", "آخر الطلبات")}</p>
            <button
              type="button"
              onClick={() => onGoToOrders()}
              className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
            >
              {t("View all", "عرض الكل")}
              <ArrowUpRight className="size-3" />
            </button>
          </div>
          <div>
            {filtered.slice(0, 8).map((o) => (
              <RecentOrderRow key={o.orderId} order={o} locale={locale} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-border/60 p-10 text-center">
          <ShoppingBag className="mx-auto size-10 text-muted-foreground/30" />
          <p className="mt-3 font-semibold text-foreground">
            {t("No orders in this period", "لا توجد طلبات في هذه الفترة")}
          </p>
        </div>
      )}
    </div>
  );
}
