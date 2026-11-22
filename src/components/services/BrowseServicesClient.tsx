"use client";

import { RotateCcw, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Button } from "@/components/ui/Button";
import { ServiceGridSkeleton } from "@/components/ui/Loader";
import { apiRequest } from "@/lib/api-client";
import { SALON_CATEGORIES } from "@/lib/constants";
import type { SalonService } from "@/types";

type ServiceSortOption =
  | "newest"
  | "price_asc"
  | "price_desc"
  | "duration_asc"
  | "duration_desc";

const SORT_LABELS: Record<ServiceSortOption, string> = {
  newest: "Featured",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  duration_asc: "Shortest Duration",
  duration_desc: "Longest Duration",
};

export function BrowseServicesClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get("category") || "all";
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState<ServiceSortOption>("newest");

  const [services, setServices] = useState<SalonService[]>([]);
  const [totalCatalogCount, setTotalCatalogCount] = useState<number | null>(null);
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
      const apiSort =
        sort === "price_asc" || sort === "price_desc" ? sort : "newest";
      params.set("sort", apiSort);

      const data = await apiRequest<{
        services: SalonService[];
        categories: string[];
      }>(`/services?${params.toString()}`, { auth: false });

      const nextServices = data.services || [];
      setServices(nextServices);
      if (!debouncedSearch && category === "all") {
        setTotalCatalogCount(nextServices.length);
      }
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

  const displayedServices = useMemo(() => {
    if (sort === "duration_asc") {
      return [...services].sort((a, b) => a.duration - b.duration || a.price - b.price);
    }
    if (sort === "duration_desc") {
      return [...services].sort((a, b) => b.duration - a.duration || a.price - b.price);
    }
    return services;
  }, [services, sort]);

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

  const hasSearchOrCategory = debouncedSearch !== "" || category !== "all";
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      {/* Compact Page Introduction */}
      <div className="max-w-2xl">
        <p className="text-xs font-bold tracking-widest text-accent-text uppercase">
          Treatment Menu
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-text sm:text-5xl">
          Find Your Perfect Treatment
        </h1>
        <p className="mt-2.5 text-sm leading-relaxed text-muted sm:text-base">
          Explore curated hair, facial, nail, and spa rituals—compare
          transparent pricing and durations before booking.
        </p>
      </div>

      {/* Search, Filter & Sort Controls */}
      <search className="mt-7 rounded-card border border-border bg-surface p-4 shadow-card sm:p-5">
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
              className="salon-select h-11 w-full rounded-control border border-border bg-surface text-sm text-text focus:border-primary focus:outline-none"
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
              Sort by
            </label>
            <select
              id="service-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as ServiceSortOption)}
              className="salon-select h-11 w-full rounded-control border border-border bg-surface text-sm text-text focus:border-primary focus:outline-none"
            >
              <option value="newest">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration_asc">Shortest Duration</option>
              <option value="duration_desc">Longest Duration</option>
            </select>
          </div>
        </form>

        {/* Filtering Feedback & Active Filter Chips */}
        {!isLoading && !error && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold text-text">
                Showing {displayedServices.length}
                {hasSearchOrCategory && totalCatalogCount !== null
                  ? ` of ${totalCatalogCount}`
                  : ""}{" "}
                {displayedServices.length === 1 ? "matching service" : "matching services"}
              </p>

              {debouncedSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setDebouncedSearch("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-page px-2.5 py-1 text-xs font-medium text-text transition-colors hover:border-primary/40 hover:bg-secondary/50 cursor-pointer"
                >
                  <span>Search: &ldquo;{debouncedSearch}&rdquo;</span>
                  <X className="h-3 w-3 text-muted" aria-hidden="true" />
                </button>
              )}

              {category !== "all" && (
                <button
                  type="button"
                  onClick={() => handleCategoryChange("all")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-page px-2.5 py-1 text-xs font-medium text-text transition-colors hover:border-primary/40 hover:bg-secondary/50 cursor-pointer"
                >
                  <span>Category: {category}</span>
                  <X className="h-3 w-3 text-muted" aria-hidden="true" />
                </button>
              )}

              {sort !== "newest" && (
                <button
                  type="button"
                  onClick={() => setSort("newest")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-page px-2.5 py-1 text-xs font-medium text-text transition-colors hover:border-primary/40 hover:bg-secondary/50 cursor-pointer"
                >
                  <span>Sort: {SORT_LABELS[sort]}</span>
                  <X className="h-3 w-3 text-muted" aria-hidden="true" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-control border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-secondary cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Clear All
              </button>
            )}
          </div>
        )}
      </search>

      {/* Results Grid */}
      <div className="mt-8">
        {isLoading ? (
          <ServiceGridSkeleton count={6} />
        ) : error ? (
          <div className="rounded-card border border-border bg-surface p-12 text-center shadow-card">
            <h2 className="font-display text-2xl font-semibold text-text">
              Unable to reach the treatment menu
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">{error}</p>
            <Button variant="secondary" className="mt-5" onClick={fetchServices}>
              Retry
            </Button>
          </div>
        ) : displayedServices.length === 0 ? (
          <div className="rounded-card border border-border bg-surface px-6 py-14 text-center shadow-card">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-primary">
              <Search className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold text-text sm:text-3xl">
              No matching treatments found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
              {debouncedSearch && category !== "all"
                ? `We couldn't find any treatments matching "${debouncedSearch}" in ${category}.`
                : debouncedSearch
                  ? `We couldn't find any treatments matching "${debouncedSearch}".`
                  : category !== "all"
                    ? `There are currently no active treatments listed under ${category}.`
                    : "Try adjusting your search keywords or clearing active filters to view all salon treatments."}
            </p>
            {hasActiveFilters && (
              <Button variant="secondary" className="mt-6" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
