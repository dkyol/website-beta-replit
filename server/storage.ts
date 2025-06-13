import { concerts, votes, type Concert, type InsertConcert, type Vote, type InsertVote, type ConcertWithVotes } from "@shared/schema";

export interface IStorage {
  getConcerts(): Promise<Concert[]>;
  getConcertById(id: number): Promise<Concert | undefined>;
  createConcert(concert: InsertConcert): Promise<Concert>;
  vote(vote: InsertVote): Promise<Vote>;
  getVoteStats(): Promise<{ [concertId: number]: { excited: number; interested: number } }>;
  getConcertsWithVotes(): Promise<ConcertWithVotes[]>;
}

export class MemStorage implements IStorage {
  private concerts: Map<number, Concert>;
  private votes: Map<number, Vote>;
  private concertIdCounter: number;
  private voteIdCounter: number;
  private previousRanks: Map<number, number>;

  constructor() {
    this.concerts = new Map();
    this.votes = new Map();
    this.concertIdCounter = 1;
    this.voteIdCounter = 1;
    this.previousRanks = new Map();
    
    // Initialize with real DC piano concert data
    this.initializeConcerts();
  }

  private initializeConcerts() {
    const concertData = [
      {
        title: "José Luiz Martins' Brazil Project",
        date: "Sunday at 7:00 PM",
        venue: "Takoma Station Tavern",
        price: "From $23.18",
        organizer: "Jazz Kitchen Productions",
        description: "Experience the vibrant rhythms of Brazilian jazz with internationally acclaimed pianist José Luiz Martins.",
        imageUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Harpsichordist Jory Vinikour plays Sparkling Scarlatti Sonatas",
        date: "Sat, Jun 28, 8:00 PM",
        venue: "St. Columba's Episcopal Church",
        price: "From $63.74",
        organizer: "Capriccio Baroque",
        description: "Renowned harpsichordist Jory Vinikour brings Scarlatti's brilliant sonatas to life in an intimate baroque setting.",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Washington | 2025 Scholarship Pianists Debut Recital",
        date: "Fri, Jul 18, 7:30 PM",
        venue: "La Maison Française, Embassy of France",
        price: "Free",
        organizer: "Embassy Cultural Program",
        description: "Young scholarship recipients showcase their exceptional talent in this debut performance at the French Embassy.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Fatty Liver Foundation Benefit Recital | Celimene Daudet, Piano",
        date: "Thu, Oct 23, 7:30 PM",
        venue: "La Maison Française, Embassy of France",
        price: "Donation",
        organizer: "Fatty Liver Foundation",
        description: "Celebrated pianist Celimene Daudet performs in support of fatty liver disease research and awareness.",
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "DC Chamber Musicians Season Finale",
        date: "Saturday at 3:00 PM",
        venue: "St Thomas Episcopal Church",
        price: "From $35.00",
        organizer: "DC Chamber Musicians",
        description: "The season concludes with an extraordinary chamber music performance featuring piano and strings.",
        imageUrl: "https://images.unsplash.com/photo-1465847899823-1fb0be2e9d48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      },
      {
        title: "Considering Matthew Shepard",
        date: "Fri, Jul 11, 7:30 PM",
        venue: "Washington National Cathedral",
        price: "From $23.18",
        organizer: "Berkshire Choral",
        description: "A powerful choral and piano performance honoring the memory of Matthew Shepard.",
        imageUrl: "https://images.unsplash.com/photo-1519139270028-15872d17547c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"
      }
    ];

    concertData.forEach(data => {
      const concert: Concert = {
        id: this.concertIdCounter++,
        ...data
      };
      this.concerts.set(concert.id, concert);
    });
  }

  async getConcerts(): Promise<Concert[]> {
    return Array.from(this.concerts.values());
  }

  async getConcertById(id: number): Promise<Concert | undefined> {
    return this.concerts.get(id);
  }

  async createConcert(concert: InsertConcert): Promise<Concert> {
    const newConcert: Concert = {
      id: this.concertIdCounter++,
      ...concert
    };
    this.concerts.set(newConcert.id, newConcert);
    return newConcert;
  }

  async vote(vote: InsertVote): Promise<Vote> {
    const newVote: Vote = {
      id: this.voteIdCounter++,
      ...vote,
      createdAt: new Date()
    };
    this.votes.set(newVote.id, newVote);
    return newVote;
  }

  async getVoteStats(): Promise<{ [concertId: number]: { excited: number; interested: number } }> {
    const stats: { [concertId: number]: { excited: number; interested: number } } = {};
    
    for (const vote of this.votes.values()) {
      if (!stats[vote.concertId]) {
        stats[vote.concertId] = { excited: 0, interested: 0 };
      }
      
      if (vote.voteType === 'excited') {
        stats[vote.concertId].excited++;
      } else if (vote.voteType === 'interested') {
        stats[vote.concertId].interested++;
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
      concert.rankChange = previousRank - currentRank;
      
      // Update previous ranks for next time
      this.previousRanks.set(concert.id, currentRank);
    });

    return concertsWithVotes;
  }
}

export const storage = new MemStorage();
