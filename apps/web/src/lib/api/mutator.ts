/**
 * Fetch adapter for Orval + TanStack Query (`client: "react-query"`).
 * Responses are normalized to `{ data, status, headers }` per Orval’s fetch output.
 *
 * Use `NEXT_PUBLIC_API_BASE_URL=/backend/api` in dev so session cookies stay on the Next
 * origin (see `next.config.ts` rewrite to Laravel).
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
  const method = init?.method ?? "GET";
  const res = await fetch(resolved, {
    ...init,
    credentials: "include",
    headers: mergeHeaders(
      init?.headers,
      xsrfHeaderForRequest(typeof method === "string" ? method : "GET"),
    ),
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
