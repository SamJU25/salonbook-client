import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-md rounded-panel border border-border bg-surface p-8 text-center shadow-card sm:p-10">
          <p className="text-xs font-bold tracking-widest text-accent-text uppercase">
            404 · Page Not Found
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-text">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-3 text-sm text-muted">
            The route you requested may have moved or is unavailable. Return to
            home or browse our salon services.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Back to Home
            </Link>
            <Link
              href="/services"
              className="inline-flex h-11 items-center justify-center rounded-control border border-border bg-surface px-5 text-sm font-semibold text-text hover:bg-surface-muted"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
