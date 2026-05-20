export interface FamilyPackContentItem {
  id: string;
  nameAr: string;
  nameEn: string;
  size: string;
  benefit: string;
  imageSrc: string;
  imageAlt: string;
}

const IMG = "/images/products";

export const FAMILY_PACK_CONTENTS_TITLE_AR = "ماذا تحتوي باقة العائلة؟";
export const FAMILY_PACK_CONTENTS_TITLE_EN = "What's Inside The Family Pack";

export const FAMILY_PACK_CONTENTS: FamilyPackContentItem[] = [
  {
    id: "almond-amlou",
    nameAr: "أملو باللوز",
    nameEn: "Amlou Almond",
    size: "250 غ",
    benefit: "قومة لوز أصيلة مع عسل وزيت أركان من سوس",
    imageSrc: `${IMG}/almond-amlou.png`,
    imageAlt: "أملو باللوز 250 غ — تازارزيت بيو",
  },
  {
    id: "pistachio-amlou",
    nameAr: "أملو بالفستق",
    nameEn: "Pistachio Amlou",
    size: "250 غ",
    benefit: "فستق فاخر بلون طبيعي ونكهة راقية",
    imageSrc: `${IMG}/pistachio-amlou.png`,
    imageAlt: "أملو بالفستق 250 غ — تازارزيت بيو",
  },
  {
    id: "mixed-nuts-honey",
    nameAr: "مكسرات بالعسل",
    nameEn: "Mixed Nuts with Honey",
    size: "250 غ",
    benefit: "لوز وجوز وفستق وكاجو مع عسل ذهبي كثيف",
    imageSrc: `${IMG}/mixed-nuts.png`,
    imageAlt: "مكسرات بالعسل 250 غ — تازارزيت بيو",
  },
  {
    id: "argan-oil",
    nameAr: "زيت أركان مغربي",
    nameEn: "Argan Oil",
    size: "250 مل",
    benefit: "أركان بكر معصور على البارد للعناية اليومية",
    imageSrc: `${IMG}/argan-oil.png`,
    imageAlt: "زيت أركان 250 مل — تازارزيت بيو",
  },
];
