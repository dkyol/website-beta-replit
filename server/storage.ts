import { concerts, votes, userSessions, type Concert, type InsertConcert, type Vote, type InsertVote, type ConcertWithVotes, type UserSession, type InsertUserSession, type UserBadges } from "@shared/schema";
import { db } from "./db";
import { eq, sql, count, countDistinct, desc } from "drizzle-orm";
import { calculateUserBadges } from "@shared/badges";
import { sortConcertsByDate, isFutureConcert } from "@shared/dateUtils";

export interface IStorage {
  getConcerts(): Promise<Concert[]>;
  getFutureConcerts(): Promise<Concert[]>;
  getConcertById(id: number): Promise<Concert | undefined>;
  createConcert(concert: InsertConcert): Promise<Concert>;
  vote(vote: InsertVote, sessionId: string): Promise<Vote>;
  getVoteStats(): Promise<{ [concertId: number]: { excited: number; interested: number } }>;
  getConcertsWithVotes(): Promise<ConcertWithVotes[]>;
  getUserSession(sessionId: string): Promise<UserSession | undefined>;
  createOrUpdateUserSession(sessionId: string): Promise<UserSession>;
  getUserBadges(sessionId: string): Promise<UserBadges>;
}

export class DatabaseStorage implements IStorage {
  private previousRanks: Map<number, number>;

  constructor() {
    this.previousRanks = new Map();
  }

  private async initializeConcerts() {
    try {
      // Check if concerts already exist in database
      const existingConcerts = await db.select().from(concerts).limit(1);
      if (existingConcerts.length > 0) {
        return; // Data already exists, no need to initialize
      }
    } catch (error) {
      console.log("Database not ready yet, will initialize on first request");
      return;
    }
    const concertData = [
      {
        title: "José Luiz Martins' Brazil Project",
        date: new Date("2024-12-15T19:00:00"),
        venue: "Takoma Station Tavern",
        price: "From $23.18",
        organizer: "Jazz Kitchen Productions",
        description: "Experience the vibrant rhythms of Brazilian jazz with internationally acclaimed pianist José Luiz Martins.",
        imageUrl: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1051553063%2F53596862044%2F1%2Foriginal.20250612-114654?crop=focalpoint&fit=crop&h=230&w=460&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=437618b6bf8a617d9e5b15c2f10c5200"
      },
      {
        title: "Harpsichordist Jory Vinikour plays Sparkling Scarlatti Sonatas",
        date: new Date("2025-06-28T20:00:00"),
        venue: "St. Columba's Episcopal Church",
        price: "From $63.74",
        organizer: "Capriccio Baroque",
        description: "Renowned harpsichordist Jory Vinikour brings Scarlatti's brilliant sonatas to life in an intimate baroque setting.",
        imageUrl: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F923324233%2F226582576668%2F1%2Foriginal.20241226-115525?crop=focalpoint&fit=crop&h=230&w=460&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=b5c46a7077ecbac3dfc3ff9b5bed4711"
      },
      {
        title: "Washington | 2025 Scholarship Pianists Debut Recital",
        date: new Date("2025-07-18T19:30:00"),
        venue: "La Maison Française, Embassy of France",
        price: "Free",
        organizer: "Embassy Cultural Program",
        description: "Young scholarship recipients showcase their exceptional talent in this debut performance at the French Embassy.",
        imageUrl: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1012220253%2F90224703647%2F1%2Foriginal.20250418-200017?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=5e-05&fp-y=5e-05&s=5ff3ae740072ef59d20791697d58778f"
      },
      {
        title: "Fatty Liver Foundation Benefit Recital | Celimene Daudet, Piano",
        date: new Date("2025-10-23T19:30:00"),
        venue: "La Maison Française, Embassy of France",
        price: "Donation",
        organizer: "Fatty Liver Foundation",
        description: "Celebrated pianist Celimene Daudet performs in support of fatty liver disease research and awareness.",
        imageUrl: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F838593109%2F90224703647%2F1%2Foriginal.20240831-144333?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=5e-05&fp-y=5e-05&s=03ddc74cba0bd3eea567787ed92885b6"
      },
      {
        title: "DC Chamber Musicians Season Finale",
        date: new Date("2025-08-16T15:00:00"),
        venue: "St Thomas Episcopal Church",
        price: "From $35.00",
        organizer: "DC Chamber Musicians",
        description: "The season concludes with an extraordinary chamber music performance featuring piano and strings.",
        imageUrl: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1034149363%2F1463811440923%2F1%2Foriginal.20250519-164932?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=a8ec10685630b68281387c02e91c3350"
      },
      {
        title: "Considering Matthew Shepard",
        date: new Date("2025-07-11T19:30:00"),
        venue: "Washington National Cathedral",
        price: "From $23.18",
        organizer: "Berkshire Choral",
        description: "A powerful choral and piano performance honoring the memory of Matthew Shepard.",
        imageUrl: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1040576603%2F528497426627%2F1%2Foriginal.20250528-133310?crop=focalpoint&fit=crop&h=230&w=460&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.512310606061&fp-y=0.224252491694&s=359684fec5bab0f97ff22326e33009c3"
      }
    ];

    try {
      // Insert initial concert data into database
      for (const data of concertData) {
        await db.insert(concerts).values(data);
      }
    } catch (error) {
      console.error("Failed to initialize concerts:", error);
    }
  }

  async getConcerts(): Promise<Concert[]> {
    try {
      const result = await db.select().from(concerts).orderBy(concerts.date);
      // If no concerts found, try to initialize
      if (result.length === 0) {
        await this.initializeConcerts();
        return await db.select().from(concerts).orderBy(concerts.date);
      }
      return result;
    } catch (error) {
      console.error("Database error in getConcerts:", error);
      throw new Error("Failed to fetch concerts");
    }
  }

  async getFutureConcerts(): Promise<Concert[]> {
    try {
      const allConcerts = await this.getConcerts();
      return allConcerts.filter(concert => isFutureConcert(concert.date));
    } catch (error) {
      console.error("Database error in getFutureConcerts:", error);
      return [];
    }
  }

  async getConcertById(id: number): Promise<Concert | undefined> {
    try {
      const [concert] = await db.select().from(concerts).where(eq(concerts.id, id));
      return concert || undefined;
    } catch (error) {
      console.error("Database error in getConcertById:", error);
      return undefined;
    }
  }

  async createConcert(concert: InsertConcert): Promise<Concert> {
    try {
      const [newConcert] = await db
        .insert(concerts)
        .values(concert)
        .returning();
      return newConcert;
    } catch (error) {
      console.error("Database error in createConcert:", error);
      throw new Error("Failed to create concert");
    }
  }

  async vote(vote: InsertVote, sessionId: string): Promise<Vote> {
    try {
      // Create the vote with session tracking
      const [newVote] = await db
        .insert(votes)
        .values({ ...vote, sessionId })
        .returning();
      
      // Update user session statistics after vote
      await this.createOrUpdateUserSession(sessionId);
      
      return newVote;
    } catch (error) {
      console.error("Database error in vote:", error);
      throw new Error("Failed to submit vote");
    }
  }

  async getVoteStats(): Promise<{ [concertId: number]: { excited: number; interested: number } }> {
    try {
      const voteResults = await db
        .select({
          concertId: votes.concertId,
          voteType: votes.voteType,
          count: sql<number>`count(*)`.as('count')
        })
        .from(votes)
        .groupBy(votes.concertId, votes.voteType);

      const stats: { [concertId: number]: { excited: number; interested: number } } = {};
      
      for (const result of voteResults) {
        if (!stats[result.concertId]) {
          stats[result.concertId] = { excited: 0, interested: 0 };
        }
        
        if (result.voteType === 'excited') {
          stats[result.concertId].excited = result.count;
        } else if (result.voteType === 'interested') {
          stats[result.concertId].interested = result.count;
        }
      }

      return stats;
    } catch (error) {
      console.error("Database error in getVoteStats:", error);
      return {};
    }
  }

  async getConcertsWithVotes(): Promise<ConcertWithVotes[]> {
    try {
      const allConcerts = await this.getConcerts();
      const voteStats = await this.getVoteStats();
    
      const concertsWithVotes = allConcerts.map(concert => {
        const stats = voteStats[concert.id] || { excited: 0, interested: 0 };
        const totalVotes = stats.excited + stats.interested;
        const weightedScore = (stats.excited * 2) + stats.interested;
        
        return {
          ...concert,
          excitedVotes: stats.excited,
          interestedVotes: stats.interested,
          totalVotes,
          weightedScore,
          rank: 0, // Will be set after sorting
          previousRank: this.previousRanks.get(concert.id)
        };
      });

      // Sort by weighted score and assign ranks
      concertsWithVotes.sort((a, b) => b.weightedScore - a.weightedScore);
      
      concertsWithVotes.forEach((concert, index) => {
        const currentRank = index + 1;
        const previousRank = concert.previousRank || currentRank;
        
        concert.rank = currentRank;
        (concert as any).rankChange = previousRank - currentRank;
        
        // Update previous ranks for next time
        this.previousRanks.set(concert.id, currentRank);
      });

      // Return only top 10 concerts
      return concertsWithVotes.slice(0, 10);
    } catch (error) {
      console.error("Database error in getConcertsWithVotes:", error);
      return [];
    }
  }

  async getUserSession(sessionId: string): Promise<UserSession | undefined> {
    try {
      const [session] = await db.select().from(userSessions).where(eq(userSessions.sessionId, sessionId));
      return session || undefined;
    } catch (error) {
      console.error("Database error in getUserSession:", error);
      return undefined;
    }
  }



  async createOrUpdateUserSession(sessionId: string): Promise<UserSession> {
    try {
      // Get current session stats by querying votes
      const sessionVotes = await db
        .select({
          totalVotes: count(),
          excitedVotes: sql<number>`sum(case when ${votes.voteType} = 'excited' then 1 else 0 end)`,
          interestedVotes: sql<number>`sum(case when ${votes.voteType} = 'interested' then 1 else 0 end)`,
          uniqueConcerts: countDistinct(votes.concertId)
        })
        .from(votes)
        .where(eq(votes.sessionId, sessionId));

      const stats = sessionVotes[0] || { totalVotes: 0, excitedVotes: 0, interestedVotes: 0, uniqueConcerts: 0 };

      // Check if session exists
      const existingSession = await this.getUserSession(sessionId);
      
      if (existingSession) {
        // Update existing session
        const [updatedSession] = await db
          .update(userSessions)
          .set({
            totalVotes: stats.totalVotes,
            excitedVotes: stats.excitedVotes,
            interestedVotes: stats.interestedVotes,
            uniqueConcertsVoted: stats.uniqueConcerts,
            lastVoteAt: new Date()
          })
          .where(eq(userSessions.sessionId, sessionId))
          .returning();
        return updatedSession;
      } else {
        // Create new session
        const [newSession] = await db
          .insert(userSessions)
          .values({
            sessionId,
            totalVotes: stats.totalVotes,
            excitedVotes: stats.excitedVotes,
            interestedVotes: stats.interestedVotes,
            uniqueConcertsVoted: stats.uniqueConcerts,
            firstVoteAt: new Date(),
            lastVoteAt: new Date()
          })
          .returning();
        return newSession;
      }
    } catch (error) {
      console.error("Database error in createOrUpdateUserSession:", error);
      throw new Error("Failed to update user session");
    }
  }

  async getUserBadges(sessionId: string): Promise<UserBadges> {
    try {
      const session = await this.getUserSession(sessionId);
    
      if (!session) {
        // Return empty badges for non-existent sessions
        return {
          sessionId,
          badges: [],
          session: {
            id: 0,
            sessionId,
            totalVotes: 0,
            excitedVotes: 0,
            interestedVotes: 0,
            uniqueConcertsVoted: 0,
            firstVoteAt: null,
            lastVoteAt: null,
            createdAt: null
          }
        };
      }

      const badges = calculateUserBadges(session);
      
      return {
        sessionId,
        badges,
        session
      };
    } catch (error) {
      console.error("Database error in getUserBadges:", error);
      return {
        sessionId,
        badges: [],
        session: {
          id: 0,
          sessionId,
          totalVotes: 0,
          excitedVotes: 0,
          interestedVotes: 0,
          uniqueConcertsVoted: 0,
          firstVoteAt: null,
          lastVoteAt: null,
          createdAt: null
        }
      };
    }
  }
}

export const storage = new DatabaseStorage();
