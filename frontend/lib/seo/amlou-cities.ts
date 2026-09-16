export type AmlouCity = {
  slug: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  /** Tourist / surf / heritage destination */
  tourist?: boolean;
};

/** Major Moroccan cities + tourist destinations for Amlou delivery GEO. */
export const AMLOU_CITIES: AmlouCity[] = [
  { slug: "casablanca", nameAr: "الدار البيضاء", nameFr: "Casablanca", nameEn: "Casablanca" },
  { slug: "rabat", nameAr: "الرباط", nameFr: "Rabat", nameEn: "Rabat" },
  { slug: "sale", nameAr: "سلا", nameFr: "Salé", nameEn: "Sale" },
  { slug: "temara", nameAr: "تمارة", nameFr: "Témara", nameEn: "Temara" },
  { slug: "skhirat", nameAr: "الصخيرات", nameFr: "Skhirat", nameEn: "Skhirat" },
  { slug: "mohammedia", nameAr: "المحمدية", nameFr: "Mohammedia", nameEn: "Mohammedia" },
  { slug: "bouznika", nameAr: "بوزنيقة", nameFr: "Bouznika", nameEn: "Bouznika" },
  { slug: "marrakech", nameAr: "مراكش", nameFr: "Marrakech", nameEn: "Marrakech" },
  { slug: "agadir", nameAr: "أكادير", nameFr: "Agadir", nameEn: "Agadir" },
  { slug: "inezgane", nameAr: "إنزكان", nameFr: "Inezgane", nameEn: "Inezgane" },
  { slug: "ait-melloul", nameAr: "أيت ملول", nameFr: "Aït Melloul", nameEn: "Ait Melloul" },
  { slug: "tanger", nameAr: "طنجة", nameFr: "Tanger", nameEn: "Tangier" },
  { slug: "tetouan", nameAr: "تطوان", nameFr: "Tétouan", nameEn: "Tetouan" },
  { slug: "fnideq", nameAr: "الفنيدق", nameFr: "Fnideq", nameEn: "Fnideq" },
  { slug: "martil", nameAr: "مرتيل", nameFr: "Martil", nameEn: "Martil" },
  { slug: "fes", nameAr: "فاس", nameFr: "Fès", nameEn: "Fez" },
  { slug: "meknes", nameAr: "مكناس", nameFr: "Meknès", nameEn: "Meknes" },
  { slug: "kenitra", nameAr: "القنيطرة", nameFr: "Kénitra", nameEn: "Kenitra" },
  { slug: "oujda", nameAr: "وجدة", nameFr: "Oujda", nameEn: "Oujda" },
  { slug: "nador", nameAr: "الناظور", nameFr: "Nador", nameEn: "Nador" },
  { slug: "berkane", nameAr: "بركان", nameFr: "Berkane", nameEn: "Berkane" },
  { slug: "el-jadida", nameAr: "الجديدة", nameFr: "El Jadida", nameEn: "El Jadida" },
  { slug: "safi", nameAr: "آسفي", nameFr: "Safi", nameEn: "Safi" },
  { slug: "settat", nameAr: "سطات", nameFr: "Settat", nameEn: "Settat" },
  { slug: "berrechid", nameAr: "برشيد", nameFr: "Berrechid", nameEn: "Berrechid" },
  { slug: "khouribga", nameAr: "خريبكة", nameFr: "Khouribga", nameEn: "Khouribga" },
  { slug: "beni-mellal", nameAr: "بني ملال", nameFr: "Béni Mellal", nameEn: "Beni Mellal" },
  { slug: "khemisset", nameAr: "الخميسات", nameFr: "Khemisset", nameEn: "Khemisset" },
  { slug: "taza", nameAr: "تازة", nameFr: "Taza", nameEn: "Taza" },
  { slug: "larache", nameAr: "العرائش", nameFr: "Larache", nameEn: "Larache" },
  { slug: "ksar-el-kebir", nameAr: "القصر الكبير", nameFr: "Ksar El Kébir", nameEn: "Ksar El Kebir" },
  { slug: "tiznit", nameAr: "تيزنيت", nameFr: "Tiznit", nameEn: "Tiznit" },
  { slug: "taroudant", nameAr: "تارودانت", nameFr: "Taroudant", nameEn: "Taroudant" },
  { slug: "ouarzazate", nameAr: "ورزازات", nameFr: "Ouarzazate", nameEn: "Ouarzazate" },
  { slug: "errachidia", nameAr: "الرشيدية", nameFr: "Errachidia", nameEn: "Errachidia" },
  { slug: "guelmim", nameAr: "كلميم", nameFr: "Guelmim", nameEn: "Guelmim" },
  { slug: "laayoune", nameAr: "العيون", nameFr: "Laâyoune", nameEn: "Laayoune" },
  { slug: "dakhla", nameAr: "الداخلة", nameFr: "Dakhla", nameEn: "Dakhla" },
  { slug: "taghazout", nameAr: "تغازوت", nameFr: "Taghazout", nameEn: "Taghazout", tourist: true },
  { slug: "tamraght", nameAr: "تمراغت", nameFr: "Tamraght", nameEn: "Tamraght", tourist: true },
  { slug: "aourir", nameAr: "أورير", nameFr: "Aourir", nameEn: "Aourir", tourist: true },
  { slug: "imsouane", nameAr: "إمسوان", nameFr: "Imsouane", nameEn: "Imsouane", tourist: true },
  { slug: "essaouira", nameAr: "الصويرة", nameFr: "Essaouira", nameEn: "Essaouira", tourist: true },
  { slug: "sidi-kaouki", nameAr: "سيدي كاوكي", nameFr: "Sidi Kaouki", nameEn: "Sidi Kaouki", tourist: true },
  { slug: "oualidia", nameAr: "الوليدية", nameFr: "Oualidia", nameEn: "Oualidia", tourist: true },
  { slug: "mirleft", nameAr: "ميرلفت", nameFr: "Mirleft", nameEn: "Mirleft", tourist: true },
  { slug: "sidi-ifni", nameAr: "سيدي إفني", nameFr: "Sidi Ifni", nameEn: "Sidi Ifni", tourist: true },
  { slug: "legzira", nameAr: "لكزيرة", nameFr: "Legzira", nameEn: "Legzira", tourist: true },
  { slug: "tafraoute", nameAr: "تافراوت", nameFr: "Tafraoute", nameEn: "Tafraoute", tourist: true },
  { slug: "chefchaouen", nameAr: "شفشاون", nameFr: "Chefchaouen", nameEn: "Chefchaouen", tourist: true },
  { slug: "asilah", nameAr: "أصيلة", nameFr: "Asilah", nameEn: "Asilah", tourist: true },
  { slug: "al-hoceima", nameAr: "الحسيمة", nameFr: "Al Hoceima", nameEn: "Al Hoceima", tourist: true },
  { slug: "saidia", nameAr: "السعيدية", nameFr: "Saïdia", nameEn: "Saidia", tourist: true },
  { slug: "ifrane", nameAr: "إفران", nameFr: "Ifrane", nameEn: "Ifrane", tourist: true },
  { slug: "azrou", nameAr: "أزرو", nameFr: "Azrou", nameEn: "Azrou", tourist: true },
  { slug: "midelt", nameAr: "ميدلت", nameFr: "Midelt", nameEn: "Midelt", tourist: true },
  { slug: "merzouga", nameAr: "مرزوقة", nameFr: "Merzouga", nameEn: "Merzouga", tourist: true },
  { slug: "zagora", nameAr: "زاكورة", nameFr: "Zagora", nameEn: "Zagora", tourist: true },
  { slug: "tinghir", nameAr: "تنغير", nameFr: "Tinghir", nameEn: "Tinghir", tourist: true },
  { slug: "boumalne-dades", nameAr: "بومالن دادس", nameFr: "Boumalne Dadès", nameEn: "Boumalne Dades", tourist: true },
  { slug: "skoura", nameAr: "سكورة", nameFr: "Skoura", nameEn: "Skoura", tourist: true },
  { slug: "ait-ben-haddou", nameAr: "آيت بن حدو", nameFr: "Aït Ben Haddou", nameEn: "Ait Ben Haddou", tourist: true },
  { slug: "ourika", nameAr: "أوريكة", nameFr: "Ourika", nameEn: "Ourika", tourist: true },
  { slug: "imilchil", nameAr: "إيميلشيل", nameFr: "Imilchil", nameEn: "Imilchil", tourist: true },
  { slug: "imlil", nameAr: "إمليل", nameFr: "Imlil", nameEn: "Imlil", tourist: true },
];

const bySlug = new Map(AMLOU_CITIES.map((c) => [c.slug, c]));

export function getAmlouCity(slug: string): AmlouCity | undefined {
  return bySlug.get(slug);
}

export function amlouCityPath(slug: string): string {
  return `/amlou/${slug}`;
}
