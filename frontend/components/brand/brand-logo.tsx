"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  BRAND_LOGO_HEIGHT,
  BRAND_LOGO_PNG,
  BRAND_LOGO_SVG,
  BRAND_LOGO_WIDTH,
  BRAND_NAME,
} from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoVariant = "header" | "footer" | "compact" | "checkout" | "admin";

const variantConfig: Record<
  BrandLogoVariant,
  { sizes: string; className: string }
> = {
  header: {
    sizes: "(max-width: 640px) 80px, (max-width: 1024px) 96px, 128px",
    className: "aspect-[433/577] h-[4.75rem] sm:h-[5.75rem] lg:h-[7rem]",
  },
  footer: {
    sizes: "(max-width: 640px) 112px, 160px",
    className: "aspect-[433/577] h-[5.5rem] sm:h-[6.5rem]",
  },
  compact: {
    sizes: "(max-width: 640px) 96px, 112px",
    className: "aspect-[433/577] h-[5.25rem] sm:h-[6rem]",
  },
  checkout: {
    sizes: "(max-width: 640px) 112px, 140px",
    className: "aspect-[433/577] h-[6rem] sm:h-[7rem] mx-auto",
  },
  admin: {
    sizes: "(max-width: 640px) 112px, 140px",
    className: "aspect-[433/577] h-[6rem] sm:h-[7rem]",
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
  const [useSvg, setUseSvg] = useState(false);

  useEffect(() => {
    const probe = new window.Image();
    probe.onload = () => setUseSvg(true);
    probe.onerror = () => setUseSvg(false);
    probe.src = BRAND_LOGO_SVG;
  }, []);

  const imageClass =
    "h-full w-full object-contain object-center [image-rendering:auto]";

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        config.className,
        className,
      )}
    >
      {useSvg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={BRAND_LOGO_SVG}
          alt={BRAND_NAME}
          width={BRAND_LOGO_WIDTH}
          height={BRAND_LOGO_HEIGHT}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className={imageClass}
        />
      ) : (
        <Image
          src={BRAND_LOGO_PNG}
          alt={BRAND_NAME}
          width={BRAND_LOGO_WIDTH}
          height={BRAND_LOGO_HEIGHT}
          sizes={config.sizes}
          quality={100}
          priority={priority}
          className={imageClass}
        />
      )}
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
