import Image from "next/image";

import { Container } from "@/components/layout/container";
import {
  FAMILY_PACK_STORY_ALT,
  FAMILY_PACK_STORY_DESKTOP_HEIGHT,
  FAMILY_PACK_STORY_DESKTOP_SRC,
  FAMILY_PACK_STORY_DESKTOP_WIDTH,
  FAMILY_PACK_STORY_MOBILE_HEIGHT,
  FAMILY_PACK_STORY_MOBILE_SRC,
  FAMILY_PACK_STORY_MOBILE_WIDTH,
} from "@/lib/products/family-pack-story";
import { cn } from "@/lib/utils";

const frameClass =
  "overflow-hidden rounded-2xl border border-border/60 bg-card/40 shadow-warm-md ring-1 ring-border/40";

interface FamilyPackStoryVisualProps {
  className?: string;
}

export function FamilyPackStoryVisual({ className }: FamilyPackStoryVisualProps) {
  return (
    <figure
      className={cn("w-full", className)}
      aria-label={FAMILY_PACK_STORY_ALT}
    >
      <figcaption className="sr-only">{FAMILY_PACK_STORY_ALT}</figcaption>

      {/* Mobile — vertical storytelling, full width */}
      <div className="px-4 sm:px-6 md:hidden">
        <div className={frameClass}>
          <Image
            src={FAMILY_PACK_STORY_MOBILE_SRC}
            alt={FAMILY_PACK_STORY_ALT}
            width={FAMILY_PACK_STORY_MOBILE_WIDTH}
            height={FAMILY_PACK_STORY_MOBILE_HEIGHT}
            sizes="100vw"
            loading="lazy"
            className="h-auto w-full object-contain object-center"
          />
        </div>
      </div>

      {/* Tablet / desktop — wide centered container */}
      <div className="hidden md:block">
        <Container className="max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className={frameClass}>
            <Image
              src={FAMILY_PACK_STORY_DESKTOP_SRC}
              alt={FAMILY_PACK_STORY_ALT}
              width={FAMILY_PACK_STORY_DESKTOP_WIDTH}
              height={FAMILY_PACK_STORY_DESKTOP_HEIGHT}
              sizes="(min-width: 1024px) 1024px, 90vw"
              loading="lazy"
              className="mx-auto h-auto w-full max-w-full object-contain object-center"
            />
          </div>
        </Container>
      </div>
    </figure>
  );
}
