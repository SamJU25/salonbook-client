"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 py-16">
      <div className="max-w-md rounded-panel border border-border bg-surface p-8 text-center shadow-card">
        <h1 className="font-display text-3xl font-semibold text-text">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted">
          An unexpected error occurred while loading this page. Please try
          again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-control border border-border bg-surface px-5 text-sm font-semibold text-text hover:bg-surface-muted"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
