"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { PageLoader } from "@/components/ui/Loader";
import { signOut, useSession } from "@/lib/auth-client";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;
    const user = session?.user as
      | { role?: string; isBlocked?: boolean }
      | undefined;

    if (!user) {
      router.replace("/sign-in?callbackUrl=/dashboard");
      return;
    }

    if (user.isBlocked) {
      toast.error("Your account has been blocked by an administrator.");
      void signOut().then(() => router.replace("/sign-in"));
      return;
    }

    router.replace(
      user.role === "admin" ? "/dashboard/admin" : "/dashboard/customer"
    );
  }, [isPending, session, router]);

  return (
    <div className="min-h-screen bg-page p-8">
      <PageLoader label="Opening your dashboard..." />
    </div>
  );
}
