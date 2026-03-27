import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as authSchema from "./auth-schema";

const schema = { ...authSchema };

if (!process.env.DATABASE_URL) throw new Error("No DATABASE_URL provided");

const sql = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: sql, schema, casing: "camelCase" });

export { db, schema };
