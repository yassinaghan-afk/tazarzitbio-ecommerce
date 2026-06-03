"use client";

import { Home, Phone, User } from "lucide-react";

import { EditableVerificationField } from "@/components/thank-you/editable-verification-field";
import type { CheckoutFormData, PlacedOrder } from "@/lib/checkout/types";
import { formatMoroccanPhoneDisplay } from "@/lib/checkout/validation";
import { useTranslation } from "@/lib/i18n/language-provider";

interface ThankYouVerificationProps {
  order: PlacedOrder;
  onCustomerUpdate: (customer: CheckoutFormData) => void;
}

export function ThankYouVerification({
  order,
  onCustomerUpdate,
}: ThankYouVerificationProps) {
  const { t } = useTranslation();
  const { customer } = order;

  const patchCustomer = (patch: Partial<CheckoutFormData>) => {
    onCustomerUpdate({ ...customer, ...patch });
  };

  return (
    <div className="mt-10 text-start">
      <h2 className="text-display text-center text-xl text-foreground sm:text-2xl">
        {t("verify.title")}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        {t("verify.sub")}
      </p>

      <div className="mt-6 space-y-3">
        <EditableVerificationField
          label={t("checkout.fullName").replace(" *", "")}
          icon={User}
          value={customer.fullName}
          onSave={(fullName) => patchCustomer({ fullName })}
          placeholder={t("checkout.placeholderName")}
        />

        <EditableVerificationField
          label={t("checkout.phone").replace(" *", "")}
          icon={Phone}
          value={customer.phone}
          displayValue={formatMoroccanPhoneDisplay(customer.phone)}
          onSave={(phone) => patchCustomer({ phone })}
          variant="phone"
          inputMode="tel"
          dir="ltr"
          placeholder={t("checkout.placeholderPhone")}
        />

        <EditableVerificationField
          label={t("checkout.address").replace(" *", "")}
          icon={Home}
          value={customer.address}
          onSave={(address) => patchCustomer({ address })}
          variant="address"
          placeholder={t("checkout.placeholderAddress")}
        />
      </div>

      <p className="mt-4 text-center text-2xs text-muted-foreground">
        {t("verify.codNote")}
      </p>
    </div>
  );
}
