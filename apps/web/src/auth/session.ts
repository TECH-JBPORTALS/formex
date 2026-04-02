import { cookies, headers } from "next/headers";
import type { User } from "../lib/api/generated/models";
import { getStatefulHeadersForLaravel } from "../lib/api/laravel-stateful-headers";

export async function getServerSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const fromStore = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const hdrs = await headers();
  const rawCookie = hdrs.get("cookie") ?? fromStore;
  if (!rawCookie) {
    return null;
  }

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

  const json = (await res.json()) as { user: User };
  return json.user ?? null;
}
