import { ensureSanctumCsrf } from "@/lib/api/csrf";
import { $api, resolveApiUrl } from "@/lib/api/mutator";

export type CalendarUploadKind = "dcet_events" | "academic_calendar";

export type CalendarUploadMeta = {
  kind: string;
  original_filename: string;
  mime_type: string;
  size: number;
  updated_at: string;
};

function formatApiFailureMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
    const errors = (data as { errors?: Record<string, unknown> }).errors;
    if (errors && typeof errors === "object") {
      for (const value of Object.values(errors)) {
        if (Array.isArray(value) && typeof value[0] === "string") {
          return value[0];
        }
      }
    }
  }
  if (status === 401) {
    return "You are not signed in, or the session cookie was not sent to the API. Use NEXT_PUBLIC_API_BASE_URL=/backend/api so requests stay on the app origin.";
  }
  if (status === 403) {
    return "You do not have permission to manage calendar uploads for this institution.";
  }
  if (status === 404) {
    return "Calendar uploads endpoint was not found. Check that the API is on /api and migrations are applied.";
  }
  if (status === 419) {
    return "Security token expired. Refresh the page and try again.";
  }
  if (status === 422) {
    return "Validation failed. Check file type (PDF or image) and size.";
  }
  return `Request failed (${status}).`;
}

export async function fetchCalendarUploadsIndex(): Promise<
  Record<CalendarUploadKind, CalendarUploadMeta | null>
> {
  const res = await $api<{
    data?: Record<CalendarUploadKind, CalendarUploadMeta | null>;
  }>("/institution/calendar-uploads", {
    method: "GET",
    cache: "no-store",
  });
  if (res.status !== 200 || !res.data?.data) {
    const fallback =
      typeof res.data !== "object" || res.data === null
        ? "Unexpected response from the API (not JSON). Check NEXT_PUBLIC_API_BASE_URL and the Laravel /api prefix."
        : formatApiFailureMessage(res.data, res.status);
    throw new Error(fallback);
  }
  return res.data.data;
}

export async function uploadCalendarFile(
  kind: CalendarUploadKind,
  file: File,
): Promise<{ ok: boolean; status: number; errorMessage?: string }> {
  await ensureSanctumCsrf();
  const body = new FormData();
  body.append("kind", kind);
  body.append("file", file);
  const res = await $api<{
    message?: string;
    errors?: Record<string, string[]>;
  }>("/institution/calendar-uploads", {
    method: "POST",
    body,
  });
  if (res.status === 201) {
    return { ok: true, status: res.status };
  }
  return {
    ok: false,
    status: res.status,
    errorMessage: formatApiFailureMessage(res.data, res.status),
  };
}

export async function removeCalendarFile(
  kind: CalendarUploadKind,
): Promise<{ ok: boolean; status: number; errorMessage?: string }> {
  await ensureSanctumCsrf();
  const res = await $api<{ message?: string }>(
    `/institution/calendar-uploads/${kind}`,
    { method: "DELETE" },
  );
  if (res.status === 200) {
    return { ok: true, status: res.status };
  }
  return {
    ok: false,
    status: res.status,
    errorMessage: formatApiFailureMessage(res.data, res.status),
  };
}

export function calendarFileDownloadUrl(kind: CalendarUploadKind): string {
  return resolveApiUrl(`/institution/calendar-uploads/${kind}/file`);
}

/** Authenticated binary download for preview (cookies). */
export async function fetchCalendarFileBlob(
  kind: CalendarUploadKind,
): Promise<Blob> {
  const res = await fetch(calendarFileDownloadUrl(kind), {
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "*/*" },
  });
  if (!res.ok) {
    throw new Error("Download failed.");
  }
  return res.blob();
}
