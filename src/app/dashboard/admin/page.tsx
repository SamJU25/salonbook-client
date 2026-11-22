"use client";

import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Scissors,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageLoader } from "@/components/ui/Loader";
import { apiRequest } from "@/lib/api-client";
import type { AdminOverviewStats } from "@/types";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<AdminOverviewStats>("/admin/overview");
      setStats(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load admin overview"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  if (isLoading) {
    return <PageLoader label="Loading dashboard data..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Overview</h1>
          <p className="mt-1 text-sm text-muted">
            Manage services, customers, appointments, and payments.
          </p>
        </div>

        <Link
          href="/dashboard/admin/services/new"
          className="inline-flex h-11 items-center justify-center rounded-control bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Add New Service
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total Registered Customers"
          value={stats?.totalCustomers ?? 0}
          icon={Users}
        />
        <StatCard
          label="Total Active Services"
          value={stats?.totalActiveServices ?? 0}
          icon={Scissors}
        />
        <StatCard
          label="Total Appointment Requests"
          value={stats?.totalAppointments ?? 0}
          icon={CalendarCheck}
        />
        <StatCard
          label="Pending Appointments"
          value={stats?.pendingAppointments ?? 0}
          icon={CalendarClock}
        />
        <StatCard
          label="Confirmed Appointments"
          value={stats?.confirmedAppointments ?? 0}
          icon={CheckCircle2}
        />
        <StatCard
          label="Total Successful Payments"
          value={stats?.totalSuccessfulPayments ?? 0}
          icon={CreditCard}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/admin/appointments"
          className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors hover:border-primary/40"
        >
          <h2 className="text-base font-bold text-text">Review Appointments</h2>
          <p className="mt-1 text-sm text-muted">
            Confirm pending customer bookings or cancel requests.
          </p>
        </Link>
        <Link
          href="/dashboard/admin/services"
          className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors hover:border-primary/40"
        >
          <h2 className="text-base font-bold text-text">Manage Services</h2>
          <p className="mt-1 text-sm text-muted">
            Add, edit, or pause salon services.
          </p>
        </Link>
        <Link
          href="/dashboard/admin/transactions"
          className="rounded-card border border-border bg-surface p-5 shadow-xs transition-colors hover:border-primary/40"
        >
          <h2 className="text-base font-bold text-text">Transactions</h2>
          <p className="mt-1 text-sm text-muted">
            View completed Stripe payments.
          </p>
        </Link>
      </div>
    </div>
  );
}
