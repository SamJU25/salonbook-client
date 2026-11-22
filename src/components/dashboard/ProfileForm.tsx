"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { PageLoader } from "@/components/ui/Loader";
import { apiRequest } from "@/lib/api-client";
import { useSession } from "@/lib/auth-client";
import { profileFormSchema } from "@/lib/validators";
import type { SalonUser } from "@/types";

export function ProfileForm() {
  const { refetch } = useSession();
  const [profile, setProfile] = useState<SalonUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<SalonUser>("/profile/me");
      setProfile(data);
      setName(data.name || "");
      setPhone(data.phone || "");
      setImage(data.image || "");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load profile"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = profileFormSchema.safeParse({ name, phone, image });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Invalid profile details");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await apiRequest<SalonUser>("/profile/me", {
        method: "PATCH",
        body: JSON.stringify({
          name: parsed.data.name,
          phone: parsed.data.phone || null,
          image: parsed.data.image || null,
        }),
      });
      setProfile(updated);
      await refetch();
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoader label="Loading your profile..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">My Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Update your display name, contact number, and profile photo.
        </p>
      </div>

      <div className="max-w-2xl rounded-card border border-border bg-surface p-6 shadow-xs sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="profile-email"
              className="mb-1.5 block text-sm font-semibold text-text"
            >
              Email Address
            </label>
            <input
              id="profile-email"
              type="email"
              value={profile?.email || ""}
              disabled
              className="h-11 w-full cursor-not-allowed rounded-control border border-border bg-surface-muted px-3.5 text-sm text-muted"
            />
            <p className="mt-1 text-xs text-muted">
              Account email cannot be modified.
            </p>
          </div>

          <div>
            <label
              htmlFor="profile-name"
              className="mb-1.5 block text-sm font-semibold text-text"
            >
              Full Name <span className="text-[#9A352E]">*</span>
            </label>
            <input
              id="profile-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="profile-phone"
              className="mb-1.5 block text-sm font-semibold text-text"
            >
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
            />
          </div>

          <ImageUploader
            label="Profile Image"
            value={image}
            onChange={setImage}
            allowUrlInput
            helperText="Upload a new photo or paste an image URL."
          />

          <div className="pt-2">
            <Button type="submit" isLoading={isSaving}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
