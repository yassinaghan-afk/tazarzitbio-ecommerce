/** Brand assets — add SVG under public/brand for sharpest rendering */
export const BRAND_LOGO_SVG = "/brand/tazarzitbio-logo.svg";
export const BRAND_LOGO_PNG = "/brand/tazarzitbio-logo.png";
/** Primary logo — PNG today; add public/brand/tazarzitbio-logo.svg to auto-upgrade */
export const BRAND_LOGO_SRC = BRAND_LOGO_PNG;
export const BRAND_NAME = "TazarzitBio";
export const BRAND_TAGLINE_AR = "من قلب سوس";

/** Intrinsic dimensions of logo asset (portrait) */
export const BRAND_LOGO_WIDTH = 433;
export const BRAND_LOGO_HEIGHT = 577;

/** Synced with globals.css — used by announcement bar offset math */
export const HEADER_HEIGHT_MOBILE_PX = 92;
export const HEADER_HEIGHT_DESKTOP_PX = 120;

export const FAMILY_PACK_SLUG = "premium-family-pack";

export function isFamilyPackProduct(slug: string): boolean {
  return slug === FAMILY_PACK_SLUG;
}
