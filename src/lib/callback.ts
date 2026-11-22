/**
 * Sanitizes a post-auth callback path so only same-origin relative paths are allowed.
 * Rejects protocol-relative URLs (`//evil.com`) and backslash bypasses (`/\evil.com`).
 */
export function getSafeCallbackUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return null;
  }
  try {
    const parsed = new URL(raw, "https://salonbook.local");
    if (parsed.origin !== "https://salonbook.local") return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function resolveCustomerDestination(callbackUrl: string | null): string {
  if (callbackUrl && !callbackUrl.startsWith("/dashboard/admin")) {
    return callbackUrl;
  }
  return "/dashboard/customer";
}
