import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema for wallet data responses
export const WalletDataSchema = z.object({
  address: z.string(),
  balance: z.string(),
  totalTransactions: z.number(),
  lastActivity: z.string(),
  uniqueContracts: z.number(),
  hasNft: z.boolean(),
  isEarlyAdopter: z.boolean(),
});

export type WalletData = z.infer<typeof WalletDataSchema>;

// Schema for wallet address validation
export const WalletAddressSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address format"),
});

export type WalletAddressInput = z.infer<typeof WalletAddressSchema>;

// Database schemas - not used for this project but keeping for compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
