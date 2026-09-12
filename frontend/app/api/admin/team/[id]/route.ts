import { type NextRequest, NextResponse } from "next/server";

import type { AdminUserRecord } from "@/lib/admin/ops-types";
import { roleHasPermission } from "@/lib/admin/permissions";
import { hashPassword, requireAdminSession } from "@/lib/admin/session";
import { logAudit } from "@/lib/server/audit";
import { readStore, updateStore } from "@/lib/server/store";

type Ctx = { params: Promise<{ id: string }> };

/* ------------------------------------------------------------------ */
/* PUT /api/admin/team/[id]  — update member                           */
/* ------------------------------------------------------------------ */
export async function PUT(req: NextRequest, ctx: Ctx) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "team:edit_permissions")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;

  let body: {
    name?: string;
    role?: string;
    isActive?: boolean;
    commissionPerConfirmed?: number;
    newPassword?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Prevent demoting / deactivating the owner account
  if (id === "owner") {
    return NextResponse.json({ error: "Cannot edit the owner account" }, { status: 403 });
  }

  const store = await readStore();
  const member = store.ops.adminUsers.find((u) => u.id === id);
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Only admin can promote to admin or edit other admins
  if (
    (body.role === "admin" || member.role === "admin") &&
    session.role !== "admin"
  ) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  let passwordHash = member.passwordHash;
  if (body.newPassword) {
    if (body.newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    passwordHash = await hashPassword(body.newPassword);
  }

  const updated: AdminUserRecord = {
    ...member,
    name: body.name?.trim() ?? member.name,
    role: (body.role as AdminUserRecord["role"]) ?? member.role,
    isActive: body.isActive !== undefined ? body.isActive : member.isActive,
    commissionPerConfirmed:
      body.commissionPerConfirmed !== undefined
        ? Number(body.commissionPerConfirmed)
        : member.commissionPerConfirmed,
    passwordHash,
  };

  await updateStore((prev) => ({
    ...prev,
    ops: {
      ...prev.ops,
      adminUsers: prev.ops.adminUsers.map((u) => (u.id === id ? updated : u)),
    },
  }));

  await logAudit("team.edit", "AdminUser", id);

  const { passwordHash: _ph, ...safe } = updated;
  return NextResponse.json({ member: safe });
}

/* ------------------------------------------------------------------ */
/* DELETE /api/admin/team/[id]  — deactivate member                    */
/* ------------------------------------------------------------------ */
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const session = await requireAdminSession(req);
  if (!session || !roleHasPermission(session.role, "team:remove_member")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;
  if (id === "owner") {
    return NextResponse.json({ error: "Cannot remove the owner account" }, { status: 403 });
  }

  const store = await readStore();
  const member = store.ops.adminUsers.find((u) => u.id === id);
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // Deactivate instead of delete (preserve audit trail)
  await updateStore((prev) => ({
    ...prev,
    ops: {
      ...prev.ops,
      adminUsers: prev.ops.adminUsers.map((u) =>
        u.id === id ? { ...u, isActive: false } : u,
      ),
    },
  }));

  await logAudit("team.remove", "AdminUser", id);
  return NextResponse.json({ ok: true });
}
