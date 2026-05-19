import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  emoji?: string;
  label?: string;
  sublabel?: string;
  gradient?: string;
  aspect?: "square" | "video" | "portrait" | "wide";
  className?: string;
  size?: "sm" | "md" | "lg";
  framed?: boolean;
}

const aspects = {
  square:   "aspect-square",
  video:    "aspect-video",
  portrait: "aspect-[4/5]",
  wide:     "aspect-[16/9]",
};

const emojiSizes = { sm: "text-4xl", md: "text-6xl", lg: "text-8xl" };

export function PlaceholderImage({
  emoji = "🫒",
  label,
  sublabel = "صورة قريباً",
  gradient = "from-amber-100 via-orange-50 to-yellow-100",
  aspect = "square",
  className,
  size = "md",
  framed = true,
}: PlaceholderImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        framed ? "frame-premium rounded-3xl" : "rounded-2xl border border-border/60 shadow-warm-lg",
        aspects[aspect],
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(20_30%_10%/0.08)_100%)]"
      />
      <div
        aria-hidden
        className="absolute -top-1/2 start-0 z-[1] h-full w-2/3 rotate-12 bg-gradient-to-b from-white/30 to-transparent opacity-50"
      />
      <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center gap-2 p-6 text-center">
        <span
          className={cn(
            "drop-shadow-[0_4px_12px_hsl(20_30%_10%/0.15)]",
            emojiSizes[size],
          )}
          aria-hidden
        >
          {emoji}
        </span>
        {label && (
          <p className="text-sm font-semibold tracking-wide text-foreground/85">
            {label}
          </p>
        )}
        <p className="text-xs text-muted-foreground/75">{sublabel}</p>
      </div>
    </div>
  );
}
