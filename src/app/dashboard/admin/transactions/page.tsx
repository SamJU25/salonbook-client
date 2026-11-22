"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageLoader } from "@/components/ui/Loader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiRequest } from "@/lib/api-client";
import {
  formatCurrency,
  formatDateEnUS,
  formatDateTimeEnUS,
} from "@/lib/format";
import type { AppointmentCustomerRef, SalonTransaction } from "@/types";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<SalonTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<SalonTransaction[]>("/admin/transactions");
      setTransactions(data || []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load transactions"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  if (isLoading) {
    return <PageLoader label="Loading payment transactions..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Payment Transactions</h1>
        <p className="mt-1 text-sm text-muted">
          Read-only ledger of Stripe Checkout payments verified through webhook
          events.
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-10 text-center shadow-xs">
          <p className="text-base font-semibold text-text">
            No payment transactions recorded yet.
          </p>
        </div>
      ) : (
        <>
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="admin-transactions-caption"
            className="hidden overflow-x-auto rounded-card border border-border bg-surface shadow-xs xl:block"
          >
            <table className="w-full border-collapse text-left text-sm">
              <caption id="admin-transactions-caption" className="sr-only">
                Verified Stripe payment transactions
              </caption>
              <thead className="border-b border-border bg-surface-muted/70 text-xs font-bold tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Related Service</th>
                  <th className="px-4 py-3.5">Appointment Date</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Currency</th>
                  <th className="px-4 py-3.5">Stripe Session</th>
                  <th className="px-4 py-3.5">Payment Status</th>
                  <th className="px-4 py-3.5">Transaction Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => {
                  const customer =
                    typeof tx.customerId === "object" && tx.customerId !== null
                      ? (tx.customerId as AppointmentCustomerRef)
                      : null;
                  const appt =
                    typeof tx.appointmentId === "object" &&
                    tx.appointmentId !== null
                      ? tx.appointmentId
                      : null;
                  const shortSession =
                    tx.stripeSessionId.length > 20
                      ? `${tx.stripeSessionId.slice(0, 18)}...`
                      : tx.stripeSessionId;

                  return (
                    <tr key={tx._id} className="hover:bg-surface-muted/40">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-text">
                          {customer?.name || "Customer"}
                        </div>
                        <div className="text-xs text-muted">
                          {customer?.email || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-text">
                        {appt?.serviceId?.serviceName || "Salon Service"}
                      </td>
                      <td className="px-4 py-3.5 text-muted">
                        {appt
                          ? `${appt.appointmentDate} · ${appt.timeSlot}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-text">
                        {formatCurrency(tx.amount, tx.currency)}
                      </td>
                      <td className="px-4 py-3.5 uppercase text-muted">
                        {tx.currency}
                      </td>
                      <td
                        className="px-4 py-3.5 font-mono text-xs text-muted"
                        title={tx.stripeSessionId}
                      >
                        {shortSession}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        {formatDateTimeEnUS(tx.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:hidden">
            {transactions.map((tx) => {
              const customer =
                typeof tx.customerId === "object" && tx.customerId !== null
                  ? (tx.customerId as AppointmentCustomerRef)
                  : null;
              const appt =
                typeof tx.appointmentId === "object" &&
                tx.appointmentId !== null
                  ? tx.appointmentId
                  : null;

              return (
                <article
                  key={tx._id}
                  className="rounded-card border border-border bg-surface p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold text-text">
                        {appt?.serviceId?.serviceName || "Salon Service"}
                      </h2>
                      <p className="break-words text-xs text-muted">
                        {customer?.name} · {customer?.email}
                      </p>
                    </div>
                    <span className="shrink-0">
                      <StatusBadge status={tx.status} />
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                    <span className="font-bold text-text">
                      {formatCurrency(tx.amount, tx.currency)} {tx.currency.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDateEnUS(tx.createdAt)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
