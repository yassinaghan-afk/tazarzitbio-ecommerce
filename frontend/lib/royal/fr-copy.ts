/** French copy for /royalfr — keep /royal Arabic files untouched. */

export const AMLOU_ROYAL_FR_NAME = "Amlou Royal";
export const AMLOU_ROYAL_FR_PATH = "/royalfr";
export const AMLOU_ROYAL_FR_CANONICAL = "https://www.tazarzitbio.com/royalfr";
export const AMLOU_ROYAL_FR_THANK_YOU = "/royalfr/thank-you";

export const AMLOU_ROYAL_FR_IMAGES = {
  hero: {
    src: "/images/royal/fr/01-hero.jpg",
    alt: "Amlou Royal — un mélange naturel pour une meilleure santé",
    width: 682,
    height: 1024,
  },
  afterForm: {
    src: "/images/royal/fr/02-ingredients.jpg",
    alt: "Amlou Royal — ingrédients riches et naturels, 100% naturel",
    width: 1024,
    height: 1024,
  },
} as const;

export const AMLOU_ROYAL_FR_OFFERS = {
  "royal-1": {
    title: "1 pot",
    weight: "500 g",
    subtitle: "Pour découvrir le goût",
  },
  "royal-2": {
    title: "2 pots",
    weight: "1 kg",
    subtitle: "Le choix le plus demandé",
  },
  "royal-3": {
    title: "3 pots",
    weight: "1,5 kg",
    subtitle: "Meilleure valeur",
    gift: "🎁 + Cadeau",
  },
} as const;

export type RoyalFrOfferId = keyof typeof AMLOU_ROYAL_FR_OFFERS;

/** French currency label for /royalfr only (Arabic /royal keeps درهم). */
export function formatRoyalFrDh(n: number): string {
  return `${n} DH`;
}

export const royalFrCopy = {
  productName: AMLOU_ROYAL_FR_NAME,
  heroAria: "Amlou Royal",
  heroTitle: "Amlou Royal — Un mélange naturel pour une meilleure santé",
  ctaOrder: "Commander maintenant",
  chooseOffer: "Choisissez votre offre 👇",
  urgency: "⚠️ Dernière chance ! Le prix actuel est limité dans le temps",
  mostOrdered: "🔥 Le plus demandé",
  bestValue: "🏆 Meilleure valeur",
  freeShipping: "🎁 Livraison gratuite",
  shippingPlus: (fee: number) => `+ ${fee} DH de livraison`,
  selectedOffer: "Offre sélectionnée",
  formHeading: "Entrez vos informations ci-dessous pour finaliser la commande",
  labelOffer: "Offre",
  labelShipping: "Livraison",
  free: "Gratuite",
  fullName: "Nom complet",
  phone: "Téléphone",
  address: "Adresse",
  addressPlaceholder: "Ville, quartier ou adresse complète…",
  confirmOrder: "Confirmer la commande",
  submitting: "Enregistrement en cours…",
  codNote: "Paiement à la livraison · Nous vous appelons pour confirmer",
  errNameShort: "Entrez le nom complet (3 caractères minimum)",
  errNameRequired: "Le nom complet est obligatoire",
  errPhoneInvalid: "Entrez un numéro marocain valide (06 ou 07)",
  errPhoneRequired: "Le téléphone est obligatoire",
  errAddress: "Entrez l'adresse (ville, quartier ou adresse complète)",
  errOfferGone: "Cette offre n'est plus disponible. Choisissez une autre.",
  errSubmit: "Impossible d'enregistrer la commande. Réessayez.",
  errNetwork: "Problème de réseau. Vérifiez la connexion et réessayez.",
  modalClose: "Fermer",
  modalChooseOffer: "Choisissez votre offre",
  modalOrderInfo: "Informations de commande",
  modalBackOffers: "Retour aux offres",
  modalStep1: "Étape 1 sur 2 · Paiement à la livraison",
  modalStep2: "Étape 2 sur 2 · Complétez vos informations",
  modalChange: "Modifier",
  modalProductPrice: "Prix du produit",
  modalTrustShip: "Livraison gratuite",
  modalTrustCod: "Paiement à la livraison",
  modalTrustCall: "On vous appelle pour confirmer",
  modalContinue: "Continuer la commande",
  freeShipAll: "Livraison gratuite dans tout le Maroc",
  saveLabel: (amount: string) => `Économisez ${amount}`,
  selectedThis: "Offre sélectionnée ✓",
  selectThis: "Choisir cette offre",
  thankTitle: "Merci pour votre commande ❤️",
  thankReceived: "Nous avons bien reçu votre commande.",
  thankCall: "Nous vous appellerons bientôt au numéro fourni pour confirmer.",
  thankLoading: "Chargement des détails…",
  thankNotFound:
    "Nous n'avons pas trouvé les détails de la commande sur cet appareil. Si vous avez bien commandé, nous vous contacterons bientôt.",
  thankOrderId: "N° de commande",
  thankOfferDetails: "Détails de l'offre",
  thankCodTitle: "Paiement à la livraison (COD)",
  thankCodBody:
    "Vous ne payez rien maintenant. Réglez le montant à la livraison après confirmation.",
  thankHome: "Retour à l'accueil",
  thankTotal: "Total",
  /** Honest upsell pitch — no fake % off (prices = catalog sale prices). */
  upsellLoading: "Chargement de votre offre…",
  upsellCatalogError:
    "Impossible de charger les produits. Vous pouvez passer et finaliser la commande.",
  upsellTitle: "Offre spéciale avant de finaliser 👑",
  upsellSubtitle:
    "Ajoutez d'autres produits à votre commande — mêmes prix catalogue",
  upsellNoExtraShip: "Sans frais de livraison supplémentaires",
  upsellLoadingProducts: "Chargement des produits…",
  upsellTapWeight: " · Appuyez pour ajouter et choisir le poids",
  upsellMultiWeight: "Plusieurs poids — appuyez pour ajouter et choisir",
  upsellFrom: (price: string) => `À partir de ${price}`,
  upsellDecQty: "Diminuer la quantité",
  upsellIncQty: "Augmenter la quantité",
  upsellAdded: "Ajouté",
  upsellAdd: "Ajouter",
  upsellAddToOrder: "Ajouter à la commande",
  upsellCurrentOrder: "Votre commande actuelle",
  upsellOriginalItems: "Produits d'origine",
  upsellExtras: "Vos ajouts",
  upsellFinalTotal: "Total final",
  upsellShipOnce:
    "La livraison n'est calculée qu'une seule fois — pas de frais supplémentaires sur les ajouts.",
  upsellConfirming: "Confirmation en cours…",
  upsellContinue: "Continuer et finaliser",
  upsellSkip: "Passer et finaliser",
  upsellConfirmError:
    "Impossible de confirmer la commande pour le moment. Réessayez — votre commande est enregistrée et ne sera pas dupliquée.",
  weightKicker: "Choisir le poids",
  weightSubtitle: "Choisissez le poids — le prix s'affiche pour chaque option",
  weightSelected: "Votre choix",
  weightClose: "Fermer",
  weightCod: "Paiement à la livraison",
  currency: "DH",
} as const;
