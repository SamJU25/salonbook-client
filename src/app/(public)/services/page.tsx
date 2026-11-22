import type { Metadata } from "next";
import { BrowseServicesClient } from "@/components/services/BrowseServicesClient";
import { fetchServerPublicServices } from "@/lib/server-services";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Salon Services",
  description:
    "Search salon services by name, filter by category, and sort by price or duration.",
};

export default async function BrowseServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const [resolvedParams, snapshot] = await Promise.all([
    searchParams,
    fetchServerPublicServices(),
  ]);

  const initialCategory = resolvedParams.category?.trim() || "all";
  const initialServices =
    initialCategory !== "all"
      ? snapshot.services.filter((svc) => svc.category === initialCategory)
      : snapshot.services;

  return (
    <BrowseServicesClient
      initialCategory={initialCategory}
      initialServices={initialServices}
      initialCategories={snapshot.categories}
      initialTotalCount={snapshot.ok ? snapshot.services.length : null}
      hasInitialData={snapshot.ok}
    />
  );
}
