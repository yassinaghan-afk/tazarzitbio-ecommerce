import type { Metadata } from "next";
import { AmlouHubPage } from "@/lib/seo/amlou-hub-page";
import { absoluteUrl } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: "أملو طبيعي من سوس — شراء أونلاين في المغرب | تازارزيت بيو",
  description:
    "شراء أملو تقليدي وأملو ملكي أونلاين في المغرب. مكونات طبيعية من سوس، توصيل لكل المدن، والدفع عند الاستلام.",
  alternates: {
    canonical: absoluteUrl("/amlou"),
    languages: {
      "ar-MA": absoluteUrl("/amlou"),
      "fr-MA": absoluteUrl("/fr/amlou"),
      "en-MA": absoluteUrl("/en/amlou"),
      "x-default": absoluteUrl("/amlou"),
    },
  },
  openGraph: {
    title: "أملو طبيعي من سوس — تازارزيت بيو",
    description:
      "أملو تقليدي وأملو ملكي من سوس مع توصيل داخل المغرب والدفع عند الاستلام.",
    url: absoluteUrl("/amlou"),
    locale: "ar_MA",
  },
};

export default function Page() {
  return <AmlouHubPage locale="ar" />;
}
