import Link from "next/link";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "#products", label: "منتجاتنا" },
  { href: "#story", label: "قصتنا" },
  { href: "#trust", label: "لماذا نحن" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-primary">
          تازارزيت بيو
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="التنقل الرئيسي"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Button size="sm" className="text-sm">
          تسوق الآن
        </Button>
      </div>
    </header>
  );
}
