"use client";

import Image from "next/image";

import { Container } from "@/components/layout/container";
import {
  FAMILY_PACK_STORY_DESKTOP_HEIGHT,
  FAMILY_PACK_STORY_DESKTOP_SRC,
  FAMILY_PACK_STORY_DESKTOP_WIDTH,
  FAMILY_PACK_STORY_MOBILE_HEIGHT,
  FAMILY_PACK_STORY_MOBILE_SRC,
  FAMILY_PACK_STORY_MOBILE_WIDTH,
} from "@/lib/products/family-pack-story";
import { useTranslation } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

const frameClass =
  "overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-warm-md ring-1 ring-border/40";

interface FamilyPackStoryVisualProps {
  className?: string;
}

export function FamilyPackStoryVisual({ className }: FamilyPackStoryVisualProps) {
  const { t } = useTranslation();
  const alt = t("familyPack.storyAlt");

  return (
    <figure className={cn("w-full", className)} aria-label={alt}>
      <figcaption className="sr-only">{alt}</figcaption>

      <div className="px-4 sm:px-6 md:hidden">
        <div className={frameClass}>
          <Image
            src={FAMILY_PACK_STORY_MOBILE_SRC}
            alt={alt}
            width={FAMILY_PACK_STORY_MOBILE_WIDTH}
            height={FAMILY_PACK_STORY_MOBILE_HEIGHT}
            sizes="100vw"
            loading="lazy"
            className="h-auto w-full object-contain object-center"
          />
        </div>
      </div>

      <Container size="lg" className="hidden md:block">
        <div className={frameClass}>
          <Image
            src={FAMILY_PACK_STORY_DESKTOP_SRC}
            alt={alt}
            width={FAMILY_PACK_STORY_DESKTOP_WIDTH}
            height={FAMILY_PACK_STORY_DESKTOP_HEIGHT}
            sizes="(max-width: 1280px) 90vw, 1100px"
            loading="lazy"
            className="h-auto w-full object-contain object-center"
          />
        </div>
      </Container>
    </figure>
  );
}
