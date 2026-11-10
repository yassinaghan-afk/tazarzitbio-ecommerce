import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { ACCENTS, PREVIEW_WORDS, type Accent, type CaptionStyle, type Position } from "./options";

const KEYWORD_INDEX = 2;

function keywordColor(accent: Accent): string {
  return accent === "green" ? ACCENTS.yellow : ACCENTS.green;
}

export function StylePreview({
  style,
  accent,
  position,
  tick,
}: {
  style: CaptionStyle;
  accent: Accent;
  position: Position;
  tick: number;
}) {
  const color = ACCENTS[accent];
  const active = tick % PREVIEW_WORDS.length;
  const pos = style === "classic" ? "bottom" : position;

  let words = PREVIEW_WORDS.map((w, i) => ({ w, i }));
  if (style === "viral" || style === "neon") words = active < 2 ? words.slice(0, 2) : words.slice(2);
  if (style === "one_word") words = [words[active]];

  const outline = (px: number): CSSProperties => ({
    WebkitTextStroke: `${px}px #000`,
    paintOrder: "stroke fill",
  });

  const wordStyle = (i: number): CSSProperties => {
    const isActive = i === active;
    switch (style) {
      case "viral":
        return { color: isActive ? color : i === KEYWORD_INDEX ? keywordColor(accent) : "#fff", ...outline(3) };
      case "boxed":
        return { color: isActive ? color : "#fff" };
      case "one_word":
        return { color: i === KEYWORD_INDEX ? color : "#fff", ...outline(3.5) };
      case "neon":
        return {
          color: isActive ? "#fff" : "#b4b4b4",
          textShadow: `0 0 ${6}px ${color}, 0 0 ${14}px ${color}`,
        };
      case "minimal":
        return { color: i === KEYWORD_INDEX ? color : "#fff", textShadow: "0 1px 4px rgba(0,0,0,.6)" };
      case "classic":
        return { color: "#fff", ...outline(2) };
    }
  };

  const size = {
    viral: "text-[15px]",
    boxed: "text-[12px]",
    one_word: "text-[22px]",
    neon: "text-[14px]",
    minimal: "text-[11px]",
    classic: "text-[9px]",
  }[style];

  return (
    <div
      className={cn(
        "relative flex aspect-[9/16] w-full overflow-hidden rounded-xl bg-[radial-gradient(circle_at_30%_20%,#3b4a5c,#12161c_70%)]",
        pos === "top" && "items-start pt-[22%]",
        pos === "middle" && "items-center",
        pos === "bottom" && (style === "classic" ? "items-end pb-[10%]" : "items-end pb-[26%]"),
      )}
    >
      <div className="absolute inset-x-[28%] top-[34%] h-[30%] rounded-full bg-white/5 blur-md" />
      <div className="relative w-full px-2 text-center" dir="rtl">
        <span
          key={style === "one_word" || style === "viral" || style === "neon" ? `${style}-${words[0]?.i}` : style}
          className={cn(
            "inline-flex flex-wrap justify-center gap-x-[0.28em] leading-tight",
            style === "minimal" || style === "classic" ? "font-bold" : "font-extrabold",
            style === "boxed" && "rounded-md bg-black/75 px-[0.4em] py-[0.15em]",
            (style === "viral" || style === "one_word") && "animate-[vidpop_.18s_ease-out]",
            (style === "viral" || style === "neon" || style === "one_word") && "flex-nowrap whitespace-nowrap",
            size,
          )}
        >
          {words.map(({ w, i }) => (
            <span key={i} style={wordStyle(i)}>
              {w}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
