"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/language-provider";
import { cn } from "@/lib/utils";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "start" | "end";
  className?: string;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = "start",
  className,
}: DrawerProps) {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const slideFrom = side === "start" ? "100%" : "-100%";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label={t("drawer.closeOverlay")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ x: slideFrom }}
            animate={{ x: 0 }}
            exit={{ x: slideFrom }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cn(
              "fixed top-0 z-[70] flex h-full w-full max-w-[100dvw] flex-col overflow-hidden bg-card shadow-warm-xl sm:max-w-md",
              side === "start" ? "start-0" : "end-0",
              className,
            )}
          >
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <h2 className="text-lg font-bold text-foreground">{title}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label={t("drawer.close")}
                className="rounded-full"
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-5 py-5">
              {children}
            </div>
            {footer && (
              <div className="min-w-0 shrink-0 border-t border-border/60 bg-card/95 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop-blur-md">
                {footer}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
