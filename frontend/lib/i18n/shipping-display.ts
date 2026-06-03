import type { ShippingResult } from "@/lib/shipping/calculate";

import { translate } from "./translations";
import type { Language } from "./types";

export function getShippingDisplayLabel(
  shipping: ShippingResult,
  locale: Language,
  fee?: number,
): { primary: string; secondary?: string } {
  if (shipping.isFreeShipping) {
    const label = translate(locale, "common.freeShipping");
    if (locale === "ar") return { primary: label };
    if (locale === "fr") return { primary: label };
    return { primary: label };
  }

  const amount = fee ?? shipping.shippingFee;
  if (locale === "ar") {
    return {
      primary: `${translate(locale, "common.shippingFee")}: ${amount} ${translate(locale, "common.currency")}`,
    };
  }
  if (locale === "fr") {
    return {
      primary: `${translate(locale, "common.shippingFee")}: ${amount} MAD`,
      secondary: shipping.labelFr,
    };
  }
  return {
    primary: `${translate(locale, "common.shippingFee")}: ${amount} MAD`,
    secondary: shipping.labelFr,
  };
}
