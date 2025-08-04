import type { Express } from "express";
import { createServer, type Server } from "http";
import { body, validationResult } from "express-validator";
import { storage } from "./storage";
import { enrichTopLeads } from "./pdl";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { healthCheck } from "./middleware/monitoring";

// Security: Enhanced rate limiting for lead generation (resource-intensive operation)
const leadGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 lead generations per minute
  message: {
    error: 'Lead generation rate limit exceeded. Please wait before generating more leads.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for monitoring
  app.get('/api/health', healthCheck);
  // Security: Input validation middleware for lead creation
  const validateLeadInput = [
    body('*.businessName')
      .isLength({ min: 1, max: 255 })
      .withMessage('Business name must be between 1 and 255 characters')
      .escape(),
    body('*.industry')
      .isLength({ min: 1, max: 100 })
      .withMessage('Industry must be between 1 and 100 characters')
      .escape(),
    body('*.rationale')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Rationale must be between 1 and 1000 characters')
      .escape(),
    body('*.contactName')
      .isLength({ min: 1, max: 255 })
      .withMessage('Contact name must be between 1 and 255 characters')
      .escape(),
    body('*.email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email format'),
    body('*.website')
      .optional()
      .isURL()
      .withMessage('Invalid website URL'),
    body('*.linkedinUrl')
      .optional()
      .isURL()
      .withMessage('Invalid LinkedIn URL'),
  ];

  // API route to save generated leads to database
  app.post("/api/leads", leadGenerationLimiter, validateLeadInput, async (req, res) => {
    try {
      // Security: Check validation results
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array().map(err => ({
            field: err.param,
            message: err.msg
          }))
        });
      }

      // Security: Additional Zod validation for type safety
      const leadsData = z.array(insertLeadSchema).parse(req.body);
      
      // Enrich top 5 leads with PDL data to ensure we get 3 real matches
      console.log("🔍 Starting PDL enrichment for top 5 leads to get 3 real matches...");
      const enrichedData = await enrichTopLeads(
        leadsData.map(lead => ({
          email: lead.email,
          contactName: lead.contactName,
          businessName: lead.businessName
        })),
        5
      );
      
      // Merge enrichment data back into leads - prioritize successful enrichments
      const successfulEnrichments = enrichedData.filter(e => e.enrichment.success);
      console.log(`🎯 Found ${successfulEnrichments.length} successful PDL enrichments`);
      
      const leadsWithEnrichment = leadsData.map((lead, index) => {
        if (index < 5) { // Check first 5 leads for enrichment
          const enrichment = enrichedData[index]?.enrichment;
          if (enrichment?.success) {
            return {
              ...lead,
              phone: enrichment.phone,
              enrichedName: enrichment.fullName,
              title: enrichment.title,
              linkedinUrl: enrichment.linkedinUrl || lead.linkedinUrl,
              isEnriched: true
            };
          }
        }
        return {
          ...lead,
          isEnriched: false
        };
      });
      
      // Count and log successful enrichments
      const enrichedCount = leadsWithEnrichment.filter(lead => lead.isEnriched).length;
      console.log(`✨ Successfully enriched ${enrichedCount} leads with PDL data`);
      
      const savedLeads = await storage.createLeads(leadsWithEnrichment);
      
      console.log(`Successfully saved ${savedLeads.length} leads to database (${enrichedData.filter(e => e.enrichment.success).length} enriched)`);
      res.json(savedLeads);
    } catch (error) {
      console.error("Error saving leads:", error);
      
      // Security: Don't expose sensitive error details to client
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid lead data format",
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      
      // Generic error response for security
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API route to get all saved leads with pagination and filtering
  app.get("/api/leads", async (req, res) => {
    try {
      // Security: Validate query parameters
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const offset = (page - 1) * limit;

      const leads = await storage.getAllLeads(limit, offset);
      const totalCount = await storage.getLeadsCount();
      
      res.json({
        leads,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
