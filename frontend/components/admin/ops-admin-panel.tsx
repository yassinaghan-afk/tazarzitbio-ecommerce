"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Banknote,
  Megaphone,
  PieChart,
  Receipt,
  Users,
  UserCheck,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FinancePayload = {
  kpis: {
    totalSales: number;
    deliveredRevenue: number;
    pendingRevenue: number;
    productCosts: number;
    shippingCosts: number;
    confirmationCommissions: number;
    advertisingSpend: number;
    otherExpenses: number;
    netProfit: number;
    cashOnHand: number;
    amountReceivable: number;
    amountPayable: number;
    orderCount: number;
    deliveredCount: number;
  };
  partners: {
    partnerId: string;
    name: string;
    ownershipPercent: number;
    contributed: number;
    expensesPaid: number;
    withdrawn: number;
    received: number;
    profitShare: number;
    netPosition: number;
  }[];
  cash: {
    opening: number;
    cashIn: number;
    cashOut: number;
    expected: number;
    actual: number | null;
    difference: number | null;
  };
  settings: {
    openingCash: number;
    defaultCommissionPerConfirmed: number;
    commissionOn: string;
    actualCashCounted?: number;
  };
};

function mad(n: number) {
  return `${Math.round(n).toLocaleString()} DH`;
}

function Kpi({
  label,
  labelAr,
  value,
  tone = "default",
}: {
  label: string;
  labelAr: string;
  value: string;
  tone?: "default" | "green" | "red" | "amber" | "blue";
}) {
  const toneClass = {
    default: "text-foreground",
    green: "text-emerald-700",
    red: "text-rose-700",
    amber: "text-amber-700",
    blue: "text-blue-700",
  }[tone];
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="text-xs text-muted-foreground" dir="rtl">
        {labelAr}
      </p>
      <p className={cn("mt-2 text-2xl font-extrabold tabular-nums", toneClass)}>
        {value}
      </p>
    </div>
  );
}

const PRESETS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "this_week", label: "This Week" },
  { id: "this_month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
  { id: "this_year", label: "This Year" },
] as const;

type OpsTab =
  | "finance"
  | "customers"
  | "agents"
  | "expenses"
  | "ads"
  | "cash"
  | "partners"
  | "audit";

export function OpsAdminPanel({
  locale = "en",
}: {
  locale?: "en" | "ar";
}) {
  const [tab, setTab] = useState<OpsTab>("finance");
  const [preset, setPreset] = useState("this_month");
  const [finance, setFinance] = useState<FinancePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<
    {
      phone: string;
      name: string;
      city: string;
      orderCount: number;
      deliveredCount: number;
      totalSpent?: number;
      customerType: string;
      lastOrderAt: string;
      note: string;
      orders: { orderId: string; sequenceLabel: string; total: number; orderStatus: string; createdAt: string }[];
    }[]
  >([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [agents, setAgents] = useState<
    { id: string; name: string; username: string; commissionPerConfirmed: number; isActive: boolean }[]
  >([]);
  const [expenses, setExpenses] = useState<{ id: string; date: string; amount: number; category: string; description: string; paidBy: string }[]>([]);
  const [ads, setAds] = useState<{ id: string; date: string; platform: string; campaign: string; amount: number; paidBy: string }[]>([]);
  const [cashTxns, setCashTxns] = useState<{ id: string; date: string; amount: number; direction: string; description: string; type: string }[]>([]);
  const [partners, setPartners] = useState<{ id: string; name: string; ownershipPercent: number }[]>([]);
  const [audit, setAudit] = useState<{ id: string; action: string; objectType: string; at: string }[]>([]);

  // forms
  const [agentForm, setAgentForm] = useState({ name: "", username: "", password: "", commission: "10" });
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    category: "other",
    description: "",
    paidBy: "company",
    partnerId: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [adForm, setAdForm] = useState({
    amount: "",
    platform: "meta",
    campaign: "",
    paidBy: "yassin",
    partnerId: "partner-yassin",
    date: new Date().toISOString().slice(0, 10),
  });
  const [cashForm, setCashForm] = useState({
    amount: "",
    direction: "in",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [partnerTxn, setPartnerTxn] = useState({
    partnerId: "partner-yassin",
    type: "contribution",
    amount: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [openingCash, setOpeningCash] = useState("");
  const [actualCash, setActualCash] = useState("");
  const [msg, setMsg] = useState("");

  const loadFinance = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/finance?preset=${preset}`, { cache: "no-store" });
      if (res.status === 403) {
        setError("No finance access");
        setFinance(null);
        return;
      }
      if (!res.ok) throw new Error("fail");
      const data = (await res.json()) as FinancePayload;
      setFinance(data);
      setOpeningCash(String(data.settings.openingCash ?? 0));
      setActualCash(
        typeof data.settings.actualCashCounted === "number"
          ? String(data.settings.actualCashCounted)
          : "",
      );
    } catch {
      setError("Failed to load finance");
    } finally {
      setLoading(false);
    }
  }, [preset]);

  const loadResource = useCallback(async (resource: string) => {
    const res = await fetch(`/api/admin/ops?resource=${resource}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  }, []);

  useEffect(() => {
    if (tab === "finance") void loadFinance();
  }, [tab, loadFinance]);

  useEffect(() => {
    if (tab === "customers") {
      void fetch("/api/admin/customers", { cache: "no-store" })
        .then((r) => r.json())
        .then((d: { customers: typeof customers }) => setCustomers(d.customers ?? []));
    }
    if (tab === "agents") {
      void loadResource("agents").then((d) => d && setAgents(d.agents ?? []));
    }
    if (tab === "expenses") {
      void loadResource("expenses").then((d) => d && setExpenses(d.expenses ?? []));
      void loadResource("partners").then((d) => d && setPartners(d.partners ?? []));
    }
    if (tab === "ads") {
      void loadResource("ads").then((d) => d && setAds(d.adExpenses ?? []));
      void loadResource("partners").then((d) => d && setPartners(d.partners ?? []));
    }
    if (tab === "cash") {
      void loadResource("cash").then((d) => d && setCashTxns(d.cashTransactions ?? []));
      void loadFinance();
    }
    if (tab === "partners") {
      void loadFinance();
      void loadResource("partners").then((d) => d && setPartners(d.partners ?? []));
    }
    if (tab === "audit") {
      void fetch("/api/admin/audit-logs", { cache: "no-store" })
        .then((r) => r.json())
        .then((d: { logs?: typeof audit; auditLogs?: typeof audit }) =>
          setAudit(d.logs ?? d.auditLogs ?? []),
        );
    }
  }, [tab, loadResource, loadFinance]);

  async function postOps(resource: string, data: Record<string, unknown>) {
    setMsg("");
    const res = await fetch("/api/admin/ops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource, data }),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => null)) as { error?: string } | null;
      setMsg(err?.error || "Failed");
      return false;
    }
    setMsg("Saved");
    return true;
  }

  const tabs: { id: OpsTab; label: string; labelAr: string; icon: React.ElementType }[] = [
    { id: "finance", label: "Finance", labelAr: "المالية", icon: PieChart },
    { id: "customers", label: "Customers", labelAr: "الزبناء", icon: Users },
    { id: "agents", label: "Agents", labelAr: "موظفو التأكيد", icon: UserCheck },
    { id: "expenses", label: "Expenses", labelAr: "المصاريف", icon: Receipt },
    { id: "ads", label: "Advertising", labelAr: "الإعلانات", icon: Megaphone },
    { id: "cash", label: "Cash", labelAr: "الصندوق", icon: Wallet },
    { id: "partners", label: "Partners", labelAr: "الشركاء", icon: Banknote },
    { id: "audit", label: "Audit", labelAr: "السجل", icon: Receipt },
  ];

  const selected = customers.find((c) => c.phone === selectedCustomer);

  return (
    <div className="space-y-5" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div>
        <h2 className="text-2xl font-extrabold">
          {locale === "ar" ? "العمليات والمالية" : "Operations & Finance"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {locale === "ar"
            ? "لوحة الإدارة — بدون بيانات وهمية"
            : "Live ledger from store records — no mock numbers"}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map(({ id, label, labelAr, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
              tab === id
                ? "bg-accent text-accent-foreground"
                : "bg-secondary/70 text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {locale === "ar" ? labelAr : label}
          </button>
        ))}
      </div>

      {msg && (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          {msg}
        </p>
      )}
      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800">
          {error}
        </p>
      )}

      {tab === "finance" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold",
                  preset === p.id ? "bg-foreground text-background" : "bg-secondary",
                )}
              >
                {p.label}
              </button>
            ))}
            <Button size="sm" variant="outline" onClick={() => void loadFinance()}>
              Refresh
            </Button>
          </div>
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {finance && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <Kpi label="Total Sales" labelAr="إجمالي المبيعات" value={mad(finance.kpis.totalSales)} tone="amber" />
                <Kpi label="Delivered Revenue" labelAr="إيرادات مسلّمة" value={mad(finance.kpis.deliveredRevenue)} tone="green" />
                <Kpi label="Pending Revenue" labelAr="إيرادات معلّقة" value={mad(finance.kpis.pendingRevenue)} tone="amber" />
                <Kpi label="Product Costs" labelAr="تكلفة المنتجات" value={mad(finance.kpis.productCosts)} />
                <Kpi label="Shipping Costs" labelAr="تكلفة الشحن" value={mad(finance.kpis.shippingCosts)} />
                <Kpi label="Confirmation Commissions" labelAr="عمولات التأكيد" value={mad(finance.kpis.confirmationCommissions)} />
                <Kpi label="Advertising Spend" labelAr="إنفاق الإعلانات" value={mad(finance.kpis.advertisingSpend)} tone="red" />
                <Kpi label="Other Expenses" labelAr="مصاريف أخرى" value={mad(finance.kpis.otherExpenses)} />
                <Kpi label="Net Profit" labelAr="صافي الربح" value={mad(finance.kpis.netProfit)} tone={finance.kpis.netProfit >= 0 ? "green" : "red"} />
                <Kpi label="Cash on Hand" labelAr="الكاش المتوفر" value={mad(finance.kpis.cashOnHand)} tone="blue" />
                <Kpi label="Receivable" labelAr="المستحقات" value={mad(finance.kpis.amountReceivable)} />
                <Kpi label="Payable" labelAr="المستحق علينا" value={mad(finance.kpis.amountPayable)} />
              </div>
              <p className="text-xs text-muted-foreground">
                Sales ≠ Cash. Delivered revenue uses order totals; COGS from product costPrice; ads from Ad Expenses ledger.
              </p>
            </>
          )}
        </div>
      )}

      {tab === "customers" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
            <p className="mb-3 font-bold">Customers ({customers.length})</p>
            <div className="max-h-[28rem] space-y-2 overflow-y-auto">
              {customers.map((c) => (
                <button
                  key={c.phone}
                  type="button"
                  onClick={() => setSelectedCustomer(c.phone)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2 text-start text-sm",
                    selectedCustomer === c.phone ? "border-accent bg-accent/5" : "border-border/50",
                  )}
                >
                  <div className="flex justify-between gap-2">
                    <span className="font-bold">{c.name}</span>
                    <span className="text-xs uppercase text-muted-foreground">{c.customerType}</span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground" dir="ltr">
                    {c.phone} · {c.city}
                  </p>
                  <p className="text-xs">
                    Orders: {c.orderCount} · Delivered: {c.deliveredCount}
                    {typeof c.totalSpent === "number" ? ` · ${mad(c.totalSpent)}` : ""}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
            {selected ? (
              <div className="space-y-3">
                <p className="font-bold text-lg">{selected.name}</p>
                <p className="font-mono text-sm" dir="ltr">
                  {selected.phone}
                </p>
                <p className="text-sm text-muted-foreground">{selected.city}</p>
                <ul className="space-y-2 text-sm">
                  {selected.orders.map((o) => (
                    <li key={o.orderId} className="flex justify-between gap-2 border-b border-border/40 py-2">
                      <div>
                        <p className="font-semibold">{o.sequenceLabel}</p>
                        <p className="text-xs text-muted-foreground">
                          {o.orderId} · {new Date(o.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="font-bold">{mad(o.total)}</p>
                        <p className="text-xs">{o.orderStatus}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a customer</p>
            )}
          </div>
        </div>
      )}

      {tab === "agents" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <form
            className="space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await postOps("agents", {
                name: agentForm.name,
                username: agentForm.username,
                password: agentForm.password,
                commissionPerConfirmed: Number(agentForm.commission) || 10,
                role: "confirmation_agent",
              });
              if (ok) {
                setAgentForm({ name: "", username: "", password: "", commission: "10" });
                const d = await loadResource("agents");
                if (d) setAgents(d.agents ?? []);
              }
            }}
          >
            <p className="font-bold">Create confirmation agent</p>
            <div>
              <Label>Name</Label>
              <Input value={agentForm.name} onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })} required />
            </div>
            <div>
              <Label>Username</Label>
              <Input value={agentForm.username} onChange={(e) => setAgentForm({ ...agentForm, username: e.target.value })} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={agentForm.password} onChange={(e) => setAgentForm({ ...agentForm, password: e.target.value })} required />
            </div>
            <div>
              <Label>Commission / confirmed order (DH)</Label>
              <Input value={agentForm.commission} onChange={(e) => setAgentForm({ ...agentForm, commission: e.target.value })} />
            </div>
            <Button type="submit" variant="gold" className="rounded-full">
              Create agent
            </Button>
          </form>
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
            <p className="mb-3 font-bold">Agents</p>
            <ul className="space-y-2 text-sm">
              {agents.map((a) => (
                <li key={a.id} className="flex justify-between border-b border-border/40 py-2">
                  <div>
                    <p className="font-semibold">{a.name}</p>
                    <p className="text-xs text-muted-foreground">@{a.username}</p>
                  </div>
                  <p className="font-bold">{a.commissionPerConfirmed} DH</p>
                </li>
              ))}
              {agents.length === 0 && (
                <p className="text-muted-foreground">No agents yet</p>
              )}
            </ul>
          </div>
        </div>
      )}

      {tab === "expenses" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <form
            className="space-y-3 rounded-2xl border p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await postOps("expenses", {
                amount: Number(expenseForm.amount),
                category: expenseForm.category,
                description: expenseForm.description,
                paidBy: expenseForm.paidBy,
                partnerId: expenseForm.partnerId || undefined,
                date: expenseForm.date,
              });
              if (ok) {
                const d = await loadResource("expenses");
                if (d) setExpenses(d.expenses ?? []);
              }
            }}
          >
            <p className="font-bold">Add expense</p>
            <Input placeholder="Amount DH" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={expenseForm.category}
              onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
            >
              {["advertising","products_inventory","shipping","confirmation","packaging","salaries","software","operations","other"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Input placeholder="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={expenseForm.paidBy}
              onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
            >
              <option value="company">Company</option>
              <option value="yassin">Yassin</option>
              <option value="mohamed">Mohamed</option>
              <option value="shared">Shared</option>
            </select>
            <select
              className="w-full rounded-xl border px-3 py-2 text-sm"
              value={expenseForm.partnerId}
              onChange={(e) => setExpenseForm({ ...expenseForm, partnerId: e.target.value })}
            >
              <option value="">Partner (optional)</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
            <Button type="submit">Save expense</Button>
          </form>
          <div className="rounded-2xl border p-4 max-h-[28rem] overflow-y-auto">
            {expenses.map((e) => (
              <div key={e.id} className="flex justify-between border-b py-2 text-sm">
                <div>
                  <p className="font-semibold">{e.description || e.category}</p>
                  <p className="text-xs text-muted-foreground">{e.date} · {e.paidBy}</p>
                </div>
                <p className="font-bold">{mad(e.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "ads" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <form
            className="space-y-3 rounded-2xl border p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await postOps("ads", {
                amount: Number(adForm.amount),
                platform: adForm.platform,
                campaign: adForm.campaign,
                paidBy: adForm.paidBy,
                partnerId: adForm.partnerId || undefined,
                date: adForm.date,
              });
              if (ok) {
                const d = await loadResource("ads");
                if (d) setAds(d.adExpenses ?? []);
              }
            }}
          >
            <p className="font-bold">Add ad spend</p>
            <Input placeholder="Amount DH" value={adForm.amount} onChange={(e) => setAdForm({ ...adForm, amount: e.target.value })} required />
            <select className="w-full rounded-xl border px-3 py-2 text-sm" value={adForm.platform} onChange={(e) => setAdForm({ ...adForm, platform: e.target.value })}>
              <option value="meta">Meta</option>
              <option value="tiktok">TikTok</option>
              <option value="google">Google</option>
              <option value="other">Other</option>
            </select>
            <Input placeholder="Campaign" value={adForm.campaign} onChange={(e) => setAdForm({ ...adForm, campaign: e.target.value })} />
            <select className="w-full rounded-xl border px-3 py-2 text-sm" value={adForm.paidBy} onChange={(e) => setAdForm({ ...adForm, paidBy: e.target.value })}>
              <option value="yassin">Yassin</option>
              <option value="mohamed">Mohamed</option>
              <option value="shared">Shared</option>
              <option value="company">Company</option>
            </select>
            <select className="w-full rounded-xl border px-3 py-2 text-sm" value={adForm.partnerId} onChange={(e) => setAdForm({ ...adForm, partnerId: e.target.value })}>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <Input type="date" value={adForm.date} onChange={(e) => setAdForm({ ...adForm, date: e.target.value })} />
            <Button type="submit">Save ad</Button>
          </form>
          <div className="rounded-2xl border p-4 max-h-[28rem] overflow-y-auto">
            {ads.map((a) => (
              <div key={a.id} className="flex justify-between border-b py-2 text-sm">
                <div>
                  <p className="font-semibold">{a.platform} · {a.campaign}</p>
                  <p className="text-xs text-muted-foreground">{a.date} · {a.paidBy}</p>
                </div>
                <p className="font-bold">{mad(a.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "cash" && (
        <div className="space-y-4">
          {finance && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi label="Opening Cash" labelAr="رصيد الافتتاح" value={mad(finance.cash.opening)} />
              <Kpi label="Cash In" labelAr="دخول" value={mad(finance.cash.cashIn)} tone="green" />
              <Kpi label="Cash Out" labelAr="خروج" value={mad(finance.cash.cashOut)} tone="red" />
              <Kpi label="Expected Cash" labelAr="المتوقع" value={mad(finance.cash.expected)} tone="blue" />
              {finance.cash.difference != null && (
                <Kpi
                  label="Difference"
                  labelAr="الفارق"
                  value={mad(finance.cash.difference)}
                  tone={finance.cash.difference === 0 ? "green" : "amber"}
                />
              )}
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            <form
              className="space-y-3 rounded-2xl border p-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await postOps("cash", {
                  amount: Number(cashForm.amount),
                  direction: cashForm.direction,
                  description: cashForm.description,
                  date: cashForm.date,
                });
                if (ok) {
                  const d = await loadResource("cash");
                  if (d) setCashTxns(d.cashTransactions ?? []);
                  void loadFinance();
                }
              }}
            >
              <p className="font-bold">Cash movement</p>
              <Input placeholder="Amount" value={cashForm.amount} onChange={(e) => setCashForm({ ...cashForm, amount: e.target.value })} required />
              <select className="w-full rounded-xl border px-3 py-2 text-sm" value={cashForm.direction} onChange={(e) => setCashForm({ ...cashForm, direction: e.target.value })}>
                <option value="in">Cash In</option>
                <option value="out">Cash Out</option>
              </select>
              <Input placeholder="Description" value={cashForm.description} onChange={(e) => setCashForm({ ...cashForm, description: e.target.value })} />
              <Input type="date" value={cashForm.date} onChange={(e) => setCashForm({ ...cashForm, date: e.target.value })} />
              <Button type="submit">Record</Button>
            </form>
            <form
              className="space-y-3 rounded-2xl border p-4"
              onSubmit={async (e) => {
                e.preventDefault();
                await fetch("/api/admin/finance", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    openingCash: Number(openingCash) || 0,
                    actualCashCounted: actualCash === "" ? undefined : Number(actualCash),
                  }),
                });
                setMsg("Cash settings saved");
                void loadFinance();
              }}
            >
              <p className="font-bold">Reconciliation</p>
              <div>
                <Label>Opening cash</Label>
                <Input value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} />
              </div>
              <div>
                <Label>Actual cash counted</Label>
                <Input value={actualCash} onChange={(e) => setActualCash(e.target.value)} />
              </div>
              <Button type="submit">Save</Button>
            </form>
          </div>
          <div className="rounded-2xl border p-4 max-h-64 overflow-y-auto">
            {cashTxns.map((t) => (
              <div key={t.id} className="flex justify-between border-b py-2 text-sm">
                <div>
                  <p className="font-semibold">{t.description || t.type}</p>
                  <p className="text-xs text-muted-foreground">{t.date} · {t.direction}</p>
                </div>
                <p className={cn("font-bold", t.direction === "in" ? "text-emerald-700" : "text-rose-700")}>
                  {t.direction === "in" ? "+" : "-"}
                  {mad(t.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "partners" && finance && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {finance.partners.map((p) => (
              <div key={p.partnerId} className="rounded-2xl border border-border/60 bg-card/70 p-4">
                <p className="text-lg font-extrabold">{p.name}</p>
                <p className="text-xs text-muted-foreground">Ownership {p.ownershipPercent}%</p>
                <dl className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><dt>Contributed</dt><dd className="font-bold">{mad(p.contributed)}</dd></div>
                  <div className="flex justify-between"><dt>Expenses paid</dt><dd className="font-bold">{mad(p.expensesPaid)}</dd></div>
                  <div className="flex justify-between"><dt>Withdrawn</dt><dd className="font-bold">{mad(p.withdrawn)}</dd></div>
                  <div className="flex justify-between"><dt>Received</dt><dd className="font-bold">{mad(p.received)}</dd></div>
                  <div className="flex justify-between border-t pt-1"><dt>Profit share</dt><dd className="font-bold">{mad(p.profitShare)}</dd></div>
                  <div className="flex justify-between"><dt>Net position</dt><dd className={cn("font-extrabold", p.netPosition >= 0 ? "text-emerald-700" : "text-rose-700")}>{mad(p.netPosition)}</dd></div>
                </dl>
              </div>
            ))}
          </div>
          <form
            className="grid max-w-lg gap-3 rounded-2xl border p-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const ok = await postOps("partner-txns", {
                partnerId: partnerTxn.partnerId,
                type: partnerTxn.type,
                amount: Number(partnerTxn.amount),
                description: partnerTxn.description,
                date: partnerTxn.date,
              });
              if (ok) void loadFinance();
            }}
          >
            <p className="font-bold">Partner transaction</p>
            <select className="rounded-xl border px-3 py-2 text-sm" value={partnerTxn.partnerId} onChange={(e) => setPartnerTxn({ ...partnerTxn, partnerId: e.target.value })}>
              {(partners.length ? partners : [
                { id: "partner-yassin", name: "Yassin", ownershipPercent: 50 },
                { id: "partner-mohamed", name: "Mohamed", ownershipPercent: 50 },
              ]).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select className="rounded-xl border px-3 py-2 text-sm" value={partnerTxn.type} onChange={(e) => setPartnerTxn({ ...partnerTxn, type: e.target.value })}>
              <option value="contribution">Contribution</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="received">Received</option>
              <option value="expense_paid">Expense paid</option>
            </select>
            <Input placeholder="Amount" value={partnerTxn.amount} onChange={(e) => setPartnerTxn({ ...partnerTxn, amount: e.target.value })} required />
            <Input placeholder="Description" value={partnerTxn.description} onChange={(e) => setPartnerTxn({ ...partnerTxn, description: e.target.value })} />
            <Input type="date" value={partnerTxn.date} onChange={(e) => setPartnerTxn({ ...partnerTxn, date: e.target.value })} />
            <Button type="submit">Save</Button>
          </form>
          <p className="text-xs text-muted-foreground">
            Business profit and partner cash position are separate. Adjust ownership % via partners API/store.
          </p>
        </div>
      )}

      {tab === "audit" && (
        <div className="rounded-2xl border p-4 max-h-[32rem] overflow-y-auto">
          {audit.map((a) => (
            <div key={a.id} className="border-b py-2 text-sm">
              <p className="font-semibold">{a.action}</p>
              <p className="text-xs text-muted-foreground">
                {a.objectType} · {new Date(a.at).toLocaleString()}
              </p>
            </div>
          ))}
          {audit.length === 0 && <p className="text-muted-foreground">No audit entries</p>}
        </div>
      )}
    </div>
  );
}
