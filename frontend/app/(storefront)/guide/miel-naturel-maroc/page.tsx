import type { Metadata } from "next";

import { GuideArticle } from "@/components/seo/guide-article";

export const metadata: Metadata = {
  title: "العسل الطبيعي من المغرب | دليل تازارزيت بيو",
  description:
    "دليل عن العسل الطبيعي من سوس والمغرب: النقاء، الاستخدام اليومي، والشراء أونلاين مع الدفع عند الاستلام من تازارزيت بيو.",
  alternates: { canonical: "/guide/miel-naturel-maroc" },
  keywords: [
    "عسل طبيعي",
    "عسل المغرب",
    "عسل سوس",
    "miel naturel Maroc",
    "تازارزيت بيو",
  ],
  openGraph: {
    title: "العسل الطبيعي من المغرب",
    description:
      "تعرّف على العسل الطبيعي من سوس وكيف تطلب من تازارزيت بيو مع الدفع عند الاستلام.",
    url: "/guide/miel-naturel-maroc",
  },
};

export default function HoneyGuidePage() {
  return (
    <GuideArticle
      path="/guide/miel-naturel-maroc"
      label="Guide · عسل"
      title="العسل الطبيعي من المغرب"
      intro="العسل جزء أساسي من الضيافة المغربية. عسل المراعي والمناطق مثل سوس يُقدَّر لنكهته واستخدامه في الفطور والعلاج المنزلي التقليدي."
      sections={[
        {
          heading: "ماذا يعني «عسل طبيعي»؟",
          paragraphs: [
            "يعني التركيز على عسل دون إضافات سكر صناعي واضحة، مع شفافية حول المصدر قدر الإمكان. اللون والقوام يختلفان حسب الموسم والنباتات.",
            "عند تازارزيت بيو نقدّم عسلاً ومنتجات بالعسل ضمن تشكيلة طبيعية من سوس، مع طلب سهل وتوصيل داخل المغرب.",
          ],
        },
        {
          heading: "استخدام يومي",
          paragraphs: [
            "يُضاف إلى الشاي، الخبز، الزبادي، أو يُقدَّم مع الأملو والمكسرات. يُحفظ مغلقاً بعيداً عن الرطوبة العالية.",
            "إذا تبلّر العسل فهذا سلوك طبيعي لكثير من الأنواع؛ يمكن تدفئته بلطف في حمام ماء دون غليان.",
          ],
        },
        {
          heading: "Miel naturel du Maroc (FR)",
          paragraphs: [
            "Le miel du Souss et d’autres régions marocaines s’intègre au petit-déjeuner et à l’hospitalité. Tazarzit Bio propose des produits naturels livrés partout au Maroc, paiement à la livraison.",
          ],
        },
        {
          heading: "Natural honey from Morocco (EN)",
          paragraphs: [
            "Moroccan honey from regions like Souss is valued for breakfast and hospitality. Shop Tazarzit Bio for natural products with nationwide cash-on-delivery.",
          ],
        },
      ]}
      faqs={[
        {
          q: "هل توصّلون العسل لكل المدن؟",
          a: "نعم، نغطي المدن المغربية عبر شركاء التوصيل، مع الدفع عند الاستلام بعد تأكيد الطلب.",
        },
        {
          q: "ما الفرق بين عسل الدغموس وأنواع أخرى؟",
          a: "النكهة واللون يعتمدان على مصدر الرحيق. عسل الدغموس معروف بطابعه المحلي الغني؛ راجع صفحة المنتج للتفاصيل.",
        },
      ]}
    />
  );
}
