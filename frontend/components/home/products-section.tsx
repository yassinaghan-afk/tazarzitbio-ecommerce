import { Button } from "@/components/ui/button";

const categories = [
  {
    name: "أملو",
    description: "كلاسيكي، بالفستق، وباللوز",
    emoji: "🥜",
  },
  {
    name: "زيت أركان",
    description: "زيت أصيل من سوس",
    emoji: "✨",
  },
  {
    name: "عسل طبيعي",
    description: "نقي ومختار بعناية",
    emoji: "🍯",
  },
  {
    name: "مكسرات بالعسل",
    description: "مزيج فاخر ومقرمش",
    emoji: "🌰",
  },
  {
    name: "علب هدايا",
    description: "للمناسبات والأعياد",
    emoji: "🎁",
  },
  {
    name: "عروض عائلية",
    description: "قيمة أعلى وتوفير أكبر",
    emoji: "👨‍👩‍👧‍👦",
  },
];

export function ProductsSection() {
  return (
    <section id="products" className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-2xl font-bold text-primary md:text-3xl">
              منتجاتنا
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              اكتشف مجموعة منتجاتنا الطبيعية — قريباً مع صفحات تفصيلية لكل
              منتج.
            </p>
          </div>
          <Button variant="outline">عرض الكل</Button>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li
              key={category.name}
              className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <span className="text-3xl" aria-hidden>
                {category.emoji}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                {category.name}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {category.description}
              </p>
              <p className="mt-4 text-sm font-medium text-accent-foreground">
                قريباً · الدفع عند الاستلام
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
