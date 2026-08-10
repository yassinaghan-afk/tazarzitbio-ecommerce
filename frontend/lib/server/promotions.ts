import type {
  CouponValidationResult,
  Promotion,
} from "@/lib/admin/cms-types";
import { readStore, updateStore } from "@/lib/server/store";

function isWithinDates(promo: Promotion, now = new Date()): boolean {
  if (promo.startsAt && new Date(promo.startsAt) > now) return false;
  if (promo.endsAt && new Date(promo.endsAt) < now) return false;
  return true;
}

/**
 * Validate a coupon code against the current promotions and cart subtotal.
 * Returns the MAD discount (and/or free shipping flag) it grants.
 */
export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<CouponValidationResult> {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized) return { valid: false, reason: "empty" };

  const store = await readStore();
  const promo = store.promotions.find((p) => p.code === normalized);
  if (!promo || !promo.isActive) return { valid: false, reason: "not_found" };
  if (!isWithinDates(promo)) return { valid: false, reason: "expired" };
  if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
    return { valid: false, reason: "limit_reached" };
  }
  if (promo.minSubtotal > 0 && subtotal < promo.minSubtotal) {
    return { valid: false, reason: "min_subtotal", discount: 0 };
  }

  if (promo.type === "free-shipping") {
    return { valid: true, code: normalized, discount: 0, freeShipping: true };
  }
  const discount =
    promo.type === "percentage"
      ? Math.round((subtotal * promo.value) / 100)
      : Math.min(promo.value, subtotal);
  return { valid: true, code: normalized, discount, freeShipping: false };
}

/** Increment a coupon's usage counter after a successful order. */
export async function recordCouponUsage(code: string): Promise<void> {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  if (!normalized) return;
  await updateStore((prev) => ({
    ...prev,
    promotions: prev.promotions.map((p) =>
      p.code === normalized ? { ...p, usedCount: p.usedCount + 1 } : p,
    ),
  }));
}
