import { users, leads, type User, type InsertUser, type Lead, type InsertLead } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createLeads(leads: InsertLead[]): Promise<Lead[]>;
  getAllLeads(limit?: number, offset?: number): Promise<Lead[]>;
  getLeadsCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createLeads(insertLeads: InsertLead[]): Promise<Lead[]> {
    const savedLeads = await db
      .insert(leads)
      .values(insertLeads)
      .returning();
    
    // Log each saved lead's ID for debugging
    savedLeads.forEach(lead => {
      console.log(`Saved lead to database with ID: ${lead.id} - ${lead.businessName}`);
    });
    
    return savedLeads;
  }

  async getAllLeads(limit: number = 50, offset: number = 0): Promise<Lead[]> {
    return await db.select().from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getLeadsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(leads);
    return result[0].count;
  }
}

export const storage = new DatabaseStorage();
