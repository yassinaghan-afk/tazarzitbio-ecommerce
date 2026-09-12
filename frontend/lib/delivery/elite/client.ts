/**
 * Elite Delivery HTTP client — endpoints from official docs only:
 * https://www.elitedelivery.ma/api-documentation.php
 *
 * GET  /v1.0/stores/{token}
 * GET  /v1.0/statuses
 * GET  /v1.0/cities
 * POST /v1.0/batch/{token}
 */

export const ELITE_DEFAULT_BASE_URL = "https://elitedelivery.ma";

export type EliteCity = { id: string; name: string };
export type EliteStatus = { id: string; name: string; color?: string };
export type EliteStore = { id: string; brand_name?: string };

export type ElitePackagePayload = {
  receiver_name: string;
  address: string;
  city: string;
  phone: string;
  price: string;
  product: string;
  note?: string;
  internal_id?: string;
};

export type EliteBatchRequest = {
  store_id: number;
  packages: ElitePackagePayload[];
};

export type EliteApiError = {
  ok: false;
  status: number;
  errorCode: string;
  errorMessage: string;
  /** Safe body snippet — never includes the token */
  bodySnippet?: string;
};

export type EliteApiOk<T> = {
  ok: true;
  status: number;
  data: T;
};

function stripTokenFromUrl(url: string): string {
  return url.replace(/\/v1\.0\/(?:stores|batch)\/[^/?#]+/g, (m) =>
    m.replace(/\/[^/]+$/, "/[REDACTED]"),
  );
}

async function eliteFetch(
  url: string,
  init?: RequestInit,
): Promise<{ status: number; text: string; json: unknown }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
    const text = await res.text();
    let json: unknown = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { status: res.status, text, json };
  } finally {
    clearTimeout(timer);
  }
}

function mapHttpError(status: number, body: unknown): EliteApiError {
  const msg =
    body && typeof body === "object" && "error" in body
      ? String((body as { error: unknown }).error)
      : body && typeof body === "object" && "message" in body
        ? String((body as { message: unknown }).message)
        : undefined;

  const defaults: Record<number, { code: string; ar: string }> = {
    400: { code: "BAD_REQUEST", ar: "بيانات غير صالحة لإرسال الشحنة" },
    401: { code: "UNAUTHORIZED", ar: "رمز Elite Delivery غير صالح أو منتهي" },
    403: { code: "FORBIDDEN", ar: "صلاحيات غير كافية لدى Elite Delivery" },
    429: { code: "RATE_LIMIT", ar: "تم تجاوز حد الطلبات — أعد المحاولة لاحقاً" },
    500: { code: "SERVER_ERROR", ar: "خطأ في خادم Elite Delivery" },
  };
  const d = defaults[status] ?? {
    code: `HTTP_${status}`,
    ar: "تعذر الاتصال بشركة التوصيل",
  };
  return {
    ok: false,
    status,
    errorCode: d.code,
    errorMessage: msg && msg.length < 200 ? `${d.ar}: ${msg}` : d.ar,
    bodySnippet: typeof body === "string" ? body.slice(0, 200) : undefined,
  };
}

export function buildEliteUrl(baseUrl: string, path: string): string {
  const base = (baseUrl || ELITE_DEFAULT_BASE_URL).replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function eliteGetStores(
  baseUrl: string,
  token: string,
): Promise<EliteApiOk<EliteStore[]> | EliteApiError> {
  const url = buildEliteUrl(baseUrl, `/v1.0/stores/${encodeURIComponent(token)}`);
  try {
    const { status, json, text } = await eliteFetch(url);
    if (status !== 200) return mapHttpError(status, json ?? text);
    if (json && typeof json === "object" && !Array.isArray(json) && "error" in json) {
      return mapHttpError(401, json);
    }
    const list = Array.isArray(json)
      ? (json as EliteStore[])
      : Array.isArray((json as { data?: unknown })?.data)
        ? ((json as { data: EliteStore[] }).data)
        : null;
    if (!list) {
      return {
        ok: false,
        status,
        errorCode: "INVALID_RESPONSE",
        errorMessage: "استجابة متاجر Elite غير متوقعة",
      };
    }
    return { ok: true, status, data: list };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      errorCode: "NETWORK_ERROR",
      errorMessage: "تعذر الاتصال بشركة التوصيل",
      bodySnippet: err instanceof Error ? err.message : undefined,
    };
  }
}

export async function eliteGetStatuses(
  baseUrl: string,
): Promise<EliteApiOk<EliteStatus[]> | EliteApiError> {
  const url = buildEliteUrl(baseUrl, `/v1.0/statuses`);
  try {
    const { status, json, text } = await eliteFetch(url);
    if (status !== 200) return mapHttpError(status, json ?? text);
    if (!Array.isArray(json)) {
      return {
        ok: false,
        status,
        errorCode: "INVALID_RESPONSE",
        errorMessage: "استجابة حالات Elite غير متوقعة",
      };
    }
    return {
      ok: true,
      status,
      data: (json as EliteStatus[]).map((s) => ({
        id: String(s.id),
        name: String(s.name ?? ""),
        color: s.color,
      })),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      errorCode: "NETWORK_ERROR",
      errorMessage: "تعذر الاتصال بشركة التوصيل",
    };
  }
}

export async function eliteGetCities(
  baseUrl: string,
): Promise<EliteApiOk<EliteCity[]> | EliteApiError> {
  const url = buildEliteUrl(baseUrl, `/v1.0/cities`);
  try {
    const { status, json, text } = await eliteFetch(url);
    if (status !== 200) return mapHttpError(status, json ?? text);
    if (!Array.isArray(json)) {
      return {
        ok: false,
        status,
        errorCode: "INVALID_RESPONSE",
        errorMessage: "استجابة مدن Elite غير متوقعة",
      };
    }
    return {
      ok: true,
      status,
      data: (json as EliteCity[]).map((c) => ({
        id: String(c.id),
        name: String(c.name ?? "").trim(),
      })),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      errorCode: "NETWORK_ERROR",
      errorMessage: "تعذر الاتصال بشركة التوصيل",
    };
  }
}

export type EliteBatchResultPackage = {
  package_id?: string;
  id?: string;
  tracking?: string;
  internal_id?: string;
  status?: string | number;
  error?: string;
  [key: string]: unknown;
};

export async function eliteCreateBatch(
  baseUrl: string,
  token: string,
  body: EliteBatchRequest,
): Promise<
  | EliteApiOk<{ raw: unknown; packages: EliteBatchResultPackage[] }>
  | EliteApiError
> {
  const url = buildEliteUrl(baseUrl, `/v1.0/batch/${encodeURIComponent(token)}`);
  try {
    const { status, json, text } = await eliteFetch(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (status !== 200) return mapHttpError(status, json ?? text);
    if (json && typeof json === "object" && !Array.isArray(json) && "error" in json) {
      return mapHttpError(400, json);
    }

    const packages = extractBatchPackages(json);
    return { ok: true, status, data: { raw: json, packages } };
  } catch (err) {
    void stripTokenFromUrl; // keep helper referenced for future logging
    return {
      ok: false,
      status: 0,
      errorCode: "NETWORK_ERROR",
      errorMessage: "تعذر الاتصال بشركة التوصيل",
      bodySnippet: err instanceof Error ? err.message : undefined,
    };
  }
}

function extractBatchPackages(json: unknown): EliteBatchResultPackage[] {
  if (!json) return [];
  if (Array.isArray(json)) return json as EliteBatchResultPackage[];
  if (typeof json !== "object") return [];
  const obj = json as Record<string, unknown>;
  for (const key of ["packages", "data", "results", "items", "colis"]) {
    if (Array.isArray(obj[key])) return obj[key] as EliteBatchResultPackage[];
  }
  // Single package object
  if (obj.package_id || obj.id) return [obj as EliteBatchResultPackage];
  return [];
}

export function extractPackageId(
  pkg: EliteBatchResultPackage | undefined,
  fallbackInternalId?: string,
): string | undefined {
  if (!pkg) return undefined;
  const candidates = [
    pkg.package_id,
    pkg.id,
    pkg.tracking,
    typeof pkg.code === "string" ? pkg.code : undefined,
  ];
  for (const c of candidates) {
    if (c != null && String(c).trim()) return String(c).trim();
  }
  // Some APIs nest success under message only — last resort use internal_id echo
  if (fallbackInternalId && pkg.internal_id === fallbackInternalId) {
    return undefined;
  }
  return undefined;
}

/** Elite panel IDs look like ELITE-… or CL-ELITE-… */
export function looksLikeElitePackageId(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^(CL-)?ELITE-[A-Z0-9-]+$/i.test(value.trim());
}
