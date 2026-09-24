"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const WAVEFORM = [
  0.28, 0.45, 0.72, 0.38, 0.9, 0.55, 0.32, 0.68, 0.48, 0.82, 0.4, 0.6, 0.95,
  0.5, 0.35, 0.7, 0.42, 0.88, 0.58, 0.3, 0.65, 0.78, 0.44, 0.52, 0.86, 0.36,
  0.62, 0.74, 0.48, 0.8, 0.4, 0.56, 0.92, 0.34, 0.66, 0.5, 0.76, 0.42, 0.58,
  0.84,
];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function WhatsappVoicePlayer({
  src,
  label = "تسجيل صوتي من زبون",
}: {
  src: string;
  label?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = "metadata";
    audioRef.current = audio;

    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onTime = () => setCurrent(audio.currentTime);
    const onEnded = () => {
      setPlaying(false);
      setCurrent(0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audioRef.current = null;
    };
  }, [src]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
    } else {
      audio.pause();
    }
  }

  function seek(ratio: number) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const next = Math.min(1, Math.max(0, ratio)) * duration;
    audio.currentTime = next;
    setCurrent(next);
  }

  const progress = duration > 0 ? current / duration : 0;
  const displayTime = playing || current > 0 ? current : duration;

  return (
    <div
      className="mx-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl rounded-tr-md bg-[#dcf8c6] px-3 py-2.5 shadow-sm"
      role="group"
      aria-label={label}
      dir="ltr"
    >
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? "إيقاف" : "تشغيل"}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white transition hover:bg-[#008f72] active:scale-95"
      >
        {playing ? (
          <Pause className="size-5 fill-current" strokeWidth={0} />
        ) : (
          <Play className="size-5 fill-current pl-0.5" strokeWidth={0} />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div
          className="flex h-8 cursor-pointer items-end gap-[2px]"
          role="slider"
          aria-label="تقدم التسجيل"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(current)}
          tabIndex={0}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - rect.left) / rect.width);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") seek(progress + 0.05);
            if (e.key === "ArrowLeft") seek(progress - 0.05);
          }}
        >
          {WAVEFORM.map((height, i) => {
            const filled = i / WAVEFORM.length <= progress;
            return (
              <span
                key={i}
                className={`w-[3px] rounded-full transition-colors ${
                  filled ? "bg-[#00a884]" : "bg-[#a8c5b0]"
                }`}
                style={{ height: `${Math.max(18, height * 100)}%` }}
              />
            );
          })}
        </div>
        <p className="mt-0.5 text-left text-[11px] tabular-nums text-[#54656f]">
          {formatTime(displayTime)}
        </p>
      </div>

      <div className="relative shrink-0">
        <div
          className="flex size-12 items-center justify-center rounded-full bg-[#dfe5e7] text-[#8696a0]"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="size-7 fill-current">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <span
          className="absolute -bottom-0.5 -start-0.5 flex size-5 items-center justify-center rounded-full bg-[#00a884] text-white shadow"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="size-3 fill-current">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" />
          </svg>
        </span>
      </div>
    </div>
  );
}
