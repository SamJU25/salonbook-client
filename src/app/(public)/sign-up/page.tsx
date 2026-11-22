"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCardShell } from "@/components/auth/AuthCardShell";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { PageLoader } from "@/components/ui/Loader";
import { signUp, useSession } from "@/lib/auth-client";
import { signUpSchema } from "@/lib/validators";

function getSafeCallback(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function SignUpFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallback(searchParams.get("callbackUrl"));
  const { data: session } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const u = session?.user as { role?: string; isBlocked?: boolean } | undefined;
    if (!u || u.isBlocked) return;
    router.replace(u.role === "admin" ? "/dashboard/admin" : "/dashboard/customer");
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    const parsed = signUpSchema.safeParse({ name, email, password, image });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Please check your form details";
      setFieldError(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signUp.email({
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        password: parsed.data.password,
        ...(parsed.data.image ? { image: parsed.data.image } : {}),
      });

      if (error) {
        const msg = error.message || "Registration failed. Please try again.";
        setFieldError(msg);
        toast.error(msg);
        return;
      }

      toast.success("Account created successfully! Welcome to SalonBook.");
      const destination =
        callbackUrl && !callbackUrl.startsWith("/dashboard/admin")
          ? callbackUrl
          : "/dashboard/customer";
      router.push(destination);
      router.refresh();
    } catch {
      toast.error("Unable to complete registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCardShell
      title="Create your account"
      subtitle="Join SalonBook to book salon treatments and track your appointments."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="signup-name"
            className="mb-1.5 block text-sm font-semibold text-text"
          >
            Full Name <span className="text-[#9A352E]">*</span>
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Rivera"
            className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="mb-1.5 block text-sm font-semibold text-text"
          >
            Email Address <span className="text-[#9A352E]">*</span>
          </label>
          <input
            id="signup-email"
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
            htmlFor="signup-password"
            className="mb-1.5 block text-sm font-semibold text-text"
          >
            Password <span className="text-[#9A352E]">*</span>
          </label>
          <p id="signup-password-rules" className="mb-1.5 text-xs text-muted">
            Minimum 6 characters, including 1 uppercase and 1 lowercase letter.
          </p>
          <div className="relative">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              pattern="(?=.*[a-z])(?=.*[A-Z]).{6,}"
              aria-describedby="signup-password-rules"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
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

        <ImageUploader
          label="Profile Image (Optional)"
          value={image}
          onChange={setImage}
          allowUrlInput
          helperText="Upload a photo or paste an image URL."
        />

        {fieldError && (
          <p
            role="alert"
            className="rounded-control border border-status-cancelled-border bg-status-cancelled-bg px-3.5 py-2.5 text-xs font-medium text-status-cancelled-text"
          >
            {fieldError}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-muted">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <GoogleAuthButton
        callbackURL={callbackUrl || "/dashboard"}
        label="Sign up with Google"
      />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={
            callbackUrl
              ? `/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`
              : "/sign-in"
          }
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCardShell>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading sign up..." />}>
      <SignUpFormContent />
    </Suspense>
  );
}
