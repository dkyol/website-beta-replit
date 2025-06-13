import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertVoteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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
      
      // Verify concert exists
      const concert = await storage.getConcertById(validatedData.concertId);
      if (!concert) {
        return res.status(404).json({ error: "Concert not found" });
      }

      // Verify vote type is valid
      if (!['excited', 'interested'].includes(validatedData.voteType)) {
        return res.status(400).json({ error: "Invalid vote type" });
      }

      const vote = await storage.vote(validatedData);
      res.json(vote);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
