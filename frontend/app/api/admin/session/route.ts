import { type NextRequest, NextResponse } from "next/server";

import { requireAdminSession } from "@/lib/admin/session";
import { roleHasPermission } from "@/lib/admin/permissions";

export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    role: session.role,
    userId: session.userId,
    userName: session.userName,
    permissions: {
      finance: roleHasPermission(session.role, "finance:read"),
      partners: roleHasPermission(session.role, "partners:read"),
      cash: roleHasPermission(session.role, "cash:read"),
      ads: roleHasPermission(session.role, "ads:read"),
      reports: roleHasPermission(session.role, "reports:read"),
      agents: roleHasPermission(session.role, "agents:write"),
      ordersAll: roleHasPermission(session.role, "orders:all"),
      content: roleHasPermission(session.role, "content:write"),
    },
  });
}
