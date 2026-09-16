import { CommerceShell } from "@/components/commerce/commerce-shell";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  JsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/json-ld";
import { getRequestLocale } from "@/lib/seo/locale";

/**
 * Public storefront layout — header, announcement, cart, footer.
 * Admin routes intentionally do NOT use this layout.
 */
export default async function StorefrontLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { readStore } = await import("@/lib/server/store");
  const store = await readStore();
  const locale = await getRequestLocale();
  return (
    <CommerceShell initialLocale={locale}>
      <JsonLd data={organizationJsonLd(store.siteSettings)} />
      <JsonLd data={websiteJsonLd()} />
      <SiteHeader cmsNav={store.navigation.header} />
      <AnnouncementBar />
      <main className="max-w-full overflow-x-hidden pt-[var(--site-top-offset,8rem)] lg:pt-[var(--site-top-offset,9.75rem)]">
        {children}
      </main>
      <SiteFooter
        cmsNavigation={store.navigation}
        settings={store.siteSettings}
      />
    </CommerceShell>
  );
}
