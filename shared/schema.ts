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

// Database schemas for our application
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isAdmin: true,
});

export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type").notNull(), // 'string', 'number', 'boolean', 'json'
  description: text("description"),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
  updatedBy: text("updated_by"),
});

export const insertAppSettingsSchema = createInsertSchema(appSettings).pick({
  key: true,
  value: true,
  type: true,
  description: true,
  updatedBy: true,
});

export const advertisements = pgTable("advertisements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  placement: text("placement").notNull(), // 'home', 'airdrop', 'sidebar', etc.
  imageUrl: text("image_url"),
  targetUrl: text("target_url"),
  isActive: boolean("is_active").notNull().default(true),
  startDate: text("start_date"),
  endDate: text("end_date"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  createdBy: text("created_by"),
});

export const insertAdvertisementSchema = createInsertSchema(advertisements).pick({
  title: true,
  content: true,
  placement: true,
  imageUrl: true,
  targetUrl: true,
  isActive: true,
  startDate: true,
  endDate: true,
  createdBy: true,
});

// Types for the schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAppSetting = z.infer<typeof insertAppSettingsSchema>;
export type AppSetting = typeof appSettings.$inferSelect;

export type InsertAdvertisement = z.infer<typeof insertAdvertisementSchema>;
export type Advertisement = typeof advertisements.$inferSelect;

// Schema for app configurations
export const AppConfigSchema = z.object({
  appName: z.string().default("Monad Wallet Analyzer"),
  appDescription: z.string().default("Analyze Monad wallets and check airdrop eligibility"),
  primaryColor: z.string().default("#6366f1"), // Indigo-500
  secondaryColor: z.string().default("#8b5cf6"), // Purple-500
  logoUrl: z.string().optional(),
  showAds: z.boolean().default(true),
  airdropRequirements: z.object({
    ethTransactions: z.number().default(10),
    requireNadsNft: z.boolean().default(true),
    monTokenBalance: z.number().default(10),
    monadTransactions: z.number().default(200),
    requireEarlyAdopter: z.boolean().default(true),
  }),
  socialLinks: z.array(
    z.object({
      name: z.string(),
      url: z.string().url(),
      icon: z.string()
    })
  ).default([]),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
