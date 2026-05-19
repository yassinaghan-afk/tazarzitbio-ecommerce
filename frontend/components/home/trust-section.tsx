const trustItems = [
  {
    title: "100% طبيعي",
    description: "مكونات نقية دون إضافات صناعية",
  },
  {
    title: "من قلب سوس",
    description: "أصالة مغربية من منطقة سوس",
  },
  {
    title: "الدفع عند الاستلام",
    description: "ادفع نقداً عند استلام طلبك",
  },
  {
    title: "تغليف فاخر",
    description: "مناسب للهدايا والعائلة",
  },
];

export function TrustSection() {
  return (
    <section id="trust" className="border-b border-border bg-card py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-primary md:text-3xl">
          لماذا تثق بتازارزيت بيو؟
        </h2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <li
              key={item.title}
              className="rounded-xl border border-border bg-background p-5 text-center shadow-sm"
            >
              <p className="text-lg font-semibold text-foreground">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
