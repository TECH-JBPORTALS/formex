import "server-only";

import { headers } from "next/headers";
import type { AuthSession } from "@/lib/api/generated/models/authSession";
import type { User } from "@/lib/api/generated/models/user";
import { getStatefulHeadersForLaravel } from "@/lib/api/laravel-stateful-headers";
import { getIncomingCookieHeader } from "../lib/server/incoming-cookie-header";

export type { AuthSession };

export async function getServerSession(): Promise<AuthSession | null> {
  const rawCookie = await getIncomingCookieHeader(); 
  if (!rawCookie) {
    return null;
  }

  const hdrs = await headers();

  const backend = (
    process.env.LARAVEL_BACKEND_URL ?? "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  const res = await fetch(`${backend}/api/user`, {
    headers: getStatefulHeadersForLaravel(rawCookie, {
      headers: hdrs,
    }),
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403 || res.status === 419) {
    return null;
  }
  if (!res.ok) {
    return null;
  }

  const json = (await res.json()) as AuthSession;
  return json.user ? json : null;
}

export async function getServerSessionUser(): Promise<User | null> {
  const session = await getServerSession();

  return session?.user ?? null;
}
