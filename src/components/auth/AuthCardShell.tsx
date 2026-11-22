import { Sparkles } from "lucide-react";

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
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-secondary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              SalonBook Member Access
            </span>
            <h2 className="mt-6 font-display text-4xl font-semibold leading-tight text-white">
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
              src="/images/hero-salon.jpg"
              alt="Calm sunlit SalonBook studio"
              className="aspect-16/10 w-full object-cover"
            />
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:col-span-7">
          <div className="mx-auto max-w-md">
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
