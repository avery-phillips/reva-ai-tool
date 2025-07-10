import { z } from "zod";

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
