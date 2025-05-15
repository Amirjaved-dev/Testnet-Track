import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema for wallet airdrop eligibility criteria
export const AirdropCriteriaSchema = z.object({
  ethTransactions: z.object({
    required: z.number(),
    actual: z.number(),
    isEligible: z.boolean(),
  }),
  nadsNft: z.object({
    required: z.boolean(),
    actual: z.boolean(),
    isEligible: z.boolean(),
  }),
  monBalance: z.object({
    required: z.string(),
    actual: z.string(),
    isEligible: z.boolean(),
  }),
  monadTransactions: z.object({
    required: z.number(),
    actual: z.number(),
    isEligible: z.boolean(),
  }),
  earlyAdopter: z.object({
    required: z.boolean(),
    actual: z.boolean(),
    isEligible: z.boolean(),
    date: z.string().optional(),
  }),
});

// Schema for wallet data responses
export const WalletDataSchema = z.object({
  address: z.string(),
  balance: z.string(),
  totalTransactions: z.number(),
  lastActivity: z.string(),
  uniqueContracts: z.number(),
  hasNft: z.boolean(),
  isEarlyAdopter: z.boolean(),
  // Add airdrop eligibility criteria
  airdropEligibility: z.object({
    criteria: AirdropCriteriaSchema,
    isEligible: z.boolean(),
    message: z.string(),
  }),
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
