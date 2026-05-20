"use client";

import { Banknote, Home, Phone, User } from "lucide-react";

import type { PlacedOrder } from "@/lib/checkout/types";
import { formatMoroccanPhoneDisplay } from "@/lib/checkout/validation";

interface ThankYouVerificationProps {
  order: PlacedOrder;
}

export function ThankYouVerification({ order }: ThankYouVerificationProps) {
  const { customer } = order;
  const displayPhone = formatMoroccanPhoneDisplay(customer.phone);
  const total = order.total ?? order.subtotal;

  return (
    <div className="mt-10 text-start">
      <h2 className="text-display text-center text-xl text-foreground sm:text-2xl">
        تأكد من أن معلوماتك صحيحة
      </h2>
      <p className="mx-auto mt-3 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
        تأكد من أن هاتفك مفعّل، فريقنا سيتصل بك لتأكيد الطلب قبل الشحن.
      </p>

      <div className="mt-6 space-y-3">
        <div className="glass-card rounded-2xl border border-border/60 bg-card/80 p-4 shadow-warm-md">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <User className="size-4 text-accent" aria-hidden />
            <span>الاسم الكامل</span>
          </div>
          <p className="text-lg font-bold text-foreground">{customer.fullName}</p>
        </div>

        <div className="glass-card rounded-2xl border border-accent/30 bg-gradient-to-br from-amber-50/90 via-card to-orange-50/40 p-5 shadow-warm-lg">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Phone className="size-4 text-accent" aria-hidden />
            <span>رقم الهاتف</span>
          </div>
          <p
            dir="ltr"
            className="text-3xl font-extrabold tabular-nums tracking-wide text-foreground sm:text-4xl"
          >
            {displayPhone}
          </p>
        </div>

        <div className="glass-card rounded-2xl border border-border/60 bg-card/80 p-5 shadow-warm-md">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Home className="size-4 text-accent" aria-hidden />
            <span>العنوان الكامل</span>
          </div>
          <p className="text-base font-bold leading-relaxed text-foreground sm:text-lg">
            {customer.address}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4 rounded-2xl border border-accent/25 bg-accent/10 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Banknote className="size-5 text-accent" aria-hidden />
            <span>إجمالي الطلب</span>
          </div>
          <p className="text-3xl font-extrabold tabular-nums text-accent">
            {total}
            <span className="ms-1 text-lg font-bold">د.م.</span>
          </p>
        </div>
      </div>

      <p className="mt-4 text-center text-2xs text-muted-foreground">
        الدفع عند الاستلام · Paiement à la livraison
      </p>
    </div>
  );
}
