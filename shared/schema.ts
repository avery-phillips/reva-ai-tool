import { z } from "zod";
import { pgTable, serial, text, timestamp, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const leadFormSchema = z.object({
  businessType: z.string().min(1, "Business type is required"),
  targetLocation: z.string().min(1, "Target location is required"),
  squareFootage: z.string().min(1, "Square footage is required"),
  features: z.array(z.string()).optional().default([]),
});

export const tenantLeadSchema = z.object({
  id: z.string(),
  name: z.string(),
  industry: z.string(),
  reasoning: z.string(),
  contact: z.string(),
  isEnriched: z.boolean().optional(),
  phone: z.string().optional(),
  enrichedName: z.string().optional(),
  title: z.string().optional(),
  linkedinUrl: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
export type TenantLead = z.infer<typeof tenantLeadSchema>;

export const propertyFeatures = [
  "Parking",
  "Loading Dock", 
  "Retail Visibility",
  "Office Space",
  "Walk-In Traffic",
  "Storage Space"
] as const;

export type PropertyFeature = typeof propertyFeatures[number];

// Database tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessName: text("business_name").notNull(),
  industry: text("industry").notNull(),
  rationale: text("rationale").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"), // PDL enriched phone number
  website: text("website"),
  linkedinUrl: text("linkedin_url"),
  title: text("title"), // PDL enriched job title
  enrichedName: text("enriched_name"), // PDL enriched full name
  isEnriched: boolean("is_enriched").default(false), // Flag to track PDL enrichment
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
