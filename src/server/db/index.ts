import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as authSchema from "./auth-schema";
import * as appSchema from "./schema";

const schema = { ...authSchema, ...appSchema };

if (!process.env.DATABASE_URL) throw new Error("No DATABASE_URL provided");

const sql = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: sql, schema, casing: "snake_case" });

export { db };
