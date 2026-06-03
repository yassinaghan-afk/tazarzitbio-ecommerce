import type { AnnouncementMessage } from "@/lib/admin/announcement-bar";

import { translate, type TranslationKey } from "./translations";
import type { Language } from "./types";

const MESSAGE_ID_KEYS: Record<string, TranslationKey> = {
  cod: "announce.cod",
  delivery: "announce.delivery",
  "free-349": "announce.free349",
  "free-3": "announce.free349",
  "free-399": "announce.free349",
  "free-499": "announce.free349",
  souss: "announce.souss",
  confirm: "announce.confirm",
};

export function resolveAnnouncementText(
  message: AnnouncementMessage,
  locale: Language,
): string {
  const key = MESSAGE_ID_KEYS[message.id];
  if (key) return translate(locale, key);
  return message.text;
}
