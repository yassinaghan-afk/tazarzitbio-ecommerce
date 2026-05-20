import Image from "next/image";

import { cn } from "@/lib/utils";

const ORBIT_NUTS = [
  { id: "pistachio", color: "bg-emerald-600", size: "size-4", className: "top-[6%] start-[16%]" },
  { id: "walnut", color: "bg-amber-950", size: "size-3.5", className: "top-[4%] end-[18%]" },
  { id: "almond", color: "bg-amber-700", size: "size-4", className: "top-[30%] start-[2%]" },
  { id: "cashew", color: "bg-amber-500", size: "size-3.5", className: "top-[26%] end-[4%]" },
  { id: "seed1", color: "bg-yellow-700", size: "size-2.5", className: "bottom-[30%] start-[8%]" },
  { id: "seed2", color: "bg-yellow-600", size: "size-2.5", className: "bottom-[34%] end-[10%]" },
  { id: "honey1", color: "bg-amber-400", size: "size-3", className: "bottom-[10%] start-[20%] ring-amber-200/60" },
  { id: "honey2", color: "bg-amber-300", size: "size-2.5", className: "bottom-[8%] end-[22%] ring-amber-100/80" },
] as const;

interface MixedNutsJarVisualProps {
  src: string;
  alt: string;
  className?: string;
}

/** Jar with decorative nuts, seeds, and honey accents around the product */
export function MixedNutsJarVisual({ src, alt, className }: MixedNutsJarVisualProps) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-full max-w-[11rem] sm:max-w-[12.5rem]",
        className,
      )}
    >
      <div
        aria-hidden
        className="absolute inset-[12%] rounded-full bg-gradient-to-br from-amber-200/40 via-transparent to-emerald-900/10 blur-md"
      />
      {ORBIT_NUTS.map((nut) => (
        <span
          key={nut.id}
          aria-hidden
          className={cn(
            "absolute z-20 rounded-full shadow-[0_2px_6px_hsl(20_30%_10%/0.25)] ring-1 ring-white/50",
            nut.color,
            nut.size,
            nut.className,
          )}
        />
      ))}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[6%] left-1/2 z-10 h-2.5 w-14 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-300/0 via-amber-400/80 to-amber-300/0 blur-[2px]"
      />
      <div className="relative z-10 flex h-full items-center justify-center p-2">
        <Image
          src={src}
          alt={alt}
          width={400}
          height={400}
          sizes="(max-width: 640px) 140px, 160px"
          className="h-full w-auto max-h-full object-contain drop-shadow-[0_8px_20px_hsl(20_30%_10%/0.18)]"
        />
      </div>
    </div>
  );
}
