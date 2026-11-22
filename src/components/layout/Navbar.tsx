"use client";

import {
  CalendarCheck,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  UserCircle2,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BrandMark } from "@/components/ui/BrandMark";
import { signOut, useSession } from "@/lib/auth-client";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const user = session?.user as
    | { name?: string; email?: string; image?: string | null; role?: string }
    | undefined;

  const isAdmin = user?.role === "admin";
  const dashboardHref = isAdmin ? "/dashboard/admin" : "/dashboard/customer";
  const dashboardNavLabel = isAdmin ? "Admin Dashboard" : "My Account";

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setDropdownOpen(false);
      setMobileOpen(false);
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const navLinkClass = (href: string) => {
    const isActive =
      href === "/" ? pathname === "/" : pathname.startsWith(href);
    return `inline-flex items-center px-1 py-2 text-sm transition-colors ${
      isActive
        ? "font-semibold text-primary underline decoration-primary/60 decoration-2 underline-offset-8"
        : "font-medium text-text/75 hover:text-primary"
    }`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-xs">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-text focus-visible:rounded-lg"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-control bg-primary text-white">
            <BrandMark className="h-4.5 w-4.5" />
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-text">
            SalonBook
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-7 md:flex"
        >
          <Link
            href="/"
            aria-current={pathname === "/" ? "page" : undefined}
            className={navLinkClass("/")}
          >
            Home
          </Link>
          <Link
            href="/services"
            aria-current={pathname.startsWith("/services") ? "page" : undefined}
            className={navLinkClass("/services")}
          >
            Browse Services
          </Link>
          {user && (
            <Link
              href={dashboardHref}
              aria-current={pathname.startsWith("/dashboard") ? "page" : undefined}
              className={navLinkClass("/dashboard")}
            >
              {dashboardNavLabel}
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <div className="h-10 w-32 animate-pulse rounded-control bg-surface-muted" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup="menu"
                className="inline-flex h-11 items-center gap-2.5 rounded-control border border-border bg-surface px-3.5 text-sm font-semibold text-text transition-colors hover:border-primary/40 hover:bg-surface-muted cursor-pointer"
              >
                {user.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.image}
                    alt={user.name || "User avatar"}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="max-w-[140px] truncate">{user.name || "Account"}</span>
                <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
              </button>

              {dropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-card border border-border bg-surface p-2 shadow-dropdown"
                >
                  <div className="border-b border-border px-3 py-2">
                    <p className="truncate text-sm font-semibold text-text">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <Link
                    href={dashboardHref}
                    role="menuitem"
                    className="mt-1 flex items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium text-text hover:bg-surface-muted"
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" aria-hidden="true" />
                    {isAdmin ? "Admin Dashboard" : "My Dashboard"}
                  </Link>
                  {isAdmin ? (
                    <Link
                      href="/dashboard/admin/services"
                      role="menuitem"
                      className="mt-0.5 flex items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium text-text hover:bg-surface-muted"
                    >
                      <Scissors className="h-4 w-4 text-primary" aria-hidden="true" />
                      Manage Services
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard/customer/appointments"
                      role="menuitem"
                      className="mt-0.5 flex items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium text-text hover:bg-surface-muted"
                    >
                      <CalendarCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                      My Appointments
                    </Link>
                  )}
                  <Link
                    href={isAdmin ? "/dashboard/admin/profile" : "/dashboard/customer/profile"}
                    role="menuitem"
                    className="mt-0.5 flex items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium text-text hover:bg-surface-muted"
                  >
                    <UserCircle2 className="h-4 w-4 text-primary" aria-hidden="true" />
                    My Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="mt-0.5 flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-left text-sm font-medium text-[#9A352E] hover:bg-status-cancelled-bg cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                aria-current={pathname === "/sign-in" ? "page" : undefined}
                className={`inline-flex h-10 items-center justify-center px-3 text-sm font-semibold transition-colors ${
                  pathname === "/sign-in"
                    ? "text-primary"
                    : "text-text/80 hover:text-primary"
                }`}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                aria-current={pathname === "/sign-up" ? "page" : undefined}
                className={`inline-flex h-10 items-center justify-center rounded-control px-4 text-sm font-semibold text-white transition-colors ${
                  pathname === "/sign-up"
                    ? "bg-primary-hover"
                    : "bg-primary hover:bg-primary-hover"
                }`}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-primary-nav"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-control border border-border bg-surface text-text md:hidden cursor-pointer"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div
          id="mobile-primary-nav"
          className="border-t border-border bg-surface px-4 py-4 md:hidden"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col gap-1.5">
            <Link href="/" className={navLinkClass("/")}>
              Home
            </Link>
            <Link href="/services" className={navLinkClass("/services")}>
              Browse Services
            </Link>
            {user ? (
              <>
                <Link href={dashboardHref} className={navLinkClass("/dashboard")}>
                  {dashboardNavLabel}
                </Link>
                {isAdmin ? (
                  <Link
                    href="/dashboard/admin/services"
                    className={navLinkClass("/dashboard/admin/services")}
                  >
                    Manage Services
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/customer/appointments"
                    className={navLinkClass("/dashboard/customer/appointments")}
                  >
                    My Appointments
                  </Link>
                )}
                <Link
                  href={isAdmin ? "/dashboard/admin/profile" : "/dashboard/customer/profile"}
                  className={navLinkClass(
                    isAdmin ? "/dashboard/admin/profile" : "/dashboard/customer/profile"
                  )}
                >
                  My Profile
                </Link>
                <div className="mt-2 border-t border-border pt-3">
                  <p className="px-3 text-xs font-semibold text-muted">
                    Signed in as {user.name}
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 flex w-full items-center gap-2 rounded-control px-3 py-2.5 text-left text-sm font-semibold text-[#9A352E] hover:bg-status-cancelled-bg cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 flex flex-col gap-2.5 border-t border-border pt-3">
                <Link
                  href="/sign-in"
                  aria-current={pathname === "/sign-in" ? "page" : undefined}
                  className={`inline-flex h-11 items-center justify-center rounded-control border px-4 text-sm font-semibold transition-colors ${
                    pathname === "/sign-in"
                      ? "border-primary bg-secondary text-primary"
                      : "border-border bg-surface text-text hover:border-primary hover:text-primary"
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  aria-current={pathname === "/sign-up" ? "page" : undefined}
                  className={`inline-flex h-11 items-center justify-center rounded-control px-4 text-sm font-semibold text-white transition-colors ${
                    pathname === "/sign-up"
                      ? "bg-primary-hover"
                      : "bg-primary hover:bg-primary-hover"
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
