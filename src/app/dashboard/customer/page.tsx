"use client";

import { CalendarCheck, CalendarClock, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageLoader } from "@/components/ui/Loader";
import { apiRequest } from "@/lib/api-client";
import type { CustomerOverviewStats } from "@/types";

export default function CustomerOverviewPage() {
  const [stats, setStats] = useState<CustomerOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<CustomerOverviewStats>(
        "/dashboard/customer-overview"
      );
      setStats(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load dashboard overview"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  if (isLoading) {
    return <PageLoader label="Loading dashboard data..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Customer Overview</h1>
          <p className="mt-1 text-sm text-muted">
            Track your salon appointment requests and confirmed bookings.
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex h-11 items-center justify-center rounded-control bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Book New Service
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={stats?.totalAppointments ?? 0}
          icon={CalendarCheck}
        />
        <StatCard
          label="Pending"
          value={stats?.pendingAppointments ?? 0}
          icon={CalendarClock}
        />
        <StatCard
          label="Confirmed"
          value={stats?.confirmedAppointments ?? 0}
          icon={CheckCircle2}
        />
        <StatCard
          label="Cancelled"
          value={stats?.cancelledAppointments ?? 0}
          icon={XCircle}
        />
      </div>

      <div className="rounded-card border border-border bg-surface p-6 shadow-xs">
        <h2 className="text-lg font-bold text-text">Next Steps</h2>
        <p className="mt-1 text-sm text-muted">
          Once the salon confirms a pending appointment request, visit{" "}
          <Link
            href="/dashboard/customer/appointments"
            className="font-semibold text-primary hover:underline"
          >
            My Appointments
          </Link>{" "}
          to complete payment securely through Stripe.
        </p>
      </div>
    </div>
  );
}
