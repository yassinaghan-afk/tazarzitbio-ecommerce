import Link from "next/link";

import { Container, Section } from "@/components/layout/container";
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  JsonLd,
} from "@/lib/seo/json-ld";

export type GuideFaq = { q: string; a: string };

export type GuideSection = {
  heading: string;
  paragraphs: string[];
};

export function GuideArticle({
  path,
  title,
  label,
  intro,
  sections,
  faqs,
  ctaHref = "/products",
  ctaLabel = "تسوق منتجات تازارزيت بيو",
}: {
  path: string;
  title: string;
  label: string;
  intro: string;
  sections: GuideSection[];
  faqs: GuideFaq[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "الرئيسية", path: "/" },
          { name: "أدلة", path: "/guide" },
          { name: title, path },
        ])}
      />
      {faqs.length > 0 ? <JsonLd data={faqPageJsonLd(faqs)} /> : null}

      <Section spacing="lg" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(35_65%_46%_/_0.12),_transparent_55%),radial-gradient(ellipse_at_bottom,_hsl(96_33%_22%_/_0.08),_transparent_50%)]"
        />
        <Container size="md" className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
            {label}
          </p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {intro}
          </p>

          <div className="mt-12 space-y-10">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-foreground/80 sm:text-base">
                  {section.paragraphs.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {faqs.length > 0 ? (
            <section className="mt-14">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                أسئلة شائعة
              </h2>
              <div className="mt-6 space-y-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.q}
                    className="border-b border-border/70 pb-4 last:border-b-0"
                  >
                    <h3 className="text-base font-semibold text-foreground">
                      {faq.q}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href={ctaHref}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {ctaLabel}
            </Link>
            <Link
              href="/guide"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              كل الأدلة
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
