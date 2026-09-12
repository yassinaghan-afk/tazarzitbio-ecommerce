import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

import type { AdminUserRecord } from "@/lib/admin/ops-types";
import { roleHasPermission } from "@/lib/admin/permissions";
import { hashPassword, requireAdminSession } from "@/lib/admin/session";
import { logAudit } from "@/lib/server/audit";
import { readStore, updateStore } from "@/lib/server/store";

/* ------------------------------------------------------------------ */
/* GET /api/admin/team  — list team members                            */
/* ------------------------------------------------------------------ */
export async function GET(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "team:view")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const store = await readStore();
  // Never expose password hashes
  const members = store.ops.adminUsers.map(({ passwordHash: _, ...rest }) => rest);
  return NextResponse.json({ members });
}

/* ------------------------------------------------------------------ */
/* POST /api/admin/team  — create new team member                      */
/* ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "team:invite")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    name?: string;
    username?: string;
    password?: string;
    role?: string;
    commissionPerConfirmed?: number;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, username, password, role, commissionPerConfirmed = 0 } = body;
  if (!name || !username || !password || !role) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!["admin", "manager", "confirmation_agent"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const store = await readStore();
  const exists = store.ops.adminUsers.find(
    (u) => u.username.toLowerCase() === username.toLowerCase(),
  );
  if (exists) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const newMember: AdminUserRecord = {
    id: `user-${crypto.randomUUID().slice(0, 8)}`,
    name: name.trim(),
    username: username.trim().toLowerCase(),
    passwordHash,
    role: role as AdminUserRecord["role"],
    isActive: true,
    commissionPerConfirmed: Number(commissionPerConfirmed) || 0,
    createdAt: new Date().toISOString(),
  };

  await updateStore((prev) => ({
    ...prev,
    ops: {
      ...prev.ops,
      adminUsers: [...prev.ops.adminUsers, newMember],
    },
  }));

  await logAudit("team.invite", "AdminUser", newMember.id);

  const { passwordHash: _ph, ...safe } = newMember;
  return NextResponse.json({ member: safe }, { status: 201 });
}
