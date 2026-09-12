
import { eliteDeliveryProvider } from "@/lib/delivery/elite/provider";
import type { DeliveryProvider, DeliveryProviderId } from "@/lib/delivery/types";

const providers: Record<string, DeliveryProvider> = {
  elite: eliteDeliveryProvider,
};

export function getDeliveryProvider(
  id: DeliveryProviderId = "elite",
): DeliveryProvider | null {
  return providers[id] ?? null;
}

export function listDeliveryProviders(): DeliveryProvider[] {
  return Object.values(providers);
}
