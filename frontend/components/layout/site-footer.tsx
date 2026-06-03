"use client";

import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Container } from "@/components/layout/container";
import { useTranslation } from "@/lib/i18n/language-provider";

/** Product category names — kept in Arabic per catalog */
const shopLinks = [
  "أملو",
  "أملو بالفستق",
  "زيت أركان",
  "عسل طبيعي",
  "مكسرات بالعسل",
];

export function SiteFooter() {
  const { t } = useTranslation();

  const infoLinks = [
    { label: t("footer.about"), href: "/#story" },
    { label: t("footer.delivery"), href: "/products" },
    { label: t("footer.returns"), href: "/products" },
    { label: t("nav.faq"), href: "/#faq" },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex transition-opacity hover:opacity-90">
              <BrandLogo variant="footer" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-foreground">
              {t("footer.codBadge")}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {t("footer.shop")}
            </p>
            <ul className="mt-4 space-y-3">
              {shopLinks.map((name) => (
                <li key={name}>
                  <Link
                    href="/products"
                    className="inline-flex min-h-11 items-center text-sm text-foreground/70 transition-colors hover:text-accent"
                  >
                    {name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/#bundles"
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-accent transition-colors hover:text-accent/80"
                >
                  {t("footer.gifts")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {t("footer.info")}
            </p>
            <ul className="mt-4 space-y-3">
              {infoLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-foreground/70 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              {t("footer.contact")}
            </p>
            <ul className="mt-4 space-y-3 text-sm text-foreground/70">
              <li>
                <a
                  href="https://wa.me/212600000000"
                  className="transition-colors hover:text-accent"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="tel:+212600000000"
                  className="transition-colors hover:text-accent"
                >
                  +212 600 000 000
                </a>
              </li>
            </ul>
            <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-4">
              <p className="text-xs font-semibold text-foreground">
                {t("footer.supportTitle")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("footer.supportHours")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Tazarzit Bio · {t("footer.rights")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
