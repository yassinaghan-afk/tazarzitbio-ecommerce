import { fetchHealth } from "@/lib/api";

export async function ApiStatus() {
  const health = await fetchHealth();

  if (!health) {
    return (
      <p className="text-center text-xs text-muted-foreground">
        API غير متصل — تأكد من تشغيل الخادم على المنفذ 8000
      </p>
    );
  }

  return (
    <p className="text-center text-xs text-muted-foreground">
      API: {health.status} · v{health.version} · DB: {health.database}
    </p>
  );
}
