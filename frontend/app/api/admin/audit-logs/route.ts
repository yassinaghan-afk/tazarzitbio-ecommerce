import { type NextRequest, NextResponse } from "next/server";

import { roleHasPermission } from "@/lib/admin/permissions";
import { requireAdminSession } from "@/lib/admin/session";
import { readStore } from "@/lib/server/store";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "audit:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await readStore();
  return NextResponse.json({ auditLogs: store.auditLogs });
}
