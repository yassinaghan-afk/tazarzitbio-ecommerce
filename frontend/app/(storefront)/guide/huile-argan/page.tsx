import type { Metadata } from "next";

import { GuideArticle } from "@/components/seo/guide-article";

export const metadata: Metadata = {
  title: "زيت الأركان الغذائي | دليل تازارزيت بيو",
  description:
    "ما الفرق بين زيت الأركان للطعام وزيت التجميل؟ دليل مختصر عن زيت الأركان الغذائي من سوس وكيفية استخدامه يومياً.",
  alternates: { canonical: "/guide/huile-argan" },
  keywords: [
    "زيت الأركان",
    "huile d'argan",
    "زيت أركان غذائي",
    "سوس",
    "تازارزيت بيو",
  ],
  openGraph: {
    title: "زيت الأركان الغذائي",
    description:
      "دليل عن زيت الأركان الصالح للأكل من المغرب — استخدام يومي ومنتجات تازارزيت بيو.",
    url: "/guide/huile-argan",
  },
};

export default function ArganOilGuidePage() {
  return (
    <GuideArticle
      path="/guide/huile-argan"
      label="Guide · أركان"
      title="زيت الأركان الغذائي"
      intro="زيت الأركان مرتبط بمنطقة سوس وبشجرة الأركان. للاستخدام على المائدة يُختار زيت غذائي (torréfié غالباً)، وهو يختلف عن الزيوت المخصّصة للبشرة والشعر."
      sections={[
        {
          heading: "غذاء أم تجميل؟",
          paragraphs: [
            "الزيت الغذائي يُستعمل في السلطات، الأملو، وبعض الأطباق التقليدية. رائحته ونكهته أقوى عادةً من زيت التجميل.",
            "زيت التجميل يُصاغ للعناية الخارجية. عند الشراء أونلاين، اقرأ وصف المنتج بعناية لمعرفة الاستخدام المقصود.",
          ],
        },
        {
          heading: "لماذا سوس؟",
          paragraphs: [
            "منطقة سوس هي الموطن التقليدي لشجرة الأركان. الشراء من علامات توضح المصدر وطريقة التحضير يساعد على الثقة في الجودة.",
            "تازارزيت بيو تقدّم منتجات طبيعية مرتبطة بهذه المنطقة، مع توصيل داخل المغرب والدفع عند الاستلام.",
          ],
        },
        {
          heading: "Huile d’argan alimentaire (FR)",
          paragraphs: [
            "L’huile d’argan alimentaire du Souss se distingue de l’huile cosmétique. Elle entre dans l’amlou, les salades et la cuisine marocaine. Tazarzit Bio livre au Maroc avec paiement à la livraison.",
          ],
        },
        {
          heading: "Edible argan oil (EN)",
          paragraphs: [
            "Edible argan oil from Morocco’s Souss region is used in amlou and cooking, unlike cosmetic argan oil. Tazarzit Bio offers natural products with cash-on-delivery shipping nationwide.",
          ],
        },
      ]}
      faqs={[
        {
          q: "هل يمكن طهي زيت الأركان؟",
          a: "يُفضَّل استخدامه بارداً أو بإضافة خفيفة للحفاظ على النكهة، حسب الوصفة. اتبع إرشادات المنتج.",
        },
        {
          q: "هل زيت الأركان مناسب للنباتيين؟",
          a: "الزيت نفسه نباتي؛ تأكد من باقي مكونات المنتج (مثل الأملو بالعسل) إذا كان ذلك مهماً لنظامك.",
        },
      ]}
    />
  );
}
