import { db } from "./db";
import {
  generations,
  type InsertGeneration,
  type Generation
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getGenerations(): Promise<Generation[]>;
  getGeneration(id: number): Promise<Generation | undefined>;
  createGeneration(generation: InsertGeneration): Promise<Generation>;
  updateGeneration(id: number, updates: Partial<Generation>): Promise<Generation>;
}

export class DatabaseStorage implements IStorage {
  async getGenerations(): Promise<Generation[]> {
    return await db.select().from(generations).orderBy(desc(generations.createdAt));
  }

  async getGeneration(id: number): Promise<Generation | undefined> {
    const [generation] = await db.select().from(generations).where(eq(generations.id, id));
    return generation;
  }

  async createGeneration(insertGeneration: InsertGeneration): Promise<Generation> {
    const [generation] = await db.insert(generations).values(insertGeneration).returning();
    return generation;
  }

  async updateGeneration(id: number, updates: Partial<Generation>): Promise<Generation> {
    const [updated] = await db
      .update(generations)
      .set(updates)
      .where(eq(generations.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
