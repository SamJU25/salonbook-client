import type { Metadata } from "next";
import { Suspense } from "react";
import { BrowseServicesClient } from "@/components/services/BrowseServicesClient";
import { PageLoader } from "@/components/ui/Loader";

export const metadata: Metadata = {
  title: "Browse Salon Services",
  description:
    "Search salon services by name, filter by category, and sort by price or duration.",
};

export default function BrowseServicesPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading salon services..." />}>
      <BrowseServicesClient />
    </Suspense>
  );
}
