import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/ui/BrandMark";

export function Footer() {
  return (
    <footer className="border-t border-border bg-sidebar text-sidebar-text">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary text-white">
                <BrandMark className="h-4.5 w-4.5" />
              </span>
              <span className="font-display text-2xl font-semibold text-white">
                SalonBook
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-sidebar-muted">
              Hair, skincare, and spa appointments — book your visit online and
              manage treatments in one place.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              Navigation
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-sidebar-muted">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition-colors hover:text-white">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link href="/sign-in" className="transition-colors hover:text-white">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="transition-colors hover:text-white">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              Salon Contact
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-sidebar-muted">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>42 Dosan-daero 55-gil, Gangnam-gu, Seoul</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>+82 2-512-0480</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>hello@salonbook.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">
              Opening Hours & Social
            </h2>
            <div className="mt-4 space-y-3 text-sm text-sidebar-muted">
              <p className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                <span>
                  Mon – Sat: 9:00 AM – 7:00 PM
                  <br />
                  Sunday: Closed
                </span>
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-sidebar-text transition-colors hover:bg-primary"
                >
                  Instagram
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-sidebar-text transition-colors hover:bg-primary"
                >
                  Facebook
                </a>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-sidebar-text transition-colors hover:bg-primary"
                >
                  Pinterest
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#C8D5CD] sm:flex-row">
          <p>&copy; {new Date().getFullYear()} SalonBook. All rights reserved.</p>
          <p>Open Monday – Saturday, 9:00 AM – 7:00 PM</p>
        </div>
      </div>
    </footer>
  );
}
