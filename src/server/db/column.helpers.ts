import { createId } from "@paralleldrive/cuid2";
import { sql } from "drizzle-orm";
import { text, timestamp } from "drizzle-orm/pg-core";

export const initCols = {
  id: text()
    .primaryKey()
    .$default(() => createId()),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).$onUpdate(
    () => sql`CURRENT_TIMESTAMP`,
  ),
};
