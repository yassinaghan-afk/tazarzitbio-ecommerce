"use client";

import { Home, Phone, User } from "lucide-react";

import { EditableVerificationField } from "@/components/thank-you/editable-verification-field";
import type { CheckoutFormData, PlacedOrder } from "@/lib/checkout/types";
import { formatMoroccanPhoneDisplay } from "@/lib/checkout/validation";

interface ThankYouVerificationProps {
  order: PlacedOrder;
  onCustomerUpdate: (customer: CheckoutFormData) => void;
}

export function ThankYouVerification({
  order,
  onCustomerUpdate,
}: ThankYouVerificationProps) {
  const { customer } = order;

  const patchCustomer = (patch: Partial<CheckoutFormData>) => {
    onCustomerUpdate({ ...customer, ...patch });
  };

  return (
    <div className="mt-10 text-start">
      <h2 className="text-display text-center text-xl text-foreground sm:text-2xl">
        تأكد من أن معلوماتك صحيحة
      </h2>
      <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        تأكد من أن هاتفك مفعّل، فريقنا سيتصل بك لتأكيد الطلب قبل الشحن. يمكنك
        تعديل بياناتك مباشرة إن لزم الأمر.
      </p>

      <div className="mt-6 space-y-3">
        <EditableVerificationField
          label="الاسم الكامل"
          icon={User}
          value={customer.fullName}
          onSave={(fullName) => patchCustomer({ fullName })}
          placeholder="مثال: محمد العلمي"
        />

        <EditableVerificationField
          label="رقم الهاتف"
          icon={Phone}
          value={customer.phone}
          displayValue={formatMoroccanPhoneDisplay(customer.phone)}
          onSave={(phone) => patchCustomer({ phone })}
          variant="phone"
          inputMode="tel"
          dir="ltr"
          placeholder="06 XX XX XX XX"
        />

        <EditableVerificationField
          label="العنوان الكامل"
          icon={Home}
          value={customer.address}
          onSave={(address) => patchCustomer({ address })}
          variant="address"
          placeholder="المدينة، الحي، الشارع، رقم المنزل..."
        />
      </div>

      <p className="mt-4 text-center text-2xs text-muted-foreground">
        الدفع عند الاستلام · Paiement à la livraison
      </p>
    </div>
  );
}
