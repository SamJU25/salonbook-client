"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/Button";
import { ServiceGridSkeleton } from "@/components/ui/Loader";
import { apiRequest } from "@/lib/api-client";
import { SALON_CATEGORIES } from "@/lib/constants";
import type { SalonService } from "@/types";

interface CategoryMeta {
  image: string;
  description: string;
}

const CATEGORY_META: Record<string, CategoryMeta> = {
  "Haircut & Styling": {
    image: "/images/services/haircut-styling.jpg",
    description: "Tailored cuts, silk presses & blowouts.",
  },
  "Facial & Skincare": {
    image: "/images/services/facial-skincare.jpg",
    description: "Lymphatic massage & hydration facials.",
  },
  "Hair Coloring": {
    image: "/images/services/hair-coloring.jpg",
    description: "Dimensional balayage & botanical gloss.",
  },
  "Spa & Massage": {
    image: "/images/services/spa-massage.jpg",
    description: "Warm basalt stone & herbal massage.",
  },
  "Hair Treatment": {
    image: "/images/services/hair-treatment.jpg",
    description: "Plant keratin & argan oil smoothing.",
  },
  Makeup: {
    image: "/images/services/makeup.jpg",
    description: "Soft bridal and event makeup artistry.",
  },
  "Manicure & Pedicure": {
    image: "/images/services/manicure-pedicure.jpg",
    description: "Cuticle care, mineral soak & polish.",
  },
};

const DEFAULT_META: CategoryMeta = {
  image: "/images/services/silk-press.jpg",
  description: "Professional hair, skincare, nail, and spa services.",
};

/**
 * Computes responsive grid spans for a balanced 2-column tablet and 2-3-2 desktop layout.
 */
function getBentoSpanClass(index: number, total: number): string {
  if (total === 7) {
    // Tablet: balanced 2-column rows (last item spans 2 cols to avoid an orphan slot)
    // Desktop (lg): 2 wide (3+3), 3 medium (2+2+2), 2 wide (3+3)
    if (index === 0 || index === 1 || index === 5) {
      return "md:col-span-1 md:aspect-auto md:h-[248px] lg:col-span-3 lg:h-[280px]";
    }
    if (index === 6) {
      return "md:col-span-2 md:aspect-auto md:h-[248px] lg:col-span-3 lg:h-[280px]";
    }
    return "md:col-span-1 md:aspect-auto md:h-[248px] lg:col-span-2 lg:h-[250px]";
  }
  return "md:col-span-1 md:aspect-auto md:h-[248px] lg:col-span-2 lg:h-[250px]";
}

function getCardImageSizes(index: number, total: number): string {
  if (total === 7 && (index === 0 || index === 1 || index === 5 || index === 6)) {
    return "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 50vw";
  }
  return "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw";
}

export function HomeDynamicSections() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<string[]>([...SALON_CATEGORIES]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiRequest<{
        services: SalonService[];
        categories: string[];
      }>("/services", { auth: false });
      const activeServices = (data.services || []).filter(
        (svc) => svc.status === "active"
      );
      const counts: Record<string, number> = {};
      for (const svc of activeServices) {
        counts[svc.category] = (counts[svc.category] ?? 0) + 1;
      }

      setCategoryCounts(counts);
      setServices(activeServices.slice(0, 6));
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (err) {
      setCategoryCounts(null);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load featured salon services right now."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const orderedBase = [
    "Haircut & Styling",
    "Facial & Skincare",
    "Hair Coloring",
    "Spa & Massage",
    "Hair Treatment",
    "Makeup",
    "Manicure & Pedicure",
  ].filter((c) => categories.includes(c));

  const extra = categories.filter((c) => !orderedBase.includes(c));
  const displayCategories = [...orderedBase, ...extra];

  return (
    <>
      {/* Dynamic Section 1: Featured Salon Services */}
      <section
        aria-labelledby="featured-services-heading"
        className="mx-auto max-w-7xl px-4 pt-9 pb-14 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-widest text-accent-text uppercase">
              Popular Services
            </p>
            <h2
              id="featured-services-heading"
              className="mt-2 font-display text-3xl font-semibold text-text sm:text-4xl"
            >
              Featured Salon Services
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Popular hair, skincare, nail, and spa services you can book
              online.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            View all services
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <ServiceGridSkeleton count={6} />
          ) : error ? (
            <div className="rounded-card border border-border bg-surface p-10 text-center shadow-card">
              <h3 className="font-display text-2xl font-semibold text-text">
                Services unavailable
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">{error}</p>
              <Button variant="secondary" className="mt-5" onClick={loadData}>
                Try again
              </Button>
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-card border border-border bg-surface p-10 text-center">
              <p className="text-base font-semibold text-text">
                No services available right now.
              </p>
              <p className="mt-1 text-sm text-muted">
                Check back soon for updated salon services.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Section 2: Unified Editorial 2-3-2 Category Grid */}
      <section
        aria-labelledby="categories-heading"
        className="border-y border-border bg-warm-sand/60"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-widest text-accent-text uppercase">
                By Category
              </p>
              <h2
                id="categories-heading"
                className="mt-2 font-display text-3xl font-semibold text-text sm:text-4xl"
              >
                Salon Service Categories
              </h2>
              <p className="mt-2 text-sm text-muted sm:text-base">
                Pick a category to see available services.
              </p>
            </div>

            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              Explore all categories
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
            {displayCategories.map((category, index) => {
              const meta = CATEGORY_META[category] ?? DEFAULT_META;
              const spanClass = getBentoSpanClass(
                index,
                displayCategories.length
              );
              const serviceCount =
                categoryCounts !== null ? (categoryCounts[category] ?? 0) : null;

              return (
                <Link
                  key={category}
                  href={`/services?category=${encodeURIComponent(category)}`}
                  className={`group block aspect-16/10 min-h-[210px] overflow-hidden rounded-card border border-border bg-sidebar shadow-card transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none ${spanClass}`}
                >
                  <article className="relative flex h-full w-full flex-col justify-end p-5 text-white sm:p-6">
                    <Image
                      src={meta.image}
                      alt={`${category} salon treatment`}
                      fill
                      sizes={getCardImageSizes(index, displayCategories.length)}
                      className="object-cover object-[50%_24%] transition-transform duration-500 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[#13221C]/90 via-[#13221C]/38 to-transparent transition-colors duration-300 group-hover:from-[#13221C]/95 motion-reduce:transition-none"
                      aria-hidden="true"
                    />

                    <div className="relative z-10">
                      {serviceCount !== null && (
                        <p className="text-[11px] font-semibold tracking-[0.12em] text-white/80 uppercase">
                          {serviceCount}{" "}
                          {serviceCount === 1 ? "Service" : "Services"}
                        </p>
                      )}
                      <h3 className="mt-0.5 font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
                        {category}
                      </h3>
                      <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-white/85 sm:text-sm">
                        {meta.description}
                      </p>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
