import { extraAr, extraEn, extraFr } from "./extra-messages";
import {
  packExtraAr,
  packExtraEn,
  packExtraFr,
} from "./extra-messages-pack";
import type { Language } from "./types";

const arMessages = {
  "lang.select": "اختر اللغة",
  "lang.ar": "العربية",
  "lang.fr": "Français",
  "lang.en": "English",

  "nav.products": "منتجاتنا",
  "nav.bundles": "عروض العائلة",
  "nav.story": "قصتنا",
  "nav.reviews": "آراء العملاء",
  "nav.faq": "الأسئلة الشائعة",
  "nav.shopNow": "تسوق الآن",
  "nav.cart": "سلة التسوق",
  "nav.menuOpen": "افتح القائمة",
  "nav.menuClose": "أغلق القائمة",
  "nav.main": "التنقل الرئيسي",

  "hero.homeAria": "الصفحة الرئيسية",
  "hero.badge": "من قلب سوس · حرفية مغربية أصيلة",
  "hero.title1": "طعم سوس",
  "hero.title2": "في أبهى صورة",
  "hero.subtitle":
    "أملو، زيت أركان، وعسل نقي — منتجات طبيعية 100% تحمل دفء المغرب وفخامة الحرف اليدوية إلى مائدتك.",
  "hero.discover": "اكتشف المجموعة",
  "hero.ourStory": "قصتنا",
  "hero.trustNatural": "طبيعي 100%",
  "hero.trustCod": "الدفع عند الاستلام",
  "hero.trustRating": "4.9 تقييم العملاء",
  "hero.clients": "+2000 عميل",
  "hero.clientsSub": "يثقون بجودتنا",
  "hero.familyPack": "باقة عائلية — قيمة ممتازة",

  "cta.journey": "ابدأ رحلتك مع سوس",
  "cta.title1": "جرّب الطبيعة",
  "cta.title2": "كما يجب أن تكون",
  "cta.subtitle":
    "أكثر من ٢٠٠٠ عميل اختاروا تازارزيت بيو. اطلب الآن — الدفع عند الاستلام، توصيل لجميع مدن المغرب، وضمان جودة في كل عبوة.",
  "cta.orderNow": "اطلب الآن",
  "cta.browse": "تصفح المنتجات",
  "cta.trust1": "لا دفع مسبق",
  "cta.trust2": "توصيل سريع",
  "cta.trust3": "طبيعي 100%",
  "cta.trust4": "من قلب سوس",
  "cta.trust5": "ضمان الجودة",

  "bestSellers.label": "منتجاتنا",
  "bestSellers.title": "عسل وأملو من قلب سوس",
  "bestSellers.desc":
    "جودة فاخرة، تقييمات حقيقية، والدفع عند الاستلام — اختر فئتك واطلب الآن.",
  "bestSellers.viewAll": "عرض الكل",
  "bestSellers.catAll": "الكل",
  "bestSellers.catHoney": "عسل",
  "bestSellers.catAmlou": "أملو",
  "bestSellers.empty": "لا توجد منتجات في هذه الفئة حالياً.",
  "bestSellers.footer": "جميع الأسعار بالدرهم المغربي · الدفع عند الاستلام في كل الطلبات",

  "productsPage.title": "منتجات طبيعية فاخرة من قلب سوس",
  "productsPage.subtitle":
    "أملو، عسل، زيت أركان ومكسرات مختارة بعناية — جودة طبيعية، توصيل سريع، والدفع عند الاستلام",

  "common.subtotal": "المجموع الفرعي",
  "common.total": "الإجمالي",
  "common.shipping": "التوصيل",
  "common.free": "مجاني",
  "common.freeShipping": "توصيل مجاني",
  "common.shippingFee": "رسوم التوصيل",
  "common.currency": "د.م.",
  "common.from": "ابتداءً من",
  "common.cod": "الدفع عند الاستلام",
  "common.codShort": "بدون دفع مسبق",

  "cart.title": "سلة التسوق",
  "cart.empty": "سلتك فارغة",
  "cart.emptySub": "اكتشف منتجاتنا الطبيعية من سوس",
  "cart.shopProducts": "تسوق المنتجات",
  "cart.checkout": "إتمام الطلب (COD)",
  "cart.codNote": "الدفع عند الاستلام — بدون دفع مسبق",
  "cart.secureNote":
    "طلبك آمن — نتصل بك لتأكيد العنوان قبل الشحن. الدفع نقداً عند الاستلام فقط.",
  "cart.decrease": "تقليل الكمية",
  "cart.increase": "زيادة الكمية",
  "cart.remove": "حذف",
  "cart.honeyTitle": "أكمل طلبك بعسل سوس",
  "cart.honeySub": "أنواع مختلفة — اختر 250غ أو 500غ أو 750غ",

  "checkout.reviewTitle": "مراجعة الطلب",
  "checkout.reviewSub": "الخطوة 1 من 2",
  "checkout.detailsTitle": "بيانات التوصيل",
  "checkout.detailsSub": "الخطوة 2 من 2",
  "checkout.complete": "إتمام الطلب",
  "checkout.submitting": "جاري الإرسال...",
  "checkout.confirm": "تأكيد الطلب - الدفع عند الاستلام",
  "checkout.back": "رجوع لمراجعة السلة",
  "checkout.yourProducts": "منتجاتك",
  "checkout.emptyCart": "سلتك فارغة — أضف منتجاً للمتابعة",
  "checkout.reviewHint":
    "يمكنك إضافة منتجات مقترحة ثم الضغط على «إتمام الطلب» لإدخال بياناتك. الدفع عند الاستلام فقط.",
  "checkout.detailsHint": "أدخل بياناتك — سيتصل بك فريقنا لتأكيد الطلب قبل الشحن.",
  "checkout.fullName": "الاسم الكامل *",
  "checkout.phone": "رقم الهاتف *",
  "checkout.address": "العنوان الكامل *",
  "checkout.placeholderName": "مثال: محمد العلمي",
  "checkout.placeholderPhone": "06 XX XX XX XX",
  "checkout.placeholderAddress": "المدينة، الحي، الشارع، رقم المنزل...",
  "checkout.phoneHint": "أرقام مغربية فقط (06 أو 07)",

  "validation.fullNameRequired": "الاسم الكامل مطلوب",
  "validation.fullNameShort": "أدخل اسماً كاملاً (3 أحرف على الأقل)",
  "validation.phoneRequired": "رقم الهاتف مطلوب",
  "validation.phoneInvalid": "أدخل رقم هاتف مغربي صحيح (06 أو 07)",
  "validation.addressRequired": "العنوان الكامل مطلوب",
  "validation.addressShort": "أدخل عنواناً كاملاً (المدينة، الحي، الشارع)",

  "shipping.progressAria": "التقدم نحو التوصيل المجاني",
  "shipping.remaining": "باقي",
  "shipping.forFree": "للتوصيل المجاني",
  "shipping.marketing":
    "أضف منتجات بقيمة أعلى للاستفادة من التوصيل المجاني عند بلوغ الحد الأدنى.",

  "thankYou.blessing": "بارك الله فيك",
  "thankYou.title": "شكراً من قلب سوس",
  "thankYou.subtitleBefore": "تم استلام طلبك بنجاح.",
  "thankYou.subtitleAfter":
    "— سيتصل بك فريق تازارزيت بيو خلال ساعات قليلة لتأكيد الطلب والعنوان قبل الشحن.",
  "thankYou.loading": "جاري تحميل تفاصيل طلبك...",
  "thankYou.notFound":
    "لم نعثر على تفاصيل الطلب في هذا المتصفح. إذا أكملت الطلب للتو، تحقق من رسائلك — أو تواصل معنا عبر واتساب.",
  "thankYou.shopMore": "تسوق المنتجات",
  "thankYou.shopAgain": "تسوق أكثر",
  "thankYou.home": "العودة للرئيسية",
  "thankYou.recommended": "قد يعجبك أيضاً",
  "thankYou.recommendedSub":
    "اطلب منتجاً جديداً — يفتح الدفع مباشرة مع المنتج المختار",
  "thankYou.summary": "ملخص المنتجات",
  "thankYou.quantity": "×",

  "catalog.orderNow": "اطلب الآن",
  "catalog.addToCart": "أضف للسلة",
  "catalog.viewDetails": "عرض التفاصيل",

  "honey.upsellLabel": "مقترحات العسل",
  "honey.defaultTitle": "عسل طبيعي — أضف إلى طلبك",
  "honey.defaultSub": "ثلاثة أنواع من سوس — اختر الحجم وأضف بضغطة واحدة",
  "honey.addToOrder": "أضف إلى الطلب",
  "honey.pickSize": "اختر الحجم",

  "product.quantity": "الكمية",
  "product.orderNow": "اطلب الآن",
  "product.addToCart": "أضف للسلة",
  "product.decreaseQty": "تقليل الكمية",
  "product.increaseQty": "زيادة الكمية",
  "product.trustCod": "الدفع عند الاستلام",
  "product.trustDelivery": "توصيل لجميع المدن",
  "product.trustCall": "فريقنا يتصل بك لتأكيد الطلب",
  "product.trustNatural": "منتجات طبيعية من قلب سوس",
  "product.related": "منتجات ذات صلة",

  "badge.bestseller": "الأكثر مبيعاً",
  "badge.new": "جديد",
  "badge.natural": "طبيعي 100%",
  "badge.limited": "عرض محدود",

  "footer.shop": "تسوق",
  "footer.info": "معلومات",
  "footer.contact": "تواصل معنا",
  "footer.gifts": "علب الهدايا والعروض العائلية →",
  "footer.about": "من نحن",
  "footer.delivery": "سياسة التوصيل",
  "footer.returns": "سياسة الإرجاع",
  "footer.codBadge": "الدفع عند الاستلام · COD",
  "footer.tagline":
    "منتجات مغربية طبيعية فاخرة — أملو، زيت أركان، عسل، ومكسرات مختارة من سوس. الدفع عند الاستلام في جميع أنحاء المغرب.",
  "footer.supportTitle": "ساعات الدعم",
  "footer.supportHours": "الإثنين – السبت · ٩ص – ٨م",
  "footer.rights": "جميع الحقوق محفوظة",
  ...extraAr,
  ...packExtraAr,
} as const;

export type TranslationKey =
  | keyof typeof arMessages
  | keyof typeof extraAr
  | keyof typeof packExtraAr;

const fr: Record<TranslationKey, string> = {
  "lang.select": "Choisir la langue",
  "lang.ar": "العربية",
  "lang.fr": "Français",
  "lang.en": "English",

  "nav.products": "Nos produits",
  "nav.bundles": "Offres famille",
  "nav.story": "Notre histoire",
  "nav.reviews": "Avis clients",
  "nav.faq": "FAQ",
  "nav.shopNow": "Acheter",
  "nav.cart": "Panier",
  "nav.menuOpen": "Ouvrir le menu",
  "nav.menuClose": "Fermer le menu",
  "nav.main": "Navigation principale",

  "hero.homeAria": "Page d'accueil",
  "hero.badge": "Du cœur du Souss · Artisanat marocain authentique",
  "hero.title1": "Le goût du Souss",
  "hero.title2": "dans toute sa splendeur",
  "hero.subtitle":
    "Amlou, huile d'argan et miel pur — 100 % naturel, la chaleur du Maroc et l'artisanat d'exception à votre table.",
  "hero.discover": "Découvrir la collection",
  "hero.ourStory": "Notre histoire",
  "hero.trustNatural": "100 % naturel",
  "hero.trustCod": "Paiement à la livraison",
  "hero.trustRating": "Note clients 4,9",
  "hero.clients": "+2000 clients",
  "hero.clientsSub": "nous font confiance",
  "hero.familyPack": "Pack famille — excellent rapport qualité-prix",

  "cta.journey": "Commencez votre voyage au Souss",
  "cta.title1": "Goûtez la nature",
  "cta.title2": "comme elle doit l'être",
  "cta.subtitle":
    "Plus de 2000 clients ont choisi Tazarzit Bio. Commandez — paiement à la livraison, livraison dans tout le Maroc, qualité garantie.",
  "cta.orderNow": "Commander",
  "cta.browse": "Voir les produits",
  "cta.trust1": "Sans paiement anticipé",
  "cta.trust2": "Livraison rapide",
  "cta.trust3": "100 % naturel",
  "cta.trust4": "Du cœur du Souss",
  "cta.trust5": "Qualité garantie",

  "bestSellers.label": "Nos produits",
  "bestSellers.title": "Miel et amlou du Souss",
  "bestSellers.desc":
    "Qualité premium, avis authentiques, paiement à la livraison — choisissez votre catégorie.",
  "bestSellers.viewAll": "Tout voir",
  "bestSellers.catAll": "Tout",
  "bestSellers.catHoney": "Miel",
  "bestSellers.catAmlou": "Amlou",
  "bestSellers.empty": "Aucun produit dans cette catégorie pour le moment.",
  "bestSellers.footer":
    "Tous les prix en dirhams · Paiement à la livraison sur chaque commande",

  "productsPage.title": "Produits naturels premium du Souss",
  "productsPage.subtitle":
    "Amlou, miel, huile d'argan et fruits secs sélectionnés — qualité naturelle, livraison rapide, paiement à la livraison",

  "common.subtotal": "Sous-total",
  "common.total": "Total",
  "common.shipping": "Livraison",
  "common.free": "Gratuit",
  "common.freeShipping": "Livraison gratuite",
  "common.shippingFee": "Frais de livraison",
  "common.currency": "MAD",
  "common.from": "À partir de",
  "common.cod": "Paiement à la livraison",
  "common.codShort": "Sans paiement anticipé",

  "cart.title": "Panier",
  "cart.empty": "Votre panier est vide",
  "cart.emptySub": "Découvrez nos produits naturels du Souss",
  "cart.shopProducts": "Voir les produits",
  "cart.checkout": "Finaliser (COD)",
  "cart.codNote": "Paiement à la livraison — sans avance",
  "cart.secureNote":
    "Commande sécurisée — nous vous appelons pour confirmer l'adresse. Paiement en espèces à la livraison uniquement.",
  "cart.decrease": "Diminuer la quantité",
  "cart.increase": "Augmenter la quantité",
  "cart.remove": "Supprimer",
  "cart.honeyTitle": "Complétez avec du miel du Souss",
  "cart.honeySub": "Plusieurs variétés — 250 g, 500 g ou 750 g",

  "checkout.reviewTitle": "Vérifier la commande",
  "checkout.reviewSub": "Étape 1 sur 2",
  "checkout.detailsTitle": "Coordonnées de livraison",
  "checkout.detailsSub": "Étape 2 sur 2",
  "checkout.complete": "Finaliser la commande",
  "checkout.submitting": "Envoi en cours...",
  "checkout.confirm": "Confirmer — paiement à la livraison",
  "checkout.back": "Retour au panier",
  "checkout.yourProducts": "Vos articles",
  "checkout.emptyCart": "Panier vide — ajoutez un produit pour continuer",
  "checkout.reviewHint":
    "Ajoutez des suggestions puis appuyez sur « Finaliser » pour vos coordonnées. Paiement à la livraison uniquement.",
  "checkout.detailsHint":
    "Saisissez vos informations — notre équipe vous appellera avant l'expédition.",
  "checkout.fullName": "Nom complet *",
  "checkout.phone": "Téléphone *",
  "checkout.address": "Adresse complète *",
  "checkout.placeholderName": "Ex. : Mohamed Alami",
  "checkout.placeholderPhone": "06 XX XX XX XX",
  "checkout.placeholderAddress": "Ville, quartier, rue, numéro...",
  "checkout.phoneHint": "Numéros marocains uniquement (06 ou 07)",

  "validation.fullNameRequired": "Le nom complet est requis",
  "validation.fullNameShort": "Entrez un nom complet (3 caractères minimum)",
  "validation.phoneRequired": "Le téléphone est requis",
  "validation.phoneInvalid": "Entrez un numéro marocain valide (06 ou 07)",
  "validation.addressRequired": "L'adresse complète est requise",
  "validation.addressShort": "Entrez une adresse complète (ville, quartier, rue)",

  "shipping.progressAria": "Progression vers la livraison gratuite",
  "shipping.remaining": "Plus que",
  "shipping.forFree": "pour la livraison gratuite",
  "shipping.marketing":
    "Ajoutez des articles pour profiter de la livraison gratuite dès le seuil atteint.",

  "thankYou.blessing": "Merci et baraka",
  "thankYou.title": "Merci du cœur du Souss",
  "thankYou.subtitleBefore": "Votre commande a bien été reçue.",
  "thankYou.subtitleAfter":
    "— L'équipe Tazarzit Bio vous appellera sous peu pour confirmer commande et adresse.",
  "thankYou.loading": "Chargement des détails de votre commande...",
  "thankYou.notFound":
    "Détails introuvables sur ce navigateur. Si vous venez de commander, vérifiez vos messages ou contactez-nous sur WhatsApp.",
  "thankYou.shopMore": "Voir les produits",
  "thankYou.shopAgain": "Continuer vos achats",
  "thankYou.home": "Retour à l'accueil",
  "thankYou.recommended": "Vous aimerez aussi",
  "thankYou.recommendedSub":
    "Nouvelle commande — le paiement s'ouvre avec le produit choisi",
  "thankYou.summary": "Récapitulatif",
  "thankYou.quantity": "×",

  "catalog.orderNow": "Commander",
  "catalog.addToCart": "Ajouter au panier",
  "catalog.viewDetails": "Voir les détails",

  "honey.upsellLabel": "Suggestions miel",
  "honey.defaultTitle": "Miel naturel — ajoutez à votre commande",
  "honey.defaultSub": "Trois variétés du Souss — choisissez la taille",
  "honey.addToOrder": "Ajouter à la commande",
  "honey.pickSize": "Choisir la taille",

  "product.quantity": "Quantité",
  "product.orderNow": "Commander",
  "product.addToCart": "Ajouter au panier",
  "product.decreaseQty": "Diminuer la quantité",
  "product.increaseQty": "Augmenter la quantité",
  "product.trustCod": "Paiement à la livraison",
  "product.trustDelivery": "Livraison dans toutes les villes",
  "product.trustCall": "Nous vous appelons pour confirmer",
  "product.trustNatural": "Produits naturels du Souss",
  "product.related": "Produits associés",

  "badge.bestseller": "Best-seller",
  "badge.new": "Nouveau",
  "badge.natural": "100 % naturel",
  "badge.limited": "Offre limitée",

  "footer.shop": "Boutique",
  "footer.info": "Informations",
  "footer.contact": "Contact",
  "footer.gifts": "Coffrets cadeaux et offres famille →",
  "footer.about": "À propos",
  "footer.delivery": "Livraison",
  "footer.returns": "Retours",
  "footer.codBadge": "Paiement à la livraison · COD",
  "footer.tagline":
    "Produits marocains naturels premium — amlou, argan, miel et fruits secs du Souss. Paiement à la livraison partout au Maroc.",
  "footer.supportTitle": "Horaires support",
  "footer.supportHours": "Lun – Sam · 9h – 20h",
  "footer.rights": "Tous droits réservés",
  ...extraFr,
  ...packExtraFr,
};

const en: Record<TranslationKey, string> = {
  "lang.select": "Choose language",
  "lang.ar": "العربية",
  "lang.fr": "Français",
  "lang.en": "English",

  "nav.products": "Our products",
  "nav.bundles": "Family offers",
  "nav.story": "Our story",
  "nav.reviews": "Reviews",
  "nav.faq": "FAQ",
  "nav.shopNow": "Shop now",
  "nav.cart": "Shopping cart",
  "nav.menuOpen": "Open menu",
  "nav.menuClose": "Close menu",
  "nav.main": "Main navigation",

  "hero.homeAria": "Homepage",
  "hero.badge": "From the heart of Souss · Authentic Moroccan craft",
  "hero.title1": "The taste of Souss",
  "hero.title2": "at its finest",
  "hero.subtitle":
    "Amlou, argan oil, and pure honey — 100% natural products bringing Moroccan warmth and artisan luxury to your table.",
  "hero.discover": "Explore the collection",
  "hero.ourStory": "Our story",
  "hero.trustNatural": "100% natural",
  "hero.trustCod": "Cash on delivery",
  "hero.trustRating": "4.9 customer rating",
  "hero.clients": "2000+ customers",
  "hero.clientsSub": "trust our quality",
  "hero.familyPack": "Family pack — great value",

  "cta.journey": "Start your Souss journey",
  "cta.title1": "Taste nature",
  "cta.title2": "as it should be",
  "cta.subtitle":
    "Over 2000 customers chose Tazarzit Bio. Order now — cash on delivery, nationwide shipping, quality in every jar.",
  "cta.orderNow": "Order now",
  "cta.browse": "Browse products",
  "cta.trust1": "No prepayment",
  "cta.trust2": "Fast delivery",
  "cta.trust3": "100% natural",
  "cta.trust4": "From Souss",
  "cta.trust5": "Quality guarantee",

  "bestSellers.label": "Our products",
  "bestSellers.title": "Honey & amlou from Souss",
  "bestSellers.desc":
    "Premium quality, real reviews, cash on delivery — pick a category and order.",
  "bestSellers.viewAll": "View all",
  "bestSellers.catAll": "All",
  "bestSellers.catHoney": "Honey",
  "bestSellers.catAmlou": "Amlou",
  "bestSellers.empty": "No products in this category right now.",
  "bestSellers.footer": "All prices in MAD · Cash on delivery on every order",

  "productsPage.title": "Premium natural products from Souss",
  "productsPage.subtitle":
    "Amlou, honey, argan oil and selected nuts — natural quality, fast delivery, cash on delivery",

  "common.subtotal": "Subtotal",
  "common.total": "Total",
  "common.shipping": "Shipping",
  "common.free": "Free",
  "common.freeShipping": "Free shipping",
  "common.shippingFee": "Shipping fee",
  "common.currency": "MAD",
  "common.from": "From",
  "common.cod": "Cash on delivery",
  "common.codShort": "No prepayment",

  "cart.title": "Shopping cart",
  "cart.empty": "Your cart is empty",
  "cart.emptySub": "Discover our natural products from Souss",
  "cart.shopProducts": "Shop products",
  "cart.checkout": "Checkout (COD)",
  "cart.codNote": "Cash on delivery — no prepayment",
  "cart.secureNote":
    "Your order is secure — we call you to confirm the address. Cash on delivery only.",
  "cart.decrease": "Decrease quantity",
  "cart.increase": "Increase quantity",
  "cart.remove": "Remove",
  "cart.honeyTitle": "Complete with Souss honey",
  "cart.honeySub": "Different varieties — 250g, 500g or 750g",

  "checkout.reviewTitle": "Review order",
  "checkout.reviewSub": "Step 1 of 2",
  "checkout.detailsTitle": "Delivery details",
  "checkout.detailsSub": "Step 2 of 2",
  "checkout.complete": "Complete order",
  "checkout.submitting": "Sending...",
  "checkout.confirm": "Confirm order — cash on delivery",
  "checkout.back": "Back to cart review",
  "checkout.yourProducts": "Your items",
  "checkout.emptyCart": "Cart is empty — add a product to continue",
  "checkout.reviewHint":
    "Add suggested items then tap « Complete order » for your details. Cash on delivery only.",
  "checkout.detailsHint":
    "Enter your details — our team will call you before shipping.",
  "checkout.fullName": "Full name *",
  "checkout.phone": "Phone number *",
  "checkout.address": "Full address *",
  "checkout.placeholderName": "e.g. Mohamed Alami",
  "checkout.placeholderPhone": "06 XX XX XX XX",
  "checkout.placeholderAddress": "City, district, street, house number...",
  "checkout.phoneHint": "Moroccan numbers only (06 or 07)",

  "validation.fullNameRequired": "Full name is required",
  "validation.fullNameShort": "Enter a full name (at least 3 characters)",
  "validation.phoneRequired": "Phone number is required",
  "validation.phoneInvalid": "Enter a valid Moroccan number (06 or 07)",
  "validation.addressRequired": "Full address is required",
  "validation.addressShort": "Enter a full address (city, area, street)",

  "shipping.progressAria": "Progress toward free shipping",
  "shipping.remaining": "Only",
  "shipping.forFree": "left for free shipping",
  "shipping.marketing":
    "Add more items to unlock free shipping when you reach the minimum.",

  "thankYou.blessing": "Thank you",
  "thankYou.title": "Thanks from the heart of Souss",
  "thankYou.subtitleBefore": "Your order was received successfully.",
  "thankYou.subtitleAfter":
    "— The Tazarzit Bio team will call you shortly to confirm your order and address.",
  "thankYou.loading": "Loading your order details...",
  "thankYou.notFound":
    "We could not find order details in this browser. If you just placed an order, check your messages or contact us on WhatsApp.",
  "thankYou.shopMore": "Shop products",
  "thankYou.shopAgain": "Shop more",
  "thankYou.home": "Back to home",
  "thankYou.recommended": "You may also like",
  "thankYou.recommendedSub":
    "Start a new order — checkout opens with your selected product",
  "thankYou.summary": "Order summary",
  "thankYou.quantity": "×",

  "catalog.orderNow": "Order now",
  "catalog.addToCart": "Add to cart",
  "catalog.viewDetails": "View details",

  "honey.upsellLabel": "Honey suggestions",
  "honey.defaultTitle": "Natural honey — add to your order",
  "honey.defaultSub": "Three Souss varieties — pick a size",
  "honey.addToOrder": "Add to order",
  "honey.pickSize": "Choose size",

  "product.quantity": "Quantity",
  "product.orderNow": "Order now",
  "product.addToCart": "Add to cart",
  "product.decreaseQty": "Decrease quantity",
  "product.increaseQty": "Increase quantity",
  "product.trustCod": "Cash on delivery",
  "product.trustDelivery": "Delivery nationwide",
  "product.trustCall": "We call you to confirm",
  "product.trustNatural": "Natural products from Souss",
  "product.related": "Related products",

  "badge.bestseller": "Bestseller",
  "badge.new": "New",
  "badge.natural": "100% natural",
  "badge.limited": "Limited offer",

  "footer.shop": "Shop",
  "footer.info": "Information",
  "footer.contact": "Contact us",
  "footer.gifts": "Gift boxes & family offers →",
  "footer.about": "About us",
  "footer.delivery": "Delivery policy",
  "footer.returns": "Returns policy",
  "footer.codBadge": "Cash on delivery · COD",
  "footer.tagline":
    "Premium Moroccan natural products — amlou, argan, honey and nuts from Souss. Cash on delivery across Morocco.",
  "footer.supportTitle": "Support hours",
  "footer.supportHours": "Mon – Sat · 9am – 8pm",
  "footer.rights": "All rights reserved",
  ...extraEn,
  ...packExtraEn,
};

export const translations: Record<TranslationKey, string> = {
  ...arMessages,
};

export const translationsByLocale: Record<Language, Record<TranslationKey, string>> = {
  ar: arMessages,
  fr,
  en,
};

export function translate(
  locale: Language,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const template =
    translationsByLocale[locale][key] ??
    translationsByLocale.ar[key] ??
    key;
  if (!params) return template;
  return Object.entries(params).reduce(
    (text, [name, value]) =>
      text.replaceAll(`{${name}}`, String(value)),
    template,
  );
}
