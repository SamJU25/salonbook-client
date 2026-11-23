"use client";

import { ArrowLeft, Calendar, CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Loader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { apiRequest } from "@/lib/api-client";
import { signOut, useSession } from "@/lib/auth-client";
import { DatePicker } from "@/components/ui/DatePicker";
import { PREDEFINED_TIME_SLOTS } from "@/lib/constants";
import { getSalonNow, parseTimeSlotMinutes } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { bookingSchema } from "@/lib/validators";
import type { SalonService } from "@/types";

export default function ServiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const serviceId = params?.id || "";
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const user = session?.user as
    | { id?: string; name?: string; role?: string; isBlocked?: boolean }
    | undefined;

  const [service, setService] = useState<SalonService | null>(null);
  const [isLoadingService, setIsLoadingService] = useState(true);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const todayIso = useMemo(() => getSalonNow().date, []);
  const [appointmentDate, setAppointmentDate] = useState<string>(todayIso);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect unauthenticated users or sign out blocked users
  useEffect(() => {
    if (isSessionPending) return;
    if (!user) {
      router.replace(
        `/sign-in?callbackUrl=${encodeURIComponent(`/services/${serviceId}`)}`
      );
      return;
    }
    if (user.isBlocked) {
      toast.error("Your account has been blocked by an administrator.");
      void signOut().then(() => router.replace("/sign-in"));
    }
  }, [isSessionPending, user, router, serviceId]);

  const loadService = useCallback(async () => {
    if (!user || user.isBlocked || !serviceId) return;
    setIsLoadingService(true);
    setServiceError(null);
    try {
      const data = await apiRequest<SalonService>(`/services/${serviceId}`);
      setService(data);
    } catch (err) {
      setServiceError(
        err instanceof Error ? err.message : "Service not found or unavailable."
      );
    } finally {
      setIsLoadingService(false);
    }
  }, [user, serviceId]);

  useEffect(() => {
    if (!isSessionPending && user && !user.isBlocked) {
      void loadService();
    }
  }, [isSessionPending, user, loadService]);

  const loadBookedSlots = useCallback(async () => {
    if (!user || user.isBlocked || !serviceId || !appointmentDate || !service) {
      return;
    }
    if (service.status !== "active") return;

    setIsLoadingSlots(true);
    try {
      const data = await apiRequest<{ bookedSlots: string[] }>(
        `/services/${serviceId}/booked-slots?date=${encodeURIComponent(appointmentDate)}`
      );
      const taken = data.bookedSlots || [];
      setBookedSlots(taken);
      setSelectedSlot((prev) => (taken.includes(prev) ? "" : prev));
    } catch {
      setBookedSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [user, serviceId, appointmentDate, service]);

  useEffect(() => {
    void loadBookedSlots();
  }, [loadBookedSlots]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || user?.role === "admin") return;

    const parsed = bookingSchema.safeParse({
      appointmentDate,
      timeSlot: selectedSlot,
      message,
    });

    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ||
          "Please select a valid date and available time slot"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("/appointments", {
        method: "POST",
        body: JSON.stringify({
          serviceId: service._id,
          appointmentDate: parsed.data.appointmentDate,
          timeSlot: parsed.data.timeSlot,
          message: parsed.data.message,
        }),
      });
      toast.success("Appointment requested. You can track confirmation in My Appointments.");
      router.push("/dashboard/customer/appointments");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to submit appointment request.";
      toast.error(msg);
      void loadService();
      void loadBookedSlots();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSessionPending || !user || user.isBlocked) {
    return <PageLoader label="Checking your account..." />;
  }

  if (isLoadingService) {
    return <PageLoader label="Loading salon service details..." />;
  }

  if (serviceError || !service) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-panel border border-border bg-surface p-10 text-center shadow-card">
          <h1 className="font-display text-3xl font-semibold text-text">
            Service Unavailable
          </h1>
          <p className="mt-2 text-sm text-muted">
            {serviceError || "The requested salon service could not be found."}
          </p>
          <Link
            href="/services"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Browse Services
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin";
  const isInactive = service.status !== "active";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Browse Services
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Service Information */}
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-panel border border-border bg-surface shadow-card">
            <div className="aspect-4/3 w-full overflow-hidden bg-surface-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={service.image}
                alt={service.serviceName}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold tracking-widest text-accent-text uppercase">
                  {service.category}
                </span>
                {service.status !== "active" && (
                  <StatusBadge status={service.status} />
                )}
              </div>

              <h1 className="mt-2 font-display text-3xl font-semibold text-text sm:text-4xl">
                {service.serviceName}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-6 border-y border-border py-4">
                <div>
                  <p className="text-xs font-medium text-muted">Service Price</p>
                  <p className="mt-0.5 text-2xl font-bold text-text">
                    {formatCurrency(service.price)}
                  </p>
                </div>
                <div className="h-9 w-px bg-border" aria-hidden="true" />
                <div>
                  <p className="text-xs font-medium text-muted">
                    Estimated Duration
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-lg font-bold text-text">
                    <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                    {service.duration} mins
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h2 className="text-sm font-bold tracking-wide text-text uppercase">
                  About This Treatment
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-muted sm:text-base">
                  {service.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Booking Panel */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-panel border border-border bg-surface p-6 shadow-card sm:p-7">
            <h2 className="font-display text-2xl font-semibold text-text sm:text-3xl">
              Book Appointment
            </h2>
            <p className="mt-1.5 text-sm text-muted">
              Pick a date and time to request this appointment.
            </p>

            {isAdmin ? (
              <div className="mt-6 rounded-card border border-status-pending-border bg-status-pending-bg p-4 text-sm text-status-pending-text">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p className="font-bold">Admin Account</p>
                    <p className="mt-1">
                      Admin accounts can&apos;t book appointments. Sign in with
                      a customer account to book.
                    </p>
                  </div>
                </div>
              </div>
            ) : isInactive ? (
              <div className="mt-6 rounded-card border border-status-inactive-border bg-status-inactive-bg p-4 text-sm text-status-inactive-text">
                This service is currently unavailable.
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor="booking-date"
                    className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-text"
                  >
                    <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
                    Appointment Date
                  </label>
                  <DatePicker
                    id="booking-date"
                    value={appointmentDate}
                    minDate={todayIso}
                    onChange={setAppointmentDate}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-text">
                      Available Time Slots
                    </span>
                    {isLoadingSlots && (
                      <span className="text-xs font-medium text-muted">
                        Checking availability...
                      </span>
                    )}
                  </div>

                  <div
                    role="radiogroup"
                    aria-label="Available appointment time slots"
                    className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2"
                  >
                    {PREDEFINED_TIME_SLOTS.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const salonNow = getSalonNow();
                      const isPastToday =
                        appointmentDate === salonNow.date &&
                        parseTimeSlotMinutes(slot) <= salonNow.minutes;
                      const isDisabled = isBooked || isPastToday || isLoadingSlots;
                      const isSelected = selectedSlot === slot && !isDisabled;
                      return (
                        <button
                          key={slot}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          disabled={isDisabled}
                          onClick={() => setSelectedSlot(slot)}
                          className={`flex items-center justify-between rounded-control border px-3 py-2.5 text-xs font-semibold transition-colors ${
                            isBooked || isPastToday
                              ? "cursor-not-allowed border-border bg-surface-muted text-muted/60 line-through"
                              : isSelected
                                ? "cursor-pointer border-primary bg-primary text-white"
                                : "cursor-pointer border-border bg-surface text-text hover:border-primary hover:bg-secondary/50"
                          }`}
                        >
                          <span>{slot}</span>
                          {isBooked ? (
                            <span className="text-[10px] no-underline">Booked</span>
                          ) : isPastToday ? (
                            <span className="text-[10px] no-underline">Passed</span>
                          ) : isSelected ? (
                            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="booking-message"
                    className="mb-1.5 block text-sm font-semibold text-text"
                  >
                    Additional Message{" "}
                    <span className="font-normal text-muted">(Optional)</span>
                  </label>
                  <textarea
                    id="booking-message"
                    rows={3}
                    maxLength={500}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add any preferences or notes for your appointment..."
                    className="w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="rounded-card border border-border bg-page p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Selected Service</span>
                    <span className="font-semibold text-text">
                      {service.serviceName}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-muted">Date &amp; Time</span>
                    <span className="font-semibold text-text">
                      {appointmentDate}
                      {selectedSlot ? ` · ${selectedSlot}` : " · Select a slot"}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2.5">
                    <span className="font-semibold text-text">Total Price</span>
                    <span className="text-base font-bold text-primary">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    You&apos;ll only pay after the salon confirms your request.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={!selectedSlot || isLoadingSlots}
                >
                  Request Appointment
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
