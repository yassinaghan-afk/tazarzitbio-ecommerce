"use client";

import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Container } from "@/components/layout/container";
import { pickNavLabel } from "@/components/layout/site-header";
import type { NavigationSettings, SiteSettings } from "@/lib/admin/cms-types";
import { useTranslation } from "@/lib/i18n/language-provider";

/** Product category names — default fallback (Arabic, per catalog) */
const defaultShopLinks = [
  "أملو",
  "أملو بالفستق",
  "زيت أركان",
  "عسل طبيعي",
  "مكسرات بالعسل",
];

export function SiteFooter({
  cmsNavigation,
  settings,
}: {
  cmsNavigation?: NavigationSettings;
  settings?: SiteSettings;
}) {
  const { t, locale } = useTranslation();

  const cmsShop = (cmsNavigation?.footerShop ?? []).filter((l) => l.isVisible);
  const cmsInfo = (cmsNavigation?.footerInfo ?? []).filter((l) => l.isVisible);

  const shopLinks =
    cmsShop.length > 0
      ? cmsShop.map((l) => ({ label: pickNavLabel(l, locale), href: l.href }))
      : defaultShopLinks.map((name) => ({ label: name, href: "/products" }));

  const infoLinks =
    cmsInfo.length > 0
      ? cmsInfo.map((l) => ({ label: pickNavLabel(l, locale), href: l.href }))
      : [
          { label: t("footer.about"), href: "/#story" },
          { label: t("footer.delivery"), href: "/products" },
          { label: t("footer.returns"), href: "/products" },
          { label: t("nav.faq"), href: "/#faq" },
        ];

  const whatsappDigits = (settings?.whatsapp ?? "212600000000").replace(/\D/g, "");
  const phone = settings?.phone || "+212 600 000 000";
  const brandName = settings?.brandName || "Tazarzit Bio";

  const socials = [
    { label: "Instagram", href: settings?.instagram },
    { label: "TikTok", href: settings?.tiktok },
    { label: "Facebook", href: settings?.facebook },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href));

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
              {shopLinks.map((link) => (
                <li key={link.label + link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-foreground/70 transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {cmsShop.length === 0 && (
                <li>
                  <Link
                    href="/#bundles"
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-accent transition-colors hover:text-accent/80"
                  >
                    {t("footer.gifts")}
                  </Link>
                </li>
              )}
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
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-accent"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-accent"
                  dir="ltr"
                >
                  {phone}
                </a>
              </li>
              {settings?.email && (
                <li>
                  <a
                    href={`mailto:${settings.email}`}
                    className="transition-colors hover:text-accent"
                    dir="ltr"
                  >
                    {settings.email}
                  </a>
                </li>
              )}
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-4">
              <p className="text-xs font-semibold text-foreground">
                {t("footer.supportTitle")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {settings?.supportHours || t("footer.supportHours")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {brandName} · {t("footer.rights")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
