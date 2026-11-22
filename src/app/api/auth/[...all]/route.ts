import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { ensureAuthReady, getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const preferredRegion = "iad1";

export async function GET(req: NextRequest) {
  await ensureAuthReady();
  const { GET: handler } = toNextJsHandler(getAuth());
  return handler(req);
}

export async function POST(req: NextRequest) {
  await ensureAuthReady();
  const { POST: handler } = toNextJsHandler(getAuth());
  return handler(req);
}
