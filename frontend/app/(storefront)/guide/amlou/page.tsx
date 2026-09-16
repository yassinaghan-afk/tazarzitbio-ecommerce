import type { Metadata } from "next";

import { GuideArticle } from "@/components/seo/guide-article";

export const metadata: Metadata = {
  title: "ما هو الأملو؟ | دليل تازارزيت بيو",
  description:
    "الأملو منتج مغربي تقليدي من اللوز وزيت الأركان والعسل. تعرّف على مكوناته، فوائده، وكيف تشتري أملو طبيعي مع الدفع عند الاستلام.",
  alternates: { canonical: "/guide/amlou" },
  keywords: [
    "أملو",
    "أملو مغربي",
    "Amlou",
    "أملو ملكي",
    "تازارزيت بيو",
    "سوس",
  ],
  openGraph: {
    title: "ما هو الأملو؟",
    description:
      "دليل مختصر عن الأملو المغربي من سوس — مكونات طبيعية والدفع عند الاستلام.",
    url: "/guide/amlou",
  },
};

export default function AmlouGuidePage() {
  return (
    <GuideArticle
      path="/guide/amlou"
      label="Guide · أملو"
      title="ما هو الأملو؟"
      intro="الأملو (Amlou) خلطة مغربية تقليدية من منطقة سوس، غالباً من اللوز المحمّص وزيت الأركان الغذائي، وقد يُحلّى بالعسل. يُقدَّم مع الخبز في الفطور والضيافة."
      ctaHref="/amlouroyal"
      ctaLabel="اطلب أملو ملكي"
      sections={[
        {
          heading: "مكونات الأملو التقليدي",
          paragraphs: [
            "الصيغة الكلاسيكية تعتمد لوزاً محمّصاً مطحوناً، زيت أركان صالحاً للأكل، وغالباً عسلاً طبيعياً. الجودة تتوقف على نقاء المكونات وغياب الإضافات الصناعية.",
            "عند تازارزيت بيو نختار مكونات من سوس ونحافظ على طابع تقليدي واضح: طعم غني وقوام قابل للدهن، مناسب للمائدة المغربية اليومية.",
          ],
        },
        {
          heading: "كيف يُستخدم الأملو؟",
          paragraphs: [
            "يُدهن على الخبز أو الملوي، ويُقدَّم مع الشاي، أو كجزء من ضيافة الضيوف. بعض العائلات تضيفه إلى فطور نهاية الأسبوع كمرافق للعسل والزبدة.",
            "يُحفظ في مكان بارد وجاف بعد الفتح، ويُستهلك بأدوات نظيفة للحفاظ على النكهة.",
          ],
        },
        {
          heading: "Amlou — en bref (FR)",
          paragraphs: [
            "L’amlou est une spécialité du Souss à base d’amandes, d’huile d’argan alimentaire et souvent de miel. Chez Tazarzit Bio, il est proposé en livraison partout au Maroc avec paiement à la livraison.",
          ],
        },
        {
          heading: "What is Amlou? (EN)",
          paragraphs: [
            "Amlou is a traditional Moroccan spread from the Souss region, typically made with roasted almonds, edible argan oil, and honey. Tazarzit Bio ships across Morocco with cash on delivery.",
          ],
        },
      ]}
      faqs={[
        {
          q: "هل الأملو حلو أم مالح؟",
          a: "غالباً ما يكون حلواً خفيفاً بفضل العسل، مع نكهة اللوز المحمّص وزيت الأركان. الوصفات تختلف حسب المنطقة والمنتج.",
        },
        {
          q: "هل أملو تازارزيت بيو طبيعي؟",
          a: "نعم — نركز على مكونات طبيعية من سوس دون إضافات صناعية، مع الدفع عند الاستلام في المغرب.",
        },
        {
          q: "أين أشتري الأملو أونلاين في المغرب؟",
          a: "يمكنك الطلب من متجر تازارزيت بيو، بما في ذلك صفحة أملو ملكي، مع تأكيد الطلب والتوصيل عبر خدمة الدفع عند الاستلام.",
        },
      ]}
    />
  );
}
