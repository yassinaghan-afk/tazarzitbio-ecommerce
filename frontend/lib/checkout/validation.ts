import type { CheckoutFormData, CheckoutFormErrors } from "./types";

export function normalizeMoroccanPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("212")) {
    digits = digits.slice(3);
    if (!digits.startsWith("0")) digits = `0${digits}`;
  }
  if (digits.length === 9 && (digits.startsWith("6") || digits.startsWith("7"))) {
    digits = `0${digits}`;
  }
  return digits;
}

export function isValidMoroccanPhone(input: string): boolean {
  const digits = normalizeMoroccanPhone(input);
  return /^0[67]\d{8}$/.test(digits);
}

export function formatMoroccanPhoneDisplay(input: string): string {
  const digits = normalizeMoroccanPhone(input);
  if (!/^0[67]\d{8}$/.test(digits)) return input.trim();
  return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
}

export function validateCheckoutForm(
  data: CheckoutFormData,
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};

  const name = data.fullName.trim();
  if (!name) {
    errors.fullName = "الاسم الكامل مطلوب";
  } else if (name.length < 3) {
    errors.fullName = "أدخل اسماً كاملاً (3 أحرف على الأقل)";
  }

  if (!data.phone.trim()) {
    errors.phone = "رقم الهاتف مطلوب";
  } else if (!isValidMoroccanPhone(data.phone)) {
    errors.phone = "أدخل رقم هاتف مغربي صحيح (06 أو 07)";
  }

  if (!data.address.trim()) {
    errors.address = "العنوان الكامل مطلوب";
  }

  return errors;
}

export function hasCheckoutErrors(errors: CheckoutFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
