"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

type FieldVariant = "default" | "phone" | "address";

interface EditableVerificationFieldProps {
  label: string;
  icon: LucideIcon;
  value: string;
  onSave: (value: string) => void;
  variant?: FieldVariant;
  displayValue?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  dir?: "ltr" | "rtl";
  placeholder?: string;
  className?: string;
}

const cardStyles: Record<FieldVariant, string> = {
  default: "border-border/60 bg-card/80",
  phone:
    "border-accent/30 bg-gradient-to-br from-amber-50/90 via-card to-orange-50/40",
  address: "border-border/60 bg-card/80 p-5",
};

const valueStyles: Record<FieldVariant, string> = {
  default: "text-lg font-bold text-foreground",
  phone:
    "text-3xl font-extrabold tabular-nums tracking-wide text-foreground sm:text-4xl",
  address: "text-base font-bold leading-relaxed text-foreground sm:text-lg",
};

export function EditableVerificationField({
  label,
  icon: Icon,
  value,
  onSave,
  variant = "default",
  displayValue,
  inputMode,
  dir,
  placeholder,
  className,
}: EditableVerificationFieldProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [savedFlash, setSavedFlash] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
    setSavedFlash(false);
  };

  const cancelEdit = () => {
    setDraft(value);
    setEditing(false);
  };

  const commitSave = () => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value.trim()) {
      cancelEdit();
      return;
    }
    onSave(trimmed);
    setEditing(false);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2200);
  };

  const shown = displayValue ?? value;

  return (
    <div
      className={cn(
        "glass-card relative rounded-2xl border shadow-warm-md transition-shadow",
        variant === "phone" ? "p-5" : "p-4",
        cardStyles[variant],
        savedFlash && "ring-2 ring-emerald-400/50",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <Icon className="size-4 shrink-0 text-accent" aria-hidden />
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <AnimatePresence mode="wait">
            {savedFlash && !editing && (
              <motion.span
                key="saved"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                aria-label={t("common.savedAria")}
              >
                <Check className="size-4 stroke-[2.5]" />
              </motion.span>
            )}
          </AnimatePresence>
          {!editing && !savedFlash && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 rounded-full text-muted-foreground hover:bg-accent/10 hover:text-accent"
              onClick={startEdit}
              aria-label={t("common.editLabel", { label })}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          {variant === "address" ? (
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder={placeholder}
              className={cn(
                "checkout-field flex w-full resize-none rounded-xl border border-border bg-card/90 px-4 py-3 text-base font-medium leading-relaxed text-foreground",
                "placeholder:text-muted-foreground/70",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
            />
          ) : (
            <Input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              inputMode={inputMode}
              dir={dir}
              placeholder={placeholder}
              className={cn(
                variant === "phone" && "h-14 text-base font-bold tabular-nums sm:text-xl",
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitSave();
                if (e.key === "Escape") cancelEdit();
              }}
            />
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="gold"
              size="sm"
              className="flex-1 rounded-full"
              onClick={commitSave}
            >
              {t("common.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={cancelEdit}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <p
          dir={dir}
          className={cn(valueStyles[variant], dir === "ltr" && "text-end")}
        >
          {shown}
        </p>
      )}
    </div>
  );
}
