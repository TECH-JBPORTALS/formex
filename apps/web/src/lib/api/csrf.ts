/**
 * Laravel Sanctum SPA authentication: prime CSRF cookie before state-changing requests.
 */
export async function ensureSanctumCsrf(): Promise<void> {
  const envBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "/backend/api"
  ).replace(/\/$/, "");
  const url = `${envBase.replace(/\/api$/, "")}/sanctum/csrf-cookie`;
  await fetch(url, { credentials: "include", method: "GET" });
}
