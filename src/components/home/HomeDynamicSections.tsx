"use client";

import {
  ArrowRight,
  Droplets,
  Flower2,
  HandHeart,
  Palette,
  Scissors,
  Sparkles,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/Button";
import { ServiceGridSkeleton } from "@/components/ui/Loader";
import { apiRequest } from "@/lib/api-client";
import { SALON_CATEGORIES } from "@/lib/constants";
import type { SalonService } from "@/types";

const CATEGORY_META: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; subtitle: string }
> = {
  "Haircut & Styling": {
    icon: Scissors,
    subtitle: "Tailored cuts & blowouts",
  },
  "Hair Coloring": {
    icon: Palette,
    subtitle: "Balayage & botanical gloss",
  },
  "Hair Treatment": {
    icon: Droplets,
    subtitle: "Keratin & restorative masks",
  },
  "Facial & Skincare": {
    icon: Sun,
    subtitle: "Calm radiance rituals",
  },
  Makeup: {
    icon: Sparkles,
    subtitle: "Soft editorial artistry",
  },
  "Manicure & Pedicure": {
    icon: HandHeart,
    subtitle: "Botanical nail & cuticle care",
  },
  "Spa & Massage": {
    icon: Flower2,
    subtitle: "Herbal stone relaxation",
  },
};

export function HomeDynamicSections() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<string[]>([...SALON_CATEGORIES]);
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
      setServices((data.services || []).slice(0, 6));
      if (data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch (err) {
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

  return (
    <>
      {/* Dynamic Section 1: Featured Salon Services */}
      <section
        aria-labelledby="featured-services-heading"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      >
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-widest text-accent-text uppercase">
              Curated Treatments
            </p>
            <h2
              id="featured-services-heading"
              className="mt-2 font-display text-3xl font-semibold text-text sm:text-4xl"
            >
              Featured Salon Services
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Explore our most requested hair, skincare, nail, and spa rituals
              available for online booking.
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
            <div className="rounded-card border border-border bg-surface p-8 text-center">
              <p className="text-sm font-medium text-[#9A352E]">{error}</p>
              <Button variant="secondary" className="mt-4" onClick={loadData}>
                Try again
              </Button>
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-card border border-border bg-surface p-10 text-center">
              <p className="text-base font-semibold text-text">
                No active salon services published yet.
              </p>
              <p className="mt-1 text-sm text-muted">
                Check back soon or browse our full menu once services are active.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dynamic Section 2: Salon Service Categories */}
      <section
        aria-labelledby="categories-heading"
        className="border-y border-border bg-warm-sand/60"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest text-accent-text uppercase">
              Browse by Specialty
            </p>
            <h2
              id="categories-heading"
              className="mt-2 font-display text-3xl font-semibold text-text sm:text-4xl"
            >
              Salon Service Categories
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              Select a treatment category to jump directly to matching services.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => {
              const meta = CATEGORY_META[category] ?? {
                icon: Sparkles,
                subtitle: "Explore services",
              };
              const Icon = meta.icon;
              return (
                <Link
                  key={category}
                  href={`/services?category=${encodeURIComponent(category)}`}
                  className="group flex flex-col justify-between rounded-card border border-border bg-surface p-5 shadow-card transition-[border-color,box-shadow] duration-200 hover:border-primary/45 hover:shadow-card-hover"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-control bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="mt-4">
                    <h3 className="text-base font-bold text-text group-hover:text-primary">
                      {category}
                    </h3>
                    <p className="mt-1 text-xs text-muted">{meta.subtitle}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
