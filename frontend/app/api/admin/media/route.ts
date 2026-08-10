import { type NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

import { isAdminRequest } from "@/lib/admin/auth";
import type { MediaAsset } from "@/lib/admin/cms-types";
import { logAudit } from "@/lib/server/audit";
import { readStore, updateStore } from "@/lib/server/store";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const VIDEO_EXT = new Set([".mp4", ".webm", ".mov"]);

/** Resolve a public /uploads/... url to a safe absolute path inside uploads. */
function resolveUploadPath(url: string): string | null {
  if (!url.startsWith("/uploads/")) return null;
  const rel = url.slice("/uploads/".length);
  const abs = path.resolve(UPLOADS_ROOT, rel);
  if (!abs.startsWith(UPLOADS_ROOT + path.sep)) return null;
  return abs;
}

async function walkUploads(dir: string, urlBase: string): Promise<MediaAsset[]> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const assets: MediaAsset[] = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const url = `${urlBase}/${entry.name}`;
    if (entry.isDirectory()) {
      assets.push(...(await walkUploads(abs, url)));
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    const kind = IMAGE_EXT.has(ext) ? "image" : VIDEO_EXT.has(ext) ? "video" : null;
    if (!kind) continue;
    const stat = await fs.stat(abs);
    assets.push({
      url,
      name: entry.name,
      alt: "",
      size: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      kind,
    });
  }
  return assets;
}

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [assets, store] = await Promise.all([
    walkUploads(UPLOADS_ROOT, "/uploads"),
    readStore(),
  ]);
  const altByUrl = new Map(store.mediaMeta.map((m) => [m.url, m.alt]));
  const media = assets
    .map((a) => ({ ...a, alt: altByUrl.get(a.url) ?? "" }))
    .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  return NextResponse.json({ media });
}

/** PATCH: update alt text for a media url */
export async function PATCH(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { url?: string; alt?: string };
  try {
    body = (await req.json()) as { url?: string; alt?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const url = (body.url ?? "").toString();
  if (!resolveUploadPath(url)) {
    return NextResponse.json({ error: "Invalid media url" }, { status: 400 });
  }
  const alt = (body.alt ?? "").toString();
  await updateStore((prev) => {
    const mediaMeta = prev.mediaMeta.filter((m) => m.url !== url);
    if (alt) mediaMeta.push({ url, alt });
    return { ...prev, mediaMeta };
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.searchParams.get("url") ?? "";
  const abs = resolveUploadPath(url);
  if (!abs) {
    return NextResponse.json({ error: "Invalid media url" }, { status: 400 });
  }
  try {
    await fs.unlink(abs);
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
  await updateStore((prev) => ({
    ...prev,
    mediaMeta: prev.mediaMeta.filter((m) => m.url !== url),
  }));
  void logAudit(`Media file deleted (${url})`, "media");
  return NextResponse.json({ ok: true });
}
