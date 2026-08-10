import crypto from "node:crypto";

import type { AuditLogEntry } from "@/lib/admin/cms-types";
import { updateStore } from "@/lib/server/store";

const MAX_ENTRIES = 500;

/**
 * Append an entry to the admin audit log (kept in the store, capped).
 * Never throws — audit logging must not break the mutation it describes.
 */
export async function logAudit(
  action: string,
  objectType: string,
  objectId?: string,
): Promise<void> {
  try {
    const entry: AuditLogEntry = {
      id: crypto.randomUUID().slice(0, 8),
      action,
      objectType,
      objectId,
      at: new Date().toISOString(),
    };
    await updateStore((prev) => ({
      ...prev,
      auditLogs: [entry, ...(prev.auditLogs ?? [])].slice(0, MAX_ENTRIES),
    }));
  } catch (err) {
    console.error("audit log error", err);
  }
}
