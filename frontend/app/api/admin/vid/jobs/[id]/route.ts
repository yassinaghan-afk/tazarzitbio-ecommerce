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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await guardVideoRequest(req);
  if (denied) return denied;
  const { id } = await params;
  if (!isValidJobId(id)) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  try {
    return relayJson(await videoServiceFetch(`/jobs/${id}`));
  } catch {
    return serviceUnreachable();
  }
}
