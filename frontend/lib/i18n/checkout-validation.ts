import type { CheckoutFormData, CheckoutFormErrors } from "@/lib/checkout/types";
import {
  hasCheckoutErrors,
  isValidMoroccanPhone,
  normalizeMoroccanPhone,
} from "@/lib/checkout/validation";

import { translate, type TranslationKey } from "./translations";
import type { Language } from "./types";

export { hasCheckoutErrors, isValidMoroccanPhone, normalizeMoroccanPhone };

export function validateCheckoutFormLocalized(
  data: CheckoutFormData,
  locale: Language,
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};
  const t = (key: TranslationKey) => translate(locale, key);

  const name = data.fullName.trim();
  if (!name) {
    errors.fullName = t("validation.fullNameRequired");
  } else if (name.length < 3) {
    errors.fullName = t("validation.fullNameShort");
  }

  if (!data.phone.trim()) {
    errors.phone = t("validation.phoneRequired");
  } else if (!isValidMoroccanPhone(data.phone)) {
    errors.phone = t("validation.phoneInvalid");
  }

  if (!data.address.trim()) {
    errors.address = t("validation.addressRequired");
  }

  return errors;
}
