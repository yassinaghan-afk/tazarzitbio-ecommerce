export type CaptionStyle = "viral" | "boxed" | "one_word" | "neon" | "minimal" | "classic";
export type Accent = "yellow" | "green" | "cyan" | "pink" | "orange" | "red";
export type Position = "top" | "middle" | "bottom";

export type StudioSettings = {
  style: CaptionStyle;
  position: Position;
  accent: Accent;
  speech_language: "darija" | "ar" | "fr" | "en" | "auto";
  caption_language: "same" | "darija_ar" | "darija_latin" | "ar" | "fr" | "en";
  hook: boolean;
  hook_text: string;
  cta: boolean;
  cta_text: string;
  zooms: boolean;
  sfx: boolean;
  music: boolean;
  grade: boolean;
  progress_bar: boolean;
};

export type CaptionWord = { t: string; s: number; e: number; k: boolean };
export type CaptionSegment = { words: CaptionWord[] };

export type JobStatus = "queued" | "transcribing" | "rendering" | "done" | "error";

export type Job = {
  id: string;
  status: JobStatus;
  stage: string;
  progress: number;
  error: string | null;
  settings: StudioSettings;
  duration: number | null;
  segments: CaptionSegment[] | null;
  hook: string;
  cta: string;
  version: number;
  filename: string;
  queue_position?: number;
};

export const DEFAULT_SETTINGS: StudioSettings = {
  style: "viral",
  position: "bottom",
  accent: "yellow",
  speech_language: "darija",
  caption_language: "same",
  hook: true,
  hook_text: "",
  cta: true,
  cta_text: "",
  zooms: true,
  sfx: true,
  music: true,
  grade: true,
  progress_bar: true,
};

export const ACCENTS: Record<Accent, string> = {
  yellow: "#FFD400",
  green: "#3CFF6B",
  cyan: "#00E0FF",
  pink: "#FF3EA5",
  orange: "#FF7A00",
  red: "#FF2D2D",
};

export const STYLES: { id: CaptionStyle; name: string; hint: string }[] = [
  { id: "viral", name: "فايرال", hint: "كلمة بكلمة كتشعل، بحال Hormozi" },
  { id: "boxed", name: "بلوك", hint: "النص فوق خلفية كحلة" },
  { id: "one_word", name: "كلمة وحدة", hint: "كلمة كبيرة وحدة فكل مرة" },
  { id: "neon", name: "نيون", hint: "توهج ملون وراء الكلام" },
  { id: "minimal", name: "بسيط", hint: "جملة نقية بلا بزاف ديال التأثيرات" },
  { id: "classic", name: "كلاسيك", hint: "ترجمة لتحت بحال الأفلام" },
];

export const POSITIONS: { id: Position; label: string }[] = [
  { id: "top", label: "الفوق" },
  { id: "middle", label: "الوسط" },
  { id: "bottom", label: "لتحت" },
];

export const SPEECH_LANGUAGES: { id: StudioSettings["speech_language"]; label: string }[] = [
  { id: "darija", label: "الدارجة المغربية" },
  { id: "ar", label: "العربية" },
  { id: "fr", label: "Français" },
  { id: "en", label: "English" },
  { id: "auto", label: "تلقائي" },
];

export const CAPTION_LANGUAGES: { id: StudioSettings["caption_language"]; label: string }[] = [
  { id: "same", label: "نفس لغة الهضرة" },
  { id: "darija_ar", label: "الدارجة بالحروف العربية" },
  { id: "darija_latin", label: "Darija b l7orof latin" },
  { id: "ar", label: "العربية الفصحى" },
  { id: "fr", label: "Français" },
  { id: "en", label: "English" },
];

export const EXTRAS: { key: "zooms" | "sfx" | "music" | "grade" | "progress_bar"; label: string; hint: string }[] = [
  { key: "zooms", label: "Zoom و transitions", hint: "زوم على الكلمات المهمة، flash و shake فكل قطعة" },
  { key: "sfx", label: "Sound effects", hint: "Whoosh، pop، boom فالبلايص المناسبة" },
  { key: "music", label: "موسيقى خفيفة", hint: "كتنقص بوحدها ملي كيهضر شي حد" },
  { key: "grade", label: "Color grade", hint: "ألوان أقوى و vignette" },
  { key: "progress_bar", label: "Progress bar", hint: "خط رقيق الفوق كيبين شحال بقا" },
];

export const STAGE_LABELS: Record<string, string> = {
  upload: "كنطلعو الفيديو…",
  queued: "فالطابور، غادي نبداو دابا…",
  analyse: "كنحللو الفيديو…",
  transcribe: "كنكتبو الهضرة بالذكاء الاصطناعي…",
  audio: "كنزيدو الصوت والموسيقى…",
  render: "كنرندرو الفيديو…",
  done: "واجد!",
};

export const PREVIEW_WORDS = ["هادي", "نقطة", "مهمة", "بزاف"];
