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
  validateCheckoutFormLocalized,
} from "@/lib/i18n/checkout-validation";
import { useTranslation } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";
import { trackInitiateCheckout } from "@/lib/tracking/events";

const emptyForm: CheckoutFormData = {
  fullName: "",
  phone: "",
  address: "",
};

type CheckoutStep = "review" | "details";

const COUPON_LABELS = {
  ar: {
    placeholder: "كود التخفيض (اختياري)",
    apply: "تطبيق",
    applied: "تم تطبيق الكود",
    remove: "إزالة",
    invalid: "كود غير صالح أو منتهي",
    minSubtotal: "قيمة السلة أقل من الحد الأدنى لهذا الكود",
  },
  fr: {
    placeholder: "Code promo (optionnel)",
    apply: "Appliquer",
    applied: "Code appliqué",
    remove: "Retirer",
    invalid: "Code invalide ou expiré",
    minSubtotal: "Sous-total insuffisant pour ce code",
  },
  en: {
    placeholder: "Promo code (optional)",
    apply: "Apply",
    applied: "Code applied",
    remove: "Remove",
    invalid: "Invalid or expired code",
    minSubtotal: "Cart subtotal too low for this code",
  },
} as const;

function CouponField() {
  const { locale } = useTranslation();
  const { coupon, applyCoupon, removeCoupon } = useCommerce();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labels =
    COUPON_LABELS[locale as keyof typeof COUPON_LABELS] ?? COUPON_LABELS.ar;

  const handleApply = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    const result = await applyCoupon(code);
    setBusy(false);
    if (!result.ok) {
      setError(
        result.reason === "min_subtotal" ? labels.minSubtotal : labels.invalid,
      );
    } else {
      setCode("");
    }
  };

  if (coupon) {
    return (
      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
        <span className="font-semibold text-emerald-700">
          {labels.applied}: <span className="font-mono">{coupon.code}</span>
          {coupon.discount > 0 && (
            <span className="ms-2 tabular-nums">-{coupon.discount} MAD</span>
          )}
        </span>
        <button
          type="button"
          onClick={removeCoupon}
          className="text-xs font-semibold text-emerald-700 underline"
        >
          {labels.remove}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
          placeholder={labels.placeholder}
          className="h-10 flex-1 font-mono uppercase"
          dir="ltr"
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl px-4"
          disabled={busy || !code.trim()}
          onClick={handleApply}
        >
          {labels.apply}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function CheckoutDrawer() {
  const { t, locale } = useTranslation();
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
    const nextErrors = validateCheckoutFormLocalized(form, locale);
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

  const title =
    step === "review" ? t("checkout.reviewTitle") : t("checkout.detailsTitle");
  const subtitle =
    step === "review" ? t("checkout.reviewSub") : t("checkout.detailsSub");

  const footer =
    step === "review" ? (
      <Button
        type="button"
        variant="gold"
        size="lg"
        className="min-h-12 w-full rounded-full shadow-gold"
        disabled={items.length === 0}
        onClick={() => setStep("details")}
      >
        {t("checkout.complete")}
      </Button>
    ) : (
      <div className="space-y-2">
        <Button
          type="submit"
          form="checkout-form"
          variant="gold"
          size="lg"
          className="min-h-12 w-full rounded-full shadow-gold"
          disabled={submitting || items.length === 0}
        >
          {submitting ? t("checkout.submitting") : t("checkout.confirm")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="min-h-11 w-full gap-2 text-muted-foreground"
          onClick={() => setStep("review")}
        >
          <ArrowRight className="size-4 rotate-180" />
          {t("checkout.back")}
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
              <p className="mb-3 text-xs font-bold text-accent">{t("checkout.yourProducts")}</p>
              <ul className="space-y-4">
                {items.map((item) => (
                  <CartLineRow key={item.lineId} item={item} compact />
                ))}
              </ul>
              <div className="mt-4 border-t border-border/50 pt-4">
                <OrderTotals shipping={shipping} showUpsell />
                <CouponField />
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              {t("checkout.emptyCart")}
            </p>
          )}

          <CheckoutCrossSell products={crossSellProducts} />

          <div className="flex items-start gap-2 rounded-xl border border-accent/15 bg-secondary/40 p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>{t("checkout.reviewHint")}</p>
          </div>
        </div>
      ) : (
        <form
          id="checkout-form"
          onSubmit={handleSubmit}
          className="w-full max-w-full min-w-0 space-y-5"
        >
          <div className="flex items-start gap-2 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-foreground/85">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>{t("checkout.detailsHint")}</p>
          </div>

          <div>
            <Label htmlFor="fullName">{t("checkout.fullName")}</Label>
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              placeholder={t("checkout.placeholderName")}
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              error={errors.fullName}
            />
          </div>

          <div>
            <Label htmlFor="phone">{t("checkout.phone")}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              dir="ltr"
              className="text-end"
              placeholder={t("checkout.placeholderPhone")}
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              error={errors.phone}
            />
            <p className="mt-1 flex items-center gap-1 text-2xs text-muted-foreground">
              <Phone className="size-3" />
              {t("checkout.phoneHint")}
            </p>
          </div>

          <div>
            <Label htmlFor="address">{t("checkout.address")}</Label>
            <Input
              id="address"
              name="address"
              autoComplete="street-address"
              placeholder={t("checkout.placeholderAddress")}
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
