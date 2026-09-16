import type { Metadata } from "next";
import Link from "next/link";

import { Container, Section } from "@/components/layout/container";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "أدلة تازارزيت بيو | أملو، أركان، عسل",
  description:
    "أدلة مختصرة عن الأملو وزيت الأركان والعسل الطبيعي من سوس — لفهم المنتج قبل الشراء، مع التوصيل والدفع عند الاستلام في المغرب.",
  alternates: { canonical: "/guide" },
  openGraph: {
    title: "أدلة تازارزيت بيو",
    description:
      "تعرّف على الأملو، زيت الأركان الغذائي، والعسل الطبيعي من منطقة سوس.",
    url: "/guide",
  },
};

const GUIDES = [
  {
    href: "/guide/amlou",
    title: "ما هو الأملو؟",
    desc: "تعريف الأملو المغربي، مكوناته، وكيف يُقدَّم على المائدة.",
  },
  {
    href: "/guide/amlou-casablanca",
    title: "أملو في الدار البيضاء",
    desc: "شراء أملو أونلاين مع التوصيل والدفع عند الاستلام في الدار البيضاء.",
  },
  {
    href: "/guide/amlou-marrakech",
    title: "أملو في مراكش",
    desc: "توصيل أملو ملكي وتقليدي إلى مراكش مع تأكيد الطلب هاتفياً.",
  },
  {
    href: "/guide/amlou-agadir",
    title: "أملو في أكادير",
    desc: "أملو من سوس إلى أكادير — طلب أونلاين أو واتساب مع الدفع عند الاستلام.",
  },
  {
    href: "/guide/huile-argan",
    title: "زيت الأركان الغذائي",
    desc: "الفرق بين زيت الأركان للطعام والتجميل، والاستخدام اليومي.",
  },
  {
    href: "/guide/miel-naturel-maroc",
    title: "العسل الطبيعي من المغرب",
    desc: "عسل سوس، النقاء، وطريقة الشراء مع الدفع عند الاستلام.",
  },
] as const;

export default function GuideIndexPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "الرئيسية", path: "/" },
          { name: "أدلة", path: "/guide" },
        ])}
      />
      <Section spacing="lg" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(96_33%_22%_/_0.1),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_hsl(35_65%_46%_/_0.12),_transparent_45%)]"
        />
        <Container size="md" className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
            Guides · أدلة
          </p>
          <h1 className="mt-4 text-3xl font-extrabold text-foreground sm:text-4xl">
            أدلة تازارزيت بيو
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            محتوى واضح عن منتجاتنا الطبيعية من سوس — مفيد للشراء وللإجابة عن
            أسئلة محركات البحث والذكاء الاصطناعي.
          </p>

          <ul className="mt-12 space-y-6">
            {GUIDES.map((guide) => (
              <li key={guide.href}>
                <Link
                  href={guide.href}
                  className="group block border-b border-border/80 pb-6 transition-colors hover:border-accent"
                >
                  <h2 className="text-xl font-bold text-foreground group-hover:text-accent">
                    {guide.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {guide.desc}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
