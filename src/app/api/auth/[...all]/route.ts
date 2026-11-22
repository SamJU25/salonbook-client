import { toNextJsHandler } from "better-auth/next-js";
import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { GET: handler } = toNextJsHandler(getAuth());
  return handler(req);
}

export async function POST(req: NextRequest) {
  const { POST: handler } = toNextJsHandler(getAuth());
  return handler(req);
}
