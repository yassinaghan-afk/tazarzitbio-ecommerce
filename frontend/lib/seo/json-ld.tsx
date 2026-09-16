import type { SiteSettings } from "@/lib/admin/cms-types";
import type { PublicProduct } from "@/lib/products/types";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tazarzitbio.com"
).replace(/\/$/, "");

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd(settings?: SiteSettings | null) {
  const sameAs = [
    settings?.instagram,
    settings?.facebook,
    settings?.tiktok,
  ].filter((url): url is string => Boolean(url?.trim()));

  const phone = settings?.phone?.trim();
  const email = settings?.email?.trim();
  const whatsapp = settings?.whatsapp?.replace(/\D/g, "");

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.brandName?.trim() || "Tazarzit Bio",
    alternateName: "تازارزيت بيو",
    url: SITE_URL,
    logo: absoluteUrl(settings?.logoUrl || "/brand/tazarzitbio-logo.png"),
    description:
      settings?.seoDescription?.trim() ||
      "منتجات مغربية طبيعية فاخرة من قلب سوس — أملو، زيت أركان، عسل ومكسرات. الدفع عند الاستلام.",
    areaServed: {
      "@type": "Country",
      name: settings?.country?.trim() || "Morocco",
    },
    ...(sameAs.length ? { sameAs } : {}),
    ...(phone || email || whatsapp
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: ["ar", "fr", "en"],
            ...(phone ? { telephone: phone } : {}),
            ...(email ? { email } : {}),
            ...(whatsapp
              ? { url: `https://wa.me/${whatsapp}` }
              : {}),
          },
        }
      : {}),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tazarzit Bio",
    alternateName: "تازارزيت بيو",
    url: SITE_URL,
    inLanguage: ["ar-MA", "fr-MA", "en"],
  };
}

export function faqPageJsonLd(
  faqs: Array<{ q: string; a: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs
      .filter((f) => f.q.trim() && f.a.trim())
      .map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.a,
        },
      })),
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productJsonLd(product: PublicProduct, path: string) {
  const offers = product.offers.map((offer) => ({
    "@type": "Offer",
    url: absoluteUrl(path),
    priceCurrency: "MAD",
    price: offer.price,
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    name: offer.label,
  }));

  const reviews = product.reviews.slice(0, 5).map((review) => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.author,
    },
    datePublished: review.date,
    reviewBody: review.content,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameAr,
    description: product.shortDescription,
    image: product.images?.length
      ? product.images.map((src) => absoluteUrl(src))
      : [absoluteUrl(product.image)],
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Tazarzit Bio",
    },
    countryOfOrigin: {
      "@type": "Country",
      name: "Morocco",
    },
    ...(product.ingredients.length
      ? { material: product.ingredients.join("، ") }
      : {}),
    offers:
      offers.length === 1
        ? offers[0]
        : {
            "@type": "AggregateOffer",
            priceCurrency: "MAD",
            lowPrice: Math.min(...product.offers.map((o) => o.price)),
            highPrice: Math.max(...product.offers.map((o) => o.price)),
            offerCount: product.offers.length,
            offers,
          },
    ...(product.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount || product.reviews.length || 1,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(reviews.length ? { review: reviews } : {}),
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> | object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
