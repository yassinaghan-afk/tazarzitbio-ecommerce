import { type NextRequest, NextResponse } from "next/server";

import {
  guardVideoRequest,
  isValidJobId,
  serviceUnreachable,
  videoServiceFetch,
} from "@/lib/vid/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PASS_HEADERS = ["content-type", "content-length", "content-range", "accept-ranges", "last-modified", "etag"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await guardVideoRequest(req);
  if (denied) return denied;
  const { id } = await params;
  if (!isValidJobId(id)) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const range = req.headers.get("range");
  let upstream: Response;
  try {
    upstream = await videoServiceFetch(`/jobs/${id}/video`, {
      headers: range ? { range } : undefined,
    });
  } catch {
    return serviceUnreachable();
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Video not ready" }, { status: upstream.status || 502 });
  }

  const headers = new Headers({ "cache-control": "private, no-store" });
  for (const name of PASS_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  const disposition = req.nextUrl.searchParams.get("download") ? "attachment" : "inline";
  headers.set("content-disposition", `${disposition}; filename="tazarzit-video-${id.slice(0, 8)}.mp4"`);

  return new Response(upstream.body, { status: upstream.status, headers });
}
