import { API_BASE_URL, SALON_CATEGORIES } from "@/lib/constants";
import type { SalonService } from "@/types";

export interface PublicCatalogSnapshot {
  services: SalonService[];
  categories: string[];
  ok: boolean;
}

/**
 * Fetches the public active service catalog on the server so public routes
 * render real services in HTML instead of client-only loading placeholders.
 */
export async function fetchServerPublicServices(): Promise<PublicCatalogSnapshot> {
  try {
    const response = await fetch(`${API_BASE_URL}/services?sort=newest`, {
      cache: "no-store",
      signal: AbortSignal.timeout(4500),
    });

    if (!response.ok) {
      return {
        services: [],
        categories: [...SALON_CATEGORIES],
        ok: false,
      };
    }

    const payload = (await response.json()) as {
      success?: boolean;
      data?: {
        services?: SalonService[];
        categories?: string[];
      };
    };

    const services = (payload.data?.services ?? []).filter(
      (svc) => svc.status === "active"
    );
    const categories = Array.from(
      new Set([...SALON_CATEGORIES, ...(payload.data?.categories ?? [])])
    );

    return {
      services,
      categories,
      ok: true,
    };
  } catch {
    return {
      services: [],
      categories: [...SALON_CATEGORIES],
      ok: false,
    };
  }
}
