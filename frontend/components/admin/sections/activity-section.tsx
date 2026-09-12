"use client";

import { useEffect, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  action: string;
  objectType: string;
  objectId?: string;
  userId?: string;
  userName?: string;
  note?: string;
  at: string;
}

const ACTION_COLORS: Record<string, string> = {
  create:  "bg-emerald-100 text-emerald-800",
  edit:    "bg-blue-100 text-blue-800",
  delete:  "bg-rose-100 text-rose-800",
  status:  "bg-amber-100 text-amber-800",
  login:   "bg-violet-100 text-violet-800",
  team:    "bg-indigo-100 text-indigo-800",
  finance: "bg-orange-100 text-orange-800",
};

function getActionColor(action: string): string {
  const key = Object.keys(ACTION_COLORS).find((k) => action.toLowerCase().includes(k));
  return key ? ACTION_COLORS[key] : "bg-gray-100 text-gray-700";
}

function fmtDatetime(iso: string) {
  return new Date(iso).toLocaleString("fr-MA", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface Props { locale: "en" | "ar" }

export function ActivitySection({ locale }: Props) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const t = (en: string, ar: string) => locale === "ar" ? ar : en;

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json() as { logs: AuditEntry[] };
        setLogs(data.logs ?? []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, []);

  const filtered = logs.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.objectType.toLowerCase().includes(q) ||
      (l.objectId ?? "").toLowerCase().includes(q) ||
      (l.userName ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-foreground">{t("Activity Log", "سجل النشاط")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("All admin actions are recorded here", "جميع إجراءات الإدارة مسجلة هنا")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { void refresh(); }}
          className="flex items-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          {t("Refresh", "تحديث")}
        </button>
      </div>

      <input
        type="search"
        placeholder={t("Search by action, type, user…", "بحث بالإجراء أو النوع أو المستخدم…")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20"
      />

      {loading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">{t("Loading…", "جاري التحميل…")}</div>
      ) : (
        <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Activity className="mx-auto size-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm font-semibold text-foreground">
                {t("No activity logs yet", "لا يوجد سجل نشاط بعد")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {filtered.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                  <span className={cn("mt-0.5 shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold whitespace-nowrap", getActionColor(entry.action))}>
                    {entry.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{entry.objectType}</span>
                      {entry.objectId && (
                        <span className="ms-1.5 font-mono text-xs text-muted-foreground">
                          #{entry.objectId.slice(-8)}
                        </span>
                      )}
                    </p>
                    {entry.note && (
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.note}</p>
                    )}
                    {entry.userName && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("by", "بواسطة")}: {entry.userName}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                    {fmtDatetime(entry.at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
