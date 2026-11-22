"use client";

import { CreditCard, Eye, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageLoader } from "@/components/ui/Loader";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiRequest } from "@/lib/api-client";
import type { AppointmentServiceRef, SalonAppointment } from "@/types";

function getServiceRef(
  ref: SalonAppointment["serviceId"]
): AppointmentServiceRef | null {
  if (typeof ref === "object" && ref !== null) return ref;
  return null;
}

export default function CustomerAppointmentsPage() {
  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  const [detailTarget, setDetailTarget] = useState<SalonAppointment | null>(null);
  const [cancelTarget, setCancelTarget] = useState<SalonAppointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<SalonAppointment[]>("/appointments/my");
      setAppointments(data || []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load appointments"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      await apiRequest(`/appointments/${cancelTarget._id}/cancel`, {
        method: "PATCH",
      });
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === cancelTarget._id ? { ...a, status: "cancelled" } : a
        )
      );
      toast.success("Appointment request cancelled");
      setCancelTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to cancel appointment"
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePayNow = async (appointmentId: string) => {
    setPayingId(appointmentId);
    try {
      const data = await apiRequest<{ url: string }>(
        "/payments/create-checkout-session",
        {
          method: "POST",
          body: JSON.stringify({ appointmentId }),
        }
      );
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Couldn't start checkout. Please try again.");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't start payment. Please try again."
      );
      setPayingId(null);
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading your appointments..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">My Appointments</h1>
          <p className="mt-1 text-sm text-muted">
            Check your bookings, cancel pending requests, or pay for confirmed
            visits.
          </p>
        </div>

        <Link
          href="/services"
          className="inline-flex h-11 items-center justify-center rounded-control bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Book Appointment
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-10 text-center shadow-xs">
          <h2 className="font-display text-2xl font-semibold text-text">
            No appointments yet
          </h2>
          <p className="mt-2 text-sm text-muted">
            Browse our services to book your first appointment.
          </p>
          <Link
            href="/services"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-control bg-secondary px-5 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
          >
            Browse Services
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop / Tablet Semantic Table */}
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="my-appointments-table-caption"
            className="hidden overflow-x-auto rounded-card border border-border bg-surface shadow-xs xl:block"
          >
            <table className="w-full border-collapse text-left text-sm">
              <caption id="my-appointments-table-caption" className="sr-only">
                Your salon appointment requests and payment statuses
              </caption>
              <thead className="border-b border-border bg-surface-muted/70 text-xs font-bold tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3.5">Service</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Date &amp; Time</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Payment</th>
                  <th className="px-4 py-3.5">Requested</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {appointments.map((appt) => {
                  const service = getServiceRef(appt.serviceId);
                  return (
                    <tr key={appt._id} className="hover:bg-surface-muted/40">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {service?.image ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={service.image}
                              alt={service.serviceName}
                              className="h-11 w-14 shrink-0 rounded-lg object-cover"
                            />
                          ) : null}
                          <span className="font-semibold text-text">
                            {service?.serviceName || "Salon Service"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted">
                        {service?.category || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-text">
                          {appt.appointmentDate}
                        </div>
                        <div className="text-xs text-muted">{appt.timeSlot}</div>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-text">
                        ${appt.servicePrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={appt.paymentStatus} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted">
                        {new Date(appt.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDetailTarget(appt)}
                            aria-label="View appointment details"
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                            Details
                          </Button>

                          {appt.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setCancelTarget(appt)}
                              className="border-[#F0C8C4] text-[#9A352E] hover:bg-status-cancelled-bg"
                            >
                              <XCircle className="h-4 w-4" aria-hidden="true" />
                              Cancel
                            </Button>
                          )}

                          {appt.status === "confirmed" &&
                            appt.paymentStatus === "unpaid" && (
                              <Button
                                size="sm"
                                isLoading={payingId === appt._id}
                                onClick={() => handlePayNow(appt._id)}
                              >
                                <CreditCard className="h-4 w-4" aria-hidden="true" />
                                Pay Now
                              </Button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Card List */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:hidden">
            {appointments.map((appt) => {
              const service = getServiceRef(appt.serviceId);
              return (
                <article
                  key={appt._id}
                  className="rounded-card border border-border bg-surface p-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    {service?.image && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={service.image}
                        alt={service.serviceName}
                        className="h-14 w-16 shrink-0 rounded-control object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-accent-text uppercase">
                        {service?.category || "Salon Service"}
                      </p>
                      <h2 className="truncate text-base font-bold text-text">
                        {service?.serviceName || "Salon Service"}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted">
                        {appt.appointmentDate} · {appt.timeSlot}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <span className="text-base font-bold text-text">
                      ${appt.servicePrice.toFixed(2)}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={appt.status} />
                      <StatusBadge status={appt.paymentStatus} />
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setDetailTarget(appt)}
                    >
                      Details
                    </Button>
                    {appt.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCancelTarget(appt)}
                        className="border-[#F0C8C4] text-[#9A352E] hover:bg-status-cancelled-bg"
                      >
                        Cancel
                      </Button>
                    )}
                    {appt.status === "confirmed" &&
                      appt.paymentStatus === "unpaid" && (
                        <Button
                          size="sm"
                          isLoading={payingId === appt._id}
                          onClick={() => handlePayNow(appt._id)}
                        >
                          Pay Now
                        </Button>
                      )}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      <ModalDialog
        open={Boolean(detailTarget)}
        title="Appointment Details"
        onClose={() => setDetailTarget(null)}
      >
        {detailTarget && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="shrink-0 text-muted">Service</span>
              <span className="min-w-0 break-words text-right font-semibold text-text">
                {getServiceRef(detailTarget.serviceId)?.serviceName || "Service"}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="text-muted">Category</span>
              <span className="font-medium text-text">
                {getServiceRef(detailTarget.serviceId)?.category || "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="text-muted">Scheduled For</span>
              <span className="font-semibold text-text">
                {detailTarget.appointmentDate} at {detailTarget.timeSlot}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="text-muted">Price</span>
              <span className="font-bold text-text">
                ${detailTarget.servicePrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="text-muted">Appointment Status</span>
              <StatusBadge status={detailTarget.status} />
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="text-muted">Payment Status</span>
              <StatusBadge status={detailTarget.paymentStatus} />
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="text-muted">Request Date</span>
              <span className="text-text">
                {new Date(detailTarget.createdAt).toLocaleString()}
              </span>
            </div>
            {detailTarget.message && (
              <div>
                <span className="block text-muted">Your Note</span>
                <p className="mt-1 break-words rounded-control bg-page p-3 text-text">
                  {detailTarget.message}
                </p>
              </div>
            )}
          </div>
        )}
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel appointment request?"
        description="This cancels your pending request and frees up the time slot."
        confirmLabel="Cancel booking"
        cancelLabel="Keep request"
        destructive
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
}
