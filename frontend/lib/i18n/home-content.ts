import type { TranslationKey } from "./translations";
import type { Language } from "./types";

type TFn = (
  key: TranslationKey,
  params?: Record<string, string | number>,
) => string;

export function getFaqs(t: TFn) {
  return [1, 2, 3, 4, 5, 6].map((i) => ({
    q: t(`faq.q${i}` as TranslationKey),
    a: t(`faq.a${i}` as TranslationKey),
  }));
}

export function getTrustBadges(t: TFn) {
  return [1, 2, 3, 4, 5, 6].map((i) => ({
    title: t(`trust.${i}.title` as TranslationKey),
    desc: t(`trust.${i}.desc` as TranslationKey),
  }));
}

export function getStoryValues(t: TFn) {
  return [1, 2, 3, 4].map((i) => t(`story.v${i}` as TranslationKey));
}

export function getStoryPillars(t: TFn) {
  return [1, 2, 3, 4].map((i) => ({
    step: String(i).padStart(2, "0"),
    title: t(`story.p${i}.title` as TranslationKey),
    description: t(`story.p${i}.desc` as TranslationKey),
  }));
}

export function getTransparencySteps(t: TFn) {
  const icons = ["🌿", "📍", "👐", "📦"];
  return [1, 2, 3, 4].map((i) => ({
    icon: icons[i - 1]!,
    title: t(`ingredients.s${i}.title` as TranslationKey),
    description: t(`ingredients.s${i}.desc` as TranslationKey),
  }));
}

export function getLifestyleMoments(t: TFn) {
  const gradients = [
    "from-amber-100 to-orange-50",
    "from-emerald-50 to-teal-50",
    "from-violet-50 to-purple-50",
    "from-green-50 to-lime-50",
  ];
  const emojis = ["☀️", "🫖", "🌙", "💚"];
  return [1, 2, 3, 4].map((i) => ({
    emoji: emojis[i - 1]!,
    title: t(`lifestyle.m${i}.title` as TranslationKey),
    description: t(`lifestyle.m${i}.desc` as TranslationKey),
    gradient: gradients[i - 1]!,
  }));
}

export function getFamilyHospitality(t: TFn) {
  return [1, 2, 3].map((i) => ({
    title: t(`family.h${i}.title` as TranslationKey),
    desc: t(`family.h${i}.desc` as TranslationKey),
  }));
}

export type ShowcaseId =
  | "daghmous-honey"
  | "saatar-honey"
  | "eucalyptus-honey"
  | "cocoa-amlou";

export function getShowcaseContent(
  id: ShowcaseId,
  t: TFn,
  price: number,
  imageSrc: string,
  imageAlt: string,
  imageFirst?: boolean,
) {
  const prefix = `showcase.${id}` as const;
  const badge = t(`${prefix}.badge` as TranslationKey);
  return {
    id,
    label: t(`${prefix}.label` as TranslationKey),
    title: t(`${prefix}.title` as TranslationKey),
    description: t(`${prefix}.description` as TranslationKey),
    bullets: [
      t(`${prefix}.b1` as TranslationKey),
      t(`${prefix}.b2` as TranslationKey),
      t(`${prefix}.b3` as TranslationKey),
    ],
    price,
    weight: t(`${prefix}.weight` as TranslationKey),
    imageSrc,
    imageAlt,
    imageFirst,
    badge: badge.trim() ? badge : undefined,
  };
}

export function getMoroccanCitiesLabel(locale: Language): string {
  const cities =
    locale === "ar"
      ? [
          "الدار البيضاء",
          "الرباط",
          "مراكش",
          "أكادير",
          "طنجة",
          "فاس",
          "مكناس",
          "وجدة",
        ]
      : locale === "fr"
        ? [
            "Casablanca",
            "Rabat",
            "Marrakech",
            "Agadir",
            "Tanger",
            "Fès",
            "Meknès",
            "Oujda",
          ]
        : [
            "Casablanca",
            "Rabat",
            "Marrakech",
            "Agadir",
            "Tangier",
            "Fes",
            "Meknes",
            "Oujda",
          ];
  return cities.join(locale === "ar" ? " · " : " · ");
}
