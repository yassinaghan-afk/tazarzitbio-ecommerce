"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Package,
  RotateCcw,
  ShoppingBag,
  Timer,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";

import { resolveDatePreset } from "@/lib/admin/finance-calc";
import type { FinanceKpis } from "@/lib/admin/finance-calc";
import {
  formatMoney,
  formatPercent,
  safeNumber,
  safePercent,
} from "@/lib/admin/money";
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

const STATUS_LABEL: Record<string, { en: string; ar: string }> = {
  pending: { en: "New", ar: "جديد" },
  contacted: { en: "Contacted", ar: "تم الاتصال" },
  confirmed: { en: "Confirmed", ar: "مؤكد" },
  preparing: { en: "Preparing", ar: "قيد التحضير" },
  shipped: { en: "Shipped", ar: "تم الشحن" },
  in_transit: { en: "In Transit", ar: "في الطريق" },
  delivered: { en: "Delivered", ar: "تم التسليم" },
  returned: { en: "Returned", ar: "مرتجع" },
  cancelled: { en: "Cancelled", ar: "ملغى" },
};

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  tone?: "default" | "green" | "amber" | "red" | "blue" | "indigo";
  onClick?: () => void;
}

function KpiCard({ label, value, sub, icon: Icon, tone = "default", onClick }: KpiCardProps) {
  const tones = {
    default: { bg: "bg-muted/50", icon: "text-muted-foreground", val: "text-foreground" },
    green: { bg: "bg-emerald-50", icon: "text-emerald-600", val: "text-emerald-700" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", val: "text-amber-700" },
    red: { bg: "bg-rose-50", icon: "text-rose-600", val: "text-rose-700" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", val: "text-blue-700" },
    indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", val: "text-indigo-700" },
  }[tone];

  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border border-border/50 bg-card p-3.5 text-start shadow-sm",
        onClick && "cursor-pointer transition-colors hover:border-accent/30 hover:bg-accent/5",
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn("rounded-lg p-1.5", tones.bg)}>
          <Icon className={cn("size-3.5", tones.icon)} />
        </div>
        <p className="truncate text-[11px] font-semibold text-muted-foreground">{label}</p>
      </div>
      <p className={cn("mt-2 text-xl font-extrabold tabular-nums tracking-tight", tones.val)}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p> : null}
    </Comp>
  );
}

interface DashSectionProps {
  orders: OrderRecord[];
  loading: boolean;
  locale: "en" | "ar";
  canFinance: boolean;
  onGoToOrders: (filter?: string) => void;
}

export function DashSection({
  orders,
  loading,
  locale,
  canFinance,
  onGoToOrders,
}: DashSectionProps) {
  const [preset, setPreset] = useState<DatePreset>("this_month");
  const [finance, setFinance] = useState<FinanceKpis | null>(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeError, setFinanceError] = useState(false);

  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const money = (v: unknown) => formatMoney(v, { locale });

  useEffect(() => {
    if (!canFinance) {
      setFinance(null);
      return;
    }
    let cancelled = false;
    setFinanceLoading(true);
    setFinanceError(false);
    fetch(`/api/admin/finance?preset=${preset}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error("finance forbidden");
        return r.json() as Promise<{ kpis?: FinanceKpis }>;
      })
      .then((d) => {
        if (cancelled) return;
        setFinance(d.kpis ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setFinance(null);
          setFinanceError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setFinanceLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [preset, canFinance]);

  const range = useMemo(() => resolveDatePreset(preset), [preset]);

  const filtered = useMemo(() => {
    const from = range.from.getTime();
    const to = range.to.getTime();
    return orders.filter((o) => {
      const t0 = new Date(o.createdAt ?? "").getTime();
      return Number.isFinite(t0) && t0 >= from && t0 <= to;
    });
  }, [orders, range]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const newOrders = filtered.filter((o) => o.orderStatus === "pending").length;
    const confirmed = filtered.filter((o) =>
      ["confirmed", "preparing"].includes(o.orderStatus),
    ).length;
    const inTransit = filtered.filter(
      (o) =>
        o.orderStatus === "shipped" ||
        o.deliveryStatus === "shipped" ||
        o.deliveryStatus === "in_transit",
    ).length;
    const delivered = filtered.filter(
      (o) => o.orderStatus === "delivered" || o.deliveryStatus === "delivered",
    ).length;
    const returned = filtered.filter(
      (o) => o.orderStatus === "returned" || o.deliveryStatus === "returned",
    ).length;

    // Rates use period orders only; never divide by zero.
    const confirmRate = safePercent(confirmed + inTransit + delivered + returned, total);
    const deliveryRate = safePercent(delivered, total);
    const returnRate = safePercent(returned, total);

    const pendingConfirm = orders.filter(
      (o) => o.confirmationStatus === "pending_confirmation" || o.orderStatus === "pending",
    ).length;
    const failedDelivery = orders.filter(
      (o) => o.deliveryStatus === "failed_delivery",
    ).length;
    const returnedOpen = orders.filter((o) => o.orderStatus === "returned").length;
    const codPending = orders.filter(
      (o) =>
        o.shipment?.payoutStatus === "pending" &&
        (o.orderStatus === "delivered" || o.deliveryStatus === "delivered"),
    ).length;

    return {
      total,
      newOrders,
      confirmed,
      inTransit,
      delivered,
      returned,
      confirmRate,
      deliveryRate,
      returnRate,
      pendingConfirm,
      failedDelivery,
      returnedOpen,
      codPending,
    };
  }, [filtered, orders]);

  const sales = finance ? safeNumber(finance.totalSales ?? finance.totalRevenue) : null;
  const expenses = finance
    ? safeNumber(
        finance.totalExpenses ??
          safeNumber(finance.advertisingSpend) + safeNumber(finance.otherExpenses),
      )
    : null;
  const profit = finance ? safeNumber(finance.netProfit) : null;
  const cash = finance ? safeNumber(finance.cashOnHand ?? finance.cashBalance) : null;
  const margin =
    sales != null && profit != null ? safePercent(profit, sales) : 0;

  const financeValue = (v: number | null) => {
    if (financeLoading) return "…";
    if (financeError) return t("Not available", "غير متاح");
    if (v === null) return t("Not available", "غير متاح");
    return money(v);
  };

  const attention = [
    {
      label: t(
        `${stats.pendingConfirm} waiting for confirmation`,
        `${stats.pendingConfirm} بانتظار التأكيد`,
      ),
      count: stats.pendingConfirm,
      color: "amber" as const,
      onClick: () => onGoToOrders("pending"),
    },
    {
      label: t(
        `${stats.failedDelivery} failed deliveries`,
        `${stats.failedDelivery} توصيل فاشل`,
      ),
      count: stats.failedDelivery,
      color: "red" as const,
      onClick: () => onGoToOrders("failed_delivery"),
    },
    {
      label: t(`${stats.returnedOpen} returned`, `${stats.returnedOpen} مرتجع`),
      count: stats.returnedOpen,
      color: "red" as const,
      onClick: () => onGoToOrders("returned"),
    },
    {
      label: t(
        `${stats.codPending} COD payouts pending`,
        `${stats.codPending} COD معلّق`,
      ),
      count: stats.codPending,
      color: "amber" as const,
      onClick: () => onGoToOrders("cod_pending"),
    },
  ].filter((i) => i.count > 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">
            {t("Dashboard", "لوحة القيادة")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? t("Loading…", "جاري التحميل…")
              : t(
                  `${stats.total} orders in selected period`,
                  `${stats.total} طلب في الفترة المحددة`,
                )}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {DATE_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors",
                preset === p.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary/70 text-muted-foreground hover:bg-secondary",
              )}
            >
              {locale === "ar" ? p.labelAr : p.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <section>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("Orders", "الطلبات")}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard
            label={t("New", "جديدة")}
            value={stats.newOrders}
            icon={ShoppingBag}
            tone="amber"
            onClick={() => onGoToOrders("pending")}
          />
          <KpiCard
            label={t("Confirmed", "مؤكدة")}
            value={stats.confirmed}
            icon={CheckCircle2}
            tone="blue"
            onClick={() => onGoToOrders("confirmed")}
          />
          <KpiCard
            label={t("In Transit", "في الطريق")}
            value={stats.inTransit}
            icon={Truck}
            tone="indigo"
            onClick={() => onGoToOrders("shipped")}
          />
          <KpiCard
            label={t("Delivered", "مسلّمة")}
            value={stats.delivered}
            sub={stats.total > 0 ? formatPercent(stats.delivered, stats.total) : undefined}
            icon={Package}
            tone="green"
            onClick={() => onGoToOrders("delivered")}
          />
          <KpiCard
            label={t("Returned", "مرتجعة")}
            value={stats.returned}
            sub={
              stats.total > 0 && stats.returned > 0
                ? formatPercent(stats.returned, stats.total)
                : undefined
            }
            icon={RotateCcw}
            tone="red"
            onClick={() => onGoToOrders("returned")}
          />
        </div>
      </section>

      {/* Finance — permission gated */}
      {canFinance && (
        <section>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {t("Finance", "المالية")}
          </p>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <KpiCard
              label={t("Sales", "المبيعات")}
              value={financeValue(sales)}
              sub={t("Period order totals", "إجمالي طلبات الفترة")}
              icon={ShoppingBag}
              tone="amber"
            />
            <KpiCard
              label={t("Expenses", "المصاريف")}
              value={financeValue(expenses)}
              sub={t("Ads + other expenses", "إعلانات ومصاريف أخرى")}
              icon={XCircle}
              tone="red"
            />
            <KpiCard
              label={t("Net Profit", "صافي الربح")}
              value={financeValue(profit)}
              sub={
                sales != null && sales > 0
                  ? t(`Margin ${margin}%`, `هامش ${margin}%`)
                  : t("On delivered orders", "على الطلبات المسلّمة")
              }
              icon={ArrowUpRight}
              tone={profit != null && profit < 0 ? "red" : "green"}
            />
            <KpiCard
              label={t("Cash on Hand", "الصندوق")}
              value={financeValue(cash)}
              sub={t("Opening + cash in − out", "افتتاح + دخول − خروج")}
              icon={Wallet}
              tone="blue"
            />
          </div>

          {/* Compact summary strip */}
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-xl border border-border/40 bg-muted/20 p-3 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">{t("Revenue", "الإيراد")}</p>
              <p className="text-sm font-bold tabular-nums">{financeValue(sales)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">{t("Expenses", "المصاريف")}</p>
              <p className="text-sm font-bold tabular-nums">{financeValue(expenses)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">{t("Net Profit", "صافي الربح")}</p>
              <p className="text-sm font-bold tabular-nums">{financeValue(profit)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">{t("Profit Margin", "هامش الربح")}</p>
              <p className="text-sm font-bold tabular-nums">
                {financeLoading || financeError || sales === null
                  ? t("Not available", "غير متاح")
                  : `${margin}%`}
              </p>
            </div>
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            {t(
              "Net profit = delivered revenue − product cost − shipping − commissions − ads − other expenses.",
              "صافي الربح = إيراد المسلّم − تكلفة المنتجات − الشحن − العمولات − الإعلانات − مصاريف أخرى.",
            )}
          </p>
        </section>
      )}

      {/* Operations rates */}
      <section>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {t("Operations", "العمليات")}
        </p>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-border/50 bg-card p-3 text-center">
            <p className="text-lg font-extrabold tabular-nums">{stats.confirmRate}%</p>
            <p className="text-[10px] text-muted-foreground">
              {t("Confirmation", "التأكيد")}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-3 text-center">
            <p className="text-lg font-extrabold tabular-nums text-emerald-700">
              {stats.deliveryRate}%
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t("Delivery", "التوصيل")}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-3 text-center">
            <p className="text-lg font-extrabold tabular-nums text-rose-700">
              {stats.returnRate}%
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t("Returns", "المرتجعات")}
            </p>
          </div>
        </div>
      </section>

      {/* Attention */}
      {attention.length > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="size-3.5 text-amber-600" />
            <p className="text-xs font-bold text-amber-900">
              {t("Needs Attention", "يحتاج اهتماماً")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {attention.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                  item.color === "red" && "bg-rose-100 text-rose-800 hover:bg-rose-200",
                  item.color === "amber" && "bg-amber-100 text-amber-900 hover:bg-amber-200",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recent orders */}
      {filtered.length > 0 ? (
        <section className="rounded-xl border border-border/50 bg-card p-3.5 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold">{t("Recent Orders", "آخر الطلبات")}</p>
            <button
              type="button"
              onClick={() => onGoToOrders()}
              className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
            >
              {t("View all", "عرض الكل")}
              <ArrowUpRight className="size-3" />
            </button>
          </div>
          <div className="divide-y divide-border/30">
            {filtered.slice(0, 8).map((o) => {
              const st = STATUS_LABEL[o.orderStatus] ?? {
                en: o.orderStatus,
                ar: o.orderStatus,
              };
              return (
                <div
                  key={o.orderId}
                  className="flex items-center gap-2 py-2 text-sm"
                >
                  <span className="w-16 shrink-0 font-mono text-[10px] text-muted-foreground">
                    #{o.orderId.slice(-6)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{o.customerName}</p>
                  </div>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-accent">
                    {money(o.total)}
                  </span>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold">
                    {locale === "ar" ? st.ar : st.en}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        !loading && (
          <div className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center">
            <Timer className="mx-auto size-8 text-muted-foreground/30" />
            <p className="mt-2 text-sm font-semibold">
              {t("No orders in this period", "لا توجد طلبات في هذه الفترة")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t(
                "Try another date range. Finance figures still use recorded expenses for this period.",
                "جرّب فترة أخرى. أرقام المالية ما زالت تعتمد المصاريف المسجلة لهذه الفترة.",
              )}
            </p>
          </div>
        )
      )}
    </div>
  );
}
