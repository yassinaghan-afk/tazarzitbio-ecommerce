import { FREE_SHIPPING_MARKETING_AR } from "@/lib/shipping/settings";

export type AnnouncementIcon =
  | "truck"
  | "shield"
  | "package"
  | "gift"
  | "leaf"
  | "phone";

export interface AnnouncementMessage {
  id: string;
  text: string;
  icon: AnnouncementIcon;
  isEnabled: boolean;
}

export interface AnnouncementBarConfig {
  isEnabled: boolean;
  rotationIntervalMs: number;
  messages: AnnouncementMessage[];
}

export const ANNOUNCEMENT_BAR_HEIGHT_PX = 36;

export const DEFAULT_ANNOUNCEMENT_BAR: AnnouncementBarConfig = {
  isEnabled: true,
  rotationIntervalMs: 3000,
  messages: [
    {
      id: "cod",
      text: "الدفع عند الاستلام في جميع مدن المغرب",
      icon: "truck",
      isEnabled: true,
    },
    {
      id: "delivery",
      text: "توصيل سريع وآمن إلى باب المنزل",
      icon: "shield",
      isEnabled: true,
    },
    {
      id: "free-349",
      text: "توصيل مجاني للطلبات فوق 349 درهم",
      icon: "gift",
      isEnabled: true,
    },
    {
      id: "souss",
      text: "منتجات طبيعية من قلب سوس",
      icon: "leaf",
      isEnabled: true,
    },
    {
      id: "confirm",
      text: "فريقنا يتصل بك لتأكيد الطلب قبل الشحن",
      icon: "phone",
      isEnabled: true,
    },
  ],
};

const LEGACY_FREE_SHIPPING_IDS = new Set(["free-3", "free-399", "free-499"]);

function migrateAnnouncementMessageText(
  id: string,
  text: string,
): string {
  if (LEGACY_FREE_SHIPPING_IDS.has(id)) return FREE_SHIPPING_MARKETING_AR;
  const t = text.trim();
  if (!t) return t;
  if (/399|499/.test(t) && /توصيل|مجاني/.test(t)) {
    return FREE_SHIPPING_MARKETING_AR;
  }
  if (/3\s*منتجات/.test(t) && /توصيل|مجاني/.test(t)) {
    return FREE_SHIPPING_MARKETING_AR;
  }
  return text;
}

export function normalizeAnnouncementBar(
  input?: Partial<AnnouncementBarConfig> | null,
): AnnouncementBarConfig {
  if (!input) return DEFAULT_ANNOUNCEMENT_BAR;

  const messages =
    Array.isArray(input.messages) && input.messages.length > 0
      ? input.messages.map((m, i) => ({
          id: m.id ?? `msg-${i}`,
          text: migrateAnnouncementMessageText(m.id ?? `msg-${i}`, m.text ?? ""),
          icon: m.icon ?? "truck",
          isEnabled: m.isEnabled ?? true,
        }))
      : DEFAULT_ANNOUNCEMENT_BAR.messages;

  return {
    isEnabled: input.isEnabled ?? DEFAULT_ANNOUNCEMENT_BAR.isEnabled,
    rotationIntervalMs:
      typeof input.rotationIntervalMs === "number" &&
      input.rotationIntervalMs >= 1500
        ? input.rotationIntervalMs
        : DEFAULT_ANNOUNCEMENT_BAR.rotationIntervalMs,
    messages,
  };
}

export function getActiveAnnouncementMessages(
  config: AnnouncementBarConfig,
): AnnouncementMessage[] {
  return config.messages.filter((m) => m.isEnabled && m.text.trim());
}
