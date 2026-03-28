import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { headers } from "next/headers";
import { db, schema } from "@/db/client";
import { getBaseURL } from "@/utils/getBaseUrl";
import { ac, principal, program_coordinator, staff } from "./permissions";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: ["*.vercel.app", "localhost:*"],
    fallback: getBaseURL(),
  },
  database: drizzleAdapter(db, { provider: "pg", schema, camelCase: true }),
  emailAndPassword: { enabled: true },
  plugins: [
    admin({
      ac,
      roles: {
        principal,
        program_coordinator,
        staff,
      },
      adminRoles: ["principal"],
      defaultRole: "staff",
    }),
  ],
});

export const getSession = async () =>
  auth.api.getSession({ headers: await headers() });
