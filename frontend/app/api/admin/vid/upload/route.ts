import { type NextRequest, NextResponse } from "next/server";

import {
  guardVideoRequest,
  relayJson,
  serviceUnreachable,
  videoServiceFetch,
} from "@/lib/vid/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const denied = await guardVideoRequest(req);
  if (denied) return denied;

  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data") || !req.body) {
    return NextResponse.json({ error: "Upload a video file" }, { status: 400 });
  }

  try {
    const res = await videoServiceFetch("/jobs", {
      method: "POST",
      body: req.body,
      headers: { "content-type": contentType },
      duplex: "half",
    } as RequestInit & { duplex: "half" });
    return relayJson(res);
  } catch {
    return serviceUnreachable();
  }
}
