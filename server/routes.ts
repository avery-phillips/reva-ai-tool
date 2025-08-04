import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { enrichTopLeads } from "./pdl";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to save generated leads to database
  app.post("/api/leads", async (req, res) => {
    try {
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
      res.status(400).json({ error: "Invalid lead data or database error" });
    }
  });

  // API route to get all saved leads
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getAllLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Database error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
