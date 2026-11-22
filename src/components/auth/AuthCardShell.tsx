import { BrandMark } from "@/components/ui/BrandMark";

interface AuthCardShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthCardShell({
  title,
  subtitle,
  children,
}: AuthCardShellProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full grid-cols-1 overflow-hidden rounded-panel border border-border bg-surface shadow-card lg:grid-cols-12">
        <div className="relative hidden flex-col justify-between bg-sidebar p-10 text-white lg:col-span-5 lg:flex">
          <div>
            <p className="inline-flex items-center gap-2.5 text-xs font-bold tracking-widest text-secondary uppercase">
              <BrandMark className="h-4 w-4 text-accent" />
              SalonBook Member Access
            </p>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-white">
              Your salon appointments, thoughtfully organized.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-sidebar-muted">
              Sign in to request appointments, view live status updates, and
              manage confirmed bookings with secure Stripe payments.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-card border border-white/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/services/facial-skincare.jpg"
              alt="Calm botanical skincare tray in soft daylight"
              className="aspect-4/3 w-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-7">
          <div className="mx-auto w-full max-w-md">
            <h1 className="font-display text-3xl font-semibold text-text sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
