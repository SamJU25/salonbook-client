"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { apiRequest } from "@/lib/api-client";
import { SALON_CATEGORIES } from "@/lib/constants";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="max-w-2xl rounded-card border border-border bg-surface p-6 shadow-xs sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder="Signature Botanical Facial"
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
              className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text focus:border-primary focus:outline-none"
            >
              {SALON_CATEGORIES.map((cat) => (
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
              className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text focus:border-primary focus:outline-none"
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
              min="0.01"
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
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what is included in this salon treatment..."
            className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
          />
        </div>

        {/* Service Image strictly requires file upload (no URL input allowed) */}
        <ImageUploader
          label="Service Image"
          value={image}
          onChange={setImage}
          allowUrlInput={false}
          required
          helperText="Upload a JPEG, PNG, WEBP, or GIF image (hosted via ImgBB)."
        />

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button type="submit" isLoading={isSubmitting}>
            {mode === "create" ? "Create Service" : "Save Changes"}
          </Button>
          <Link
            href="/dashboard/admin/services"
            className="inline-flex h-11 items-center justify-center rounded-control border border-border bg-surface px-5 text-sm font-semibold text-text hover:bg-surface-muted"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
