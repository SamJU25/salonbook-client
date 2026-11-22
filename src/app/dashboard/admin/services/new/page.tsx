import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default function AddServicePage() {
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
        <h1 className="mt-2 text-2xl font-bold text-text">Add New Service</h1>
        <p className="mt-1 text-sm text-muted">
          Create a new salon service with an uploaded photo.
        </p>
      </div>

      <ServiceForm mode="create" />
    </div>
  );
}
