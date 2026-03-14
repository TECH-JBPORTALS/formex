import { sql } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";

export const institution = pgTable("institution", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),
  name: d.text().notNull(),
  code: d.text().notNull(),
  email: d.text().notNull(),
  phone: d.text().notNull(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));

export const template = pgTable("template", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),
  title: d.text().notNull(),
  stateJSON: d.jsonb().default([]),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));

export const student = pgTable("student", (d) => ({
  id: d.uuid().defaultRandom().primaryKey(),
  fullName: d.text().notNull(),
  dateOfBirth: d.date().notNull(),
  createdAt: d.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: d
    .timestamp({ withTimezone: true })
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
}));
