import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL)
  throw new Error("No DATABASE_URL set in .env file");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/auth-schema.ts",
  dialect: "postgresql",
  casing: "camelCase",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
