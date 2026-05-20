import { NextResponse } from "next/server";

import { getMergedCatalog } from "@/lib/products/cms-catalog";
import { toPublicProduct } from "@/lib/products/catalog";

export async function GET() {
  const catalog = await getMergedCatalog();
  const products = catalog.map(toPublicProduct);
  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
