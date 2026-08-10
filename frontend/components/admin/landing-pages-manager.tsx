"use client";

import { useEffect, useMemo, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  Copy,
  Edit2,
  Eye,
  EyeOff,
  Globe,
  GripVertical,
  Plus,
  Rocket,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  uploadMediaFile,
  useUnsavedChangesWarning,
} from "@/lib/admin/client-helpers";
import {
  createLpBlock,
  LP_BLOCK_LABELS,
  type LpBlock,
  type LpBlockType,
} from "@/lib/admin/cms-types";
import type { CmsProductRecord } from "@/lib/admin/product-types";
import type { LandingPage } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

/* Which editor fields each block type uses */
const FIELDS: Record<
  LpBlockType,
  ("title" | "subtitle" | "text" | "image" | "images" | "video" | "cta" | "items" | "countdown")[]
> = {
  hero: ["title", "subtitle", "image", "cta"],
  heading: ["title", "subtitle"],
  text: ["title", "text"],
  image: ["title", "image"],
  gallery: ["title", "images"],
  video: ["title", "video"],
  cta: ["title", "text", "cta"],
  benefits: ["title", "items"],
  testimonial: ["title", "items"],
  faq: ["title", "items"],
  offer: ["title", "text", "image", "cta"],
  countdown: ["title", "countdown"],
  whatsapp: ["title", "text", "cta"],
  guarantee: ["title", "text"],
  divider: [],
};

function emptyPage(): LandingPage {
  return {
    id: "",
    slug: "",
    featuredProductSlug: "",
    headline: "",
    subheadline: "",
    ctaText: "اطلب الآن",
    sections: [],
    blocks: [],
    isEnabled: false,
    seoTitle: "",
    seoDescription: "",
    ogImage: "",
    createdAt: new Date().toISOString(),
  };
}

function ImageField({
  value,
  onChange,
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/… or https://…"
          className="flex-1 font-mono text-xs"
          dir="ltr"
        />
        <label className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold hover:bg-secondary/60">
          <Upload className="size-3.5" />
          {uploading ? "…" : "Upload"}
          <input
            type="file"
            accept="image/*,video/mp4,video/webm"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              const url = await uploadMediaFile(file);
              setUploading(false);
              if (url) onChange(url);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-16 rounded-lg object-cover" />
      )}
    </div>
  );
}

function ItemsEditor({
  items,
  onChange,
  titlePlaceholder,
  bodyPlaceholder,
}: {
  items: { title: string; body: string }[];
  onChange: (items: { title: string; body: string }[]) => void;
  titlePlaceholder: string;
  bodyPlaceholder: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <div className="flex-1 space-y-1.5">
            <Input
              value={item.title}
              onChange={(e) =>
                onChange(items.map((it, j) => (j === i ? { ...it, title: e.target.value } : it)))
              }
              placeholder={titlePlaceholder}
              dir="rtl"
            />
            <textarea
              value={item.body}
              onChange={(e) =>
                onChange(items.map((it, j) => (j === i ? { ...it, body: e.target.value } : it)))
              }
              placeholder={bodyPlaceholder}
              dir="rtl"
              rows={2}
              className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            className="mt-1 shrink-0 rounded-full text-destructive"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="rounded-full gap-1.5 text-xs"
        onClick={() => onChange([...items, { title: "", body: "" }])}
      >
        <Plus className="size-3.5" /> Add item
      </Button>
    </div>
  );
}

function BlockCard({
  block,
  onChange,
  onDuplicate,
  onDelete,
}: {
  block: LpBlock;
  onChange: (b: LpBlock) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const controls = useDragControls();
  const fields = FIELDS[block.type] ?? [];

  return (
    <Reorder.Item
      value={block}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "rounded-2xl border border-border/60 bg-card shadow-warm-sm",
        !block.isVisible && "opacity-55",
      )}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground/60 hover:text-foreground"
          onPointerDown={(e) => controls.start(e)}
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 text-start"
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="text-sm font-bold text-foreground">
            {LP_BLOCK_LABELS[block.type]}
          </span>
          {block.title && (
            <span className="ms-2 truncate text-xs text-muted-foreground" dir="rtl">
              {block.title}
            </span>
          )}
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          title={block.isVisible ? "Hide block" : "Show block"}
          onClick={() => onChange({ ...block, isVisible: !block.isVisible })}
        >
          {block.isVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full"
          title="Duplicate block"
          onClick={onDuplicate}
        >
          <Copy className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-full text-destructive"
          title="Delete block"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-border/50 p-4">
          {fields.includes("title") && (
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={block.title}
                onChange={(e) => onChange({ ...block, title: e.target.value })}
                dir="rtl"
              />
            </div>
          )}
          {fields.includes("subtitle") && (
            <div className="space-y-1.5">
              <Label>Subtitle</Label>
              <Input
                value={block.subtitle}
                onChange={(e) => onChange({ ...block, subtitle: e.target.value })}
                dir="rtl"
              />
            </div>
          )}
          {fields.includes("text") && (
            <div className="space-y-1.5">
              <Label>Text (blank line = new paragraph)</Label>
              <textarea
                value={block.text}
                onChange={(e) => onChange({ ...block, text: e.target.value })}
                dir="rtl"
                rows={5}
                className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}
          {fields.includes("image") && (
            <ImageField
              value={block.imageUrl}
              onChange={(url) => onChange({ ...block, imageUrl: url })}
            />
          )}
          {fields.includes("images") && (
            <div className="space-y-2">
              <Label>Gallery images</Label>
              {block.images.map((src, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={src}
                    onChange={(e) =>
                      onChange({
                        ...block,
                        images: block.images.map((s, j) => (j === i ? e.target.value : s)),
                      })
                    }
                    className="flex-1 font-mono text-xs"
                    dir="ltr"
                  />
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="rounded-full text-destructive"
                    onClick={() =>
                      onChange({ ...block, images: block.images.filter((_, j) => j !== i) })
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold hover:bg-secondary/60">
                <Upload className="size-3.5" /> Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadMediaFile(file);
                    if (url) onChange({ ...block, images: [...block.images, url] });
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          )}
          {fields.includes("video") && (
            <ImageField
              label="Video URL (mp4/webm)"
              value={block.videoUrl}
              onChange={(url) => onChange({ ...block, videoUrl: url })}
            />
          )}
          {fields.includes("cta") && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>CTA text</Label>
                <Input
                  value={block.ctaText}
                  onChange={(e) => onChange({ ...block, ctaText: e.target.value })}
                  dir="rtl"
                />
              </div>
              {block.type !== "whatsapp" && (
                <div className="space-y-1.5">
                  <Label>CTA link</Label>
                  <Input
                    value={block.ctaHref}
                    onChange={(e) => onChange({ ...block, ctaHref: e.target.value })}
                    placeholder="/products/… or https://…"
                    className="font-mono text-xs"
                    dir="ltr"
                  />
                </div>
              )}
            </div>
          )}
          {fields.includes("items") && (
            <ItemsEditor
              items={block.items}
              onChange={(items) => onChange({ ...block, items })}
              titlePlaceholder={
                block.type === "faq"
                  ? "Question"
                  : block.type === "testimonial"
                    ? "Customer name / city"
                    : "Benefit title"
              }
              bodyPlaceholder={
                block.type === "faq"
                  ? "Answer"
                  : block.type === "testimonial"
                    ? "Review text"
                    : "Details (optional)"
              }
            />
          )}
          {fields.includes("countdown") && (
            <div className="space-y-1.5">
              <Label>Countdown ends at</Label>
              <Input
                type="datetime-local"
                value={block.countdownTo}
                onChange={(e) => onChange({ ...block, countdownTo: e.target.value })}
                dir="ltr"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Background</Label>
            <select
              value={block.background}
              onChange={(e) =>
                onChange({ ...block, background: e.target.value as LpBlock["background"] })
              }
              className="h-10 w-full rounded-xl border border-border bg-card/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="default">Default</option>
              <option value="alt">Soft (alt)</option>
              <option value="dark">Dark</option>
              <option value="gold">Gold</option>
            </select>
          </div>
        </div>
      )}
    </Reorder.Item>
  );
}

export function LandingPagesManager() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [products, setProducts] = useState<CmsProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LandingPage | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addType, setAddType] = useState<LpBlockType>("hero");

  useUnsavedChangesWarning(dirty && editing !== null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pagesRes, productsRes] = await Promise.all([
        fetch("/api/admin/landing-pages", { cache: "no-store" }),
        fetch("/api/admin/products", { cache: "no-store" }),
      ]);
      const pagesData = (await pagesRes.json()) as { landingPages: LandingPage[] };
      const productsData = (await productsRes.json()) as { products: CmsProductRecord[] };
      setPages(pagesData.landingPages ?? []);
      setProducts(productsData.products ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const update = (patch: Partial<LandingPage>) => {
    setEditing((s) => (s ? { ...s, ...patch } : s));
    setDirty(true);
    setError(null);
  };

  const blocks = useMemo(() => editing?.blocks ?? [], [editing]);

  const setBlocks = (next: LpBlock[]) => update({ blocks: next });

  const savePage = async (publish?: boolean) => {
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...editing,
        isEnabled: publish === undefined ? editing.isEnabled : publish,
      };
      const res = await fetch("/api/admin/landing-pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        error?: string;
        landingPage?: LandingPage;
        landingPages?: LandingPage[];
      };
      if (!res.ok || !data.landingPage) {
        setError(data.error ?? "Save failed");
        return;
      }
      setPages(data.landingPages ?? []);
      setEditing(data.landingPage);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const deletePage = async (id: string) => {
    if (!confirm("Delete this landing page? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/landing-pages?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const data = (await res.json()) as { landingPages: LandingPage[] };
    setPages(data.landingPages ?? []);
  };

  const duplicatePage = async (page: LandingPage) => {
    const copy: LandingPage = {
      ...page,
      id: "",
      slug: `${page.slug}-copy`,
      isEnabled: false,
      blocks: (page.blocks ?? []).map((b) => ({
        ...b,
        id: `blk-${crypto.randomUUID().slice(0, 8)}`,
      })),
      createdAt: new Date().toISOString(),
    };
    setEditing(copy);
    setDirty(true);
  };

  /* ------------------------------ Editor view ------------------------------ */

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground">
            {editing.id ? `Edit /lp/${editing.slug || "…"}` : "New Landing Page"}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full gap-2"
              onClick={() => {
                if (dirty && !confirm("Discard unsaved changes?")) return;
                setEditing(null);
                setDirty(false);
              }}
            >
              <X className="size-4" /> Close
            </Button>
            {editing.id && editing.slug && (
              <Button
                variant="outline"
                className="rounded-full gap-2"
                onClick={() => window.open(`/lp/${editing.slug}`, "_blank")}
              >
                <Eye className="size-4" /> Preview
              </Button>
            )}
            <Button
              variant="outline"
              className="rounded-full gap-2"
              onClick={() => void savePage(false)}
              disabled={saving}
            >
              <Save className="size-4" /> Save Draft
            </Button>
            <Button
              variant="gold"
              className="rounded-full gap-2 shadow-gold"
              onClick={() => void savePage(true)}
              disabled={saving}
            >
              <Rocket className="size-4" />
              {saving ? "Saving…" : "Publish"}
            </Button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}
        {dirty && (
          <p className="text-xs font-semibold text-amber-600">Unsaved changes</p>
        )}

        {/* Page settings */}
        <div className="grid gap-4 rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>URL Slug</Label>
              <div className="flex items-center gap-2" dir="ltr">
                <span className="text-sm text-muted-foreground">/lp/</span>
                <Input
                  value={editing.slug}
                  onChange={(e) => update({ slug: e.target.value })}
                  placeholder="ramadan-pack"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Linked Product (for the Offer block)</Label>
              <select
                value={editing.featuredProductSlug}
                onChange={(e) => update({ featuredProductSlug: e.target.value })}
                className="h-10 w-full rounded-xl border border-border bg-card/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— none —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.nameAr} ({p.slug})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold",
                  editing.isEnabled
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800",
                )}
              >
                {editing.isEnabled ? "Published" : "Draft"}
              </span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>SEO Title</Label>
              <Input
                value={editing.seoTitle ?? ""}
                onChange={(e) => update({ seoTitle: e.target.value })}
                dir="rtl"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Meta Description</Label>
              <textarea
                value={editing.seoDescription ?? ""}
                onChange={(e) => update({ seoDescription: e.target.value })}
                dir="rtl"
                rows={2}
                className="w-full rounded-xl border border-border bg-card/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <ImageField
              label="Social share image (OG)"
              value={editing.ogImage ?? ""}
              onChange={(url) => update({ ogImage: url })}
            />
          </div>
        </div>

        {/* Blocks */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-foreground">Page Blocks</h3>
            <div className="flex items-center gap-2">
              <select
                value={addType}
                onChange={(e) => setAddType(e.target.value as LpBlockType)}
                className="h-10 rounded-xl border border-border bg-card/80 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {(Object.keys(LP_BLOCK_LABELS) as LpBlockType[]).map((t) => (
                  <option key={t} value={t}>
                    {LP_BLOCK_LABELS[t]}
                  </option>
                ))}
              </select>
              <Button
                variant="gold"
                className="rounded-full gap-1.5 shadow-gold"
                onClick={() => setBlocks([...blocks, createLpBlock(addType)])}
              >
                <Plus className="size-4" /> Add Block
              </Button>
            </div>
          </div>

          {blocks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">
              No blocks yet — add a Hero, an Offer and a CTA to build your page.
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={blocks}
              onReorder={setBlocks}
              className="space-y-3"
            >
              {blocks.map((block) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  onChange={(next) =>
                    setBlocks(blocks.map((b) => (b.id === next.id ? next : b)))
                  }
                  onDuplicate={() => {
                    const idx = blocks.findIndex((b) => b.id === block.id);
                    const copy = { ...block, id: `blk-${crypto.randomUUID().slice(0, 8)}` };
                    setBlocks([
                      ...blocks.slice(0, idx + 1),
                      copy,
                      ...blocks.slice(idx + 1),
                    ]);
                  }}
                  onDelete={() => {
                    if (!confirm("Delete this block?")) return;
                    setBlocks(blocks.filter((b) => b.id !== block.id));
                  }}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------- List view ------------------------------- */

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Landing Pages</h2>
          <p className="text-sm text-muted-foreground">
            Build promotional pages published at /lp/your-slug — no code needed.
          </p>
        </div>
        <Button
          variant="gold"
          className="rounded-full gap-2 shadow-gold"
          onClick={() => {
            setEditing(emptyPage());
            setDirty(false);
          }}
        >
          <Plus className="size-4" /> New Page
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : pages.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/60 p-10 text-center">
          <Globe className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-3 font-semibold text-foreground">No landing pages yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a campaign page for ads, promos or seasonal packs.
          </p>
          <Button
            variant="outline"
            className="mt-4 rounded-full gap-2"
            onClick={() => setEditing(emptyPage())}
          >
            <Plus className="size-4" /> Create First Page
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div
              key={page.id}
              className={cn(
                "flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-warm-md",
                !page.isEnabled && "opacity-70",
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/50">
                <Globe className="size-5 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-foreground font-mono" dir="ltr">
                    /lp/{page.slug}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      page.isEnabled
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {page.isEnabled ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {(page.blocks?.length ?? 0)} blocks
                  {page.featuredProductSlug && ` · product: ${page.featuredProductSlug}`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => window.open(`/lp/${page.slug}`, "_blank")}
                  title="Preview"
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => void duplicatePage(page)}
                  title="Duplicate"
                >
                  <Copy className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => {
                    setEditing(page);
                    setDirty(false);
                  }}
                  title="Edit"
                >
                  <Edit2 className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full text-destructive hover:text-destructive"
                  onClick={() => deletePage(page.id)}
                  title="Delete"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
