import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import { storage } from "./storage";
import { insertVoteSchema } from "@shared/schema";

const execAsync = promisify(exec);

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Serve concert-specific pages with dynamic meta tags
  app.get('/concert/:id', async (req, res) => {
    const concertId = parseInt(req.params.id);
    const concert = await storage.getConcertById(concertId);
    
    if (!concert) {
      return res.redirect('/');
    }
    
    // Generate dynamic HTML with concert-specific meta tags
    const concertHtml = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    
    <title>${concert.title} | SightTune</title>
    <meta name="description" content="${concert.description || `${concert.title} at ${concert.venue} on ${concert.date}`}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${req.protocol}://${req.get('host')}/concert/${concert.id}" />
    <meta property="og:title" content="${concert.title}" />
    <meta property="og:description" content="${concert.title} at ${concert.venue} on ${concert.date}" />
    <meta property="og:image" content="${concert.imageUrl}" />
    <meta property="og:site_name" content="SightTune" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${concert.title}" />
    <meta name="twitter:description" content="${concert.title} at ${concert.venue} on ${concert.date}" />
    <meta name="twitter:image" content="${concert.imageUrl}" />
    
    <script>
      // Redirect to main page after meta tags are loaded
      setTimeout(() => {
        window.location.href = '/?concert=${concert.id}';
      }, 1000);
    </script>
  </head>
  <body>
    <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif;">
      <div style="text-align: center;">
        <h1>${concert.title}</h1>
        <p>${concert.venue}</p>
        <p>${concert.date}</p>
        <p>Redirecting to SightTune...</p>
      </div>
    </div>
  </body>
</html>`;
    
    res.send(concertHtml);
  });

  // Serve social media Open Graph image
  app.get("/og-image.png", (req, res) => {
    const imagePath = path.join(process.cwd(), "og-image.png");
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(imagePath);
  });

  // Get future concerts only (must be before /:id route)
  app.get("/api/concerts/future", async (req, res) => {
    try {
      const concerts = await storage.getFutureConcerts();
      res.json(concerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch future concerts" });
    }
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

  // Generate Instagram post image
  app.post("/api/generate-instagram-post", async (req, res) => {
    try {
      const { concertId } = req.body;
      
      if (!concertId) {
        return res.status(400).json({ error: "Concert ID is required" });
      }

      // Get concert data
      const concert = await storage.getConcertById(concertId);
      if (!concert) {
        return res.status(404).json({ error: "Concert not found" });
      }

      // Create filename with timestamp
      const timestamp = Date.now();
      const filename = `instagram_post_${concertId}_${timestamp}.png`;
      const outputPath = path.join(process.cwd(), 'client', 'public', filename);

      // Prepare concert data for Python script
      const concertData = JSON.stringify({
        title: concert.title,
        venue: concert.venue,
        date: concert.date,
        price: concert.price,
        imageUrl: concert.imageUrl
      });

      // Execute Python script to generate Instagram post
      const command = `cd ${process.cwd()} && python create_instagram_post.py '${concertData}' '${outputPath}'`;
      
      await execAsync(command);

      // Check if file was created
      if (fs.existsSync(outputPath)) {
        res.json({ 
          success: true, 
          filename: filename,
          url: `/${filename}`,
          message: "Instagram post image generated successfully"
        });
      } else {
        res.status(500).json({ error: "Failed to generate image" });
      }
    } catch (error: any) {
      console.error('Instagram post generation error:', error);
      res.status(500).json({ error: "Failed to generate Instagram post image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
