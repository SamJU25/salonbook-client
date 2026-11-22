"use client";

import { RotateCcw, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/Button";
import { ServiceGridSkeleton } from "@/components/ui/Loader";
import { apiRequest } from "@/lib/api-client";
import { SALON_CATEGORIES } from "@/lib/constants";
import type { SalonService } from "@/types";

export function BrowseServicesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get("category") || "all";
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc">("newest");

  const [services, setServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<string[]>([...SALON_CATEGORIES]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paramCat = searchParams.get("category") || "all";
    setCategory(paramCat);
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (category && category !== "all") params.set("category", category);
      if (sort) params.set("sort", sort);

      const data = await apiRequest<{
        services: SalonService[];
        categories: string[];
      }>(`/services?${params.toString()}`, { auth: false });

      setServices(data.services || []);
      if (data.categories && data.categories.length > 0) {
        const merged = Array.from(new Set([...SALON_CATEGORIES, ...data.categories]));
        setCategories(merged);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load salon services. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, category, sort]);

  useEffect(() => {
    void fetchServices();
  }, [fetchServices]);

  const handleCategoryChange = (nextCategory: string) => {
    setCategory(nextCategory);
    const params = new URLSearchParams(searchParams.toString());
    if (nextCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }
    const qs = params.toString();
    router.replace(qs ? `/services?${qs}` : "/services", { scroll: false });
  };

  const hasActiveFilters =
    searchInput.trim() !== "" || category !== "all" || sort !== "newest";

  const handleReset = () => {
    setSearchInput("");
    setDebouncedSearch("");
    setCategory("all");
    setSort("newest");
    router.replace("/services", { scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="max-w-2xl">
        <p className="text-xs font-bold tracking-widest text-accent-text uppercase">
          Treatment Menu
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-text sm:text-5xl">
          Browse Salon Services
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
          Search by treatment name, explore by category, or sort by price to
          find your ideal appointment.
        </p>
      </div>

      {/* Search, Filter & Sort Controls */}
      <search className="mt-8 rounded-card border border-border bg-surface p-4 shadow-card sm:p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setDebouncedSearch(searchInput.trim());
          }}
          className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end"
        >
          <div className="md:col-span-5">
            <label
              htmlFor="service-search"
              className="mb-1.5 block text-xs font-semibold text-text"
            >
              Search by service name
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="service-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="e.g. Balayage, Facial, Haircut..."
                spellCheck={false}
                enterKeyHint="search"
                className="h-11 w-full rounded-control border border-border bg-surface pr-3.5 pl-10 text-sm text-text placeholder:text-muted/75 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-4">
            <label
              htmlFor="service-category"
              className="mb-1.5 block text-xs font-semibold text-text"
            >
              Filter by category
            </label>
            <select
              id="service-category"
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text focus:border-primary focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label
              htmlFor="service-sort"
              className="mb-1.5 block text-xs font-semibold text-text"
            >
              Sort by price
            </label>
            <select
              id="service-sort"
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as "newest" | "price_asc" | "price_desc")
              }
              className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text focus:border-primary focus:outline-none"
            >
              <option value="newest">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </form>

        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs font-medium text-muted">
              Showing {services.length} {services.length === 1 ? "service" : "services"}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset filters
            </button>
          </div>
        )}
      </search>

      {/* Results Grid */}
      <div className="mt-10">
        {isLoading ? (
          <ServiceGridSkeleton count={6} />
        ) : error ? (
          <div className="rounded-card border border-border bg-surface p-10 text-center">
            <p className="text-sm font-semibold text-[#9A352E]">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={fetchServices}>
              Retry
            </Button>
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-card border border-border bg-surface p-12 text-center shadow-card">
            <h2 className="font-display text-2xl font-semibold text-text">
              No matching services found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Try adjusting your search keywords or clearing your category
              filter to view all active salon treatments.
            </p>
            {hasActiveFilters && (
              <Button variant="secondary" className="mt-5" onClick={handleReset}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
