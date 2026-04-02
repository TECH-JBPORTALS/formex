/**
 * Laravel Sanctum SPA authentication: prime CSRF cookie before state-changing requests.
 */
export async function ensureSanctumCsrf(): Promise<void> {
  const envBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "/backend/api"
  ).replace(/\/$/, "");
  let url: string;
  if (envBase.startsWith("/")) {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
            /\/$/,
            "",
          );
    url = `${origin}${envBase.replace(/\/api$/, "")}/sanctum/csrf-cookie`;
  } else {
    url = `${envBase.replace(/\/api$/, "")}/sanctum/csrf-cookie`;
  }
  await fetch(url, { credentials: "include", method: "GET" });
}
