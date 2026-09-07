/** Preserve campaign / UTM query params across royal checkout redirects. */
export function withCurrentSearch(path: string): string {
  if (typeof window === "undefined") return path;
  const q = window.location.search;
  if (!q || q === "?") return path;
  return path.includes("?") ? `${path}&${q.slice(1)}` : `${path}${q}`;
}

export const ROYAL_MOROCCAN_CITIES = [
  "الدار البيضاء",
  "الرباط",
  "سلا",
  "تمارة",
  "القنيطرة",
  "مراكش",
  "فاس",
  "مكناس",
  "طنجة",
  "تطوان",
  "أكادير",
  "المحمدية",
  "وجدة",
  "الناظور",
  "الحسيمة",
  "آسفي",
  "الجديدة",
  "بني ملال",
  "خريبكة",
  "سطات",
  "العرائش",
  "ورزازات",
  "الرشيدية",
  "تازة",
  "إنزكان",
  "برشيد",
  "مدينة أخرى",
] as const;

export function formatRoyalDh(n: number): string {
  return `${n} درهم`;
}
