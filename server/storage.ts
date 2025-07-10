import { users, leads, type User, type InsertUser, type Lead, type InsertLead } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createLeads(leads: InsertLead[]): Promise<Lead[]>;
  getAllLeads(): Promise<Lead[]>;
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

  async getAllLeads(): Promise<Lead[]> {
    return await db.select().from(leads);
  }
}

export const storage = new DatabaseStorage();
