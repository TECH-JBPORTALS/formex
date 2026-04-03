import "server-only";

import { headers } from "next/headers";

/** Raw `Cookie` request header for server-side Laravel fetches. */
export async function getIncomingCookieHeader(): Promise<string> {
  const h = await headers();
  return h.get("cookie") ?? "";
}
