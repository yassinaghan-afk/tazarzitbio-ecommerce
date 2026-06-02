"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Phone, ShieldCheck } from "lucide-react";

import { CartLineRow } from "@/components/cart/cart-line-row";
import { OrderTotals } from "@/components/cart/order-totals";
import { BrandLogo } from "@/components/brand/brand-logo";
import { CheckoutConfirmationCard } from "@/components/checkout/checkout-confirmation-card";
import { CheckoutCrossSell } from "@/components/checkout/checkout-cross-sell";
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
import { cn } from "@/lib/utils";
import { trackInitiateCheckout } from "@/lib/tracking/events";

const emptyForm: CheckoutFormData = {
  fullName: "",
  phone: "",
  address: "",
};

type CheckoutStep = "review" | "details";

const STEP_LABELS: Record<CheckoutStep, { title: string; subtitle: string }> = {
  review: {
    title: "مراجعة الطلب",
    subtitle: "الخطوة 1 من 2",
  },
  details: {
    title: "بيانات التوصيل",
    subtitle: "الخطوة 2 من 2",
  },
};

export function CheckoutDrawer() {
  const {
    items,
    shipping,
    checkoutOpen,
    closeCheckout,
    submitOrder,
    crossSellProducts,
  } = useCommerce();

  const [step, setStep] = useState<CheckoutStep>("review");
  const [form, setForm] = useState<CheckoutFormData>(emptyForm);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const checkoutTrackedRef = useRef(false);

  useEffect(() => {
    if (!checkoutOpen) {
      setStep("review");
      setErrors({});
      checkoutTrackedRef.current = false;
      return;
    }
    if (checkoutTrackedRef.current || items.length === 0) return;
    checkoutTrackedRef.current = true;
    trackInitiateCheckout({
      products: items.map((i) => ({
        productId: i.productId,
        slug: i.slug,
        name: i.nameAr,
        price: i.unitPrice,
        quantity: i.quantity,
      })),
      subtotal: shipping.subtotal,
      total: shipping.total,
    });
  }, [checkoutOpen, items, shipping.subtotal, shipping.total]);

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
      setStep("review");
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

  const showConfirmationCard =
    step === "details" &&
    form.phone.trim().length > 0 &&
    form.address.trim().length > 0;

  const { title, subtitle } = STEP_LABELS[step];

  const footer =
    step === "review" ? (
      <Button
        type="button"
        variant="gold"
        size="lg"
        className="w-full rounded-full shadow-gold"
        disabled={items.length === 0}
        onClick={() => setStep("details")}
      >
        إتمام الطلب
      </Button>
    ) : (
      <div className="space-y-2">
        <Button
          type="submit"
          form="checkout-form"
          variant="gold"
          size="lg"
          className="w-full rounded-full shadow-gold"
          disabled={submitting || items.length === 0}
        >
          {submitting ? "جاري الإرسال..." : "تأكيد الطلب - الدفع عند الاستلام"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-muted-foreground"
          onClick={() => setStep("review")}
        >
          <ArrowRight className="size-4 rotate-180" />
          رجوع لمراجعة السلة
        </Button>
      </div>
    );

  return (
    <Drawer open={checkoutOpen} onClose={handleClose} title={title} footer={footer}>
      <div className="mb-4 flex justify-center">
        <BrandLogo variant="checkout" />
      </div>
      <div className="mb-5 flex items-center gap-2">
        {(["review", "details"] as const).map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                step === s
                  ? "bg-accent text-foreground shadow-gold"
                  : step === "details" && s === "review"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-secondary text-muted-foreground",
              )}
            >
              {step === "details" && s === "review" ? "✓" : i + 1}
            </div>
            <div
              className={cn(
                "h-1 flex-1 rounded-full",
                step === "details" || (step === "review" && s === "review")
                  ? s === "review" && step === "details"
                    ? "bg-emerald-300"
                    : "bg-accent"
                  : "bg-border",
              )}
            />
          </div>
        ))}
      </div>
      <p className="mb-5 text-xs font-medium text-muted-foreground">{subtitle}</p>

      {step === "review" ? (
        <div className="space-y-5">
          {items.length > 0 ? (
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 shadow-warm-sm">
              <p className="mb-3 text-xs font-bold text-accent">منتجاتك</p>
              <ul className="space-y-4">
                {items.map((item) => (
                  <CartLineRow key={item.lineId} item={item} compact />
                ))}
              </ul>
              <div className="mt-4 border-t border-border/50 pt-4">
                <OrderTotals shipping={shipping} showUpsell />
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              سلتك فارغة — أضف منتجاً للمتابعة
            </p>
          )}

          <CheckoutCrossSell products={crossSellProducts} />

          <div className="flex items-start gap-2 rounded-xl border border-accent/15 bg-secondary/40 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>
              يمكنك إضافة منتجات مقترحة ثم الضغط على «إتمام الطلب» لإدخال بياناتك.
              الدفع عند الاستلام فقط.
            </p>
          </div>
        </div>
      ) : (
        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-start gap-2 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-foreground/85">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>أدخل بياناتك — سيتصل بك فريقنا لتأكيد الطلب قبل الشحن.</p>
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

          {showConfirmationCard && (
            <CheckoutConfirmationCard
              phone={form.phone}
              address={form.address}
              total={shipping.total}
            />
          )}
        </form>
      )}
    </Drawer>
  );
}
