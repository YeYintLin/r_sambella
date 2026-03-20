import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * CRM Opportunities table - stores data synced from Odoo
 */
export const opportunities = mysqlTable("opportunities", {
  id: int("id").autoincrement().primaryKey(),
  odooId: int("odooId").notNull().unique(), // Reference to Odoo opportunity ID
  name: varchar("name", { length: 255 }).notNull(), // Opportunity name
  stage: varchar("stage", { length: 100 }).notNull(), // Pipeline stage (New, Qualified, Proposition, Won, etc.)
  amount: int("amount").notNull().default(0), // Amount in currency
  probability: int("probability").notNull().default(0), // Probability percentage (0-100)
  expectedRevenue: int("expectedRevenue").notNull().default(0), // Expected revenue
  partnerName: varchar("partnerName", { length: 255 }), // Customer/Partner name
  email: varchar("email", { length: 320 }), // Contact email
  phone: varchar("phone", { length: 20 }), // Contact phone
  description: text("description"), // Additional notes
  rating: int("rating").notNull().default(0), // Star rating (0-5)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(), // Last sync from Odoo
});

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = typeof opportunities.$inferInsert;