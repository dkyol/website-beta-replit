import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const concerts = pgTable("concerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  venue: text("venue").notNull(),
  price: text("price").notNull(),
  organizer: text("organizer").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  concertId: integer("concert_id").notNull(),
  voteType: text("vote_type").notNull(), // 'excited' or 'interested'
  sessionId: text("session_id"), // Track user sessions for badges
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  totalVotes: integer("total_votes").default(0).notNull(),
  excitedVotes: integer("excited_votes").default(0).notNull(),
  interestedVotes: integer("interested_votes").default(0).notNull(),
  uniqueConcertsVoted: integer("unique_concerts_voted").default(0).notNull(),
  firstVoteAt: timestamp("first_vote_at"),
  lastVoteAt: timestamp("last_vote_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConcertSchema = createInsertSchema(concerts).omit({
  id: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertConcert = z.infer<typeof insertConcertSchema>;
export type Concert = typeof concerts.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;

export interface ConcertWithVotes extends Concert {
  excitedVotes: number;
  interestedVotes: number;
  totalVotes: number;
  weightedScore: number;
  rank: number;
  previousRank?: number;
  rankChange?: number;
}

// Badge types for fan engagement
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: (session: UserSession) => boolean;
}

export interface UserBadges {
  sessionId: string;
  badges: Badge[];
  session: UserSession;
}
