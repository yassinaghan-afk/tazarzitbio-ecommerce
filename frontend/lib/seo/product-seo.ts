import { readStore } from "@/lib/server/store";

export async function getCmsProductSeo(slug: string) {
  const store = await readStore();
  const record = store.cmsProducts?.find((p) => p.slug === slug);
  return {
    seoTitle: record?.seoTitle?.trim() || "",
    seoDescription: record?.seoDescription?.trim() || "",
  };
}
