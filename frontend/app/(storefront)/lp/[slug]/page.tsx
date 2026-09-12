import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { LpBlocksRenderer } from "@/components/lp/lp-blocks";
import { ADMIN_COOKIE_NAME, isValidAdminCookieValue } from "@/lib/admin/auth";
import type { LandingPage } from "@/lib/admin/types";
import { getMergedProductBySlug } from "@/lib/products/cms-catalog";
import { readStore } from "@/lib/server/store";

export const dynamic = "force-dynamic";

async function findPage(slug: string): Promise<LandingPage | undefined> {
  const store = await readStore();
  return store.landingPages.find((p) => p.slug === slug);
}

async function isAdminPreview(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return isValidAdminCookieValue(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await findPage(slug);
  if (!page) return {};
  return {
    title: page.seoTitle || page.headline || page.slug,
    description: page.seoDescription || page.subheadline || undefined,
    openGraph: {
      title: page.seoTitle || page.headline || page.slug,
      description: page.seoDescription || page.subheadline || undefined,
      ...(page.ogImage ? { images: [{ url: page.ogImage }] } : {}),
    },
    robots: page.isEnabled ? undefined : { index: false, follow: false },
  };
}

export default async function LandingPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await findPage(slug);
  if (!page) notFound();

  // Draft pages are visible only to a signed-in admin (Preview).
  if (!page.isEnabled && !(await isAdminPreview())) notFound();

  const store = await readStore();
  const product = page.featuredProductSlug
    ? await getMergedProductBySlug(page.featuredProductSlug)
    : undefined;

  const blocks = page.blocks ?? [];

  return (
    <div dir="rtl">
      {!page.isEnabled && (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm font-bold text-amber-800">
          Draft preview — this page is not public yet
        </div>
      )}
      {blocks.length > 0 ? (
        <LpBlocksRenderer
          blocks={blocks}
          product={product}
          whatsapp={store.siteSettings.whatsapp}
        />
      ) : (
        <section className="px-4 py-24 text-center">
          <h1 className="text-4xl font-extrabold">{page.headline || page.slug}</h1>
          {page.subheadline && (
            <p className="mt-4 text-lg text-muted-foreground">{page.subheadline}</p>
          )}
        </section>
      )}
    </div>
  );
}
