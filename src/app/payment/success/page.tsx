"use client";

import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageLoader } from "@/components/ui/Loader";
import { apiRequest } from "@/lib/api-client";
import { signOut, useSession } from "@/lib/auth-client";
import { formatCurrency } from "@/lib/format";
import type { SalonTransaction } from "@/types";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const { data: session, isPending: isSessionPending } = useSession();

  const [status, setStatus] = useState<"processing" | "paid" | "failed">("processing");
  const [transaction, setTransaction] = useState<SalonTransaction | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (isSessionPending) return;
    const user = session?.user as { isBlocked?: boolean } | undefined;
    if (!user) {
      router.replace("/sign-in?callbackUrl=/dashboard/customer/appointments");
      return;
    }
    if (user.isBlocked) {
      toast.error("Your account has been blocked by an administrator.");
      void signOut().then(() => router.replace("/sign-in"));
    }
  }, [isSessionPending, session, router]);

  useEffect(() => {
    if (isSessionPending || !session?.user || !sessionId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const checkStatus = async () => {
      try {
        const res = await apiRequest<{
          verified: boolean;
          status: "processing" | "paid" | "failed";
          transaction: SalonTransaction | null;
        }>(`/payments/session-status/${encodeURIComponent(sessionId)}`);

        if (cancelled) return;
        setTransaction(res.transaction);
        setStatus(res.status);

        if (res.status === "processing" && attempts < 8) {
          timer = setTimeout(() => {
            if (!cancelled) setAttempts((n) => n + 1);
          }, 1500);
        }
      } catch {
        if (!cancelled && attempts < 6) {
          timer = setTimeout(() => {
            if (!cancelled) setAttempts((n) => n + 1);
          }, 1500);
        }
      }
    };

    void checkStatus();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isSessionPending, session, sessionId, attempts]);

  const appt =
    transaction && typeof transaction.appointmentId === "object"
      ? transaction.appointmentId
      : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-panel border border-border bg-surface p-8 text-center shadow-card sm:p-10">
        {!sessionId ? (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-cancelled-bg text-[#9A352E]">
              <AlertCircle className="h-8 w-8" aria-hidden="true" />
            </span>
            <h1 className="mt-5 font-display text-3xl font-semibold text-text sm:text-4xl">
              Missing Payment Session
            </h1>
            <p className="mt-2 text-sm text-muted">
              No Stripe checkout session reference was found in this URL. Please
              check your payment status from My Appointments.
            </p>
          </>
        ) : status === "paid" ? (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-confirmed-bg text-status-confirmed-text">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </span>
            <h1 className="mt-5 font-display text-3xl font-semibold text-text sm:text-4xl">
              Payment Confirmed
            </h1>
            <p className="mt-2 text-sm text-muted">
              Your Stripe payment has been verified and recorded for your salon
              appointment.
            </p>

            {transaction && (
              <div className="mt-6 space-y-2.5 rounded-card border border-border bg-page p-5 text-left text-sm">
                {appt?.serviceId && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted">Service</span>
                    <span className="font-semibold text-text">
                      {appt.serviceId.serviceName}
                    </span>
                  </div>
                )}
                {appt && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted">Appointment</span>
                    <span className="font-medium text-text">
                      {appt.appointmentDate} · {appt.timeSlot}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Amount Paid</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(transaction.amount, transaction.currency)}{" "}
                    {transaction.currency.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted">Reference</span>
                  <span className="truncate font-mono text-xs text-muted">
                    {transaction.stripeSessionId.slice(0, 24)}...
                  </span>
                </div>
              </div>
            )}
          </>
        ) : status === "failed" ? (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-cancelled-bg text-[#9A352E]">
              <AlertCircle className="h-8 w-8" aria-hidden="true" />
            </span>
            <h1 className="mt-5 font-display text-3xl font-semibold text-text sm:text-4xl">
              Payment Not Completed
            </h1>
            <p className="mt-2 text-sm text-muted">
              Stripe reported that this checkout payment failed or expired. You
              can retry payment for confirmed appointments from My Appointments.
            </p>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-pending-bg text-status-pending-text">
              <Clock className="h-7 w-7" aria-hidden="true" />
            </span>
            <h1 className="mt-5 font-display text-3xl font-semibold text-text sm:text-4xl">
              Confirming Your Payment
            </h1>
            <p className="mt-2 text-sm text-muted">
              We are waiting for Stripe webhook verification to finalize your
              transaction. Your appointment payment status updates automatically
              once verified.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard/customer/appointments"
            className="inline-flex h-11 items-center justify-center rounded-control bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            View My Appointments
          </Link>
          <Link
            href="/services"
            className="inline-flex h-11 items-center justify-center rounded-control border border-border bg-surface px-5 text-sm font-semibold text-text hover:bg-surface-muted"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader label="Verifying payment status..." />}>
          <PaymentSuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
