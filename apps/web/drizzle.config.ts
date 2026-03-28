import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DIRECT_DATABASE_URL)
  throw new Error("No DIRECT_DATABASE_URL set in .env file");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/auth-schema.ts",
  dialect: "postgresql",
  casing: "camelCase",
  dbCredentials: {
    url: process.env.DIRECT_DATABASE_URL,
  },
});
