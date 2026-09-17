import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Container, Section } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/i18n/types";
import {
  aboutAddressLine,
  getAboutCopy,
} from "@/lib/seo/about-content";
import { BUSINESS_LOCATION } from "@/lib/seo/business-location";
import {
  aboutPageJsonLd,
  breadcrumbJsonLd,
  JsonLd,
} from "@/lib/seo/json-ld";
import { localizedPath } from "@/lib/seo/locale";

const PHONE = "+212 642 370 050";
const WHATSAPP = "212642370050";

export function AboutPageContent({ locale }: { locale: Language }) {
  const copy = getAboutCopy(locale);
  const homeLabel =
    locale === "fr" ? "Accueil" : locale === "en" ? "Home" : "الرئيسية";
  const aboutLabel =
    locale === "fr" ? "À propos" : locale === "en" ? "About" : "من نحن";
  const path = localizedPath(locale, "/about");
  const address = aboutAddressLine(locale);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: homeLabel, path: localizedPath(locale, "/") },
          { name: aboutLabel, path },
        ])}
      />
      <JsonLd
        data={aboutPageJsonLd({
          name: copy.h1,
          description: copy.lead,
          path,
          locale,
        })}
      />
      <Section spacing="lg" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(96_33%_22%_/_0.1),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_hsl(35_65%_46%_/_0.12),_transparent_45%)]"
        />
        <Container size="md" className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
            Tazarzit Bio
          </p>
          <h1 className="mt-4 text-3xl font-extrabold text-foreground sm:text-4xl">
            {copy.h1}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {copy.lead}
          </p>

          <div className="mt-10 space-y-5 text-base leading-relaxed text-foreground/90">
            {copy.body.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>

          <h2 className="mt-14 text-xl font-bold text-foreground">
            {copy.valuesHeading}
          </h2>
          <ul className="mt-5 space-y-3">
            {copy.values.map((v) => (
              <li key={v} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                <span className="text-sm text-foreground/85 sm:text-base">
                  {v}
                </span>
              </li>
            ))}
          </ul>

          <h2 className="mt-14 text-xl font-bold text-foreground">
            {copy.napHeading}
          </h2>
          <dl className="mt-5 space-y-3 text-sm text-muted-foreground sm:text-base">
            <div>
              <dt className="font-semibold text-foreground">
                {locale === "fr"
                  ? "Marque"
                  : locale === "en"
                    ? "Brand"
                    : "العلامة"}
              </dt>
              <dd>Tazarzit Bio · تازارزيت بيو</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">
                {locale === "fr"
                  ? "Adresse"
                  : locale === "en"
                    ? "Address"
                    : "العنوان"}
              </dt>
              <dd>
                <a
                  href={BUSINESS_LOCATION.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 hover:text-accent hover:underline"
                >
                  {address} {BUSINESS_LOCATION.postalCode}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">
                {locale === "fr"
                  ? "Téléphone / WhatsApp"
                  : locale === "en"
                    ? "Phone / WhatsApp"
                    : "الهاتف / واتساب"}
              </dt>
              <dd>
                <a
                  href={`https://wa.me/${WHATSAPP}`}
                  className="underline-offset-2 hover:text-accent hover:underline"
                >
                  {PHONE}
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-12">
            <Button asChild size="lg" className="min-h-12 px-8 font-bold">
              <Link href={copy.ctaHref}>{copy.ctaLabel}</Link>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
