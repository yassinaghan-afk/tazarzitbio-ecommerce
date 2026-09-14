/**
 * Client-safe purchase event id (mirrors server finalize-export helper).
 * Kept separate so browser bundles do not pull Node-only order export code.
 */
export function purchaseEventId(orderId: string): string {
  const safe = orderId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  return `purchase_${safe || "unknown"}`;
}
