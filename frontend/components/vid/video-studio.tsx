"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Download,
  Film,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  Wand2,
  X,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
  ACCENTS,
  CAPTION_LANGUAGES,
  DEFAULT_SETTINGS,
  EXTRAS,
  POSITIONS,
  SPEECH_LANGUAGES,
  STAGE_LABELS,
  STYLES,
  type Accent,
  type CaptionSegment,
  type Job,
  type StudioSettings,
} from "./options";
import { StylePreview } from "./style-preview";

const JOB_STORAGE_KEY = "tazarzit-vid-job";
const SETTINGS_STORAGE_KEY = "tazarzit-vid-settings";
const ACTIVE = new Set(["queued", "transcribing", "rendering"]);

function segmentText(seg: CaptionSegment): string {
  return seg.words.map((w) => (w.k ? `*${w.t}*` : w.t)).join(" ");
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

function toLogin() {
  window.location.href = "/admin/login?next=/vid";
}

export function VideoStudio() {
  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_SETTINGS);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [edits, setEdits] = useState<string[]>([]);
  const [hook, setHook] = useState("");
  const [cta, setCta] = useState("");
  const [dragging, setDragging] = useState(false);
  const [tick, setTick] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const syncedVersion = useRef<string | null>(null);

  const busy = uploadPct !== null || (job !== null && ACTIVE.has(job.status));
  const hasCaptions = job !== null && job.segments !== null;

  const fetchJob = useCallback(async (id: string) => {
    const res = await fetch(`/api/admin/vid/jobs/${id}`, { cache: "no-store" });
    if (res.status === 401) return toLogin();
    if (res.status === 404) {
      localStorage.removeItem(JOB_STORAGE_KEY);
      setJob(null);
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "ما قدرناش نوصلو للسيرفيس ديال الفيديو");
      return;
    }
    setJob(data as Job);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 650);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved), hook_text: "", cta_text: "" });
    } catch {
      /* ignore */
    }
    const savedJob = localStorage.getItem(JOB_STORAGE_KEY);
    if (savedJob) void fetchJob(savedJob);
  }, [fetchJob]);

  useEffect(() => {
    const persisted: Partial<StudioSettings> = { ...settings };
    delete persisted.hook_text;
    delete persisted.cta_text;
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(persisted));
  }, [settings]);

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    if (!job || !ACTIVE.has(job.status)) return;
    const id = setTimeout(() => void fetchJob(job.id), 2000);
    return () => clearTimeout(id);
  }, [job, fetchJob]);

  useEffect(() => {
    if (!job || job.segments === null) return;
    const key = `${job.id}:${job.version}:${job.status}`;
    if (job.status !== "done" || syncedVersion.current === key) return;
    syncedVersion.current = key;
    setEdits(job.segments.map(segmentText));
    setHook(job.hook ?? "");
    setCta(job.cta ?? "");
    setSettings((s) => ({ ...s, ...job.settings, hook_text: s.hook_text, cta_text: s.cta_text }));
  }, [job]);

  const update = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  const pickFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!f.type.startsWith("video/") && !/\.(mov|mp4|m4v|webm|mkv)$/i.test(f.name)) {
      setError("هادا ماشي فيديو. ختار ملف mp4 ولا mov.");
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const generate = () => {
    if (!file || busy) return;
    setError(null);
    setUploadPct(0);
    const form = new FormData();
    form.append("settings", JSON.stringify(settings));
    form.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/vid/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setUploadPct(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploadPct(null);
      if (xhr.status === 401) return toLogin();
      let data: { error?: string } & Partial<Job> = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 400 || !data.id) {
        setError(data.error ?? "التحميل ما نجحش، عاود جرب.");
        return;
      }
      localStorage.setItem(JOB_STORAGE_KEY, data.id);
      syncedVersion.current = null;
      setJob(data as Job);
    };
    xhr.onerror = () => {
      setUploadPct(null);
      setError("مشكل فالكونيكسيون، عاود جرب.");
    };
    xhr.send(form);
  };

  const rerender = async () => {
    if (!job || busy) return;
    setError(null);
    const res = await fetch(`/api/admin/vid/jobs/${job.id}/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings, segments: edits.map((text) => ({ text })), hook, cta }),
    });
    if (res.status === 401) return toLogin();
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "ما قدرناش نعاودو الرندر");
      return;
    }
    setJob(data as Job);
  };

  const reset = () => {
    localStorage.removeItem(JOB_STORAGE_KEY);
    syncedVersion.current = null;
    setJob(null);
    setFile(null);
    setPreview(null);
    setEdits([]);
    setError(null);
  };

  const progress = uploadPct !== null ? uploadPct : job?.progress ?? 0;
  const stage = uploadPct !== null ? "upload" : job?.stage ?? "queued";
  const videoUrl = job && job.version > 0 ? `/api/admin/vid/jobs/${job.id}/video?v=${job.version}` : null;

  return (
    <div dir="rtl" className="min-h-dvh bg-[#0b0d10] text-white">
      <style>{`@keyframes vidpop{0%{transform:scale(.7)}60%{transform:scale(1.08)}100%{transform:scale(1)}}`}</style>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-amber-300 ring-1 ring-white/10">
              <Sparkles className="size-3.5" /> TazarzitBio Studio
            </p>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">استوديو الفيديو</h1>
            <p className="mt-2 text-sm text-white/60">
              طلع الفيديو، ختار نوع الكابشن، وكليكي Generate. الذكاء الاصطناعي كيكتب الهضرة ويزيد الزوم والصوت والموسيقى.
            </p>
          </div>
          {job && (
            <button
              type="button"
              onClick={reset}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold ring-1 ring-white/15 transition hover:bg-white/15 disabled:opacity-40"
            >
              <Film className="size-4" /> فيديو جديد
            </button>
          )}
        </header>

        {error && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 ring-1 ring-red-500/30" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)} aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            {!job && (
              <Section step={1} title="طلع الفيديو">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    pickFile(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition",
                    dragging ? "border-amber-300 bg-amber-300/5" : "border-white/15 hover:border-white/30 hover:bg-white/[0.03]",
                  )}
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                    <Upload className="size-5 text-amber-300" />
                  </div>
                  {file ? (
                    <>
                      <p className="font-bold">{file.name}</p>
                      <p className="text-xs text-white/50">{(file.size / 1024 / 1024).toFixed(1)} MB · كليكي باش تبدلو</p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold">جر الفيديو لهنا ولا كليكي باش تختارو</p>
                      <p className="text-xs text-white/50">MP4 ولا MOV · حتى 3 دقايق</p>
                    </>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    accept="video/*,.mov,.mp4,.m4v"
                    className="hidden"
                    onChange={(e) => pickFile(e.target.files?.[0])}
                  />
                </div>
              </Section>
            )}

            <Section step={job ? 1 : 2} title="ختار نوع الكابشن">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={busy}
                    onClick={() => update("style", s.id)}
                    className={cn(
                      "group relative rounded-2xl p-1.5 text-start ring-2 transition disabled:opacity-50",
                      settings.style === s.id ? "bg-white/10 ring-amber-300" : "ring-transparent hover:bg-white/5",
                    )}
                  >
                    <StylePreview style={s.id} accent={settings.accent} position={settings.position} tick={tick} />
                    <p className="mt-2 px-1 text-sm font-extrabold">{s.name}</p>
                    <p className="px-1 pb-1 text-[11px] leading-snug text-white/50">{s.hint}</p>
                    {settings.style === s.id && (
                      <span className="absolute end-2.5 top-2.5 flex size-5 items-center justify-center rounded-full bg-amber-300 text-black">
                        <Check className="size-3.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label>اللون</Label>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(ACCENTS) as Accent[]).map((a) => (
                      <button
                        key={a}
                        type="button"
                        disabled={busy}
                        aria-label={a}
                        onClick={() => update("accent", a)}
                        className={cn(
                          "size-9 rounded-full ring-2 ring-offset-2 ring-offset-[#14171c] transition",
                          settings.accent === a ? "ring-white" : "ring-transparent hover:ring-white/30",
                        )}
                        style={{ backgroundColor: ACCENTS[a] }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <Label>البلاصة ديال الكابشن</Label>
                  <div className="inline-flex rounded-full bg-white/5 p-1 ring-1 ring-white/10">
                    {POSITIONS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        disabled={busy || settings.style === "classic"}
                        onClick={() => update("position", p.id)}
                        className={cn(
                          "rounded-full px-4 py-1.5 text-sm font-bold transition disabled:opacity-40",
                          settings.position === p.id ? "bg-white text-black" : "text-white/70 hover:text-white",
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section step={job ? 2 : 3} title="اللغة">
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="شنو اللغة اللي كيهضرو بيها فالفيديو؟"
                  value={settings.speech_language}
                  options={SPEECH_LANGUAGES}
                  disabled={busy || hasCaptions}
                  onChange={(v) => update("speech_language", v as StudioSettings["speech_language"])}
                />
                <SelectField
                  label="بأشمن لغة بغيتي الكابشن؟"
                  value={settings.caption_language}
                  options={CAPTION_LANGUAGES}
                  disabled={busy || hasCaptions}
                  onChange={(v) => update("caption_language", v as StudioSettings["caption_language"])}
                />
              </div>
              {hasCaptions && (
                <p className="mt-3 text-xs text-white/45">اللغة كتختار غير قبل Generate. باش تبدلها، دير فيديو جديد.</p>
              )}
            </Section>

            <Section step={job ? 3 : 4} title="الإضافات">
              <div className="grid gap-3 sm:grid-cols-2">
                {EXTRAS.map((x) => (
                  <ToggleRow
                    key={x.key}
                    label={x.label}
                    hint={x.hint}
                    checked={settings[x.key]}
                    disabled={busy}
                    onChange={(v) => update(x.key, v)}
                  />
                ))}
                <ToggleRow
                  label="Hook فالبداية"
                  hint="عنوان قوي فأول ثانيتين"
                  checked={settings.hook}
                  disabled={busy}
                  onChange={(v) => update("hook", v)}
                />
                <ToggleRow
                  label="CTA فالخر"
                  hint="الصورة كتوقف ويبان طلب الكومنتير"
                  checked={settings.cta}
                  disabled={busy}
                  onChange={(v) => update("cta", v)}
                />
              </div>
              {!hasCaptions && (settings.hook || settings.cta) && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {settings.hook && (
                    <TextField
                      label="نص الـ Hook (اختياري)"
                      placeholder="خليه خاوي والذكاء الاصطناعي يكتبو"
                      value={settings.hook_text}
                      disabled={busy}
                      onChange={(v) => update("hook_text", v)}
                    />
                  )}
                  {settings.cta && (
                    <TextField
                      label="نص الـ CTA (اختياري)"
                      placeholder="مثلا: كتبو ليا فالكومنتير"
                      value={settings.cta_text}
                      disabled={busy}
                      onChange={(v) => update("cta_text", v)}
                    />
                  )}
                </div>
              )}
            </Section>

            {job?.segments && job.status !== "error" && edits.length > 0 && (
              <Section step={4} title="صحح الكابشن">
                <p className="mb-4 text-xs text-white/50">
                  بدل أي كلمة غالطة. حط الكلمة بين *نجوم* باش تبان ملونة. من بعد كليكي «عاود الرندر».
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {settings.hook && (
                    <TextField label="Hook" value={hook} disabled={busy} onChange={setHook} />
                  )}
                  {settings.cta && <TextField label="CTA" value={cta} disabled={busy} onChange={setCta} />}
                </div>
                <div className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pe-1">
                  {job.segments.map((seg, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="w-12 shrink-0 font-mono text-xs text-white/40" dir="ltr">
                        {formatTime(seg.words[0]?.s ?? 0)}
                      </span>
                      <input
                        value={edits[i] ?? ""}
                        disabled={busy}
                        onChange={(e) => setEdits((all) => all.map((t, j) => (j === i ? e.target.value : t)))}
                        className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold ring-1 ring-white/10 focus:outline-none focus:ring-amber-300/60 disabled:opacity-50"
                      />
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-3xl bg-[#14171c] p-4 ring-1 ring-white/10">
              <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
                {job?.status === "done" && videoUrl ? (
                  <video key={videoUrl} src={videoUrl} controls playsInline className="aspect-[9/16] w-full bg-black object-contain" />
                ) : preview ? (
                  <video src={preview} controls playsInline muted className="aspect-[9/16] w-full bg-black object-contain" />
                ) : (
                  <div className="aspect-[9/16] w-full">
                    <StylePreview style={settings.style} accent={settings.accent} position={settings.position} tick={tick} />
                  </div>
                )}
              </div>

              {busy && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm font-bold">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin text-amber-300" />
                      {STAGE_LABELS[stage] ?? STAGE_LABELS.render}
                    </span>
                    <span className="font-mono text-white/60" dir="ltr">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-amber-300 transition-all duration-700" style={{ width: `${Math.max(3, progress)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-white/40">خلي الصفحة محلولة. إلا سديتيها، غادي تلقى الفيديو ملي ترجع.</p>
                </div>
              )}

              {job?.status === "error" && (
                <p className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-200 ring-1 ring-red-500/30">
                  {job.error ?? "وقع مشكل فالرندر"}
                </p>
              )}

              <div className="mt-4 space-y-2">
                {!job && (
                  <button
                    type="button"
                    onClick={generate}
                    disabled={!file || busy}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-amber-300 to-yellow-400 text-lg font-extrabold text-black shadow-[0_10px_40px_-10px_rgba(252,211,77,.6)] transition hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Wand2 className="size-5" /> Generate
                  </button>
                )}
                {job?.status === "done" && videoUrl && (
                  <a
                    href={`${videoUrl}&download=1`}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-amber-300 to-yellow-400 font-extrabold text-black transition hover:brightness-105"
                  >
                    <Download className="size-5" /> تيليشارجي الفيديو
                  </a>
                )}
                {job && hasCaptions && !busy && (
                  <button
                    type="button"
                    onClick={rerender}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 font-bold ring-1 ring-white/15 transition hover:bg-white/15"
                  >
                    <RefreshCw className="size-4" /> عاود الرندر بالتعديلات
                  </button>
                )}
                {job?.status === "error" && !hasCaptions && (
                  <button
                    type="button"
                    onClick={reset}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white/10 font-bold ring-1 ring-white/15 transition hover:bg-white/15"
                  >
                    <RefreshCw className="size-4" /> عاود من الأول
                  </button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-[#14171c] p-5 ring-1 ring-white/10 sm:p-6">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-extrabold">
        <span className="flex size-7 items-center justify-center rounded-full bg-amber-300 text-sm text-black">{step}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-sm font-bold text-white/80">{children}</p>;
}

function ToggleRow({
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/10">
      <div>
        <p className="text-sm font-bold">{label}</p>
        <p className="text-xs text-white/45">{hint}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={120}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm font-semibold ring-1 ring-white/10 placeholder:text-white/30 focus:outline-none focus:ring-amber-300/60 disabled:opacity-50"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm font-semibold ring-1 ring-white/10 focus:outline-none focus:ring-amber-300/60 disabled:opacity-50 [&>option]:bg-[#14171c]"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
