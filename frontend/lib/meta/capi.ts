import { TRACKING_CURRENCY } from "@/lib/tracking/types";
import {
  getMetaCapiAccessToken,
  getMetaPixelId,
  getMetaTestEventCode,
  isMetaCapiConfigured,
} from "@/lib/meta/env";
import {
  hashIfPresent,
  normalizeMetaCity,
  normalizeMetaPhone,
  splitFullName,
} from "@/lib/meta/hash";

export type MetaCapiEventName =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export interface MetaContentItem {
  id: string;
  quantity: number;
  item_price?: number;
}

export interface MetaCapiUserDataInput {
  email?: string;
  phone?: string;
  fullName?: string;
  city?: string;
  country?: string;
  clientIp?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  externalId?: string;
}

export interface MetaCapiEventInput {
  eventName: MetaCapiEventName;
  eventId: string;
  eventSourceUrl?: string;
  eventTime?: number; // unix seconds
  actionSource?: "website";
  customData?: {
    value?: number;
    currency?: string;
    content_ids?: string[];
    content_name?: string;
    content_type?: string;
    contents?: MetaContentItem[];
    num_items?: number;
    order_id?: string;
  };
  userData?: MetaCapiUserDataInput;
}

function buildUserData(input?: MetaCapiUserDataInput) {
  if (!input) return {};
  const { first, last } = splitFullName(input.fullName ?? "");
  const phone = normalizeMetaPhone(input.phone ?? "");
  const city = normalizeMetaCity(input.city ?? "");
  const country = (input.country ?? "ma").toLowerCase().trim();

  const userData: Record<string, string | string[] | undefined> = {
    client_ip_address: input.clientIp || undefined,
    client_user_agent: input.clientUserAgent || undefined,
    fbp: input.fbp || undefined,
    fbc: input.fbc || undefined,
  };

  const ph = hashIfPresent(phone);
  if (ph) userData.ph = [ph];

  const fn = hashIfPresent(first ?? "");
  if (fn) userData.fn = [fn];

  const ln = hashIfPresent(last ?? "");
  if (ln) userData.ln = [ln];

  const ct = hashIfPresent(city);
  if (ct) userData.ct = [ct];

  if (country.length === 2) {
    const countryHash = hashIfPresent(country);
    if (countryHash) userData.country = [countryHash];
  }

  if (input.email) {
    const em = hashIfPresent(input.email.trim().toLowerCase());
    if (em) userData.em = [em];
  }

  if (input.externalId) {
    const external = hashIfPresent(input.externalId.trim().toLowerCase());
    if (external) userData.external_id = [external];
  }

  // strip undefined
  for (const key of Object.keys(userData)) {
    if (userData[key] == null || userData[key] === "") delete userData[key];
  }
  return userData;
}

/**
 * Send a single CAPI event. Never throws — failures are logged without secrets.
 * Returns whether Meta accepted the request (HTTP 2xx).
 */
export async function sendMetaCapiEvent(
  input: MetaCapiEventInput,
): Promise<{ ok: boolean; status?: number }> {
  if (!isMetaCapiConfigured()) {
    return { ok: false };
  }

  const pixelId = getMetaPixelId();
  const token = getMetaCapiAccessToken();
  const testEventCode = getMetaTestEventCode();

  const customData: Record<string, unknown> = {
    currency: input.customData?.currency ?? TRACKING_CURRENCY,
  };
  if (input.customData?.value != null && Number.isFinite(input.customData.value)) {
    customData.value = Number(input.customData.value);
  }
  if (input.customData?.content_ids?.length) {
    customData.content_ids = input.customData.content_ids;
  }
  if (input.customData?.content_name) {
    customData.content_name = input.customData.content_name;
  }
  if (input.customData?.content_type) {
    customData.content_type = input.customData.content_type;
  }
  if (input.customData?.contents?.length) {
    customData.contents = input.customData.contents;
  }
  if (input.customData?.num_items != null) {
    customData.num_items = input.customData.num_items;
  }
  if (input.customData?.order_id) {
    customData.order_id = input.customData.order_id;
  }

  const event = {
    event_name: input.eventName,
    event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: input.actionSource ?? "website",
    event_source_url: input.eventSourceUrl || undefined,
    user_data: buildUserData(input.userData),
    custom_data: customData,
  };

  const body: Record<string, unknown> = {
    data: [event],
  };
  if (testEventCode) {
    body.test_event_code = testEventCode;
  }

  const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // don't hang checkout forever
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      // Avoid logging access_token or full body if it somehow echoed.
      console.error("Meta CAPI error", {
        eventName: input.eventName,
        eventId: input.eventId,
        status: res.status,
        // truncate response; never log the token
        body: text.slice(0, 300).replace(/access_token=[^&\s"']+/gi, "access_token=[redacted]"),
      });
      return { ok: false, status: res.status };
    }

    return { ok: true, status: res.status };
  } catch (err) {
    console.error("Meta CAPI network error", {
      eventName: input.eventName,
      eventId: input.eventId,
      message: err instanceof Error ? err.message : String(err),
    });
    return { ok: false };
  }
}
