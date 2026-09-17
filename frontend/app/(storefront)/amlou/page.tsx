import type { Metadata } from "next";
import { AmlouHubPage } from "@/lib/seo/amlou-hub-page";
import { absoluteUrl } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: {
    absolute: "شراء أملو طبيعي أونلاين في المغرب | تازارزيت بيو",
  },
  description:
    "أملو تقليدي وأملو ملكي من سوس — طبيعي 100٪، توصيل لكل المدن، والدفع عند الاستلام من تازارزيت بيو.",
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
    title: "شراء أملو طبيعي أونلاين | تازارزيت بيو",
    description:
      "أملو تقليدي وأملو ملكي من سوس مع توصيل داخل المغرب والدفع عند الاستلام.",
    url: absoluteUrl("/amlou"),
    locale: "ar_MA",
  },
};

export default function Page() {
  return <AmlouHubPage locale="ar" />;
}
