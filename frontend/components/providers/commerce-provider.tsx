"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import type { AddToCartPayload, CartLineItem } from "@/lib/cart/types";
import {
  calcSubtotal,
  createLineId,
  getCartCount,
  loadCartFromStorage,
  saveCartToStorage,
} from "@/lib/cart/utils";
import type { CheckoutFormData, PlacedOrder } from "@/lib/checkout/types";
import { LAST_ORDER_STORAGE_KEY } from "@/lib/checkout/types";
import {
  hasCheckoutErrors,
  validateCheckoutForm,
} from "@/lib/checkout/validation";
import { getProducts, getRelatedProducts } from "@/lib/products";

interface CommerceContextValue {
  items: CartLineItem[];
  itemCount: number;
  subtotal: number;
  cartOpen: boolean;
  checkoutOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  addToCart: (payload: AddToCartPayload) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
  crossSellProducts: ReturnType<typeof getRelatedProducts>;
  submitOrder: (
    form: CheckoutFormData,
  ) => { success: boolean; errors?: import("@/lib/checkout/types").CheckoutFormErrors };
}

const CommerceContext = createContext<CommerceContextValue | null>(null);

export function CommerceProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    const stored = loadCartFromStorage();
    setItems(stored.items);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCartToStorage({ items });
  }, [items, hydrated]);

  const itemCount = useMemo(() => getCartCount(items), [items]);
  const subtotal = useMemo(() => calcSubtotal(items), [items]);

  const cartSlugs = useMemo(() => [...new Set(items.map((i) => i.slug))], [items]);

  const [catalogVersion, setCatalogVersion] = useState(0);

  useEffect(() => {
    const bump = () => setCatalogVersion((v) => v + 1);
    window.addEventListener("tazarzit-pricing-updated", bump);
    return () => window.removeEventListener("tazarzit-pricing-updated", bump);
  }, []);

  const crossSellProducts = useMemo(() => {
    const catalog = getProducts();
    const relatedSlugs = cartSlugs.flatMap((slug) => {
      const p = catalog.find((x) => x.slug === slug);
      return p?.relatedSlugs ?? [];
    });
    const unique = [...new Set(relatedSlugs)].filter(
      (slug) => !cartSlugs.includes(slug),
    );
    return getRelatedProducts(unique).slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSlugs, catalogVersion]);

  const addToCart = useCallback((payload: AddToCartPayload) => {
    const lineId = createLineId(payload.productId, payload.offerId);
    const qty = payload.quantity ?? 1;

    setItems((prev) => {
      const existing = prev.find((i) => i.lineId === lineId);
      if (existing) {
        return prev.map((i) =>
          i.lineId === lineId ? { ...i, quantity: i.quantity + qty } : i,
        );
      }
      return [
        ...prev,
        {
          lineId,
          productId: payload.productId,
          slug: payload.slug,
          nameAr: payload.nameAr,
          image: payload.image,
          offerId: payload.offerId,
          offerLabel: payload.offerLabel,
          unitPrice: payload.unitPrice,
          quantity: qty,
        },
      ];
    });
    setCartOpen(true);
  }, []);

  const removeItem = useCallback((lineId: string) => {
    setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.lineId !== lineId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const openCart = useCallback(() => {
    setCheckoutOpen(false);
    setCartOpen(true);
  }, []);

  const closeCart = useCallback(() => setCartOpen(false), []);

  const openCheckout = useCallback(() => {
    setCartOpen(false);
    setCheckoutOpen(true);
  }, []);

  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);

  const submitOrder = useCallback(
    (form: CheckoutFormData) => {
      const errors = validateCheckoutForm(form);
      if (hasCheckoutErrors(errors)) return { success: false, errors };
      if (items.length === 0) return { success: false };

      const order: PlacedOrder = {
        id: `TZ-${Date.now().toString(36).toUpperCase()}`,
        placedAt: new Date().toISOString(),
        customer: form,
        items: items.map((i) => ({
          nameAr: i.nameAr,
          offerLabel: i.offerLabel,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        subtotal,
      };

      sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order));
      clearCart();
      setCheckoutOpen(false);
      router.push("/thank-you");
      return { success: true };
    },
    [items, subtotal, clearCart, router],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount,
      subtotal,
      cartOpen,
      checkoutOpen,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      addToCart,
      removeItem,
      updateQuantity,
      clearCart,
      crossSellProducts,
      submitOrder,
    }),
    [
      items,
      itemCount,
      subtotal,
      cartOpen,
      checkoutOpen,
      openCart,
      closeCart,
      openCheckout,
      closeCheckout,
      addToCart,
      removeItem,
      updateQuantity,
      clearCart,
      crossSellProducts,
      submitOrder,
    ],
  );

  return (
    <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>
  );
}

export function useCommerce() {
  const ctx = useContext(CommerceContext);
  if (!ctx) {
    throw new Error("useCommerce must be used within CommerceProvider");
  }
  return ctx;
}

/** Returns validation errors for checkout form (used by checkout drawer) */
export function useCheckoutValidation() {
  return { validateCheckoutForm, hasCheckoutErrors };
}
