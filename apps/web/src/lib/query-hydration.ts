/**
 * Orval `$api` results look like `{ data, status, headers: Headers }`. `Headers` cannot cross
 * the React Server → Client boundary. Pair {@link serializeQueryData} with
 * {@link deserializeQueryData} via TanStack `dehydrate` / `hydrate`.
 */

function headersToRecord(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

function recordToHeaders(record: Record<string, unknown>): Headers {
  const h = new Headers();
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "string") {
      h.set(key, value);
    }
  }
  return h;
}

/** `dehydrate(client, { serializeData })` — walk the tree and replace every `Headers`. */
export function serializeQueryData(data: unknown): unknown {
  if (data instanceof Headers) {
    return headersToRecord(data);
  }
  if (data === null || typeof data !== "object") {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(serializeQueryData);
  }
  const o = data as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(o)) {
    result[key] = serializeQueryData(o[key]);
  }
  return result;
}

/**
 * `hydrate` / `<HydrationBoundary options={{ defaultOptions: { deserializeData } }} />` —
 * after deep recurse, rebuild `Headers` on Orval-shaped nodes only (plain `headers` object).
 */
export function deserializeQueryData(data: unknown): unknown {
  if (data === null || typeof data !== "object") {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(deserializeQueryData);
  }

  const o = data as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(o)) {
    result[key] = deserializeQueryData(o[key]);
  }

  if (
    "data" in result &&
    "status" in result &&
    "headers" in result &&
    typeof result.status === "number" &&
    result.headers !== null &&
    typeof result.headers === "object" &&
    !(result.headers instanceof Headers) &&
    !Array.isArray(result.headers)
  ) {
    result.headers = recordToHeaders(result.headers as Record<string, unknown>);
  }

  return result;
}

/** Server-only `dehydrate` — pair with client {@link QueryHydrationBoundary}. */
export const dehydrateSerializeOptions = {
  serializeData: serializeQueryData,
} as const;
