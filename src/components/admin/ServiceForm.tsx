"use client";

import { Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiRequest } from "@/lib/api-client";
import { SALON_CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { serviceFormSchema } from "@/lib/validators";
import type { SalonService, ServiceStatus } from "@/types";

interface ServiceFormProps {
  mode: "create" | "edit";
  initialService?: SalonService;
}

export function ServiceForm({ mode, initialService }: ServiceFormProps) {
  const router = useRouter();

  const [serviceName, setServiceName] = useState(
    initialService?.serviceName || ""
  );
  const [category, setCategory] = useState(
    initialService?.category || SALON_CATEGORIES[0]
  );
  const [description, setDescription] = useState(
    initialService?.description || ""
  );
  const [price, setPrice] = useState(
    initialService ? String(initialService.price) : ""
  );
  const [duration, setDuration] = useState(
    initialService ? String(initialService.duration) : ""
  );
  const [image, setImage] = useState(initialService?.image || "");
  const [status, setStatus] = useState<ServiceStatus>(
    initialService?.status || "active"
  );
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions =
    initialService?.category &&
    !SALON_CATEGORIES.includes(
      initialService.category as (typeof SALON_CATEGORIES)[number]
    )
      ? [...SALON_CATEGORIES, initialService.category]
      : [...SALON_CATEGORIES];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = serviceFormSchema.safeParse({
      serviceName,
      category,
      description,
      price,
      duration,
      image,
      status,
    });

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message || "Please verify all service fields"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await apiRequest("/admin/services", {
          method: "POST",
          body: JSON.stringify(parsed.data),
        });
        toast.success("Salon service created successfully");
      } else if (initialService) {
        await apiRequest(`/admin/services/${initialService._id}`, {
          method: "PATCH",
          body: JSON.stringify(parsed.data),
        });
        toast.success("Salon service updated successfully");
      }

      router.push("/dashboard/admin/services");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save salon service"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const numericPrice = Number(price);
  const previewPrice =
    price.trim() && Number.isFinite(numericPrice) && numericPrice > 0
      ? formatCurrency(numericPrice)
      : "$85.00";
  const previewDuration = duration.trim() ? `${duration} min` : "60 min";

  const actionButtons = (
    <>
      <Link
        href="/dashboard/admin/services"
        className="inline-flex h-11 flex-1 items-center justify-center rounded-control border border-border bg-surface px-5 text-sm font-semibold text-text transition-colors hover:bg-surface-muted sm:flex-initial"
      >
        Cancel
      </Link>
      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isImageUploading}
        className="flex-1 px-6 sm:flex-initial"
      >
        {mode === "create" ? "Create Service" : "Save Changes"}
      </Button>
    </>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
    >
      {/* Left: Treatment Details & Pricing */}
      <div className="rounded-card border border-border bg-surface p-6 shadow-xs sm:p-8 lg:col-span-8">
        <div className="border-b border-border pb-4">
          <h2 className="text-base font-bold text-text">Service Details</h2>
          <p className="mt-0.5 text-xs text-muted">
            Set the service name, category, price, and description.
          </p>
        </div>

        <div className="mt-5 space-y-5">
          <div>
            <label
              htmlFor="svc-name"
              className="mb-1.5 block text-sm font-semibold text-text"
            >
              Service Name <span className="text-[#9A352E]">*</span>
            </label>
            <input
              id="svc-name"
              type="text"
              required
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Classic Hydrating Facial"
              className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="svc-category"
                className="mb-1.5 block text-sm font-semibold text-text"
              >
                Service Category <span className="text-[#9A352E]">*</span>
              </label>
              <select
                id="svc-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="salon-select h-11 w-full rounded-control border border-border bg-surface text-sm text-text focus:border-primary focus:outline-none"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="svc-status"
                className="mb-1.5 block text-sm font-semibold text-text"
              >
                Service Status
              </label>
              <select
                id="svc-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                className="salon-select h-11 w-full rounded-control border border-border bg-surface text-sm text-text focus:border-primary focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="svc-price"
                className="mb-1.5 block text-sm font-semibold text-text"
              >
                Price (USD) <span className="text-[#9A352E]">*</span>
              </label>
              <input
                id="svc-price"
                type="number"
                step="0.01"
                min="0.50"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="85"
                className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="svc-duration"
                className="mb-1.5 block text-sm font-semibold text-text"
              >
                Estimated Duration (minutes){" "}
                <span className="text-[#9A352E]">*</span>
              </label>
              <input
                id="svc-duration"
                type="number"
                step="1"
                min="1"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="svc-description"
              className="mb-1.5 block text-sm font-semibold text-text"
            >
              Description <span className="text-[#9A352E]">*</span>
            </label>
            <textarea
              id="svc-description"
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is included in this salon treatment..."
              className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm leading-relaxed text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="hidden flex-wrap items-center justify-end gap-3 border-t border-border pt-5 lg:flex">
            {actionButtons}
          </div>
        </div>
      </div>

      {/* Right: Media Upload & Live Listing Preview */}
      <aside className="space-y-5 rounded-card border border-border bg-surface p-6 shadow-xs lg:sticky lg:top-24 lg:col-span-4">
        {/* Service Image strictly requires file upload (no URL input allowed) */}
        <ImageUploader
          label="Service Image"
          value={image}
          onChange={setImage}
          onUploadingChange={setIsImageUploading}
          allowUrlInput={false}
          variant="dropzone"
          required
        />

        <div className="border-t border-border pt-5">
          <p className="text-[11px] font-bold tracking-wider text-muted uppercase">
            Listing Preview
          </p>

          <div className="mt-3 rounded-control border border-border bg-page/50 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-bold tracking-wider text-accent-text uppercase">
                {category}
              </span>
              <StatusBadge status={status} />
            </div>

            <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-text">
              {serviceName.trim() || "Classic Hydrating Facial"}
            </h3>

            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
              {description.trim() ||
                "Your service description will appear here."}
            </p>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="font-bold text-text">{previewPrice}</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
                <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {previewDuration}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile & Tablet submit bar after photo upload and preview */}
      <div className="flex items-center justify-end gap-3 rounded-card border border-border bg-surface p-5 shadow-xs lg:hidden">
        {actionButtons}
      </div>
    </form>
  );
}
