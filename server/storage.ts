import { concerts, votes, type Concert, type InsertConcert, type Vote, type InsertVote, type ConcertWithVotes } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getConcerts(): Promise<Concert[]>;
  getConcertById(id: number): Promise<Concert | undefined>;
  createConcert(concert: InsertConcert): Promise<Concert>;
  vote(vote: InsertVote): Promise<Vote>;
  getVoteStats(): Promise<{ [concertId: number]: { excited: number; interested: number } }>;
  getConcertsWithVotes(): Promise<ConcertWithVotes[]>;
}

export class DatabaseStorage implements IStorage {
  private previousRanks: Map<number, number>;

  constructor() {
    this.previousRanks = new Map();
    
    // Initialize with real DC piano concert data if tables are empty
    this.initializeConcerts();
  }

  private async initializeConcerts() {
    // Check if concerts already exist in database
    const existingConcerts = await db.select().from(concerts).limit(1);
    if (existingConcerts.length > 0) {
      return; // Data already exists, no need to initialize
    }
    const concertData = [
      {
        title: "José Luiz Martins' Brazil Project",
        date: "Sunday at 7:00 PM",
        venue: "Takoma Station Tavern",
        price: "From $23.18",
        organizer: "Jazz Kitchen Productions",
        description: "Experience the vibrant rhythms of Brazilian jazz with internationally acclaimed pianist José Luiz Martins.",
        imageUrl: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1051553063%2F53596862044%2F1%2Foriginal.20250612-114654?crop=focalpoint&fit=crop&h=230&w=460&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=437618b6bf8a617d9e5b15c2f10c5200"
      },
      {
        title: "Harpsichordist Jory Vinikour plays Sparkling Scarlatti Sonatas",
        date: "Sat, Jun 28, 8:00 PM",
        venue: "St. Columba's Episcopal Church",
        price: "From $63.74",
        organizer: "Capriccio Baroque",
        description: "Renowned harpsichordist Jory Vinikour brings Scarlatti's brilliant sonatas to life in an intimate baroque setting.",
        imageUrl: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F923324233%2F226582576668%2F1%2Foriginal.20241226-115525?crop=focalpoint&fit=crop&h=230&w=460&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=b5c46a7077ecbac3dfc3ff9b5bed4711"
      },
      {
        title: "Washington | 2025 Scholarship Pianists Debut Recital",
        date: "Fri, Jul 18, 7:30 PM",
        venue: "La Maison Française, Embassy of France",
        price: "Free",
        organizer: "Embassy Cultural Program",
        description: "Young scholarship recipients showcase their exceptional talent in this debut performance at the French Embassy.",
        imageUrl: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1012220253%2F90224703647%2F1%2Foriginal.20250418-200017?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=5e-05&fp-y=5e-05&s=5ff3ae740072ef59d20791697d58778f"
      },
      {
        title: "Fatty Liver Foundation Benefit Recital | Celimene Daudet, Piano",
        date: "Thu, Oct 23, 7:30 PM",
        venue: "La Maison Française, Embassy of France",
        price: "Donation",
        organizer: "Fatty Liver Foundation",
        description: "Celebrated pianist Celimene Daudet performs in support of fatty liver disease research and awareness.",
        imageUrl: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F838593109%2F90224703647%2F1%2Foriginal.20240831-144333?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=5e-05&fp-y=5e-05&s=03ddc74cba0bd3eea567787ed92885b6"
      },
      {
        title: "DC Chamber Musicians Season Finale",
        date: "Saturday at 3:00 PM",
        venue: "St Thomas Episcopal Church",
        price: "From $35.00",
        organizer: "DC Chamber Musicians",
        description: "The season concludes with an extraordinary chamber music performance featuring piano and strings.",
        imageUrl: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1034149363%2F1463811440923%2F1%2Foriginal.20250519-164932?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=a8ec10685630b68281387c02e91c3350"
      },
      {
        title: "Considering Matthew Shepard",
        date: "Fri, Jul 11, 7:30 PM",
        venue: "Washington National Cathedral",
        price: "From $23.18",
        organizer: "Berkshire Choral",
        description: "A powerful choral and piano performance honoring the memory of Matthew Shepard.",
        imageUrl: "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1040576603%2F528497426627%2F1%2Foriginal.20250528-133310?crop=focalpoint&fit=crop&h=230&w=460&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.512310606061&fp-y=0.224252491694&s=359684fec5bab0f97ff22326e33009c3"
      }
    ];

    // Insert initial concert data into database
    for (const data of concertData) {
      await db.insert(concerts).values(data);
    }
  }

  async getConcerts(): Promise<Concert[]> {
    return await db.select().from(concerts);
  }

  async getConcertById(id: number): Promise<Concert | undefined> {
    const [concert] = await db.select().from(concerts).where(eq(concerts.id, id));
    return concert || undefined;
  }

  async createConcert(concert: InsertConcert): Promise<Concert> {
    const [newConcert] = await db
      .insert(concerts)
      .values(concert)
      .returning();
    return newConcert;
  }

  async vote(vote: InsertVote): Promise<Vote> {
    const [newVote] = await db
      .insert(votes)
      .values(vote)
      .returning();
    return newVote;
  }

  async getVoteStats(): Promise<{ [concertId: number]: { excited: number; interested: number } }> {
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
  }

  async getConcertsWithVotes(): Promise<ConcertWithVotes[]> {
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

    return concertsWithVotes;
  }
}

export const storage = new DatabaseStorage();
