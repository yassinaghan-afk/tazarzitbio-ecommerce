import { NextResponse } from "next/server";

/** Lightweight health probe for EasyPanel / Docker / uptime monitors. */
export async function GET() {
  return NextResponse.json(
    { status: "ok", service: "tazarzit-bio-frontend" },
    { status: 200 },
  );
}
