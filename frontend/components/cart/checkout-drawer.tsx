"use client";

import { useState } from "react";
import { Banknote, Phone, ShieldCheck } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CheckoutFormData, CheckoutFormErrors } from "@/lib/checkout/types";
import {
  hasCheckoutErrors,
  validateCheckoutForm,
} from "@/lib/checkout/validation";

const emptyForm: CheckoutFormData = {
  fullName: "",
  phone: "",
  city: "",
  address: "",
  note: "",
};

export function CheckoutDrawer() {
  const { items, subtotal, checkoutOpen, closeCheckout, submitOrder } =
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
    if (field !== "note" && errors[field]) {
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
      title="إتمام الطلب — الدفع عند الاستلام"
      footer={
        <Button
          type="submit"
          form="checkout-form"
          variant="gold"
          size="lg"
          className="w-full rounded-full shadow-gold"
          disabled={submitting || items.length === 0}
        >
          {submitting ? "جاري الإرسال..." : `تأكيد الطلب · ${subtotal} د.م.`}
        </Button>
      }
    >
      <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-start gap-2 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-foreground/85">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
          <p>
            لن نطلب أي دفع إلكتروني. فريقنا سيتصل بك لتأكيد الطلب قبل الشحن.
          </p>
        </div>

        <div className="rounded-xl bg-secondary/50 px-4 py-3 text-sm">
          <span className="text-muted-foreground">المجموع: </span>
          <span className="font-extrabold text-accent">{subtotal} د.م.</span>
          <span className="text-muted-foreground"> · {items.length} منتج</span>
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
          <Label htmlFor="city">المدينة *</Label>
          <Input
            id="city"
            name="city"
            placeholder="مثال: أكادير"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            error={errors.city}
          />
        </div>

        <div>
          <Label htmlFor="address">العنوان الكامل *</Label>
          <Input
            id="address"
            name="address"
            placeholder="الحي، الشارع، رقم المنزل..."
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            error={errors.address}
          />
        </div>

        <div>
          <Label htmlFor="note">ملاحظة (اختياري)</Label>
          <Textarea
            id="note"
            name="note"
            placeholder="تعليمات للتوصيل أو وقت الاتصال..."
            value={form.note ?? ""}
            onChange={(e) => update("note", e.target.value)}
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
