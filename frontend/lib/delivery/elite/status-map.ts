/**
 * Elite Delivery status ID → TazarzitBio internal DeliveryStatus.
 * Status IDs verified via GET /v1.0/statuses on 2026-09-12.
 */

import type { DeliveryStatus } from "@/lib/admin/ops-types";

/** Default map — overridable from Admin settings (statusMap). */
export const DEFAULT_ELITE_STATUS_MAP: Record<string, DeliveryStatus> = {
  "0": "new", // Nouveau colis
  "1": "preparing", // En attente de ramassage
  "3": "delivered", // Livré au client
  "4": "returned", // Retourné vers agence casa
  "5": "failed_delivery", // le client ne répond pas
  "8": "failed_delivery", // Reçu par erreur
  "9": "failed_delivery", // Non reçu
  "10": "failed_delivery", // Hors zone
  "13": "in_transit", // Nouvelle info
  "14": "failed_delivery", // Téléphone Injoignable
  "15": "shipped", // Ramassé
  "17": "in_transit", // Reporté
  "18": "returned", // Colis prêt pour le retour
  "19": "returned", // Retour reçu par agence
  "20": "returned", // Retour livré au client
  "21": "returned", // Retour en cours de la livraison
  "27": "returned", // Retour débarrasse
  "28": "refused", // Refusé
  "29": "cancelled", // Annulé
  "30": "confirmed", // Interessé
  "32": "returned", // Retour en stock
  "33": "failed_delivery", // Produit endommagé
  "34": "in_transit", // Recu sur agence
  "35": "in_transit", // en cours de livraison
  "36": "returned", // Demande retour
  "37": "in_transit", // reportée indéfiniment
  "38": "failed_delivery", // Toujours injoignable
  "39": "preparing", // en cours de preparation
  "48": "returned", // Retour reçu
  "49": "in_transit", // En Transport
  "50": "returned", // Retour prêt pour l'expedition
  "51": "returned", // Retour expidié
  "52": "failed_delivery", // Perdu
  "53": "cancelled", // Colis archivé
  "58": "returned", // Produit récupéré
  "59": "failed_delivery", // Adresse inconnue
  "60": "confirmed", // RDV Confirmé
};

export function mapEliteStatusId(
  eliteStatusId: string | number,
  overrideMap?: Record<string, DeliveryStatus>,
): DeliveryStatus | null {
  const key = String(eliteStatusId).trim();
  if (!key) return null;
  if (overrideMap?.[key]) return overrideMap[key];
  return DEFAULT_ELITE_STATUS_MAP[key] ?? null;
}
