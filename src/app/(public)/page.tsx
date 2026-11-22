import {
  ArrowRight,
  CalendarCheck,
  CreditCard,
  Leaf,
  Search,
  ShieldCheck,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HomeDynamicSections } from "@/components/home/HomeDynamicSections";

const HERO_TRUST_POINTS = [
  {
    label: "Easy online appointment requests",
    icon: CalendarCheck,
  },
  {
    label: "Transparent service pricing",
    icon: Tag,
  },
  {
    label: "Secure Stripe payments",
    icon: ShieldCheck,
  },
];

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
    icon: Leaf,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="relative overflow-hidden border-b border-border bg-sidebar lg:flex lg:min-h-[610px] lg:items-center">
        <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="relative z-10 lg:col-span-6">
              <p className="inline-flex items-center gap-3 text-xs font-semibold tracking-[0.18em] text-secondary/95 uppercase">
                <span className="h-px w-7 bg-accent" aria-hidden="true" />
                Botanical Wellness &amp; Salon Studio
              </p>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
                Calm, intentional care for hair, skin, and ritual.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-sidebar-muted sm:text-lg">
                Discover thoughtful salon treatments, request a time that works
                for you, and keep your appointments effortlessly organized.
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
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-panel border border-white/15 shadow-modal">
                <Image
                  src="/images/hero-salon.jpg"
                  alt="Warm sunlit SalonBook botanical salon interior with oak styling stations and natural greenery"
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Editorial Trust Strip */}
      <section
        aria-label="Booking highlights"
        className="border-b border-border bg-surface"
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
            {HERO_TRUST_POINTS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.label}
                  className="flex items-center gap-2.5 text-sm font-medium text-text/85 sm:justify-center"
                >
                  <Icon
                    className="h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Dynamic Section 1 (Featured Services) & Dynamic Section 2 (Categories) */}
      <HomeDynamicSections />

      {/* Additional Section: How Booking Works (Editorial Split Chapter Layout) */}
      <section
        aria-labelledby="how-it-works-heading"
        className="bg-secondary/75"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:sticky lg:top-24 lg:col-span-5">
              <p className="inline-flex items-center gap-2.5 text-xs font-bold tracking-widest text-accent-text uppercase">
                <span className="h-px w-6 bg-accent-text" aria-hidden="true" />
                Simple Process
              </p>
              <h2
                id="how-it-works-heading"
                className="mt-3 font-display text-3xl font-semibold leading-tight text-text text-balance sm:text-4xl lg:text-5xl"
              >
                Your next self-care moment is just a few steps away.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted text-balance sm:text-base">
                From choosing your favorite service to confirming your
                appointment, we&apos;ve made booking simple, transparent, and
                calm.
              </p>

              <div className="mt-8">
                <Link
                  href="/services"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-control bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  Explore Salon Services
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-border lg:overflow-hidden lg:rounded-panel lg:border lg:border-border lg:bg-surface lg:shadow-card">
                {BOOKING_STEPS.map((item) => {
                  const StepIcon = item.icon;
                  return (
                    <li
                      key={item.step}
                      className="flex items-start gap-4 rounded-card border border-border bg-surface p-5 shadow-card transition-colors hover:bg-page/60 sm:p-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-7 lg:py-6 lg:shadow-none"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-secondary/85 text-primary shadow-xs">
                        <StepIcon
                          className="h-5 w-5"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold tracking-[0.16em] text-accent-text uppercase">
                          Step {item.step}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-text sm:text-lg">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
