"use client";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { uploadImageFile } from "@/lib/api-client";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  allowUrlInput?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export function ImageUploader({
  label,
  value,
  onChange,
  allowUrlInput = false,
  required = false,
  error,
  helperText,
}: ImageUploaderProps) {
  const inputId = useId();
  const urlInputId = useId();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPEG, PNG, WEBP, or GIF)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be 5 MB or smaller");
      return;
    }

    setIsUploading(true);
    try {
      const uploadedUrl = await uploadImageFile(file);
      onChange(uploadedUrl);
      toast.success("Image uploaded successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to upload image";
      toast.error(message);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="block text-sm font-semibold text-text">
        {label} {required && <span className="text-[#9A352E]">*</span>}
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {value ? (
          <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-control border border-border bg-surface-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove image"
              className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-text/80 text-white hover:bg-text cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <label
          htmlFor={inputId}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-control border border-dashed border-border bg-surface px-4 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-secondary/40 ${
            isUploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Uploading image...</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              <span>{value ? "Replace uploaded image" : "Upload image file"}</span>
            </>
          )}
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
          />
        </label>
      </div>

      {allowUrlInput && (
        <div>
          <label
            htmlFor={urlInputId}
            className="mb-1 block text-xs font-medium text-muted"
          >
            Or paste an image URL
          </label>
          <input
            id={urlInputId}
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="h-11 w-full rounded-control border border-border bg-surface px-3.5 text-sm text-text placeholder:text-muted/70 focus:border-primary focus:outline-none"
          />
        </div>
      )}

      {helperText && <p className="text-xs text-muted">{helperText}</p>}
      {error && (
        <p className="text-xs font-medium text-[#9A352E]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
