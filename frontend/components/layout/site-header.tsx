"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#products", label: "منتجاتنا" },
  { href: "#bundles",  label: "عروض العائلة" },
  { href: "#story",    label: "قصتنا" },
  { href: "#reviews",  label: "آراء العملاء" },
  { href: "#faq",      label: "الأسئلة الشائعة" },
];

export function SiteHeader() {
  const [scrolled,    setScrolled]    = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-warm-sm border-b border-border"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="group flex flex-col leading-none"
            onClick={() => setMenuOpen(false)}
          >
            <span className="text-lg font-bold text-foreground transition-colors group-hover:text-accent">
              تازارزيت بيو
            </span>
            <span className="text-2xs text-muted-foreground">
              من قلب سوس
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-6 lg:flex"
            aria-label="التنقل الرئيسي"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-0.5 after:start-0 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="سلة التسوق"
              className="relative"
            >
              <ShoppingBag className="size-5" />
              <span className="absolute -top-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-2xs font-bold text-foreground">
                0
              </span>
            </Button>

            <Button
              variant="gold"
              size="sm"
              className="hidden lg:inline-flex"
            >
              تسوق الآن
            </Button>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label={menuOpen ? "أغلق القائمة" : "افتح القائمة"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-x-0 top-16 z-40 border-b border-border bg-background/98 backdrop-blur-md shadow-warm-lg"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-4 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-4 border-t border-border pt-4">
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  تسوق الآن
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
