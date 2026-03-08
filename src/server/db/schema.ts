import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

export const template = pgTable("template", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),
  title: d.text().notNull(),
  stateJSON: d.jsonb().default([]),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));
