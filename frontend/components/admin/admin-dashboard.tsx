"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Boxes,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Coins,
  Globe,
  HandshakeIcon,
  Home,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Package,
  Radar,
  Receipt,
  Search,
  Settings2,
  Shield,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users,
  UserCog2,
  X,
} from "lucide-react";

import { BannersManager } from "@/components/admin/banners-manager";
import { DeliveryOverviewPanel } from "@/components/admin/delivery-overview";
import { EliteDeliverySettingsForm } from "@/components/admin/elite-delivery-settings";
import { HomepageEditor } from "@/components/admin/homepage-editor";
import { LandingPagesManager } from "@/components/admin/landing-pages-manager";
import { OpsAdminPanel } from "@/components/admin/ops-admin-panel";
import { OrdersTable } from "@/components/admin/orders-table";
import { PricingDashboard } from "@/components/admin/pricing-dashboard";
import { ProductsManager } from "@/components/admin/products-manager";
import { ShippingSettingsForm } from "@/components/admin/shipping-settings-form";

import { ActivitySection } from "@/components/admin/sections/activity-section";
import { CustomersSection } from "@/components/admin/sections/customers-section";
import { DashSection } from "@/components/admin/sections/dash-section";
import { RolesSection } from "@/components/admin/sections/roles-section";
import { TeamSection } from "@/components/admin/sections/team-section";

import type { OrderRecord } from "@/lib/orders/types";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand/brand-logo";

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */
type AdminSection =
  | "dashboard" | "orders" | "customers" | "products"
  | "delivery" | "finance" | "expenses" | "advertising"
  | "partners" | "reports"
  | "team" | "roles" | "activity"
  | "settings" | "content";

type NavGroup = {
  labelEn: string; labelAr: string;
  items: NavItem[];
};
type NavItem = {
  id: AdminSection;
  labelEn: string; labelAr: string;
  icon: React.ElementType;
  requireFinance?: boolean;
  requireAdmin?: boolean;
  href?: string; // external link
};

const NAV_GROUPS: NavGroup[] = [
  {
    labelEn: "Main", labelAr: "رئيسي",
    items: [
      { id: "dashboard",   labelEn: "Dashboard",   labelAr: "لوحة القيادة", icon: LayoutDashboard },
      { id: "orders",      labelEn: "Orders",       labelAr: "الطلبات",      icon: ShoppingBag },
      { id: "customers",   labelEn: "Customers",    labelAr: "العملاء",      icon: Users },
      { id: "products",    labelEn: "Products",     labelAr: "المنتجات",     icon: Package },
      { id: "delivery",    labelEn: "Delivery",     labelAr: "التوصيل",      icon: Truck },
    ],
  },
  {
    labelEn: "Finance", labelAr: "المالية",
    items: [
      { id: "finance",     labelEn: "Finance",      labelAr: "المالية",      icon: TrendingUp,     requireFinance: true },
      { id: "expenses",    labelEn: "Expenses",     labelAr: "المصاريف",     icon: Receipt,        requireFinance: true },
      { id: "advertising", labelEn: "Advertising",  labelAr: "الإعلانات",    icon: Megaphone,      requireFinance: true },
      { id: "partners",    labelEn: "Partners",     labelAr: "الشركاء",      icon: HandshakeIcon,  requireFinance: true },
      { id: "reports",     labelEn: "Reports",      labelAr: "التقارير",     icon: BarChart3,      requireFinance: true },
    ],
  },
  {
    labelEn: "Management", labelAr: "الإدارة",
    items: [
      { id: "team",      labelEn: "Team",              labelAr: "الفريق",           icon: UserCog2 },
      { id: "roles",     labelEn: "Roles & Permissions",labelAr: "الأدوار والصلاحيات",icon: Shield },
      { id: "activity",  labelEn: "Activity Log",       labelAr: "سجل النشاط",       icon: Activity,  requireAdmin: true },
    ],
  },
  {
    labelEn: "Settings", labelAr: "الإعدادات",
    items: [
      { id: "settings", labelEn: "Settings",  labelAr: "الإعدادات",  icon: Settings2 },
      { id: "content",  labelEn: "Content",   labelAr: "المحتوى",   icon: Globe },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Sidebar component                                                    */
/* ------------------------------------------------------------------ */
function Sidebar({
  section, onSection, locale, session, collapsed, onCollapse, mobile, onClose,
}: {
  section: AdminSection;
  onSection: (s: AdminSection) => void;
  locale: "en" | "ar";
  session: SessionInfo | null;
  collapsed: boolean;
  onCollapse: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const t = (en: string, ar: string) => locale === "ar" ? ar : en;
  const canFinance =
    session?.role !== "confirmation_agent" &&
    session?.permissions?.finance !== false;
  const isAdmin    = session?.role === "admin";

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-card border-e border-border/50 transition-all duration-300",
        mobile ? "w-72" : collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-3 border-b border-border/40 px-4 py-4", collapsed && !mobile && "justify-center px-2")}>
        {(!collapsed || mobile) && (
          <div className="min-w-0 flex-1">
            <BrandLogo variant="admin" className="h-8 w-auto" />
            {session && (
              <p className="mt-1 truncate text-[11px] text-muted-foreground">
                {session.userName} · <span className="capitalize">{session.role.replace("_", " ")}</span>
              </p>
            )}
          </div>
        )}
        {!mobile && (
          <button
            type="button"
            onClick={onCollapse}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {locale === "ar"
              ? (collapsed ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />)
              : (collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />)
            }
          </button>
        )}
        {mobile && (
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary">
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group) => {
          const visible = group.items.filter((item) => {
            if (item.requireFinance && !canFinance) return false;
            if (item.requireAdmin && !isAdmin) return false;
            return true;
          });
          if (visible.length === 0) return null;
          return (
            <div key={group.labelEn}>
              {(!collapsed || mobile) && (
                <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                  {t(group.labelEn, group.labelAr)}
                </p>
              )}
              <div className="space-y-0.5">
                {visible.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { onSection(item.id); if (mobile && onClose) onClose(); }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold transition-colors",
                      collapsed && !mobile && "justify-center px-2",
                      section === item.id
                        ? "bg-accent/10 text-foreground ring-1 ring-accent/20"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                    )}
                    title={collapsed && !mobile ? t(item.labelEn, item.labelAr) : undefined}
                  >
                    <item.icon className={cn("size-4 shrink-0", section === item.id ? "text-accent" : "text-muted-foreground")} />
                    {(!collapsed || mobile) && <span className="truncate">{t(item.labelEn, item.labelAr)}</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Tracking link */}
        {(!collapsed || mobile) && (
          <div>
            <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              {t("External", "خارجي")}
            </p>
            <Link
              href="/admin/tracking"
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
            >
              <Radar className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{t("Tracking & Pixels", "التتبع والإعلانات")}</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Language + Logout */}
      <div className={cn("border-t border-border/40 p-3 space-y-2", collapsed && !mobile && "px-2")}>
        {(!collapsed || mobile) && (
          <div className="flex gap-1">
            {(["en", "ar"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  // Dispatch a custom event so the parent can pick up the locale change
                  window.dispatchEvent(new CustomEvent("admin:locale", { detail: lang }));
                }}
                className={cn(
                  "flex-1 rounded-lg py-1 text-xs font-bold transition-colors",
                  locale === lang ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80",
                )}
              >
                {lang === "en" ? "EN" : "ع"}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold text-muted-foreground hover:bg-rose-50 hover:text-rose-700 transition-colors",
            collapsed && !mobile && "justify-center px-2",
          )}
          title={collapsed && !mobile ? "Sign out" : undefined}
        >
          <LogOut className="size-4 shrink-0" />
          {(!collapsed || mobile) && t("Sign Out", "تسجيل الخروج")}
        </button>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Topbar                                                               */
/* ------------------------------------------------------------------ */
function Topbar({
  section, locale, onMenuClick, notifCount,
}: {
  section: AdminSection;
  locale: "en" | "ar";
  onMenuClick: () => void;
  notifCount?: number;
}) {
  const t = (en: string, ar: string) => locale === "ar" ? ar : en;
  const sectionLabel = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === section);

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-card px-4">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-bold text-foreground truncate">
          {sectionLabel ? t(sectionLabel.labelEn, sectionLabel.labelAr) : t("Admin", "لوحة الإدارة")}
        </h1>
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-1.5 w-56">
        <Search className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          type="search"
          placeholder={t("Search…", "بحث…")}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 min-w-0"
        />
      </div>

      {/* Notifications */}
      <button type="button" className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary transition-colors">
        <Bell className="size-5" />
        {notifCount != null && notifCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
            {notifCount > 9 ? "9+" : notifCount}
          </span>
        )}
      </button>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Session info                                                         */
/* ------------------------------------------------------------------ */
interface SessionInfo {
  role: "admin" | "manager" | "confirmation_agent";
  userId: string;
  userName: string;
  permissions?: { finance?: boolean; content?: boolean; ordersAll?: boolean };
}

/* ------------------------------------------------------------------ */
/* Section wrappers (keep existing components as-is)                   */
/* ------------------------------------------------------------------ */
function DeliverySection({ locale }: { locale: "en" | "ar" }) {
  const t = (en: string, ar: string) => locale === "ar" ? ar : en;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">{t("Delivery", "التوصيل")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("Elite Delivery integration and shipment management", "تكامل Elite Delivery وإدارة الشحنات")}
        </p>
      </div>
      <EliteDeliverySettingsForm />
      <DeliveryOverviewPanel />
    </div>
  );
}

function SettingsSection({ locale }: { locale: "en" | "ar" }) {
  const t = (en: string, ar: string) => locale === "ar" ? ar : en;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">{t("Settings", "الإعدادات")}</h2>
        <p className="text-sm text-muted-foreground">{t("Shipping, site and store configuration", "إعدادات الشحن والموقع")}</p>
      </div>
      <ShippingSettingsForm />
    </div>
  );
}

function ContentSection({ locale }: { locale: "en" | "ar" }) {
  const [tab, setTab] = useState<"landing" | "homepage" | "banners">("landing");
  const t = (en: string, ar: string) => locale === "ar" ? ar : en;
  const tabs = [
    { id: "landing" as const, labelEn: "Landing Pages", labelAr: "صفحات الهبوط" },
    { id: "homepage" as const, labelEn: "Homepage", labelAr: "الرئيسية" },
    { id: "banners" as const, labelEn: "Banners", labelAr: "الإعلانات" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">{t("Content", "المحتوى")}</h2>
        <p className="text-sm text-muted-foreground">{t("Manage landing pages, homepage and banners", "إدارة صفحات الهبوط والرئيسية والإعلانات")}</p>
      </div>
      <div className="flex gap-2 border-b border-border/50">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setTab(tb.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors",
              tab === tb.id ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t(tb.labelEn, tb.labelAr)}
          </button>
        ))}
      </div>
      {tab === "landing"  && <LandingPagesManager />}
      {tab === "homepage" && <HomepageEditor />}
      {tab === "banners"  && <BannersManager />}
    </div>
  );
}

function ProductsSection({ locale }: { locale: "en" | "ar" }) {
  const t = (en: string, ar: string) => locale === "ar" ? ar : en;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">{t("Products", "المنتجات")}</h2>
        <p className="text-sm text-muted-foreground">{t("Catalog, pricing and inventory", "الكتالوج، الأسعار والمخزون")}</p>
      </div>
      <ProductsManager />
      <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
        <p className="text-sm font-bold text-foreground mb-1">{t("Internal Pricing", "الأسعار الداخلية")}</p>
        <p className="text-xs text-muted-foreground mb-4">{t("Cost prices and margins — never shown to customers", "أسعار التكلفة والهامش — لا تظهر للعملاء")}</p>
        <PricingDashboard />
      </div>
    </div>
  );
}

function ReportsSection({ locale }: { locale: "en" | "ar" }) {
  const t = (en: string, ar: string) => locale === "ar" ? ar : en;
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">{t("Reports", "التقارير")}</h2>
        <p className="text-sm text-muted-foreground">{t("Sales, orders, delivery and financial reports", "تقارير المبيعات والطلبات والتوصيل والمالية")}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { en: "Sales Report",         ar: "تقرير المبيعات" },
          { en: "Orders Report",        ar: "تقرير الطلبات" },
          { en: "Delivery Report",      ar: "تقرير التوصيل" },
          { en: "Returns Report",       ar: "تقرير المرتجعات" },
          { en: "Confirmation Report",  ar: "تقرير التأكيد" },
          { en: "Advertising Report",   ar: "تقرير الإعلانات" },
          { en: "Expenses Report",      ar: "تقرير المصاريف" },
          { en: "Product Profitability",ar: "ربحية المنتجات" },
          { en: "Customer Report",      ar: "تقرير العملاء" },
          { en: "Partners Report",      ar: "تقرير الشركاء" },
          { en: "Cash Flow",            ar: "التدفق النقدي" },
        ].map((r) => (
          <button
            key={r.en}
            type="button"
            className="flex items-start gap-3 rounded-2xl border border-border/50 bg-card p-4 text-start shadow-sm hover:border-accent/30 hover:bg-accent/5 transition-colors"
          >
            <BarChart3 className="size-5 shrink-0 text-accent mt-0.5" />
            <div>
              <p className="font-semibold text-foreground">{t(r.en, r.ar)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("Coming soon", "قريباً")}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stub sections for finance sub-areas (reuse OpsAdminPanel tabs)      */
/* ------------------------------------------------------------------ */
function FinanceSection({ locale }: { locale: "en" | "ar" }) {
  return <OpsAdminPanel locale={locale} />;
}

function ExpensesSection({ locale }: { locale: "en" | "ar" }) {
  // OpsAdminPanel will show expenses within the finance panel
  // For now delegate to OpsAdminPanel with expenses pre-selected in the future
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">
          {locale === "ar" ? "المصاريف" : "Expenses"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {locale === "ar" ? "إدارة المصاريف والتكاليف" : "Manage expenses and operational costs"}
        </p>
      </div>
      <OpsAdminPanel locale={locale} />
    </div>
  );
}

function AdvertisingSection({ locale }: { locale: "en" | "ar" }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">
          {locale === "ar" ? "الإعلانات" : "Advertising"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {locale === "ar" ? "متابعة مصاريف الإعلانات" : "Track advertising spend across platforms"}
        </p>
      </div>
      <OpsAdminPanel locale={locale} />
    </div>
  );
}

function PartnersSection({ locale }: { locale: "en" | "ar" }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">
          {locale === "ar" ? "الشركاء" : "Partners"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {locale === "ar" ? "أرصدة الشركاء ومعاملاتهم" : "Partner balances and transactions"}
        </p>
      </div>
      <OpsAdminPanel locale={locale} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main AdminDashboard                                                  */
/* ------------------------------------------------------------------ */
export function AdminDashboard() {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState<"en" | "ar">("en");
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const canFinance =
    session?.role !== "confirmation_agent" &&
    session?.permissions?.finance !== false;

  /* Persist locale in localStorage */
  useEffect(() => {
    const saved = localStorage.getItem("admin-locale");
    if (saved === "ar" || saved === "en") setLocale(saved);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const lang = (e as CustomEvent<"en" | "ar">).detail;
      setLocale(lang);
      localStorage.setItem("admin-locale", lang);
    };
    window.addEventListener("admin:locale", handler as EventListener);
    return () => window.removeEventListener("admin:locale", handler as EventListener);
  }, []);

  /* Load orders */
  const refreshOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders?pageSize=200", { cache: "no-store" });
      const data = (await res.json()) as { orders: OrderRecord[] };
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  /* Load session */
  useEffect(() => {
    void refreshOrders();
    void fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: SessionInfo) => { if (d && "role" in (d as object)) setSession(d); })
      .catch(() => null);
  }, []);

  /* Close drawer on ESC */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* Attention count for notifications bell */
  const attentionCount =
    orders.filter((o) => o.confirmationStatus === "pending_confirmation").length +
    orders.filter((o) => o.deliveryStatus === "failed_delivery").length;

  const goToOrders = (filter?: string) => {
    if (filter) {
      // Store filter in sessionStorage so OrdersTable can pre-filter
      sessionStorage.setItem("admin-orders-filter", filter);
    }
    setSection("orders");
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex bg-muted/30"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col h-full">
        <Sidebar
          section={section}
          onSection={setSection}
          locale={locale}
          session={session}
          collapsed={collapsed}
          onCollapse={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[150] bg-black/40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed top-0 bottom-0 z-[160] flex flex-col transition-transform duration-300 lg:hidden",
          locale === "ar" ? "right-0" : "left-0",
          drawerOpen ? "translate-x-0" : locale === "ar" ? "translate-x-full" : "-translate-x-full",
        )}
      >
        <Sidebar
          section={section}
          onSection={setSection}
          locale={locale}
          session={session}
          collapsed={false}
          onCollapse={() => {}}
          mobile
          onClose={() => setDrawerOpen(false)}
        />
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          section={section}
          locale={locale}
          onMenuClick={() => setDrawerOpen(true)}
          notifCount={attentionCount}
        />

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-6xl">
            {/* Dashboard */}
            {section === "dashboard" && (
              <DashSection
                orders={orders}
                loading={loading}
                locale={locale}
                canFinance={canFinance}
                onGoToOrders={goToOrders}
              />
            )}

            {/* Orders */}
            {section === "orders" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground">
                    {locale === "ar" ? "الطلبات" : "Orders"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {loading
                      ? (locale === "ar" ? "جاري التحميل…" : "Loading…")
                      : `${orders.length} ${locale === "ar" ? "طلب" : "total orders"}`}
                  </p>
                </div>
                <OrdersTable orders={orders} loading={loading} onRefresh={refreshOrders} />
              </div>
            )}

            {/* Customers */}
            {section === "customers" && (
              <CustomersSection orders={orders} locale={locale} />
            )}

            {/* Products */}
            {section === "products" && <ProductsSection locale={locale} />}

            {/* Delivery */}
            {section === "delivery" && <DeliverySection locale={locale} />}

            {/* Finance */}
            {section === "finance" && canFinance && <FinanceSection locale={locale} />}

            {/* Expenses */}
            {section === "expenses" && canFinance && <ExpensesSection locale={locale} />}

            {/* Advertising */}
            {section === "advertising" && canFinance && <AdvertisingSection locale={locale} />}

            {/* Partners */}
            {section === "partners" && canFinance && <PartnersSection locale={locale} />}

            {/* Reports */}
            {section === "reports" && canFinance && <ReportsSection locale={locale} />}

            {/* Team */}
            {section === "team" && (
              <TeamSection locale={locale} currentRole={session?.role ?? "confirmation_agent"} />
            )}

            {/* Roles */}
            {section === "roles" && <RolesSection locale={locale} />}

            {/* Activity */}
            {section === "activity" && session?.role === "admin" && (
              <ActivitySection locale={locale} />
            )}

            {/* Settings */}
            {section === "settings" && <SettingsSection locale={locale} />}

            {/* Content */}
            {section === "content" && <ContentSection locale={locale} />}

            {/* Forbidden */}
            {(
              (section === "finance"     && !canFinance) ||
              (section === "expenses"    && !canFinance) ||
              (section === "advertising" && !canFinance) ||
              (section === "partners"    && !canFinance) ||
              (section === "reports"     && !canFinance) ||
              (section === "activity"    && session?.role !== "admin")
            ) && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Shield className="size-14 text-muted-foreground/30" />
                <p className="mt-4 text-lg font-bold text-foreground">
                  {locale === "ar" ? "غير مصرح" : "Access Denied"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {locale === "ar"
                    ? "لا تملك الصلاحية للوصول إلى هذا القسم."
                    : "You don't have permission to view this section."}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
