/**
 * Fetch adapter for Orval + TanStack Query (`client: "react-query"`).
 * Responses are normalized to `{ data, status, headers }` per Orval’s fetch output.
 *
 * Use `NEXT_PUBLIC_API_BASE_URL=/backend/api` in dev so session cookies stay on the Next
 * origin (see `next.config.ts` rewrite to Laravel).
 *
 * **GET / HEAD** use Next.js `fetch` caching: `cache` + `next.revalidate` (server). On the
 * client, `next` is ignored by the runtime; `cache` follows the Fetch `RequestCache` rules.
 * Tune revalidation with `API_FETCH_REVALIDATE` or `NEXT_PUBLIC_API_FETCH_REVALIDATE` (seconds).
 *
 * **POST / PUT / PATCH / DELETE** use `cache: "no-store"` so mutations are never served from cache.
 *
 * Per-call override: pass `cache` or `next` on `RequestInit` from generated clients; `next`
 * fields you set are merged after defaults (your `revalidate` / `tags` win).
 */
export function resolveApiUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/backend/api";
  const base = envBase.replace(/\/$/, "");
  if (base.startsWith("/")) {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
            /\/$/,
            "",
          );
    return `${origin}${base}${path}`;
  }
  return `${base}${path}`;
}

/** Default `next.revalidate` for read requests (seconds). */
function getApiFetchRevalidateSeconds(): number {
  const raw =
    process.env.API_FETCH_REVALIDATE ??
    process.env.NEXT_PUBLIC_API_FETCH_REVALIDATE;
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  if (Number.isFinite(n) && n >= 0) return n;
  return 30;
}

function cacheAndNextForMethod(
  method: string,
  init?: RequestInit,
): Pick<RequestInit, "cache" | "next"> {
  const upper = (method || "GET").toUpperCase();
  const isRead = upper === "GET" || upper === "HEAD";

  if (!isRead) {
    return { cache: "no-store" };
  }

  if (init?.cache === "no-store" || init?.next?.revalidate === false) {
    return {
      cache: "no-store",
      ...(init.next ? { next: init.next } : {}),
    };
  }

  const revalidate = getApiFetchRevalidateSeconds();

  return {
    cache: init?.cache ?? "default",
    next: {
      revalidate,
      tags: ["formex-api"],
      ...init?.next,
    },
  };
}

let warnedOffOriginApi = false;

function warnIfBrowserApiOffOrigin(resolved: string): void {
  if (typeof window === "undefined" || warnedOffOriginApi) {
    return;
  }
  try {
    const reqUrl = new URL(resolved);
    if (reqUrl.origin !== window.location.origin) {
      warnedOffOriginApi = true;
      console.error(
        `[api] API URL origin (${reqUrl.origin}) differs from the page (${window.location.origin}). ` +
          "Session cookies from proxied login will not be sent — use NEXT_PUBLIC_API_BASE_URL=/backend/api (see apps/web/.env.example).",
      );
    }
  } catch {
    // ignore invalid URL
  }
}

function xsrfHeaderForRequest(method: string): Record<string, string> {
  const upper = method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(upper)) {
    return {};
  }
  if (typeof document === "undefined") {
    return {};
  }
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")
    .slice(1)
    .join("=");
  if (!raw) {
    return {};
  }
  try {
    return { "X-XSRF-TOKEN": decodeURIComponent(raw) };
  } catch {
    return { "X-XSRF-TOKEN": raw };
  }
}

export async function $api<T>(url: string, init?: RequestInit): Promise<T> {
  const resolved = resolveApiUrl(url);
  warnIfBrowserApiOffOrigin(resolved);
  const method = (init?.method ?? "GET").toUpperCase();
  const cacheAndNext = cacheAndNextForMethod(method, init);

  const res = await fetch(resolved, {
    ...init,
    ...cacheAndNext,
    credentials: "include",
    headers: mergeHeaders(init?.headers, xsrfHeaderForRequest(method)),
  });

  const status = res.status;
  const headers = res.headers;

  let data: unknown;
  if (status === 204 || status === 205) {
    data = undefined;
  } else {
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const text = await res.text();
      data = text ? JSON.parse(text) : undefined;
    } else {
      const text = await res.text();
      data = text === "" ? undefined : text;
    }
  }

  return { data, status, headers } as T;
}

function mergeHeaders(
  headersInit?: HeadersInit,
  extra?: Record<string, string>,
): HeadersInit {
  const base: Record<string, string> = { Accept: "application/json", ...extra };
  if (!headersInit) {
    return base;
  }
  if (headersInit instanceof Headers) {
    const merged = new Headers(base);
    headersInit.forEach((value, key) => {
      merged.set(key, value);
    });
    return merged;
  }
  if (Array.isArray(headersInit)) {
    return new Headers([...Object.entries(base), ...headersInit]);
  }
  return { ...base, ...headersInit };
}
