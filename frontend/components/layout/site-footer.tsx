import Link from "next/link";

import { Container } from "@/components/layout/container";

const shopLinks   = ["أملو", "أملو بالفستق", "زيت أركان", "عسل طبيعي", "مكسرات بالعسل"];
const infoLinks   = ["من نحن", "سياسة التوصيل", "سياسة الإرجاع", "الأسئلة الشائعة"];
const legalLinks  = [
  { label: "سياسة الخصوصية", href: "#" },
  { label: "الشروط والأحكام",  href: "#" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex flex-col leading-none">
              <span className="text-xl font-bold text-foreground">
                تازارزيت بيو
              </span>
              <span className="text-sm text-muted-foreground">
                من قلب سوس
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              منتجات مغربية طبيعية فاخرة — أملو، زيت أركان، عسل، ومكسرات
              مختارة من سوس. الدفع عند الاستلام في جميع أنحاء المغرب.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent-foreground">
              الدفع عند الاستلام · COD
            </div>
          </div>

          {/* Shop links */}
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              تسوق
            </p>
            <ul className="mt-4 space-y-3">
              {shopLinks.map((name) => (
                <li key={name}>
                  <Link
                    href="#"
                    className="text-sm text-foreground/70 transition-colors hover:text-accent"
                  >
                    {name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="#"
                  className="text-sm font-semibold text-accent transition-colors hover:text-accent/80"
                >
                  علب الهدايا والعروض العائلية →
                </Link>
              </li>
            </ul>
          </div>

          {/* Info links */}
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              معلومات
            </p>
            <ul className="mt-4 space-y-3">
              {infoLinks.map((name) => (
                <li key={name}>
                  <Link
                    href="#"
                    className="text-sm text-foreground/70 transition-colors hover:text-accent"
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              تواصل معنا
            </p>
            <ul className="mt-4 space-y-3 text-sm text-foreground/70">
              <li>
                <a
                  href="https://wa.me/212600000000"
                  className="transition-colors hover:text-accent"
                >
                  واتساب · WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="tel:+212600000000"
                  className="transition-colors hover:text-accent"
                >
                  اتصل بنا · Call
                </a>
              </li>
            </ul>
            <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-4">
              <p className="text-xs font-semibold text-foreground">
                ساعات الدعم
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                الإثنين – السبت · ٩ص – ٨م
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Tazarzit Bio · جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
