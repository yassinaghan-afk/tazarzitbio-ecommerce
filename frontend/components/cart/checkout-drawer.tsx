"use client";

import Image from "next/image";
import { useState } from "react";
import { Banknote, Phone, ShieldCheck, Truck } from "lucide-react";

import { OrderTotals } from "@/components/cart/order-totals";
import { useCommerce } from "@/components/providers/commerce-provider";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CheckoutFormData, CheckoutFormErrors } from "@/lib/checkout/types";
import {
  hasCheckoutErrors,
  validateCheckoutForm,
} from "@/lib/checkout/validation";

const emptyForm: CheckoutFormData = {
  fullName: "",
  phone: "",
  address: "",
};

export function CheckoutDrawer() {
  const { items, shipping, checkoutOpen, closeCheckout, submitOrder } =
    useCommerce();
  const [form, setForm] = useState<CheckoutFormData>(emptyForm);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    closeCheckout();
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateCheckoutForm(form);
    setErrors(nextErrors);
    if (hasCheckoutErrors(nextErrors)) return;

    setSubmitting(true);
    const result = submitOrder(form);
    if (result.errors) setErrors(result.errors);
    if (result.success) {
      setForm(emptyForm);
      setErrors({});
    }
    setSubmitting(false);
  };

  const update = (field: keyof CheckoutFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <Drawer
      open={checkoutOpen}
      onClose={handleClose}
      title="تأكيد الطلب — الدفع عند الاستلام"
      footer={
        <Button
          type="submit"
          form="checkout-form"
          variant="gold"
          size="lg"
          className="w-full rounded-full shadow-gold"
          disabled={submitting || items.length === 0}
        >
          {submitting
            ? "جاري الإرسال..."
            : `تأكيد الطلب · ${shipping.total} د.م.`}
        </Button>
      }
    >
      <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-start gap-2 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-foreground/85">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
          <p>
            لن نطلب أي دفع إلكتروني. سيتصل بك فريقنا لتأكيد الطلب قبل الشحن.
          </p>
        </div>

        {items.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-background/60 p-4">
            <p className="mb-3 text-xs font-bold text-accent">ملخص السلة</p>
            <ul className="space-y-2.5">
              {items.map((item) => (
                <li key={item.lineId} className="flex gap-3 text-sm">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#3d2818] to-[#2a1810]">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground line-clamp-1">
                      {item.nameAr}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.offerLabel} × {item.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 font-bold tabular-nums text-accent">
                    {item.unitPrice * item.quantity} د.م.
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-border/50 pt-4">
              <OrderTotals shipping={shipping} showUpsell={false} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-xl bg-secondary/50 px-3 py-2.5 text-xs text-muted-foreground">
          <Truck className="size-4 shrink-0 text-accent" />
          الدفع عند الاستلام — بدون دفع مسبق
        </div>

        <div>
          <Label htmlFor="fullName">الاسم الكامل *</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="مثال: محمد العلمي"
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            error={errors.fullName}
          />
        </div>

        <div>
          <Label htmlFor="phone">رقم الهاتف *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            className="text-end"
            placeholder="06 XX XX XX XX"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            error={errors.phone}
          />
          <p className="mt-1 flex items-center gap-1 text-2xs text-muted-foreground">
            <Phone className="size-3" />
            أرقام مغربية فقط (06 أو 07)
          </p>
        </div>

        <div>
          <Label htmlFor="address">العنوان الكامل *</Label>
          <Input
            id="address"
            name="address"
            autoComplete="street-address"
            placeholder="المدينة، الحي، الشارع، رقم المنزل..."
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            error={errors.address}
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Banknote className="size-4 text-accent" />
          الدفع نقداً عند استلام الطلب
        </div>
      </form>
    </Drawer>
  );
}
