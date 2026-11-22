"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCardShell } from "@/components/auth/AuthCardShell";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/Button";
import { PageLoader } from "@/components/ui/Loader";
import { authClient, signIn, signOut, useSession } from "@/lib/auth-client";
import { getSafeCallbackUrl, resolveCustomerDestination } from "@/lib/callback";
import { signInSchema } from "@/lib/validators";

function SignInFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
  const { data: session } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const u = session?.user as { role?: string; isBlocked?: boolean } | undefined;
    if (!u || u.isBlocked) return;
    if (u.role === "admin") {
      router.replace("/dashboard/admin");
    } else {
      router.replace(resolveCustomerDestination(callbackUrl));
    }
  }, [session, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid credentials";
      setFieldError(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signIn.email({
        email: parsed.data.email.toLowerCase(),
        password: parsed.data.password,
      });

      if (error) {
        const msg = error.message || "Invalid email or password";
        setFieldError(msg);
        toast.error(msg);
        return;
      }

      const sessionRes = await authClient.getSession();
      const signedInUser = sessionRes.data?.user as
        | { role?: string; isBlocked?: boolean }
        | undefined;

      if (signedInUser?.isBlocked) {
        await signOut();
        const msg =
          "Your account has been blocked by an administrator. Access is restricted.";
        setFieldError(msg);
        toast.error(msg);
        return;
      }

      toast.success("Welcome back to SalonBook");
      const destination =
        signedInUser?.role === "admin"
          ? "/dashboard/admin"
          : resolveCustomerDestination(callbackUrl);
      router.push(destination);
      router.refresh();
    } catch {
      toast.error("Sign in failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCardShell
      title="Welcome back"
      subtitle="Sign in with your email and password or continue with Google."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="signin-email"
            className="mb-1.5 block text-sm font-semibold text-text"
          >
            Email Address
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            autoComplete="username"
            spellCheck={false}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="signin-password"
            className="mb-1.5 block text-sm font-semibold text-text"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="signin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-11 w-full rounded-control border border-border bg-surface pr-11 pl-3.5 text-sm text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-pressed={showPassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:text-text cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {fieldError && (
          <p
            role="alert"
            className="rounded-control border border-status-cancelled-border bg-status-cancelled-bg px-3.5 py-2.5 text-xs font-medium text-status-cancelled-text"
          >
            {fieldError}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton
        callbackURL={callbackUrl || "/dashboard"}
        label="Sign in with Google"
      />

      <p className="mt-6 text-center text-sm text-muted">
        New to SalonBook?{" "}
        <Link
          href={
            callbackUrl
              ? `/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : "/sign-up"
          }
          className="font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthCardShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading sign in..." />}>
      <SignInFormContent />
    </Suspense>
  );
}
