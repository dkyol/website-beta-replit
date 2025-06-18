import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { insertVoteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve social media Open Graph image
  app.get("/og-image.png", (req, res) => {
    const imagePath = path.join(process.cwd(), "og-image.png");
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(imagePath);
  });

  // Get all concerts
  app.get("/api/concerts", async (req, res) => {
    try {
      const concerts = await storage.getConcerts();
      res.json(concerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch concerts" });
    }
  });

  // Get concert by ID
  app.get("/api/concerts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const concert = await storage.getConcertById(id);
      
      if (!concert) {
        return res.status(404).json({ error: "Concert not found" });
      }
      
      res.json(concert);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch concert" });
    }
  });

  // Submit a vote
  app.post("/api/vote", async (req, res) => {
    try {
      const validatedData = insertVoteSchema.parse(req.body);
      
      // Generate or get session ID from request
      const sessionId = req.body.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Verify concert exists
      const concert = await storage.getConcertById(validatedData.concertId);
      if (!concert) {
        return res.status(404).json({ error: "Concert not found" });
      }

      // Verify vote type is valid
      if (!['excited', 'interested'].includes(validatedData.voteType)) {
        return res.status(400).json({ error: "Invalid vote type" });
      }

      const vote = await storage.vote(validatedData, sessionId);
      res.json(vote);
    } catch (error: any) {
      console.error('Vote submission error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid vote data" });
      }
      res.status(500).json({ error: "Failed to submit vote" });
    }
  });

  // Get concerts with vote statistics and rankings
  app.get("/api/rankings", async (req, res) => {
    try {
      const concertsWithVotes = await storage.getConcertsWithVotes();
      res.json(concertsWithVotes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rankings" });
    }
  });

  // Get vote statistics
  app.get("/api/vote-stats", async (req, res) => {
    try {
      const stats = await storage.getVoteStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vote statistics" });
    }
  });

  // Get user badges by session ID
  app.get("/api/badges/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const userBadges = await storage.getUserBadges(sessionId);
      res.json(userBadges);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user badges" });
    }
  });

  // Get available badges list
  app.get("/api/badges", async (req, res) => {
    try {
      // Import badges directly to avoid circular dependency
      const { AVAILABLE_BADGES } = await import("@shared/badges");
      const badgesInfo = AVAILABLE_BADGES.map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color
      }));
      res.json(badgesInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch available badges" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
