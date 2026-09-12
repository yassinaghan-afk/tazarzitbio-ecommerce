"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "admin" | "manager" | "confirmation_agent";

interface PermissionGroup {
  group: string;
  groupAr: string;
  permissions: { id: string; labelEn: string; labelAr: string }[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    group: "Orders", groupAr: "الطلبات",
    permissions: [
      { id: "orders:read",          labelEn: "View orders",            labelAr: "عرض الطلبات" },
      { id: "orders:write",         labelEn: "Edit orders",            labelAr: "تعديل الطلبات" },
      { id: "orders:all",           labelEn: "View all orders",        labelAr: "عرض جميع الطلبات" },
      { id: "orders:assign",        labelEn: "Assign orders",          labelAr: "تعيين الطلبات" },
      { id: "orders:change_status", labelEn: "Change status",          labelAr: "تغيير الحالة" },
      { id: "orders:delete",        labelEn: "Delete orders",          labelAr: "حذف الطلبات" },
    ],
  },
  {
    group: "Customers", groupAr: "العملاء",
    permissions: [
      { id: "customers:read",         labelEn: "View customers",       labelAr: "عرض العملاء" },
      { id: "customers:view_phone",   labelEn: "View phone numbers",   labelAr: "عرض أرقام الهاتف" },
      { id: "customers:view_address", labelEn: "View addresses",       labelAr: "عرض العناوين" },
      { id: "customers:view_notes",   labelEn: "View notes",           labelAr: "عرض الملاحظات" },
      { id: "customers:write",        labelEn: "Edit customers",       labelAr: "تعديل العملاء" },
      { id: "customers:delete",       labelEn: "Delete customers",     labelAr: "حذف العملاء" },
    ],
  },
  {
    group: "Products", groupAr: "المنتجات",
    permissions: [
      { id: "products:read",       labelEn: "View products",       labelAr: "عرض المنتجات" },
      { id: "products:view_cost",  labelEn: "View cost prices",    labelAr: "عرض أسعار التكلفة" },
      { id: "products:write",      labelEn: "Edit products",       labelAr: "تعديل المنتجات" },
      { id: "products:delete",     labelEn: "Delete products",     labelAr: "حذف المنتجات" },
    ],
  },
  {
    group: "Delivery", groupAr: "التوصيل",
    permissions: [
      { id: "delivery:read",             labelEn: "View delivery",        labelAr: "عرض التوصيل" },
      { id: "delivery:create_shipment",  labelEn: "Create shipments",     labelAr: "إنشاء شحنات" },
      { id: "delivery:update_status",    labelEn: "Update status",        labelAr: "تحديث الحالة" },
      { id: "delivery:view_financials",  labelEn: "View delivery finance",labelAr: "عرض مالية التوصيل" },
    ],
  },
  {
    group: "Finance", groupAr: "المالية",
    permissions: [
      { id: "finance:read",        labelEn: "View finance",       labelAr: "عرض المالية" },
      { id: "finance:view_profit", labelEn: "View profit",        labelAr: "عرض الربح" },
      { id: "finance:view_cash",   labelEn: "View cash",          labelAr: "عرض الصندوق" },
      { id: "finance:write",       labelEn: "Edit finance",       labelAr: "تعديل المالية" },
      { id: "expenses:read",       labelEn: "View expenses",      labelAr: "عرض المصاريف" },
      { id: "expenses:write",      labelEn: "Create/edit expenses",labelAr: "إنشاء/تعديل المصاريف" },
      { id: "expenses:delete",     labelEn: "Delete expenses",    labelAr: "حذف المصاريف" },
      { id: "ads:read",            labelEn: "View advertising",   labelAr: "عرض الإعلانات" },
      { id: "ads:write",           labelEn: "Edit advertising",   labelAr: "تعديل الإعلانات" },
      { id: "partners:read",       labelEn: "View partners",      labelAr: "عرض الشركاء" },
      { id: "partners:view_balances", labelEn: "View balances",   labelAr: "عرض الأرصدة" },
      { id: "partners:write",      labelEn: "Edit partners",      labelAr: "تعديل الشركاء" },
      { id: "cash:read",           labelEn: "View cash register", labelAr: "عرض الصندوق" },
      { id: "cash:write",          labelEn: "Edit cash register", labelAr: "تعديل الصندوق" },
    ],
  },
  {
    group: "Reports", groupAr: "التقارير",
    permissions: [
      { id: "reports:read",   labelEn: "View reports",   labelAr: "عرض التقارير" },
      { id: "reports:export", labelEn: "Export reports", labelAr: "تصدير التقارير" },
      { id: "audit:read",     labelEn: "View audit log", labelAr: "عرض سجل النشاط" },
    ],
  },
  {
    group: "Team", groupAr: "الفريق",
    permissions: [
      { id: "team:view",             labelEn: "View team",            labelAr: "عرض الفريق" },
      { id: "team:invite",           labelEn: "Invite members",       labelAr: "دعوة أعضاء" },
      { id: "team:edit_permissions", labelEn: "Edit permissions",     labelAr: "تعديل الصلاحيات" },
      { id: "team:remove_member",    labelEn: "Remove members",       labelAr: "إزالة أعضاء" },
    ],
  },
  {
    group: "Settings", groupAr: "الإعدادات",
    permissions: [
      { id: "settings:view",  labelEn: "View settings", labelAr: "عرض الإعدادات" },
      { id: "settings:write", labelEn: "Edit settings", labelAr: "تعديل الإعدادات" },
      { id: "content:write",  labelEn: "Edit content",  labelAr: "تعديل المحتوى" },
    ],
  },
];

const ROLE_PERMISSIONS: Record<Role, Set<string>> = {
  admin: new Set([
    "orders:read","orders:write","orders:all","orders:assign","orders:change_status","orders:delete",
    "customers:read","customers:view_phone","customers:view_address","customers:view_notes","customers:write","customers:delete",
    "products:read","products:view_cost","products:write","products:delete",
    "delivery:read","delivery:create_shipment","delivery:update_status","delivery:view_financials",
    "finance:read","finance:view_profit","finance:view_cash","finance:write",
    "expenses:read","expenses:write","expenses:delete",
    "ads:read","ads:write","partners:read","partners:view_balances","partners:write",
    "cash:read","cash:write",
    "reports:read","reports:export","audit:read",
    "team:view","team:invite","team:edit_permissions","team:remove_member",
    "settings:view","settings:write","content:write",
  ]),
  manager: new Set([
    "orders:read","orders:write","orders:all","orders:assign","orders:change_status",
    "customers:read","customers:view_phone","customers:view_address","customers:view_notes","customers:write",
    "products:read","products:view_cost","products:write",
    "delivery:read","delivery:create_shipment","delivery:update_status",
    "finance:read","finance:view_profit",
    "expenses:read","ads:read","partners:read",
    "reports:read","team:view","settings:view",
  ]),
  confirmation_agent: new Set([
    "orders:read","orders:write","orders:change_status",
    "customers:read","customers:view_phone","customers:view_address",
    "delivery:read","settings:view",
  ]),
};

const ROLES: { id: Role; labelEn: string; labelAr: string; cls: string }[] = [
  { id: "admin",              labelEn: "Admin",              labelAr: "مدير كامل",  cls: "bg-violet-100 text-violet-800" },
  { id: "manager",            labelEn: "Manager",            labelAr: "مدير",       cls: "bg-blue-100 text-blue-800" },
  { id: "confirmation_agent", labelEn: "Confirmation Agent", labelAr: "عميل تأكيد",cls: "bg-amber-100 text-amber-800" },
];

interface Props { locale: "en" | "ar" }

export function RolesSection({ locale }: Props) {
  const t = (en: string, ar: string) => locale === "ar" ? ar : en;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-foreground">{t("Roles & Permissions", "الأدوار والصلاحيات")}</h2>
        <p className="text-sm text-muted-foreground">{t("Permission matrix per role", "مصفوفة الصلاحيات لكل دور")}</p>
      </div>

      {/* Role summary cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", r.cls)}>
              {locale === "ar" ? r.labelAr : r.labelEn}
            </span>
            <p className="mt-3 text-3xl font-extrabold text-foreground">
              {ROLE_PERMISSIONS[r.id].size}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("permissions", "صلاحية")}</p>
          </div>
        ))}
      </div>

      {/* Permission matrix */}
      <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="px-4 py-3 text-start font-semibold text-muted-foreground min-w-[200px]">
                {t("Permission", "الصلاحية")}
              </th>
              {ROLES.map((r) => (
                <th key={r.id} className="px-4 py-3 text-center font-semibold min-w-[120px]">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", r.cls)}>
                    {locale === "ar" ? r.labelAr : r.labelEn}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
          {PERMISSION_GROUPS.map((group) => (
            <React.Fragment key={group.group}>
              <tr className="bg-muted/20">
                <td colSpan={4} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {locale === "ar" ? group.groupAr : group.group}
                </td>
              </tr>
              {group.permissions.map((perm) => (
                <tr key={perm.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors last:border-0">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-foreground">{locale === "ar" ? perm.labelAr : perm.labelEn}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{perm.id}</p>
                  </td>
                  {ROLES.map((r) => (
                    <td key={r.id} className="px-4 py-2.5 text-center">
                      {ROLE_PERMISSIONS[r.id].has(perm.id) ? (
                        <Check className="mx-auto size-4 text-emerald-600" />
                      ) : (
                        <X className="mx-auto size-4 text-muted-foreground/30" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-800">
        <strong>{t("Note:", "ملاحظة:")}</strong>{" "}
        {t(
          "These permissions are enforced server-side on every API request. Hiding UI elements alone is not sufficient — every protected endpoint verifies role and permission before responding.",
          "هذه الصلاحيات تُطبَّق على الخادم مع كل طلب API. إخفاء عناصر الواجهة وحده غير كافٍ — كل نقطة نهاية محمية تتحقق من الدور والصلاحية قبل الرد.",
        )}
      </div>
    </div>
  );
}
