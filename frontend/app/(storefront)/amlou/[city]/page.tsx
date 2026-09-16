import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  AMLOU_CITIES,
  AmlouCityGuidePage,
  getAmlouCity,
  getAmlouCityMetadata,
} from "@/lib/seo/amlou-city-page";

type Props = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return AMLOU_CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getAmlouCity(slug);
  if (!city) return {};
  return getAmlouCityMetadata(city, "ar");
}

export default async function Page({ params }: Props) {
  const { city: slug } = await params;
  const city = getAmlouCity(slug);
  if (!city) notFound();
  return <AmlouCityGuidePage city={city} locale="ar" />;
}
