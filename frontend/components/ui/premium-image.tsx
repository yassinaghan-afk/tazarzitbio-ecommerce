import Image from "next/image";

import { cn } from "@/lib/utils";

interface PremiumImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  aspect?: "square" | "portrait" | "landscape" | "auto";
  className?: string;
  imageClassName?: string;
  warmOverlay?: boolean;
}

const aspects = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-[5/4]",
  auto: "min-h-[280px]",
};

/** Product photography — object-contain preserves labels */
export function PremiumImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  aspect = "portrait",
  className,
  imageClassName,
  warmOverlay = true,
}: PremiumImageProps) {
  return (
    <div
      className={cn(
        "frame-premium relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3d2818] via-[#4a3020] to-[#2a1810] shadow-warm-xl",
        aspects[aspect],
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,hsl(45_80%_55%/0.2)_0%,transparent_55%)]"
      />
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-contain object-center p-3 sm:p-5", imageClassName)}
        quality={90}
      />
      {warmOverlay && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2a1810]/30 via-transparent to-[hsl(45_80%_55%/0.08)]"
        />
      )}
    </div>
  );
}
