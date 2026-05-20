"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Gift,
  Leaf,
  Megaphone,
  Package,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Truck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DEFAULT_ANNOUNCEMENT_BAR,
  getActiveAnnouncementMessages,
  normalizeAnnouncementBar,
  type AnnouncementBarConfig,
  type AnnouncementIcon,
  type AnnouncementMessage,
} from "@/lib/admin/announcement-bar";
import { FREE_SHIPPING_MARKETING_AR } from "@/lib/shipping/settings";
import { cn } from "@/lib/utils";

const ICON_OPTIONS: {
  id: AnnouncementIcon;
  label: string;
  Icon: typeof Truck;
}[] = [
  { id: "truck", label: "Delivery", Icon: Truck },
  { id: "shield", label: "Secure", Icon: ShieldCheck },
  { id: "package", label: "Package", Icon: Package },
  { id: "gift", label: "Gift", Icon: Gift },
  { id: "leaf", label: "Natural", Icon: Leaf },
  { id: "phone", label: "Phone", Icon: Phone },
];

function newMessage(): AnnouncementMessage {
  return {
    id: crypto.randomUUID(),
    text: "",
    icon: "truck",
    isEnabled: true,
  };
}

export function AnnouncementBarManager() {
  const [config, setConfig] = useState<AnnouncementBarConfig>(
    DEFAULT_ANNOUNCEMENT_BAR,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const activeMessages = useMemo(
    () => getActiveAnnouncementMessages(config),
    [config],
  );

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcement-bar");
      const data = (await res.json()) as { announcementBar: AnnouncementBarConfig };
      setConfig(normalizeAnnouncementBar(data.announcementBar));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (activeMessages.length <= 1) return;
    const t = window.setInterval(() => {
      setPreviewIndex((i) => (i + 1) % activeMessages.length);
    }, config.rotationIntervalMs);
    return () => window.clearInterval(t);
  }, [activeMessages.length, config.rotationIntervalMs]);

  useEffect(() => {
    if (previewIndex >= activeMessages.length) setPreviewIndex(0);
  }, [previewIndex, activeMessages.length]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/announcement-bar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = (await res.json()) as { announcementBar: AnnouncementBarConfig };
      setConfig(normalizeAnnouncementBar(data.announcementBar));
      window.dispatchEvent(new Event("tazarzit-announcement-updated"));
    } finally {
      setSaving(false);
    }
  };

  const moveMessage = (index: number, direction: -1 | 1) => {
    setConfig((prev) => {
      const next = [...prev.messages];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, messages: next };
    });
  };

  const updateMessage = (
    id: string,
    patch: Partial<AnnouncementMessage>,
  ) => {
    setConfig((prev) => ({
      ...prev,
      messages: prev.messages.map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    }));
  };

  const removeMessage = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== id),
    }));
  };

  const previewMessage = activeMessages[previewIndex] ?? activeMessages[0];
  const PreviewIcon =
    ICON_OPTIONS.find((o) => o.id === previewMessage?.icon)?.Icon ?? Truck;

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading announcement bar...</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Rotating Announcement Bar
          </h2>
          <p className="text-sm text-muted-foreground">
            Green/gold bar under the header — rotates trust & shipping messages.
          </p>
        </div>
        <Button
          variant="gold"
          className="rounded-full gap-2 shadow-gold"
          onClick={save}
          disabled={saving}
        >
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-warm-md space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={config.isEnabled}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, isEnabled: e.target.checked }))
              }
              className="h-4 w-4 rounded"
            />
            Announcement bar enabled
          </label>

          <div className="flex items-center gap-2">
            <Label htmlFor="rotationMs" className="text-xs whitespace-nowrap">
              Rotation (seconds)
            </Label>
            <Input
              id="rotationMs"
              type="number"
              min={1.5}
              max={30}
              step={0.5}
              className="w-24"
              value={config.rotationIntervalMs / 1000}
              onChange={(e) => {
                const sec = Number(e.target.value);
                if (!Number.isFinite(sec)) return;
                setConfig((prev) => ({
                  ...prev,
                  rotationIntervalMs: Math.max(1500, Math.round(sec * 1000)),
                }));
              }}
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-muted-foreground">Live preview</p>
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-white/10 bg-[hsl(96_33%_18%)] px-4 py-2.5",
              !config.isEnabled && "opacity-40",
            )}
            dir="rtl"
          >
            {previewMessage ? (
              <div className="flex items-center justify-center gap-2 text-center">
                <PreviewIcon className="size-4 shrink-0 text-[hsl(42_55%_78%)]" />
                <p className="text-xs font-semibold text-[hsl(42_42%_96%)]">
                  {previewMessage.text}
                </p>
              </div>
            ) : (
              <p className="text-center text-xs text-[hsl(42_42%_80%)]">
                No active messages — enable at least one below.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-foreground">Messages</h3>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-2"
            onClick={() =>
              setConfig((prev) => ({
                ...prev,
                messages: [...prev.messages, newMessage()],
              }))
            }
          >
            <Plus className="size-4" /> Add message
          </Button>
        </div>

        {config.messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "rounded-2xl border border-border/60 bg-card/60 p-4 shadow-warm-sm space-y-3",
              !message.isEnabled && "opacity-50",
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === 0}
                  onClick={() => moveMessage(index, -1)}
                  aria-label="Move up"
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={index === config.messages.length - 1}
                  onClick={() => moveMessage(index, 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-4" />
                </Button>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium">
                <input
                  type="checkbox"
                  checked={message.isEnabled}
                  onChange={(e) =>
                    updateMessage(message.id, { isEnabled: e.target.checked })
                  }
                  className="h-4 w-4 rounded"
                />
                Active
              </label>

              <div className="ms-auto flex gap-1">
                {ICON_OPTIONS.map(({ id, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    title={id}
                    onClick={() => updateMessage(message.id, { icon: id })}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                      message.icon === id
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border/60 text-muted-foreground hover:border-accent/30",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive"
                onClick={() => removeMessage(message.id)}
                aria-label="Delete message"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            <Input
              value={message.text}
              onChange={(e) =>
                updateMessage(message.id, { text: e.target.value })
              }
              dir="rtl"
              placeholder="نص الإعلان بالعربية..."
            />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <Megaphone className="mt-0.5 size-4 shrink-0 text-accent" />
          <p>
            Free shipping applies when cart subtotal is{" "}
            <strong className="text-foreground">349 MAD</strong> or more (
            {FREE_SHIPPING_MARKETING_AR}).
          </p>
        </div>
      </div>
    </div>
  );
}
