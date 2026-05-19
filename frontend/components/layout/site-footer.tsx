export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-bold text-primary">تازارزيت بيو</p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              100% طبيعي من قلب سوس — منتجات مغربية فاخرة بالدفع عند الاستلام.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="font-semibold text-foreground">تسوق</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li>أملو</li>
                <li>زيت أركان</li>
                <li>عسل</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground">معلومات</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li>من نحن</li>
                <li>التوصيل</li>
                <li>الأسئلة الشائعة</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground">تواصل</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li>واتساب</li>
                <li>الدفع عند الاستلام</li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Tazarzit Bio. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
