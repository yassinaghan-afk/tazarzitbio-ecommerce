"use client";

import { useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

import type { OrderRecord } from "@/lib/orders/types";
import { formatMoney } from "@/lib/admin/money";
import { cn } from "@/lib/utils";

interface Customer {
  phone: string;
  name: string;
  city: string;
  orderCount: number;
  delivered: number;
  returned: number;
  totalSpent: number;
  lastOrderAt: string;
  type: "new" | "returning" | "vip";
}

function normalizePhone(p: string) {
  return p.replace(/\D/g, "").replace(/^212/, "0").replace(/^00212/, "0");
}

function buildCustomers(orders: OrderRecord[]): Customer[] {
  const map = new Map<string, Customer>();
  const sorted = [...orders].sort(
    (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
  );
  for (const o of sorted) {
    const key = normalizePhone(o.phone);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        phone: o.phone,
        name: o.customerName,
        city: o.city ?? "",
        orderCount: 1,
        delivered: o.orderStatus === "delivered" ? 1 : 0,
        returned:  o.orderStatus === "returned"  ? 1 : 0,
        totalSpent: o.orderStatus === "delivered" ? o.total : 0,
        lastOrderAt: o.createdAt ?? "",
        type: "new",
      });
    } else {
      existing.orderCount += 1;
      if (o.orderStatus === "delivered") { existing.delivered += 1; existing.totalSpent += o.total; }
      if (o.orderStatus === "returned")  existing.returned += 1;
      if (o.createdAt && o.createdAt > existing.lastOrderAt) existing.lastOrderAt = o.createdAt;
    }
  }
  // Assign type
  for (const c of map.values()) {
    if (c.delivered >= 5) c.type = "vip";
    else if (c.orderCount >= 2) c.type = "returning";
    else c.type = "new";
  }
  return [...map.values()].sort((a, b) => b.totalSpent - a.totalSpent);
}

const TYPE_BADGE: Record<Customer["type"], { label: string; labelAr: string; cls: string }> = {
  new:       { label: "New",       labelAr: "جديد",     cls: "bg-blue-100 text-blue-800" },
  returning: { label: "Returning", labelAr: "عائد",     cls: "bg-indigo-100 text-indigo-800" },
  vip:       { label: "VIP",       labelAr: "VIP",      cls: "bg-amber-100 text-amber-800" },
};

function formatMAD(n: number) {
  return formatMoney(n);
}

function fmtDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-MA", { day: "2-digit", month: "short", year: "numeric" });
}

interface Props {
  orders: OrderRecord[];
  locale: "en" | "ar";
}

export function CustomersSection({ orders, locale }: Props) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Customer["type"]>("all");

  const customers = useMemo(() => buildCustomers(orders), [orders]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return customers.filter((c) => {
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.phone.includes(q) && !c.city.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [customers, search, typeFilter]);

  const t = (en: string, ar: string) => locale === "ar" ? ar : en;

  const totals = useMemo(() => ({
    all:       customers.length,
    new:       customers.filter((c) => c.type === "new").length,
    returning: customers.filter((c) => c.type === "returning").length,
    vip:       customers.filter((c) => c.type === "vip").length,
  }), [customers]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">
            {t("Customers", "العملاء")}
          </h2>
          <p className="text-sm text-muted-foreground">{totals.all} {t("unique customers", "عميل فريد")}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {(["new", "returning", "vip"] as const).map((type) => {
          const info = TYPE_BADGE[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
              className={cn(
                "rounded-2xl border p-4 text-center transition-all",
                typeFilter === type ? "border-accent/40 bg-accent/10" : "border-border/50 bg-card hover:border-border",
              )}
            >
              <p className="text-2xl font-extrabold text-foreground">{totals[type]}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {locale === "ar" ? info.labelAr : info.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder={t("Search by name, phone or city…", "بحث بالاسم أو الهاتف أو المدينة…")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border/60 bg-background py-2.5 ps-9 pe-4 text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 text-start font-semibold text-muted-foreground">{t("Customer", "العميل")}</th>
              <th className="px-4 py-3 text-start font-semibold text-muted-foreground hidden sm:table-cell">{t("City", "المدينة")}</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">{t("Orders", "الطلبات")}</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground hidden md:table-cell">{t("Delivered", "مسلّم")}</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground hidden md:table-cell">{t("Returned", "مرتجع")}</th>
              <th className="px-4 py-3 text-end font-semibold text-muted-foreground">{t("Total Spent", "المجموع")}</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground hidden lg:table-cell">{t("Type", "النوع")}</th>
              <th className="px-4 py-3 text-end font-semibold text-muted-foreground hidden lg:table-cell">{t("Last Order", "آخر طلب")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((c) => {
              const badge = TYPE_BADGE[c.type];
              return (
                <tr key={c.phone} className="border-b border-border/30 hover:bg-muted/20 transition-colors last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{c.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.city || "—"}</td>
                  <td className="px-4 py-3 text-center font-bold text-foreground">{c.orderCount}</td>
                  <td className="px-4 py-3 text-center text-emerald-700 font-semibold hidden md:table-cell">{c.delivered}</td>
                  <td className="px-4 py-3 text-center text-rose-700 font-semibold hidden md:table-cell">{c.returned}</td>
                  <td className="px-4 py-3 text-end font-bold text-accent tabular-nums">{formatMAD(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", badge.cls)}>
                      {locale === "ar" ? badge.labelAr : badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end text-muted-foreground text-xs hidden lg:table-cell">
                    {fmtDate(c.lastOrderAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center">
            <Users className="mx-auto size-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm font-semibold text-foreground">{t("No customers found", "لا يوجد عملاء")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
