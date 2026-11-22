"use client";

import {
  CalendarCheck,
  CreditCard,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Scissors,
  UserCog,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BrandMark } from "@/components/ui/BrandMark";
import { PageLoader } from "@/components/ui/Loader";
import { signOut, useSession } from "@/lib/auth-client";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CUSTOMER_NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
  {
    label: "My Appointments",
    href: "/dashboard/customer/appointments",
    icon: CalendarCheck,
  },
  { label: "My Profile", href: "/dashboard/customer/profile", icon: UserCog },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Manage Services", href: "/dashboard/admin/services", icon: Scissors },
  { label: "Add Service", href: "/dashboard/admin/services/new", icon: PlusCircle },
  {
    label: "Manage Appointments",
    href: "/dashboard/admin/appointments",
    icon: CalendarCheck,
  },
  { label: "Manage Users", href: "/dashboard/admin/users", icon: Users },
  {
    label: "Transactions",
    href: "/dashboard/admin/transactions",
    icon: CreditCard,
  },
  { label: "My Profile", href: "/dashboard/admin/profile", icon: UserCog },
];

export function DashboardShell({
  requiredRole,
  children,
}: {
  requiredRole: UserRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = session?.user as
    | {
        id?: string;
        name?: string;
        email?: string;
        image?: string | null;
        role?: UserRole;
        isBlocked?: boolean;
      }
    | undefined;

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user.isBlocked) {
      toast.error("Your account has been blocked by an administrator.");
      void signOut().then(() => router.replace("/sign-in"));
      return;
    }

    const userRole: UserRole = user.role === "admin" ? "admin" : "customer";
    if (userRole !== requiredRole) {
      router.replace(
        userRole === "admin" ? "/dashboard/admin" : "/dashboard/customer"
      );
    }
  }, [isPending, user, requiredRole, router, pathname]);

  if (isPending || !user || user.isBlocked) {
    return (
      <div className="min-h-screen bg-page p-8">
        <PageLoader label="Loading dashboard..." />
      </div>
    );
  }

  const userRole: UserRole = user.role === "admin" ? "admin" : "customer";
  if (userRole !== requiredRole) {
    return (
      <div className="min-h-screen bg-page p-8">
        <PageLoader label="Redirecting to your dashboard..." />
      </div>
    );
  }

  const navItems = requiredRole === "admin" ? ADMIN_NAV : CUSTOMER_NAV;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const renderNavLinks = () => (
    <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isExact =
          item.href === "/dashboard/customer" || item.href === "/dashboard/admin";
        const isActive = isExact
          ? pathname === item.href
          : pathname === item.href ||
            (item.href === "/dashboard/admin/services" &&
              pathname.startsWith("/dashboard/admin/services/") &&
              !pathname.endsWith("/new"));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-3 rounded-control px-3.5 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-sidebar-active font-semibold text-white shadow-xs"
                : "text-sidebar-muted hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-page">
      {/* Desktop Evergreen Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-text lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-control bg-primary text-white">
              <BrandMark className="h-4 w-4" />
            </span>
            <span className="font-display text-2xl font-semibold text-white">
              SalonBook
            </span>
          </Link>
        </div>

        <div className="px-5 pt-5">
          <p className="text-[11px] font-bold tracking-widest text-sidebar-muted/80 uppercase">
            {requiredRole === "admin" ? "Admin Portal" : "Customer Portal"}
          </p>
        </div>

        {renderNavLinks()}

        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-control px-3.5 py-2.5 text-sm font-medium text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span>Back to Home</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-control px-3.5 py-2.5 text-left text-sm font-medium text-[#F5B8B3] transition-colors hover:bg-white/10 cursor-pointer"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-sidebar/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-sidebar text-sidebar-text shadow-modal">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
              <Link href="/" className="inline-flex items-center gap-2">
                <BrandMark className="h-4 w-4 text-accent" />
                <span className="font-display text-xl font-semibold text-white">
                  SalonBook
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close dashboard navigation"
                className="rounded-lg p-1.5 text-sidebar-muted hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {renderNavLinks()}
            <div className="border-t border-white/10 p-3">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-control px-3.5 py-2.5 text-sm font-medium text-sidebar-muted hover:bg-white/10 hover:text-white"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                <span>Back to Home</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-control px-3.5 py-2.5 text-left text-sm font-medium text-[#F5B8B3] hover:bg-white/10 cursor-pointer"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-topbar-border bg-topbar px-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open dashboard navigation"
                className="inline-flex h-10 w-10 items-center justify-center rounded-control border border-border bg-surface text-text lg:hidden cursor-pointer"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <span className="text-sm font-semibold text-text">
                {requiredRole === "admin"
                  ? "Admin Dashboard"
                  : "Customer Dashboard"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/services"
                className="hidden h-10 items-center rounded-control border border-border px-3.5 text-xs font-semibold text-primary transition-colors hover:bg-secondary sm:inline-flex"
              >
                Browse Services
              </Link>
              <div className="flex h-10 items-center gap-2.5 rounded-control border border-border/80 bg-page/60 px-2.5 sm:px-3">
                {user.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.image}
                    alt={user.name || "Account avatar"}
                    className="h-7 w-7 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                    {(user.name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="hidden text-left leading-tight sm:block">
                  <p className="max-w-[150px] truncate text-xs font-semibold text-text">
                    {user.name}
                  </p>
                  <p className="text-[11px] font-medium capitalize text-muted">
                    {userRole}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
