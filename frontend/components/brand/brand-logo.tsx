import Image from "next/image";

import { BRAND_LOGO_PNG, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

const LOGO_WIDTH = 433;
const LOGO_HEIGHT = 577;

type BrandLogoVariant = "header" | "footer" | "compact" | "checkout" | "admin";

const variantConfig: Record<
  BrandLogoVariant,
  { sizes: string; className: string }
> = {
  header: {
    sizes: "(max-width: 640px) 56px, (max-width: 1024px) 64px, 72px",
    className: "h-12 sm:h-14 lg:h-16",
  },
  footer: {
    sizes: "128px",
    className: "h-14 sm:h-16",
  },
  compact: {
    sizes: "96px",
    className: "h-11 sm:h-12",
  },
  checkout: {
    sizes: "104px",
    className: "h-12 mx-auto",
  },
  admin: {
    sizes: "112px",
    className: "h-12 sm:h-14",
  },
};

interface BrandLogoProps {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  variant = "header",
  className,
  priority = false,
}: BrandLogoProps) {
  const config = variantConfig[variant];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center",
        config.className,
        className,
      )}
    >
      <Image
        src={BRAND_LOGO_PNG}
        alt={BRAND_NAME}
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        sizes={config.sizes}
        quality={100}
        priority={priority}
        className="h-full w-auto max-w-none object-contain object-center"
      />
    </span>
  );
}

/** @deprecated Use BrandLogo — tagline removed */
export function BrandLockup({
  variant = "header",
  className,
  priority = false,
}: {
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
  showTagline?: boolean;
}) {
  return (
    <BrandLogo variant={variant} className={className} priority={priority} />
  );
}
