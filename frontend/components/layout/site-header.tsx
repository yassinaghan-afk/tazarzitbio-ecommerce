"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, ShoppingBag, X } from "lucide-react";

import { useCommerce } from "@/components/providers/commerce-provider";
import { BrandLockup } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/products", label: "منتجاتنا" },
  { href: "/#bundles", label: "عروض العائلة" },
  { href: "/#story", label: "قصتنا" },
  { href: "/#reviews", label: "آراء العملاء" },
  { href: "/#faq", label: "الأسئلة الشائعة" },
];

export function SiteHeader() {
  const { itemCount, openCart } = useCommerce();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out",
          scrolled ? "glass-nav-solid" : "glass-nav",
        )}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[4.75rem] lg:px-8">
          <Link
            href="/"
            className="group shrink-0 transition-opacity hover:opacity-90"
            onClick={() => setMenuOpen(false)}
          >
            <BrandLockup variant="header" priority showTagline />
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="التنقل الرئيسي"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/80 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="سلة التسوق"
              className="relative rounded-full hover:bg-secondary/80"
              onClick={openCart}
            >
              <ShoppingBag className="size-5" strokeWidth={1.75} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-gold-gradient px-1 text-[0.6rem] font-bold text-foreground shadow-gold">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Button>

            <Button
              variant="gold"
              size="sm"
              className="hidden rounded-full px-6 shadow-gold lg:inline-flex"
              asChild
            >
              <Link href="/products">تسوق الآن</Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full lg:hidden"
              aria-label={menuOpen ? "أغلق القائمة" : "افتح القائمة"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="glass-surface fixed inset-x-0 top-[4.25rem] z-40 border-b-0 shadow-warm-xl lg:top-[4.75rem]"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-6">
              <div className="mb-4 flex justify-center border-b border-border/50 pb-5">
                <BrandLockup variant="compact" showTagline />
              </div>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-4 py-3.5 text-base font-medium text-foreground transition-colors hover:bg-secondary/60"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-4 border-t border-border/50 pt-4">
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full rounded-full shadow-gold"
                  asChild
                  onClick={() => setMenuOpen(false)}
                >
                  <Link href="/products">تسوق الآن</Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
