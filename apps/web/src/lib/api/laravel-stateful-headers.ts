/**
 * Laravel Sanctum only runs session middleware when `EnsureFrontendRequestsAreStateful`
 * sees an `Origin` or `Referer` matching `config('sanctum.stateful')`. Plain server-side
 * `fetch()` omits those by default, so cookie sessions never load — add them explicitly.
 */
type HeaderBag = { get(name: string): string | null };

export function getStatefulHeadersForLaravel(
  cookieHeader: string,
  incoming?: { headers: HeaderBag },
): Record<string, string> {
  let origin = incoming?.headers.get("origin")?.replace(/\/$/, "");
  if (!origin) {
    const referer = incoming?.headers.get("referer");
    if (referer) {
      try {
        origin = new URL(referer).origin;
      } catch {
        // ignore invalid referer
      }
    }
  }
  if (!origin) {
    origin = (process.env.VERCEL_URL ?? "http://localhost:3000").replace(
      /\/$/,
      "",
    );
  }

  return {
    cookie: cookieHeader,
    Accept: "application/json",
    Origin: origin,
    Referer: `${origin}/`,
    "X-Requested-With": "XMLHttpRequest",
  };
}
