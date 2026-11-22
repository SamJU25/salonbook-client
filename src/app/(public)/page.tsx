import { ArrowRight, CalendarCheck, CreditCard, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { HomeDynamicSections } from "@/components/home/HomeDynamicSections";

const BOOKING_STEPS = [
  {
    step: "01",
    title: "Find your service",
    description:
      "Explore services and compare transparent prices and estimated durations.",
    icon: Search,
  },
  {
    step: "02",
    title: "Choose your time",
    description:
      "Select an available appointment date and time slot that fits your schedule.",
    icon: CalendarCheck,
  },
  {
    step: "03",
    title: "Confirm securely",
    description:
      "Once the salon confirms your request, complete payment safely via Stripe.",
    icon: CreditCard,
  },
  {
    step: "04",
    title: "Enjoy your visit",
    description:
      "Track appointment status and payment receipts anytime from your dashboard.",
    icon: Sparkles,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-border bg-sidebar">
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="relative z-10 lg:col-span-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-secondary uppercase">
                Botanical Wellness &amp; Salon Studio
              </p>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Calm, intentional care for hair, skin, and ritual.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-sidebar-muted sm:text-lg">
                Browse thoughtfully crafted salon treatments, request your
                preferred time slot online, and manage your appointments from one
                serene space.
              </p>

              <div className="mt-8">
                <Link
                  href="/services"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-white px-6 text-sm font-bold text-primary shadow-card transition-colors hover:bg-secondary"
                >
                  Explore Salon Services
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-16/10 w-full overflow-hidden rounded-panel border border-white/15 shadow-modal">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hero-salon.jpg"
                  alt="Warm sunlit SalonBook botanical salon interior with oak styling stations and natural greenery"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Section 1 (Featured Services) & Dynamic Section 2 (Categories) */}
      <HomeDynamicSections />

      {/* Additional Section: How Booking Works */}
      <section
        aria-labelledby="how-it-works-heading"
        className="bg-secondary/75"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold tracking-widest text-accent-text uppercase">
              Simple Process
            </p>
            <h2
              id="how-it-works-heading"
              className="mt-2 font-display text-3xl font-semibold text-text sm:text-4xl"
            >
              Your next self-care moment is just a few steps away.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              From choosing your favorite service to confirming your appointment,
              we&apos;ve made booking simple.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BOOKING_STEPS.map((item) => {
              const StepIcon = item.icon;
              return (
                <div
                  key={item.step}
                  className="flex flex-col rounded-card border border-border bg-surface p-6 shadow-card"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-control bg-secondary text-primary">
                      <StepIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-display text-2xl font-semibold text-accent-text">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-base font-bold text-text">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/services"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Explore Salon Services
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
