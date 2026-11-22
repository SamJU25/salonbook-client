import { authClient } from "./auth-client";
import { API_BASE_URL } from "./constants";

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
}

async function getBearerToken(): Promise<string> {
  const { data, error } = await authClient.token();
  if (error || !data?.token) {
    throw new ApiClientError(401, "Your session has expired. Please sign in again.", "UNAUTHORIZED");
  }
  return data.token;
}

/**
 * Calls the Express REST API, automatically attaching the Better Auth JWT
 * when `auth: true` (default).
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers: customHeaders, body, ...rest } = options;
  const headers = new Headers(customHeaders);

  if (auth) {
    const token = await getBearerToken();
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers,
      body,
      cache: "no-store",
    });
  } catch {
    throw new ApiClientError(
      0,
      "Unable to connect to the server. Please check your connection and try again.",
      "NETWORK_ERROR"
    );
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    throw new ApiClientError(
      response.status,
      payload?.message || "Something went wrong. Please try again.",
      payload?.code
    );
  }

  return payload.data as T;
}

/**
 * Uploads an image file via the Express ImgBB proxy endpoint.
 */
export async function uploadImageFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const result = await apiRequest<{ url: string }>("/uploads/image", {
    method: "POST",
    body: formData,
    auth: false,
  });

  return result.url;
}
