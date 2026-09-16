import type { PublicProduct } from "@/lib/products/types";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tazarzitbio.com"
).replace(/\/$/, "");

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Tazarzit Bio",
    alternateName: "تازارزيت بيو",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/tazarzitbio-logo.png`,
    description:
      "منتجات مغربية طبيعية فاخرة من قلب سوس — أملو، زيت أركان، عسل ومكسرات. الدفع عند الاستلام.",
    areaServed: {
      "@type": "Country",
      name: "Morocco",
    },
    sameAs: [] as string[],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tazarzit Bio",
    url: SITE_URL,
    inLanguage: ["ar-MA", "fr-MA", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/products`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(
  product: PublicProduct,
  path: string,
) {
  const offers = product.offers.map((offer) => ({
    "@type": "Offer",
    url: `${SITE_URL}${path}`,
    priceCurrency: "MAD",
    price: offer.price,
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    name: offer.label,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nameAr,
    description: product.shortDescription,
    image: product.images?.length
      ? product.images.map((src) =>
          src.startsWith("http") ? src : `${SITE_URL}${src}`,
        )
      : [`${SITE_URL}${product.image}`],
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: "Tazarzit Bio",
    },
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
