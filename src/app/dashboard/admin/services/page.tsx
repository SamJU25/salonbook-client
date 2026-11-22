"use client";

import { Edit3, Plus, Power, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageLoader } from "@/components/ui/Loader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiRequest } from "@/lib/api-client";
import type { SalonService } from "@/types";

export default function AdminManageServicesPage() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalonService | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<SalonService[]>("/admin/services");
      setServices(data || []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load salon services"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const handleToggleStatus = async (service: SalonService) => {
    const nextStatus = service.status === "active" ? "inactive" : "active";
    setTogglingId(service._id);
    try {
      const updated = await apiRequest<SalonService>(
        `/admin/services/${service._id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      setServices((prev) =>
        prev.map((s) => (s._id === service._id ? updated : s))
      );
      toast.success(`Service marked as ${nextStatus}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update service status"
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await apiRequest(`/admin/services/${deleteTarget._id}`, {
        method: "DELETE",
      });
      setServices((prev) => prev.filter((s) => s._id !== deleteTarget._id));
      toast.success("Service deleted successfully");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to delete service"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading salon services..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Manage Services</h1>
          <p className="mt-1 text-sm text-muted">
            Create, edit, activate/deactivate, or remove salon services.
          </p>
        </div>

        <Link
          href="/dashboard/admin/services/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add New Service
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-10 text-center shadow-xs">
          <p className="text-base font-semibold text-text">
            No services added yet.
          </p>
          <Link
            href="/dashboard/admin/services/new"
            className="mt-4 inline-flex h-11 items-center rounded-control bg-primary px-5 text-sm font-semibold text-white"
          >
            Create First Service
          </Link>
        </div>
      ) : (
        <>
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="admin-services-caption"
            className="hidden overflow-x-auto rounded-card border border-border bg-surface shadow-xs md:block"
          >
            <table className="w-full border-collapse text-left text-sm">
              <caption id="admin-services-caption" className="sr-only">
                All salon services managed by administrators
              </caption>
              <thead className="border-b border-border bg-surface-muted/70 text-xs font-bold tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3.5">Service</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((svc) => (
                  <tr key={svc._id} className="hover:bg-surface-muted/40">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={svc.image}
                          alt={svc.serviceName}
                          className="h-11 w-14 shrink-0 rounded-lg object-cover"
                        />
                        <span className="font-semibold text-text">
                          {svc.serviceName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted">{svc.category}</td>
                    <td className="px-4 py-3.5 font-semibold text-text">
                      ${svc.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-muted">
                      {svc.duration} mins
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={svc.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          isLoading={togglingId === svc._id}
                          onClick={() => handleToggleStatus(svc)}
                        >
                          <Power className="h-3.5 w-3.5" aria-hidden="true" />
                          {svc.status === "active" ? "Deactivate" : "Activate"}
                        </Button>
                        <Link
                          href={`/dashboard/admin/services/${svc._id}/edit`}
                          className="inline-flex h-9 items-center gap-1.5 rounded-control border border-border bg-surface px-3 text-sm font-semibold text-text hover:bg-surface-muted"
                        >
                          <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                          Edit
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteTarget(svc)}
                          className="border-[#F0C8C4] text-[#9A352E] hover:bg-status-cancelled-bg"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 md:hidden">
            {services.map((svc) => (
              <article
                key={svc._id}
                className="rounded-card border border-border bg-surface p-4 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={svc.image}
                    alt={svc.serviceName}
                    className="h-14 w-16 shrink-0 rounded-control object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-accent-text uppercase">
                        {svc.category}
                      </span>
                      <StatusBadge status={svc.status} />
                    </div>
                    <h2 className="mt-0.5 truncate text-base font-bold text-text">
                      {svc.serviceName}
                    </h2>
                    <p className="mt-1 text-xs text-muted">
                      ${svc.price.toFixed(2)} · {svc.duration} mins
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    isLoading={togglingId === svc._id}
                    onClick={() => handleToggleStatus(svc)}
                  >
                    {svc.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Link
                    href={`/dashboard/admin/services/${svc._id}/edit`}
                    className="inline-flex h-9 items-center rounded-control border border-border bg-surface px-3 text-sm font-semibold text-text"
                  >
                    Edit
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteTarget(svc)}
                    className="border-[#F0C8C4] text-[#9A352E]"
                  >
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete salon service?"
        description={`This permanently removes "${deleteTarget?.serviceName || ""}" from the catalog. Services with active bookings cannot be deleted.`}
        confirmLabel="Delete service"
        cancelLabel="Cancel"
        destructive
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
