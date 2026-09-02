"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronDown, Leaf, MapPin, ShieldCheck, Sparkles } from "lucide-react";

import { RoyalOrderSection } from "@/components/royal/royal-order-section";
import { Button } from "@/components/ui/button";
import {
  AMLOU_ROYAL_IMAGE,
  AMLOU_ROYAL_IMAGES,
  AMLOU_ROYAL_INGREDIENTS,
  AMLOU_ROYAL_NAME_AR,
} from "@/lib/products/amlou-royal";
import { trackViewContent } from "@/lib/tracking/events";
import { cn } from "@/lib/utils";

const BENEFITS = [
  { title: "مذاق فاخر", text: "خليطة مكسرات مختارة بعناية لقوام كريمي غني." },
  { title: "مكونات طبيعية", text: "100% طبيعي، بدون سكر مضاف." },
  { title: "هوية مغربية", text: "أملو من تازارزيت بيو بطابع سوس الأصيل." },
  { title: "زيت أركان غذائي", text: "لمسة أركان ناعمة تُبرز نكهة المكسرات." },
];

const WHY = [
  { title: "مكونات مختارة بعناية", icon: Sparkles },
  { title: "صناعة مغربية", icon: MapPin },
  { title: "جودة Tazarzit Bio", icon: ShieldCheck },
  { title: "100% طبيعي", icon: Leaf },
  { title: "بدون سكر مضاف", icon: Leaf },
];

const FAQS = [
  {
    q: "مما يتكوّن أملو ملكي؟",
    a: "خليطة من اللوز المحمص، الفستق، البندق المحمص، الكاجو، الكركاع، جوز البرازيل، بذور اليقطين المحمصة، غذاء ملكات النحل، وزيت أركان غذائي. النسخة بالعسل تُحلّى بعسل طبيعي.",
  },
  {
    q: "ما الفرق بين نسخة العسل والنسخة بدون عسل؟",
    a: "أملو بالعسل محلى بالعسل الطبيعي. أملو بدون عسل بدون عسل وبدون سكر مضاف.",
  },
  {
    q: "هل يوجد سكر مضاف؟",
    a: "لا. المنتوج بدون سكر مضاف.",
  },
  {
    q: "كيف يتم الطلب والدفع؟",
    a: "تختار العرض، تملأ معلوماتك، ثم تؤكد نوع الأملو. الدفع عند الاستلام.",
  },
  {
    q: "كم رسوم التوصيل؟",
    a: "التوصيل مجاناً لجميع العروض في جميع مدن المغرب.",
  },
];

function scrollToOrder() {
  document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function RoyalLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.body.classList.add("royal-lp");
    return () => document.body.classList.remove("royal-lp");
  }, []);

  useEffect(() => {
    trackViewContent({
      productId: "amlou-royal",
      slug: "amlou-royal",
      name: AMLOU_ROYAL_NAME_AR,
      price: 249,
    });
  }, []);

  return (
    <div className="bg-[#faf6ef] text-foreground">
      {/* Hero + order — one coherent full-bleed conversion block */}
      <section id="order" className="scroll-mt-0 pb-6 pt-0">
        <h1 className="sr-only">أملو ملكي — مذاق فاخر من مكونات طبيعية</h1>

        <div className="lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-2 lg:items-center">
          {/* Full-area hero — edge-to-edge plane, no card chrome */}
          <div className="relative isolate aspect-square w-full overflow-hidden bg-[#f3ebe0]">
            <Image
              src={AMLOU_ROYAL_IMAGE}
              alt={`${AMLOU_ROYAL_NAME_AR} تازارزيت بيو — 500 غ`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>

          <div className="flex flex-col justify-center bg-[#faf6ef] px-3 py-4 sm:px-4 lg:px-8 lg:py-6">
            <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
              <RoyalOrderSection embedded />
            </div>
          </div>
        </div>
      </section>

      {/* Content below the fold */}
      <section className="border-t border-[#eadfce] bg-white py-10">
        <div className="mx-auto max-w-md px-3 sm:max-w-6xl sm:px-4">
          <h2 className="text-center text-xl font-extrabold sm:text-2xl">
            لماذا أملو ملكي؟
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {BENEFITS.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-4"
              >
                <h3 className="text-sm font-extrabold">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-10">
        <div className="mx-auto max-w-md px-3 sm:max-w-6xl sm:px-4">
          <h2 className="text-center text-xl font-extrabold sm:text-2xl">المكونات</h2>
          <ul className="mx-auto mt-5 grid grid-cols-2 gap-1.5 sm:max-w-3xl">
            {AMLOU_ROYAL_INGREDIENTS.map((name) => (
              <li
                key={name}
                className="rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-xs font-semibold"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto max-w-md px-3 sm:max-w-6xl sm:px-4">
          <h2 className="text-center text-xl font-extrabold sm:text-2xl">
            تقديم المنتوج
          </h2>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
            {AMLOU_ROYAL_IMAGES.map((src, i) => (
              <div
                key={src}
                className="relative aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-[#faf6ef]"
              >
                <Image
                  src={src}
                  alt={`${AMLOU_ROYAL_NAME_AR} — ${i + 1}`}
                  fill
                  sizes="33vw"
                  className="object-contain p-2"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1a2744] py-10 text-white">
        <div className="mx-auto max-w-md px-3 sm:max-w-6xl sm:px-4">
          <h2 className="text-center text-xl font-extrabold sm:text-2xl">
            لماذا تختار أملو ملكي
          </h2>
          <ul className="mx-auto mt-5 grid gap-2 sm:max-w-3xl sm:grid-cols-2">
            {WHY.map((item) => (
              <li
                key={item.title}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-bold"
              >
                <item.icon className="size-4 shrink-0 text-accent" aria-hidden />
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto max-w-md px-3 sm:max-w-6xl sm:px-4">
          <h2 className="text-center text-xl font-extrabold sm:text-2xl">
            الجودة والثقة
          </h2>
          <div className="mx-auto mt-5 grid grid-cols-2 gap-2 sm:max-w-3xl">
            {[
              "مكونات مختارة بعناية",
              "صناعة مغربية",
              "جودة Tazarzit Bio",
              "100% طبيعي",
              "بدون سكر مضاف",
              "الدفع عند الاستلام",
            ].map((label) => (
              <p
                key={label}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-center text-xs font-bold"
              >
                {label}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-10">
        <div className="mx-auto max-w-md px-3">
          <h2 className="text-center text-xl font-extrabold">أسئلة شائعة</h2>
          <div className="mt-4 space-y-2">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={faq.q}
                  className={cn(
                    "overflow-hidden rounded-lg border",
                    open ? "border-accent/30 bg-white" : "border-neutral-200 bg-white/80",
                  )}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex min-h-10 w-full items-center justify-between gap-2 px-3 py-2.5 text-start"
                  >
                    <span className="text-xs font-bold sm:text-sm">{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-neutral-400 transition-transform",
                        open && "rotate-180 text-accent",
                      )}
                    />
                  </button>
                  {open && (
                    <p className="border-t border-neutral-100 px-3 py-2.5 text-xs leading-relaxed text-neutral-600">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#faf6ef] px-3 py-8 text-center">
        <Button
          size="lg"
          onClick={scrollToOrder}
          className="min-h-12 w-full max-w-md rounded-full bg-red-600 font-extrabold text-white hover:bg-red-700"
        >
          اطلب الآن
        </Button>
      </section>

      <div className="h-14 lg:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white/95 p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
        <Button
          size="lg"
          onClick={scrollToOrder}
          className="min-h-11 w-full rounded-full bg-red-600 font-extrabold text-white hover:bg-red-700"
        >
          اطلب الآن
        </Button>
      </div>
    </div>
  );
}
