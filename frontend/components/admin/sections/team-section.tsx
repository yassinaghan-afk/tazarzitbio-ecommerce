"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Edit2,
  KeyRound,
  Plus,
  ShieldOff,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  username: string;
  role: "admin" | "manager" | "confirmation_agent";
  isActive: boolean;
  commissionPerConfirmed: number;
  createdAt: string;
}

const ROLE_LABELS: Record<TeamMember["role"], { en: string; ar: string; cls: string }> = {
  admin:              { en: "Admin",              ar: "مدير كامل",   cls: "bg-violet-100 text-violet-800" },
  manager:            { en: "Manager",            ar: "مدير",        cls: "bg-blue-100 text-blue-800" },
  confirmation_agent: { en: "Confirmation Agent", ar: "عميل تأكيد",  cls: "bg-amber-100 text-amber-800" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-MA", { day: "2-digit", month: "short", year: "numeric" });
}

interface EditForm {
  id: string;
  name: string;
  role: TeamMember["role"];
  isActive: boolean;
  commissionPerConfirmed: number;
  newPassword: string;
}

interface Props {
  locale: "en" | "ar";
  currentRole: string;
}

export function TeamSection({ locale, currentRole }: Props) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // New member form
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<TeamMember["role"]>("confirmation_agent");
  const [newCommission, setNewCommission] = useState(10);

  const canManage = currentRole === "admin";

  const t = (en: string, ar: string) => locale === "ar" ? ar : en;

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team", { cache: "no-store" });
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json() as { members: TeamMember[] };
      setMembers(data.members ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, username: newUsername, password: newPassword, role: newRole, commissionPerConfirmed: newCommission }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Error"); setSaving(false); return; }
      setNewName(""); setNewUsername(""); setNewPassword(""); setNewRole("confirmation_agent"); setNewCommission(10);
      setShowAddForm(false);
      await refresh();
    } catch { setError(t("Network error", "خطأ في الشبكة")); }
    setSaving(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;
    setError(""); setSaving(true);
    try {
      const res = await fetch(`/api/admin/team/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          role: editForm.role,
          isActive: editForm.isActive,
          commissionPerConfirmed: editForm.commissionPerConfirmed,
          ...(editForm.newPassword ? { newPassword: editForm.newPassword } : {}),
        }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) { setError(data.error ?? "Error"); setSaving(false); return; }
      setEditForm(null);
      await refresh();
    } catch { setError(t("Network error", "خطأ في الشبكة")); }
    setSaving(false);
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm(t("Deactivate this member?", "هل تريد إلغاء تفعيل هذا العضو؟"))) return;
    setSaving(true);
    await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    await refresh();
    setSaving(false);
  };

  const handleReactivate = async (member: TeamMember) => {
    setSaving(true);
    await fetch(`/api/admin/team/${member.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    await refresh();
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">{t("Team", "الفريق")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("Manage team members and their access", "إدارة أعضاء الفريق وصلاحياتهم")}
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => { setShowAddForm(!showAddForm); setError(""); }}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-foreground shadow-sm hover:bg-accent/90 transition-colors"
          >
            {showAddForm ? <X className="size-4" /> : <Plus className="size-4" />}
            {showAddForm ? t("Cancel", "إلغاء") : t("Add Member", "إضافة عضو")}
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Add member form */}
      {showAddForm && canManage && (
        <form onSubmit={handleAdd} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
          <p className="font-bold text-foreground">{t("New Team Member", "عضو جديد في الفريق")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t("Full Name", "الاسم الكامل")} *
              </label>
              <input
                required value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder={t("Sara Mohamed", "سارة محمد")}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t("Username", "اسم المستخدم")} *
              </label>
              <input
                required value={newUsername} onChange={(e) => setNewUsername(e.target.value)}
                placeholder="sara"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm font-mono outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t("Password", "كلمة المرور")} *
              </label>
              <input
                required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                {t("Role", "الدور")} *
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as TeamMember["role"])}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
              >
                <option value="confirmation_agent">{t("Confirmation Agent", "عميل تأكيد")}</option>
                <option value="manager">{t("Manager", "مدير")}</option>
                <option value="admin">{t("Admin", "مدير كامل")}</option>
              </select>
            </div>
            {newRole === "confirmation_agent" && (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                  {t("Commission per confirmed order (DH)", "عمولة لكل طلب مؤكد (DH)")}
                </label>
                <input
                  type="number" min={0} step={0.5} value={newCommission}
                  onChange={(e) => setNewCommission(Number(e.target.value))}
                  className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setError(""); }}
              className="rounded-xl border border-border/60 px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary"
            >
              {t("Cancel", "إلغاء")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
            >
              {saving ? t("Saving…", "جاري الحفظ…") : (
                <><Check className="size-4" />{t("Add Member", "إضافة عضو")}</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Edit form */}
      {editForm && (
        <form onSubmit={handleSaveEdit} className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm space-y-4">
          <p className="font-bold text-foreground">{t("Edit Member", "تعديل العضو")}: {editForm.name}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{t("Full Name", "الاسم الكامل")}</label>
              <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{t("Role", "الدور")}</label>
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as TeamMember["role"] })}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20">
                <option value="confirmation_agent">{t("Confirmation Agent", "عميل تأكيد")}</option>
                <option value="manager">{t("Manager", "مدير")}</option>
                <option value="admin">{t("Admin", "مدير كامل")}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{t("New Password (leave blank to keep)", "كلمة مرور جديدة (اتركه فارغاً للإبقاء)")}</label>
              <input type="password" value={editForm.newPassword} onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                placeholder="••••••"
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{t("Commission/order (DH)", "عمولة/طلب (DH)")}</label>
              <input type="number" min={0} step={0.5} value={editForm.commissionPerConfirmed}
                onChange={(e) => setEditForm({ ...editForm, commissionPerConfirmed: Number(e.target.value) })}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20" />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" id="isActive" checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="rounded" />
              <label htmlFor="isActive" className="text-sm font-semibold text-foreground">{t("Active", "نشط")}</label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => { setEditForm(null); setError(""); }}
              className="rounded-xl border border-border/60 px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary">
              {t("Cancel", "إلغاء")}
            </button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-60">
              {saving ? t("Saving…", "جاري الحفظ…") : <><Check className="size-4" />{t("Save Changes", "حفظ التغييرات")}</>}
            </button>
          </div>
        </form>
      )}

      {/* Members list */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">{t("Loading…", "جاري التحميل…")}</div>
      ) : (
        <div className="space-y-3">
          {/* Owner row */}
          <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/10 font-extrabold text-accent text-lg">
              👑
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground">Owner (Admin)</p>
              <p className="text-xs text-muted-foreground font-mono">master account</p>
            </div>
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-800">
              {t("Owner", "المالك")}
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
              {t("Active", "نشط")}
            </span>
          </div>

          {members.map((m) => {
            const roleInfo = ROLE_LABELS[m.role];
            return (
              <div key={m.id} className={cn(
                "flex flex-wrap items-center gap-3 rounded-2xl border p-4 shadow-sm transition-colors",
                m.isActive ? "border-border/50 bg-card" : "border-border/30 bg-muted/30 opacity-60",
              )}>
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-foreground text-sm">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground">{m.name}</p>
                    {!m.isActive && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                        {t("Disabled", "معطّل")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">@{m.username}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t("Joined", "انضم")}: {fmtDate(m.createdAt)}
                    {m.role === "confirmation_agent" && m.commissionPerConfirmed > 0 && (
                      <span className="ms-2">· {m.commissionPerConfirmed} DH/order</span>
                    )}
                  </p>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", roleInfo.cls)}>
                  {locale === "ar" ? roleInfo.ar : roleInfo.en}
                </span>
                {canManage && (
                  <div className="flex items-center gap-1.5">
                    <button type="button" title={t("Edit", "تعديل")}
                      onClick={() => setEditForm({ id: m.id, name: m.name, role: m.role, isActive: m.isActive, commissionPerConfirmed: m.commissionPerConfirmed, newPassword: "" })}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                      <Edit2 className="size-4" />
                    </button>
                    {m.isActive ? (
                      <button type="button" title={t("Deactivate", "إلغاء التفعيل")} onClick={() => handleDeactivate(m.id)}
                        className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 transition-colors">
                        <UserX className="size-4" />
                      </button>
                    ) : (
                      <button type="button" title={t("Reactivate", "إعادة التفعيل")} onClick={() => handleReactivate(m)}
                        className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <UserCheck className="size-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {members.length === 0 && (
            <div className="py-12 text-center rounded-2xl border border-dashed border-border/60">
              <Users className="mx-auto size-10 text-muted-foreground/30" />
              <p className="mt-3 font-semibold text-foreground">{t("No team members yet", "لا يوجد أعضاء في الفريق")}</p>
              {canManage && (
                <button type="button" onClick={() => setShowAddForm(true)}
                  className="mt-3 text-sm font-semibold text-accent hover:underline">
                  {t("+ Add the first member", "+ أضف أول عضو")}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
