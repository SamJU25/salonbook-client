import { Loader2 } from "lucide-react";

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[260px] flex-col items-center justify-center gap-3 py-12 text-center"
    >
      <Loader2 className="h-7 w-7 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  );
}

export function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      aria-label="Loading salon services"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-card border border-border bg-surface p-4 shadow-card"
        >
          <div className="aspect-4/3 w-full animate-pulse rounded-control bg-surface-muted" />
          <div className="mt-4 space-y-3">
            <div className="h-3 w-24 animate-pulse rounded bg-surface-muted" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-surface-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-surface-muted" />
            <div className="h-10 w-full animate-pulse rounded-control bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
