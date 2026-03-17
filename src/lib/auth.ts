import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import * as schema from "@/server/db/auth-schema";
import { getBaseURL } from "@/utils/getBaseUrl";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: ["*.vercel.app"],
    fallback: getBaseURL(),
  },
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
});
