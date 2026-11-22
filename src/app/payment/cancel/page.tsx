import { XCircle } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function PaymentCancelPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <div className="rounded-panel border border-border bg-surface p-8 text-center shadow-card sm:p-10">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-cancelled-bg text-status-cancelled-text">
              <XCircle className="h-8 w-8" aria-hidden="true" />
            </span>
            <h1 className="mt-5 font-display text-3xl font-semibold text-text sm:text-4xl">
              Payment Cancelled
            </h1>
            <p className="mt-2 text-sm text-muted">
              You weren&apos;t charged. You can pay for your confirmed
              appointment anytime in My Appointments.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/customer/appointments"
                className="inline-flex h-11 items-center justify-center rounded-control bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Return to My Appointments
              </Link>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-control border border-border bg-surface px-5 text-sm font-semibold text-text hover:bg-surface-muted"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
