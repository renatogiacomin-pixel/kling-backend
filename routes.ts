import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.generations.list.path, async (req, res) => {
    const items = await storage.getGenerations();
    res.json(items);
  });

  app.get(api.generations.get.path, async (req, res) => {
    const item = await storage.getGeneration(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: 'Generation not found' });
    }
    res.json(item);
  });

  app.post(api.generations.create.path, async (req, res) => {
    try {
      const input = api.generations.create.input.parse(req.body);
      const generation = await storage.createGeneration(input);
      
      // Simulate background processing
      simulateGeneration(generation.id);

      res.status(201).json(generation);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}

// Mock background generation process
async function simulateGeneration(id: number) {
  // 1. Initial delay -> Processing
  setTimeout(async () => {
    await storage.updateGeneration(id, { 
      status: 'processing',
      progress: 25
    });
    
    // 2. More progress
    setTimeout(async () => {
      await storage.updateGeneration(id, { progress: 75 });
      
      // 3. Complete
      setTimeout(async () => {
        // Randomly pick a nice stock video
        const videos = [
          "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4",
          "https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4",
          "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
          "https://assets.mixkit.co/videos/preview/mixkit-abstract-video-of-a-man-with-heads-like-a-fan-34407-large.mp4"
        ];
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        
        await storage.updateGeneration(id, {
          status: 'completed',
          progress: 100,
          videoUrl: randomVideo,
          thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop' // Generic abstract thumb
        });
      }, 3000);
    }, 2000);
  }, 1000);
}
