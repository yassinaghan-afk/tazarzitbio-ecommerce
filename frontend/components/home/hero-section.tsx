import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(30_44%_64%_/_0.15),_transparent_55%)]" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
        <div className="relative z-10 space-y-6">
          <p className="inline-flex rounded-full border border-accent/40 bg-accent/10 px-4 py-1 text-sm font-medium text-accent-foreground">
            من قلب سوس · المغرب
          </p>
          <h1 className="text-4xl font-bold leading-tight text-primary md:text-5xl">
            تازارزيت بيو
          </h1>
          <p className="text-2xl font-semibold text-foreground md:text-3xl">
            100% طبيعي من قلب سوس
          </p>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            أملو، زيت أركان، عسل، ومكسرات مختارة بعناية — جودة فاخرة
            وتغليف أنيق مع الدفع عند الاستلام في جميع أنحاء المغرب.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">تسوق الآن</Button>
            <Button size="lg" variant="outline">
              اكتشف مجموعتنا
            </Button>
          </div>
        </div>

        <div className="relative z-10">
          <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-accent/20 to-background shadow-xl">
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <span className="text-6xl" aria-hidden>
                🫒
              </span>
              <p className="text-lg font-semibold text-primary">
                منتجات طبيعية فاخرة
              </p>
              <p className="text-sm text-muted-foreground">
                صورة المنتج قريباً
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
