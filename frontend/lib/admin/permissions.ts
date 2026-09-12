import type { AdminPermission, AdminRole } from "@/lib/admin/ops-types";
import { ROLE_PERMISSIONS } from "@/lib/admin/ops-types";

export function roleHasPermission(
  role: AdminRole,
  permission: AdminPermission,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function assertPermission(
  role: AdminRole | undefined,
  permission: AdminPermission,
): boolean {
  if (!role) return false;
  return roleHasPermission(role, permission);
}
