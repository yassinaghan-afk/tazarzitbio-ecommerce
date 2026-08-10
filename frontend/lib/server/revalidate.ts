import { revalidatePath } from "next/cache";

/**
 * Invalidate every public page after a CMS mutation so the live website
 * reflects saved changes immediately — no rebuild or restart required.
 */
export function revalidatePublicContent(): void {
  try {
    revalidatePath("/", "layout");
  } catch (err) {
    console.error("revalidate error", err);
  }
}
