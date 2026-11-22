"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { PageLoader } from "@/components/ui/Loader";
import { apiRequest } from "@/lib/api-client";
import type { SalonService } from "@/types";

export default function EditServicePage() {
  const params = useParams<{ id: string }>();
  const serviceId = params?.id || "";
  const [service, setService] = useState<SalonService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadService = useCallback(async () => {
    if (!serviceId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest<SalonService>(`/services/${serviceId}`);
      setService(data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unable to load salon service";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    void loadService();
  }, [loadService]);

  if (isLoading) {
    return <PageLoader label="Loading service details..." />;
  }

  if (error || !service) {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center">
        <p className="text-sm font-semibold text-[#9A352E]">
          {error || "Service not found"}
        </p>
        <Link
          href="/dashboard/admin/services"
          className="mt-4 inline-flex h-10 items-center rounded-control bg-secondary px-4 text-sm font-semibold text-primary"
        >
          Back to Manage Services
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/admin/services"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Manage Services
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-text">Edit Service</h1>
        <p className="mt-1 text-sm text-muted">
          Update the service name, price, status, or photo.
        </p>
      </div>

      <ServiceForm mode="edit" initialService={service} />
    </div>
  );
}
