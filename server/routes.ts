import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route to save generated leads to database
  app.post("/api/leads", async (req, res) => {
    try {
      const leadsData = z.array(insertLeadSchema).parse(req.body);
      const savedLeads = await storage.createLeads(leadsData);
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
