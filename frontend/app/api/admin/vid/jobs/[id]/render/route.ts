import { type NextRequest, NextResponse } from "next/server";

import {
  guardVideoRequest,
  isValidJobId,
  relayJson,
  serviceUnreachable,
  videoServiceFetch,
} from "@/lib/vid/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await guardVideoRequest(req);
  if (denied) return denied;
  const { id } = await params;
  if (!isValidJobId(id)) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const res = await videoServiceFetch(`/jobs/${id}/render`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return relayJson(res);
  } catch {
    return serviceUnreachable();
  }
}
