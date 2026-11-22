"use client";

import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageLoader } from "@/components/ui/Loader";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiRequest } from "@/lib/api-client";
import type {
  AppointmentCustomerRef,
  AppointmentServiceRef,
  SalonAppointment,
} from "@/types";

function getService(ref: SalonAppointment["serviceId"]): AppointmentServiceRef | null {
  return typeof ref === "object" && ref !== null ? ref : null;
}

function getCustomer(
  ref: SalonAppointment["customerId"]
): AppointmentCustomerRef | null {
  return typeof ref === "object" && ref !== null ? ref : null;
}

export default function AdminManageAppointmentsPage() {
  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [detailTarget, setDetailTarget] = useState<SalonAppointment | null>(null);
  const [actionTarget, setActionTarget] = useState<{
    appointment: SalonAppointment;
    nextStatus: "confirmed" | "cancelled";
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<SalonAppointment[]>("/admin/appointments");
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

  const handleConfirmAction = async () => {
    if (!actionTarget) return;
    setIsUpdating(true);
    try {
      await apiRequest(
        `/admin/appointments/${actionTarget.appointment._id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: actionTarget.nextStatus }),
        }
      );

      setAppointments((prev) =>
        prev.map((a) =>
          a._id === actionTarget.appointment._id
            ? { ...a, status: actionTarget.nextStatus }
            : a
        )
      );

      toast.success(
        `Appointment ${actionTarget.nextStatus} successfully`
      );
      setActionTarget(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update appointment status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading all appointment requests..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Manage Appointments</h1>
        <p className="mt-1 text-sm text-muted">
          Review customer appointment requests, confirm pending bookings, or
          cancel appointments.
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-10 text-center shadow-xs">
          <p className="text-base font-semibold text-text">
            No appointment requests submitted yet.
          </p>
        </div>
      ) : (
        <>
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="admin-appointments-caption"
            className="hidden overflow-x-auto rounded-card border border-border bg-surface shadow-xs xl:block"
          >
            <table className="w-full border-collapse text-left text-sm">
              <caption id="admin-appointments-caption" className="sr-only">
                All salon appointment requests
              </caption>
              <thead className="border-b border-border bg-surface-muted/70 text-xs font-bold tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Service</th>
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
                  const customer = getCustomer(appt.customerId);
                  const service = getService(appt.serviceId);
                  const canConfirm = appt.status === "pending";
                  const canCancel =
                    appt.status === "pending" ||
                    (appt.status === "confirmed" &&
                      appt.paymentStatus === "unpaid");

                  return (
                    <tr key={appt._id} className="hover:bg-surface-muted/40">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-text">
                          {customer?.name || "Customer"}
                        </div>
                        <div className="text-xs text-muted">
                          {customer?.email || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-text">
                          {service?.serviceName || "Salon Service"}
                        </div>
                        <div className="text-xs text-muted">
                          {service?.category || "—"}
                        </div>
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
                          >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                            Details
                          </Button>
                          {canConfirm && (
                            <Button
                              size="sm"
                              onClick={() =>
                                setActionTarget({
                                  appointment: appt,
                                  nextStatus: "confirmed",
                                })
                              }
                            >
                              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                              Confirm
                            </Button>
                          )}
                          {canCancel && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setActionTarget({
                                  appointment: appt,
                                  nextStatus: "cancelled",
                                })
                              }
                              className="border-[#F0C8C4] text-[#9A352E] hover:bg-status-cancelled-bg"
                            >
                              <XCircle className="h-4 w-4" aria-hidden="true" />
                              Cancel
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:hidden">
            {appointments.map((appt) => {
              const customer = getCustomer(appt.customerId);
              const service = getService(appt.serviceId);
              const canConfirm = appt.status === "pending";
              const canCancel =
                appt.status === "pending" ||
                (appt.status === "confirmed" && appt.paymentStatus === "unpaid");

              return (
                <article
                  key={appt._id}
                  className="rounded-card border border-border bg-surface p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-bold text-text">
                        {service?.serviceName || "Salon Service"}
                      </h2>
                      <p className="break-words text-xs text-muted">
                        {customer?.name || "Customer"} · {customer?.email}
                      </p>
                      <p className="mt-1 text-xs font-medium text-text">
                        {appt.appointmentDate} · {appt.timeSlot}
                      </p>
                    </div>
                    <span className="shrink-0 text-base font-bold text-text">
                      ${appt.servicePrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge status={appt.status} />
                    <StatusBadge status={appt.paymentStatus} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setDetailTarget(appt)}
                    >
                      Details
                    </Button>
                    {canConfirm && (
                      <Button
                        size="sm"
                        onClick={() =>
                          setActionTarget({
                            appointment: appt,
                            nextStatus: "confirmed",
                          })
                        }
                      >
                        Confirm
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setActionTarget({
                            appointment: appt,
                            nextStatus: "cancelled",
                          })
                        }
                        className="border-[#F0C8C4] text-[#9A352E]"
                      >
                        Cancel
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
              <span className="shrink-0 text-muted">Customer</span>
              <span className="min-w-0 break-words text-right font-semibold text-text">
                {getCustomer(detailTarget.customerId)?.name} (
                {getCustomer(detailTarget.customerId)?.email})
              </span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="shrink-0 text-muted">Service</span>
              <span className="min-w-0 break-words text-right font-semibold text-text">
                {getService(detailTarget.serviceId)?.serviceName}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="text-muted">Date &amp; Time</span>
              <span className="font-medium text-text">
                {detailTarget.appointmentDate} · {detailTarget.timeSlot}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-2">
              <span className="text-muted">Service Price</span>
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
              <span className="text-muted">Booking Request Date</span>
              <span className="text-text">
                {new Date(detailTarget.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-muted">Customer Message</span>
              <p className="mt-1 rounded-control bg-page p-3 text-text">
                {detailTarget.message || "No additional notes provided."}
              </p>
            </div>
          </div>
        )}
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(actionTarget)}
        title={
          actionTarget?.nextStatus === "confirmed"
            ? "Confirm this appointment?"
            : "Cancel this appointment?"
        }
        description={
          actionTarget?.nextStatus === "confirmed"
            ? "Confirming allows the customer to proceed with Stripe payment for this appointment."
            : "Cancelling releases the reserved time slot and prevents payment on this booking."
        }
        confirmLabel={
          actionTarget?.nextStatus === "confirmed"
            ? "Confirm appointment"
            : "Cancel appointment"
        }
        cancelLabel="Back"
        destructive={actionTarget?.nextStatus === "cancelled"}
        isLoading={isUpdating}
        onConfirm={handleConfirmAction}
        onClose={() => setActionTarget(null)}
      />
    </div>
  );
}
