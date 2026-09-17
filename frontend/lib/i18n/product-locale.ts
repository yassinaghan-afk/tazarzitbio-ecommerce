import type { Language } from "@/lib/i18n/types";
import type { PublicProduct, PublicProductOffer } from "@/lib/products/types";

type L10n = { ar: string; fr: string; en: string };

function pick(text: L10n, locale: Language): string {
  if (locale === "fr") return text.fr;
  if (locale === "en") return text.en;
  return text.ar;
}

const PRODUCT_COPY: Record<
  string,
  {
    name: L10n;
    shortDescription: L10n;
    description: L10n;
    ingredients: L10n[];
    benefits: L10n[];
    usageSuggestions: L10n[];
    faq: { q: L10n; a: L10n }[];
  }
> = {
  "almond-amlou": {
    name: {
      ar: "أملو باللوز",
      fr: "Amlou aux amandes",
      en: "Almond Amlou",
    },
    shortDescription: {
      ar: "معجون لوز مطحون يدوياً مع عسل نقي وزيت أركان — طعم سوس الأصيل.",
      fr: "Pâte d'amandes moulue à la main avec miel pur et huile d'argan — le goût authentique du Souss.",
      en: "Hand-ground almond paste with pure honey and argan oil — authentic Souss taste.",
    },
    description: {
      ar: "أملو باللوز من تازارزيت بيو يُحضّر بطريقة تقليدية من لوز محلي مطحون وعسل طبيعي وزيت أركان بكر من سوس. قوام كريمي غني مناسب للفطور والضيافة، بدون مواد حافظة. متوفر بأحجام 250 غ و500 غ و750 غ مع توصيل لجميع مدن المغرب والدفع عند الاستلام.",
      fr: "L'Amlou aux amandes de Tazarzit Bio est préparé traditionnellement avec des amandes locales moulues, du miel naturel et de l'huile d'argan vierge du Souss. Texture crémeuse idéale au petit-déjeuner et pour recevoir, sans conservateurs. Formats 250 g, 500 g et 750 g — livraison partout au Maroc, paiement à la livraison.",
      en: "Tazarzit Bio almond amlou is traditionally made with ground local almonds, natural honey and virgin Souss argan oil. A rich creamy texture for breakfast and hosting, with no preservatives. Available in 250 g, 500 g and 750 g — nationwide Morocco delivery and cash on delivery.",
    },
    ingredients: [
      { ar: "لوز محلي", fr: "Amandes locales", en: "Local almonds" },
      { ar: "عسل طبيعي", fr: "Miel naturel", en: "Natural honey" },
      { ar: "زيت أركان بكر", fr: "Huile d'argan vierge", en: "Virgin argan oil" },
    ],
    benefits: [
      {
        ar: "طعم لوز غني وقومة كريمة",
        fr: "Goût riche d'amande et texture crémeuse",
        en: "Rich almond taste and creamy texture",
      },
      {
        ar: "مثالي لفطور العائلة",
        fr: "Idéal pour le petit-déjeuner en famille",
        en: "Perfect for family breakfast",
      },
      {
        ar: "بدون مواد حافظة أو إضافات",
        fr: "Sans conservateurs ni additifs",
        en: "No preservatives or additives",
      },
    ],
    usageSuggestions: [
      {
        ar: "على خبز البيت أو الملوي",
        fr: "Sur du pain maison ou msemen",
        en: "On homemade bread or msemen",
      },
      {
        ar: "مع الشاي المغربي والضيافة",
        fr: "Avec le thé marocain et pour recevoir",
        en: "With Moroccan tea and hosting",
      },
      {
        ar: "وجبة خفيفة على مائدة العائلة",
        fr: "En collation sur la table familiale",
        en: "As a family snack",
      },
    ],
    faq: [
      {
        q: {
          ar: "كم مدة الصلاحية؟",
          fr: "Quelle est la durée de conservation ?",
          en: "What is the shelf life?",
        },
        a: {
          ar: "6 أشهر في مكان بارد وجاف.",
          fr: "6 mois dans un endroit frais et sec.",
          en: "6 months in a cool, dry place.",
        },
      },
      {
        q: {
          ar: "هل يوجد سكر مضاف؟",
          fr: "Y a-t-il du sucre ajouté ?",
          en: "Is there added sugar?",
        },
        a: {
          ar: "لا، الحلاوة من العسل الطبيعي فقط.",
          fr: "Non, la douceur vient uniquement du miel naturel.",
          en: "No — sweetness comes only from natural honey.",
        },
      },
      {
        q: {
          ar: "كيف يتم الدفع والتوصيل؟",
          fr: "Comment se passent le paiement et la livraison ?",
          en: "How do payment and delivery work?",
        },
        a: {
          ar: "الدفع عند الاستلام لجميع المدن. نتصل بك لتأكيد العنوان قبل الشحن.",
          fr: "Paiement à la livraison partout au Maroc. Nous vous appelons pour confirmer l'adresse avant l'envoi.",
          en: "Cash on delivery nationwide. We call you to confirm the address before shipping.",
        },
      },
      {
        q: {
          ar: "ما الأحجام المتوفرة؟",
          fr: "Quels formats sont disponibles ?",
          en: "What sizes are available?",
        },
        a: {
          ar: "250 غ، 500 غ، و750 غ — اختر الحجم المناسب لعائلتك.",
          fr: "250 g, 500 g et 750 g — choisissez le format adapté à votre famille.",
          en: "250 g, 500 g and 750 g — choose the size that fits your family.",
        },
      },
    ],
  },
  "pistachio-amlou": {
    name: {
      ar: "أملو بالفستق",
      fr: "Amlou à la pistache",
      en: "Pistachio Amlou",
    },
    shortDescription: {
      ar: "فستق أخضر فاخر مع عسل وزيت أركان — نكهة راقية ولون طبيعي.",
      fr: "Pistaches vertes premium avec miel et huile d'argan — goût raffiné et couleur naturelle.",
      en: "Premium green pistachios with honey and argan oil — refined taste and natural color.",
    },
    description: {
      ar: "أملو بالفستق من تازارزيت بيو يجمع حبات الفستق الفاخرة مع عسل سوس وزيت أركان بكر. تحضير حرفي يحافظ على اللون الأخضر والنكهة الراقية، بدون مواد حافظة. مثالي لمن يبحث عن أملو فستق طبيعي للشراء أونلاين في المغرب مع الدفع عند الاستلام.",
      fr: "L'Amlou à la pistache de Tazarzit Bio allie pistaches premium, miel du Souss et huile d'argan vierge. Préparation artisanale qui préserve la couleur verte et le goût raffiné, sans conservateurs. Idéal pour acheter de l'amlou pistache authentique en ligne au Maroc avec paiement à la livraison.",
      en: "Tazarzit Bio pistachio amlou combines premium pistachios with Souss honey and virgin argan oil. Artisanal preparation that keeps the green color and refined taste, with no preservatives. Ideal if you want to buy authentic pistachio amlou online in Morocco with cash on delivery.",
    },
    ingredients: [
      { ar: "فستق طبيعي", fr: "Pistaches naturelles", en: "Natural pistachios" },
      { ar: "عسل طبيعي", fr: "Miel naturel", en: "Natural honey" },
      { ar: "زيت أركان بكر", fr: "Huile d'argan vierge", en: "Virgin argan oil" },
    ],
    benefits: [
      {
        ar: "نكهة فستق أصيلة ولون طبيعي",
        fr: "Goût authentique de pistache et couleur naturelle",
        en: "Authentic pistachio taste and natural color",
      },
      {
        ar: "تحضير حرفي بطيء",
        fr: "Préparation artisanale lente",
        en: "Slow artisanal preparation",
      },
      {
        ar: "مناسب للضيافة والهدايا العائلية",
        fr: "Parfait pour recevoir et offrir",
        en: "Great for hosting and gifting",
      },
    ],
    usageSuggestions: [
      {
        ar: "فطور الأحد مع العائلة",
        fr: "Petit-déjeuner du dimanche en famille",
        en: "Sunday breakfast with family",
      },
      {
        ar: "مع التمر والشاي",
        fr: "Avec des dattes et du thé",
        en: "With dates and tea",
      },
      {
        ar: "لضيافة الضيوف المغربية",
        fr: "Pour recevoir à la marocaine",
        en: "For Moroccan-style hospitality",
      },
    ],
    faq: [
      {
        q: {
          ar: "هل اللون الأخضر طبيعي؟",
          fr: "La couleur verte est-elle naturelle ?",
          en: "Is the green color natural?",
        },
        a: {
          ar: "نعم، من الفستق دون صبغات.",
          fr: "Oui, provenant des pistaches, sans colorants.",
          en: "Yes — from pistachios, with no dyes.",
        },
      },
      {
        q: {
          ar: "الدفع عند الاستلام؟",
          fr: "Paiement à la livraison ?",
          en: "Cash on delivery?",
        },
        a: {
          ar: "نعم، تدفع نقداً عند استلام الطلب فقط.",
          fr: "Oui, vous payez en espèces uniquement à la réception.",
          en: "Yes — you pay cash only on delivery.",
        },
      },
      {
        q: {
          ar: "كيف نخزّنه؟",
          fr: "Comment le conserver ?",
          en: "How should I store it?",
        },
        a: {
          ar: "في مكان بارد وجاف، بعيداً عن الشمس المباشرة.",
          fr: "Dans un endroit frais et sec, à l'abri du soleil.",
          en: "In a cool, dry place away from direct sunlight.",
        },
      },
    ],
  },
  "argan-oil": {
    name: {
      ar: "زيت أركان مغربي",
      fr: "Huile d'argan marocaine",
      en: "Moroccan Argan Oil",
    },
    shortDescription: {
      ar: "زيت أركان بكر معصور على البارد — للوجه والجسم والشعر.",
      fr: "Huile d'argan vierge pressée à froid — visage, corps et cheveux.",
      en: "Cold-pressed virgin argan oil — for face, body and hair.",
    },
    description: {
      ar: "زيت أركان تازارزيت بيو معصور على البارد من لوز الأركان المغربي الأصيل. غني بفيتامين E ومناسب للعناية اليومية بالبشرة والشعر والجسم. منتج طبيعي 100% من سوس، يمكن طلبه أونلاين مع توصيل لجميع المدن والدفع عند الاستلام.",
      fr: "L'huile d'argan Tazarzit Bio est pressée à froid à partir d'amandons d'argan marocains authentiques. Riche en vitamine E, idéale pour le soin quotidien de la peau, des cheveux et du corps. Produit 100% naturel du Souss — commande en ligne, livraison nationale et paiement à la livraison.",
      en: "Tazarzit Bio argan oil is cold-pressed from authentic Moroccan argan kernels. Rich in vitamin E and ideal for daily face, hair and body care. A 100% natural Souss product you can order online with nationwide delivery and cash on delivery.",
    },
    ingredients: [
      {
        ar: "زيت أركان بكر 100%",
        fr: "Huile d'argan vierge 100%",
        en: "100% virgin argan oil",
      },
    ],
    benefits: [
      {
        ar: "غني بفيتامين E والأحماض الدهنية",
        fr: "Riche en vitamine E et acides gras",
        en: "Rich in vitamin E and fatty acids",
      },
      {
        ar: "يرطب البشرة والشعر",
        fr: "Hydrate la peau et les cheveux",
        en: "Moisturizes skin and hair",
      },
      {
        ar: "منتج مغربي أصيل",
        fr: "Produit marocain authentique",
        en: "Authentic Moroccan product",
      },
    ],
    usageSuggestions: [
      {
        ar: "بضع قطرات على الوجه صباحاً ومساءً",
        fr: "Quelques gouttes sur le visage matin et soir",
        en: "A few drops on the face morning and evening",
      },
      {
        ar: "تدليك خفيف للشعر قبل الغسل",
        fr: "Léger massage des cheveux avant le shampoing",
        en: "Light hair massage before washing",
      },
      {
        ar: "ترطيب اليدين والجسم",
        fr: "Hydratation des mains et du corps",
        en: "Hand and body moisturizing",
      },
    ],
    faq: [
      {
        q: {
          ar: "هل هو صالح للأكل؟",
          fr: "Est-elle comestible ?",
          en: "Is it edible?",
        },
        a: {
          ar: "يُستخدم عادة للعناية؛ راجع بطاقة المنتج عند الشراء.",
          fr: "Principalement pour les soins ; vérifiez l'étiquette à l'achat.",
          en: "Primarily for care use; check the label when purchasing.",
        },
      },
      {
        q: {
          ar: "ما الأحجام المتوفرة؟",
          fr: "Quels formats sont disponibles ?",
          en: "What sizes are available?",
        },
        a: {
          ar: "250 مل و500 مل.",
          fr: "250 ml et 500 ml.",
          en: "250 ml and 500 ml.",
        },
      },
    ],
  },
  "mixed-nuts-honey": {
    name: {
      ar: "مكسرات بالعسل",
      fr: "Fruits secs au miel",
      en: "Honey Nuts Mix",
    },
    shortDescription: {
      ar: "لوز وجوز وفستق بعسل طبيعي كثيف — قرمشة وعسل ذهبي.",
      fr: "Amandes, noix et pistaches au miel naturel dense — croquant et miel doré.",
      en: "Almonds, walnuts and pistachios with dense natural honey — crunch and golden honey.",
    },
    description: {
      ar: "مكسرات بالعسل من تازارزيت بيو: لوز وجوز وفستق مختار يدوياً مع عسل طبيعي كثيف من سوس. بدون سكر مضاف — قرمشة وعسل ذهبي مثالي للضيافة والفطور. اطلب أونلاين مع توصيل لجميع مدن المغرب والدفع عند الاستلام.",
      fr: "Fruits secs au miel Tazarzit Bio : amandes, noix et pistaches sélectionnées à la main avec un miel naturel dense du Souss. Sans sucre ajouté — croquant et miel doré pour recevoir et le petit-déjeuner. Commande en ligne, livraison nationale, paiement à la livraison.",
      en: "Tazarzit Bio honey nuts: hand-selected almonds, walnuts and pistachios with dense natural Souss honey. No added sugar — crunch and golden honey for hosting and breakfast. Order online with nationwide Morocco delivery and cash on delivery.",
    },
    ingredients: [
      { ar: "لوز", fr: "Amandes", en: "Almonds" },
      { ar: "جوز", fr: "Noix", en: "Walnuts" },
      { ar: "فستق", fr: "Pistaches", en: "Pistachios" },
      { ar: "عسل طبيعي", fr: "Miel naturel", en: "Natural honey" },
    ],
    benefits: [
      {
        ar: "قرمشة مكسرات مع عسل كثيف",
        fr: "Croquant des fruits secs avec miel dense",
        en: "Crunchy nuts with dense honey",
      },
      {
        ar: "بدون سكر مضاف",
        fr: "Sans sucre ajouté",
        en: "No added sugar",
      },
      {
        ar: "مثالي للضيافة والعائلة",
        fr: "Parfait pour recevoir et la famille",
        en: "Perfect for hosting and family",
      },
    ],
    usageSuggestions: [
      {
        ar: "مع أتاي المغربي",
        fr: "Avec le thé à la menthe",
        en: "With mint tea",
      },
      {
        ar: "وجبة خفيفة بين الوجبات",
        fr: "En collation entre les repas",
        en: "As a snack between meals",
      },
      {
        ar: "على مائدة الضيافة",
        fr: "Sur la table d'accueil",
        en: "On the hospitality table",
      },
    ],
    faq: [
      {
        q: {
          ar: "مواد حافظة؟",
          fr: "Des conservateurs ?",
          en: "Any preservatives?",
        },
        a: {
          ar: "لا، العسل يحافظ على النضارة.",
          fr: "Non, le miel préserve la fraîcheur.",
          en: "No — honey helps preserve freshness.",
        },
      },
      {
        q: {
          ar: "هل التوصيل لكل المدن؟",
          fr: "Livraison dans toutes les villes ?",
          en: "Delivery to all cities?",
        },
        a: {
          ar: "نعم، لجميع مدن المغرب مع الدفع عند الاستلام.",
          fr: "Oui, partout au Maroc avec paiement à la livraison.",
          en: "Yes — nationwide Morocco with cash on delivery.",
        },
      },
    ],
  },
  "daghmous-honey": {
    name: {
      ar: "عسل الدغموس",
      fr: "Miel de Daghmous",
      en: "Daghmous Honey",
    },
    shortDescription: {
      ar: "عسل الدغموس الطبيعي من سوس — نكهة غنية ولون ذهبي أصيل.",
      fr: "Miel de Daghmous naturel du Souss — goût riche et couleur dorée authentique.",
      en: "Natural Daghmous honey from Souss — rich taste and authentic golden color.",
    },
    description: {
      ar: "عسل الدغموس من تازارزيت بيو يُجمع من مراعي سوس الطبيعية. عسل نقي بقوام كثيف ونكهة مميزة.",
      fr: "Le miel de Daghmous Tazarzit Bio est récolté dans les pâturages naturels du Souss. Un miel pur, dense et au goût distinctif.",
      en: "Tazarzit Bio Daghmous honey is harvested from natural Souss pastures. Pure, dense honey with a distinctive taste.",
    },
    ingredients: [
      {
        ar: "عسل الدغموس الطبيعي 100%",
        fr: "Miel de Daghmous naturel 100%",
        en: "100% natural Daghmous honey",
      },
    ],
    benefits: [
      {
        ar: "عسل نقي من مراعي سوس",
        fr: "Miel pur des pâturages du Souss",
        en: "Pure honey from Souss pastures",
      },
      {
        ar: "قوام كثيف ولون ذهبي",
        fr: "Texture dense et couleur dorée",
        en: "Dense texture and golden color",
      },
      {
        ar: "مثالي للفطور والشاي",
        fr: "Idéal au petit-déjeuner et avec le thé",
        en: "Ideal for breakfast and tea",
      },
    ],
    usageSuggestions: [
      {
        ar: "مع الملوي والخبز البيت",
        fr: "Avec msemen et pain maison",
        en: "With msemen and homemade bread",
      },
      {
        ar: "في الشاي المغربي",
        fr: "Dans le thé marocain",
        en: "In Moroccan tea",
      },
      {
        ar: "على مائدة الضيافة",
        fr: "Sur la table d'accueil",
        en: "On the hospitality table",
      },
    ],
    faq: [
      {
        q: {
          ar: "هل العسل طبيعي 100%؟",
          fr: "Le miel est-il 100% naturel ?",
          en: "Is the honey 100% natural?",
        },
        a: {
          ar: "نعم، عسل نقي دون إضافات.",
          fr: "Oui, miel pur sans additifs.",
          en: "Yes — pure honey with no additives.",
        },
      },
      {
        q: {
          ar: "ما الأحجام المتوفرة؟",
          fr: "Quels formats sont disponibles ?",
          en: "What sizes are available?",
        },
        a: {
          ar: "250 غ، 500 غ، و750 غ.",
          fr: "250 g, 500 g et 750 g.",
          en: "250 g, 500 g and 750 g.",
        },
      },
      {
        q: {
          ar: "الدفع عند الاستلام؟",
          fr: "Paiement à la livraison ?",
          en: "Cash on delivery?",
        },
        a: {
          ar: "نعم، لجميع مدن المغرب.",
          fr: "Oui, partout au Maroc.",
          en: "Yes — nationwide in Morocco.",
        },
      },
    ],
  },
  "saatar-honey": {
    name: {
      ar: "عسل الزعتر",
      fr: "Miel de thym",
      en: "Thyme Honey",
    },
    shortDescription: {
      ar: "عسل الزعتر الطبيعي — نكهة عشبية مميزة من سوس.",
      fr: "Miel de thym naturel — goût herbacé distinctif du Souss.",
      en: "Natural thyme honey — distinctive herbal taste from Souss.",
    },
    description: {
      ar: "عسل الزعتر من تازارزيت بيو بنكهة عشبية أصيلة وقوام طبيعي. مناسب للفطور والعناية اليومية.",
      fr: "Le miel de thym Tazarzit Bio offre un goût herbacé authentique et une texture naturelle. Parfait au petit-déjeuner et au quotidien.",
      en: "Tazarzit Bio thyme honey has an authentic herbal taste and natural texture. Great for breakfast and daily use.",
    },
    ingredients: [
      {
        ar: "عسل الزعتر الطبيعي 100%",
        fr: "Miel de thym naturel 100%",
        en: "100% natural thyme honey",
      },
    ],
    benefits: [
      {
        ar: "نكهة زعتر مميزة",
        fr: "Goût caractéristique de thym",
        en: "Distinctive thyme flavor",
      },
      {
        ar: "عسل نقي طبيعي",
        fr: "Miel pur et naturel",
        en: "Pure natural honey",
      },
      {
        ar: "مثالي للشاي والفطور",
        fr: "Idéal pour le thé et le petit-déjeuner",
        en: "Ideal for tea and breakfast",
      },
    ],
    usageSuggestions: [
      {
        ar: "مع الشاي بالنعناع",
        fr: "Avec le thé à la menthe",
        en: "With mint tea",
      },
      {
        ar: "على الخبز والزبدة",
        fr: "Sur du pain beurré",
        en: "On buttered bread",
      },
      {
        ar: "في وصفات البيت",
        fr: "Dans vos recettes maison",
        en: "In homemade recipes",
      },
    ],
    faq: [
      {
        q: {
          ar: "ما الفرق عن عسل الدغموس؟",
          fr: "Quelle différence avec le miel de Daghmous ?",
          en: "How is it different from Daghmous honey?",
        },
        a: {
          ar: "نكهة الزعتر أعشبية أكثر، بينما الدغموس أغنى وأكثف.",
          fr: "Le thym est plus herbacé ; le Daghmous est plus riche et dense.",
          en: "Thyme is more herbal; Daghmous is richer and denser.",
        },
      },
    ],
  },
  "eucalyptus-honey": {
    name: {
      ar: "عسل الأوكالبتوس",
      fr: "Miel d'eucalyptus",
      en: "Eucalyptus Honey",
    },
    shortDescription: {
      ar: "عسل الأوكالبتوس الطبيعي — نكهة منعشة ولمسة عطرية.",
      fr: "Miel d'eucalyptus naturel — goût frais et note aromatique.",
      en: "Natural eucalyptus honey — fresh taste with an aromatic note.",
    },
    description: {
      ar: "عسل الأوكالبتوس من تازارزيت بيو بطعم منعش ورائحة مميزة. اختيار ممتاز للشاي والفطور.",
      fr: "Le miel d'eucalyptus Tazarzit Bio a un goût frais et un parfum distinctif. Excellent choix pour le thé et le petit-déjeuner.",
      en: "Tazarzit Bio eucalyptus honey has a fresh taste and distinctive aroma. Excellent for tea and breakfast.",
    },
    ingredients: [
      {
        ar: "عسل الأوكالبتوس الطبيعي 100%",
        fr: "Miel d'eucalyptus naturel 100%",
        en: "100% natural eucalyptus honey",
      },
    ],
    benefits: [
      {
        ar: "نكهة منعشة مميزة",
        fr: "Goût frais caractéristique",
        en: "Distinctive fresh taste",
      },
      {
        ar: "عسل نقي بدون إضافات",
        fr: "Miel pur sans additifs",
        en: "Pure honey with no additives",
      },
      {
        ar: "مناسب للشاي والعائلة",
        fr: "Parfait pour le thé et la famille",
        en: "Great for tea and family use",
      },
    ],
    usageSuggestions: [
      {
        ar: "في الشاي الدافئ",
        fr: "Dans le thé chaud",
        en: "In hot tea",
      },
      {
        ar: "مع الزبادي أو الخبز",
        fr: "Avec du yaourt ou du pain",
        en: "With yogurt or bread",
      },
      {
        ar: "للضيافة اليومية",
        fr: "Pour le quotidien et recevoir",
        en: "For daily use and hosting",
      },
    ],
    faq: [
      {
        q: {
          ar: "هل يناسب الأطفال؟",
          fr: "Convient-il aux enfants ?",
          en: "Is it suitable for children?",
        },
        a: {
          ar: "عسل طبيعي؛ استشر الطبيب للأطفال دون سنة.",
          fr: "Miel naturel ; demandez conseil médical pour les moins d'un an.",
          en: "Natural honey; seek medical advice for infants under one year.",
        },
      },
    ],
  },
  "cocoa-amlou": {
    name: {
      ar: "أملو الكاوكاو",
      fr: "Amlou cacao",
      en: "Cocoa Amlou",
    },
    shortDescription: {
      ar: "أملو بالكاكاو واللوز — مذاق شوكولاتي طبيعي للعائلة.",
      fr: "Amlou cacao et amandes — goût chocolaté naturel pour la famille.",
      en: "Cocoa and almond amlou — natural chocolate taste for the family.",
    },
    description: {
      ar: "أملو الكاوكاو يمزج اللوز والكاكاو الطبيعي مع عسل وزيت أركان. خيار لذيذ للفطور والوجبات الخفيفة.",
      fr: "L'Amlou cacao mélange amandes et cacao naturel avec miel et huile d'argan. Un choix gourmand pour le petit-déjeuner et les collations.",
      en: "Cocoa amlou blends almonds and natural cocoa with honey and argan oil. A tasty choice for breakfast and snacks.",
    },
    ingredients: [
      { ar: "لوز", fr: "Amandes", en: "Almonds" },
      { ar: "كاكاو طبيعي", fr: "Cacao naturel", en: "Natural cocoa" },
      { ar: "عسل طبيعي", fr: "Miel naturel", en: "Natural honey" },
      { ar: "زيت أركان", fr: "Huile d'argan", en: "Argan oil" },
    ],
    benefits: [
      {
        ar: "مذاق شوكولاتي طبيعي",
        fr: "Goût chocolaté naturel",
        en: "Natural chocolate taste",
      },
      {
        ar: "بدون مواد حافظة",
        fr: "Sans conservateurs",
        en: "No preservatives",
      },
      {
        ar: "يحبه الكبار والصغار",
        fr: "Apprécié des grands et des petits",
        en: "Loved by kids and adults",
      },
    ],
    usageSuggestions: [
      {
        ar: "على الخبز للفطور",
        fr: "Sur du pain au petit-déjeuner",
        en: "On bread for breakfast",
      },
      {
        ar: "وجبة خفيفة بعد المدرسة",
        fr: "Collation après l'école",
        en: "After-school snack",
      },
      {
        ar: "مع الحليب الدافئ",
        fr: "Avec du lait chaud",
        en: "With warm milk",
      },
    ],
    faq: [
      {
        q: {
          ar: "هل فيه شوكولا صناعية؟",
          fr: "Contient-il du chocolat industriel ?",
          en: "Does it contain industrial chocolate?",
        },
        a: {
          ar: "لا، كاكاو طبيعي ضمن التركيبة التقليدية.",
          fr: "Non, cacao naturel dans une recette traditionnelle.",
          en: "No — natural cocoa in a traditional recipe.",
        },
      },
    ],
  },
  "amlou-royal": {
    name: {
      ar: "أملو ملكي",
      fr: "Amlou Royal",
      en: "Amlou Royal",
    },
    shortDescription: {
      ar: "خليط فاخر من المكسرات المختارة وزيت أركان — منتوج مغربي طبيعي 100%.",
      fr: "Mélange premium de fruits à coque sélectionnés et d'huile d'argan — produit marocain 100% naturel.",
      en: "Premium blend of selected nuts and argan oil — 100% natural Moroccan product.",
    },
    description: {
      ar: "أملو ملكي من تازارزيت بيو: خليط فاخر من المكسرات المختارة وزيت أركان، محضّر بدون مواد حافظة. قوام غني وكثيف مثالي للفطور والضيافة. الوزن الصافي للقنينة 500 غ — متوفر بعروض قنينة واحدة أو أكثر مع توصيل مجاني والدفع عند الاستلام.",
      fr: "Amlou Royal de Tazarzit Bio : mélange premium de fruits à coque sélectionnés et d'huile d'argan, sans conservateurs. Texture riche idéale pour le petit-déjeuner et pour recevoir. Poids net 500 g par pot — packs 1, 2 ou 3 pots, livraison gratuite et paiement à la livraison.",
      en: "Amlou Royal by Tazarzit Bio: a premium blend of selected nuts and argan oil, made without preservatives. Rich texture perfect for breakfast and hosting. Net weight 500 g per jar — available in 1, 2 or 3-jar packs with free shipping and cash on delivery.",
    },
    ingredients: [
      { ar: "لوز", fr: "Amandes", en: "Almonds" },
      { ar: "فستق", fr: "Pistaches", en: "Pistachios" },
      { ar: "بندق", fr: "Noisettes", en: "Hazelnuts" },
      { ar: "جوز (كركاع)", fr: "Noix (cerneaux)", en: "Walnuts" },
      { ar: "كاجو", fr: "Noix de cajou", en: "Cashews" },
      { ar: "زيت أركان", fr: "Huile d'argan", en: "Argan oil" },
      { ar: "بذور اليقطين", fr: "Graines de courge", en: "Pumpkin seeds" },
      { ar: "بذور السمسم", fr: "Graines de sésame", en: "Sesame seeds" },
      { ar: "حبوب لقاح النحل", fr: "Pollen d'abeille", en: "Bee pollen" },
    ],
    benefits: [
      {
        ar: "خليط فاخر من 8 مكسرات وبذور مختارة",
        fr: "Mélange premium de 8 fruits à coque et graines sélectionnés",
        en: "Premium blend of 8 selected nuts and seeds",
      },
      {
        ar: "زيت أركان مغربي بكر",
        fr: "Huile d'argan marocaine vierge",
        en: "Virgin Moroccan argan oil",
      },
      {
        ar: "100% طبيعي — بدون مواد حافظة",
        fr: "100% naturel — sans conservateurs",
        en: "100% natural — no preservatives",
      },
      {
        ar: "حبوب لقاح النحل لتغذية أغنى",
        fr: "Pollen d'abeille pour une nutrition plus riche",
        en: "Bee pollen for richer nutrition",
      },
      {
        ar: "منتوج مغربي أصيل من تازارزيت بيو",
        fr: "Produit marocain authentique de Tazarzit Bio",
        en: "Authentic Moroccan product by Tazarzit Bio",
      },
    ],
    usageSuggestions: [
      {
        ar: "على خبز البيت أو الملوي في الفطور",
        fr: "Sur du pain maison ou msemen au petit-déjeuner",
        en: "On homemade bread or msemen for breakfast",
      },
      {
        ar: "مع الشاي المغربي والضيافة",
        fr: "Avec le thé marocain et pour recevoir",
        en: "With Moroccan tea and hosting",
      },
      {
        ar: "وجبة خفيفة غنية بالطاقة خلال اليوم",
        fr: "En collation énergisante dans la journée",
        en: "As an energizing snack during the day",
      },
      {
        ar: "يُحفظ في مكان جاف وبارد بعد الفتح",
        fr: "Conserver au sec et au frais après ouverture",
        en: "Store in a cool, dry place after opening",
      },
    ],
    faq: [
      {
        q: {
          ar: "ما هي مكونات أملو ملكي؟",
          fr: "Quels sont les ingrédients de l'Amlou Royal ?",
          en: "What are the ingredients of Amlou Royal?",
        },
        a: {
          ar: "لوز، فستق، بندق، جوز (كركاع)، كاجو، زيت أركان، بذور اليقطين، بذور السمسم، وحبوب لقاح النحل — كما هو مكتوب على العلبة.",
          fr: "Amandes, pistaches, noisettes, noix, noix de cajou, huile d'argan, graines de courge, graines de sésame et pollen d'abeille — comme sur l'étiquette.",
          en: "Almonds, pistachios, hazelnuts, walnuts, cashews, argan oil, pumpkin seeds, sesame seeds and bee pollen — as listed on the label.",
        },
      },
      {
        q: {
          ar: "هل يحتوي على مواد حافظة؟",
          fr: "Contient-il des conservateurs ?",
          en: "Does it contain preservatives?",
        },
        a: {
          ar: "لا. المنتج 100% طبيعي وبدون مواد حافظة.",
          fr: "Non. Le produit est 100% naturel et sans conservateurs.",
          en: "No. The product is 100% natural with no preservatives.",
        },
      },
      {
        q: {
          ar: "ما هو الوزن الصافي؟",
          fr: "Quel est le poids net ?",
          en: "What is the net weight?",
        },
        a: {
          ar: "كل قنينة 500 غ. عروض القنينتين والثلاث قنينات تعادل 1 كغ و1.5 كغ.",
          fr: "Chaque pot pèse 500 g. Les packs 2 et 3 pots équivalent à 1 kg et 1,5 kg.",
          en: "Each jar is 500 g. Two- and three-jar packs equal 1 kg and 1.5 kg.",
        },
      },
      {
        q: {
          ar: "كيف أحفظه؟",
          fr: "Comment le conserver ?",
          en: "How should I store it?",
        },
        a: {
          ar: "يُحفظ في مكان جاف وبارد، بعيداً عن الحرارة والرطوبة.",
          fr: "Conserver dans un endroit sec et frais, à l'abri de la chaleur et de l'humidité.",
          en: "Keep in a cool, dry place, away from heat and humidity.",
        },
      },
      {
        q: {
          ar: "كيف يتم الدفع والتوصيل؟",
          fr: "Comment se passent le paiement et la livraison ?",
          en: "How do payment and delivery work?",
        },
        a: {
          ar: "الدفع عند الاستلام لجميع المدن. التوصيل مجاناً لجميع عروض أملو ملكي.",
          fr: "Paiement à la livraison dans toutes les villes. Livraison gratuite sur toutes les offres Amlou Royal.",
          en: "Cash on delivery nationwide. Free shipping on all Amlou Royal offers.",
        },
      },
    ],
  },
};

const HINTS: Record<string, L10n> = {
  "الأكثر طلباً": {
    ar: "الأكثر طلباً",
    fr: "Le plus demandé",
    en: "Most popular",
  },
  "قيمة عائلية": {
    ar: "قيمة عائلية",
    fr: "Valeur familiale",
    en: "Family value",
  },
  "عناية وتجربة أولى": {
    ar: "عناية وتجربة أولى",
    fr: "Pour découvrir",
    en: "Try it first",
  },
  "اختيار الأكثر طلباً": {
    ar: "اختيار الأكثر طلباً",
    fr: "Le plus demandé",
    en: "Most popular choice",
  },
  "أفضل قيمة": {
    ar: "أفضل قيمة",
    fr: "Meilleure valeur",
    en: "Best value",
  },
  "قنينة واحدة": {
    ar: "قنينة واحدة",
    fr: "1 pot",
    en: "1 jar",
  },
  قنينتين: {
    ar: "قنينتين",
    fr: "2 pots",
    en: "2 jars",
  },
  "3 قنينات": {
    ar: "3 قنينات",
    fr: "3 pots",
    en: "3 jars",
  },
};

/** Convert Arabic weight/volume units and known offer labels for FR/EN. */
export function localizeWeightLabel(raw: string, locale: Language): string {
  if (!raw) return raw;
  const labeled = HINTS[raw];
  if (labeled) return pick(labeled, locale);
  if (locale === "ar") return raw;
  // Replace multi-char units (كغ) before single غ — otherwise "كغ" becomes "ك g".
  return raw
    .replace(/\u00a0/g, " ")
    .replace(/\s*كغ\s*/g, " kg")
    .replace(/\s*مل\s*/g, " ml")
    .replace(/\s*غ\s*/g, " g")
    .replace(/\s*—\s*/g, " — ")
    .replace(/\s+/g, " ")
    .trim();
}

export function localizeProductName(
  product: Pick<PublicProduct, "slug" | "id" | "nameAr">,
  locale: Language,
): string {
  const copy = PRODUCT_COPY[product.slug] ?? PRODUCT_COPY[product.id];
  if (!copy) return product.nameAr;
  return pick(copy.name, locale);
}

export function localizeProductShortDescription(
  product: Pick<PublicProduct, "slug" | "id" | "shortDescription">,
  locale: Language,
): string {
  const copy = PRODUCT_COPY[product.slug] ?? PRODUCT_COPY[product.id];
  if (!copy) return product.shortDescription;
  return pick(copy.shortDescription, locale);
}

export function localizeProductDescription(
  product: Pick<PublicProduct, "slug" | "id" | "description">,
  locale: Language,
): string {
  const copy = PRODUCT_COPY[product.slug] ?? PRODUCT_COPY[product.id];
  if (!copy) return product.description;
  return pick(copy.description, locale);
}

export function localizeProductList(
  items: string[],
  slug: string,
  locale: Language,
  field: "ingredients" | "benefits" | "usageSuggestions",
): string[] {
  if (locale === "ar") return items;
  const copy = PRODUCT_COPY[slug];
  if (!copy || copy[field].length === 0) return items;
  return copy[field].map((row) => pick(row, locale));
}

export function localizeProductFaq(
  faq: { q: string; a: string }[],
  slug: string,
  locale: Language,
): { q: string; a: string }[] {
  if (locale === "ar") return faq;
  const copy = PRODUCT_COPY[slug];
  if (!copy || copy.faq.length === 0) return faq;
  return copy.faq.map((row) => ({
    q: pick(row.q, locale),
    a: pick(row.a, locale),
  }));
}

export function localizeOfferHint(
  hint: string | undefined,
  locale: Language,
): string | undefined {
  if (!hint) return undefined;
  const mapped = HINTS[hint];
  if (mapped) return pick(mapped, locale);
  return localizeWeightLabel(hint, locale);
}

export function localizeOfferLabel(
  offer: PublicProductOffer,
  locale: Language,
): string {
  const base = localizeWeightLabel(offer.weight || offer.label, locale);
  const hint = localizeOfferHint(offer.hint, locale);
  return hint ? `${base} · ${hint}` : base;
}

/** Resolve a cart/order line name by slug when possible. */
export function localizeLineName(
  slug: string | undefined,
  fallbackNameAr: string,
  locale: Language,
): string {
  if (!slug) return fallbackNameAr;
  const copy = PRODUCT_COPY[slug];
  if (!copy) return fallbackNameAr;
  return pick(copy.name, locale);
}
