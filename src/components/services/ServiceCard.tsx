import { Clock } from "lucide-react";
import Link from "next/link";
import type { SalonService } from "@/types";

export function ServiceCard({ service }: { service: SalonService }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card transition-[border-color,box-shadow] duration-200 hover:border-primary/40 hover:shadow-card-hover">
      <div className="relative aspect-4/3 w-full overflow-hidden bg-surface-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={service.image}
          alt={service.serviceName}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-bold tracking-wider text-accent-text uppercase">
          {service.category}
        </p>

        <h3 className="mt-1.5 text-lg font-bold leading-snug text-text">
          {service.serviceName}
        </h3>

        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
          {service.description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3.5">
          <span className="text-lg font-bold text-text">
            ${service.price.toFixed(2)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
            <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {service.duration} mins
          </span>
        </div>

        <Link
          href={`/services/${service._id}`}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-control bg-secondary px-4 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
