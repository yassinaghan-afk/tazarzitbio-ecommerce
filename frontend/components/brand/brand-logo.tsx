import Image from "next/image";

import { BRAND_LOGO_PNG, BRAND_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

type BrandLogoVariant = "header" | "footer" | "compact" | "checkout" | "admin";

const variantConfig: Record<
  BrandLogoVariant,
  { width: number; height: number; className: string }
> = {
  header: {
    width: 132,
    height: 36,
    className: "h-8 w-auto max-w-[7.5rem] sm:h-9 sm:max-w-[8.5rem] lg:h-10 lg:max-w-[9.5rem]",
  },
  footer: {
    width: 148,
    height: 40,
    className: "h-10 w-auto max-w-[9rem]",
  },
  compact: {
    width: 108,
    height: 30,
    className: "h-7 w-auto max-w-[6.5rem]",
  },
  checkout: {
    width: 120,
    height: 32,
    className: "h-8 w-auto max-w-[7rem] mx-auto",
  },
  admin: {
    width: 128,
    height: 34,
    className: "h-9 w-auto max-w-[8rem]",
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
    <Image
      src={BRAND_LOGO_PNG}
      alt={BRAND_NAME}
      width={config.width}
      height={config.height}
      priority={priority}
      className={cn("object-contain object-center", config.className, className)}
    />
  );
}

interface BrandLockupProps {
  variant?: BrandLogoVariant;
  showTagline?: boolean;
  className?: string;
  priority?: boolean;
}

/** Logo with optional Arabic tagline — used in header/footer */
export function BrandLockup({
  variant = "header",
  showTagline = true,
  className,
  priority = false,
}: BrandLockupProps) {
  return (
    <div className={cn("flex flex-col items-start gap-0.5", className)}>
      <BrandLogo variant={variant} priority={priority} />
      {showTagline && (
        <span className="text-[0.65rem] font-medium tracking-wide text-muted-foreground">
          من قلب سوس
        </span>
      )}
    </div>
  );
}
