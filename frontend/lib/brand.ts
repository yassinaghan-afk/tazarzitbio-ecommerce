/** Brand assets — PNG used (no SVG uploaded) */
export const BRAND_LOGO_PNG = "/brand/tazarzitbio-logo.png";
export const BRAND_NAME = "TazarzitBio";
export const BRAND_TAGLINE_AR = "من قلب سوس";

export const FAMILY_PACK_SLUG = "premium-family-pack";

export function isFamilyPackProduct(slug: string): boolean {
  return slug === FAMILY_PACK_SLUG;
}
