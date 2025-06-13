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
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConcertSchema = createInsertSchema(concerts).omit({
  id: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export type InsertConcert = z.infer<typeof insertConcertSchema>;
export type Concert = typeof concerts.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;

export interface ConcertWithVotes extends Concert {
  excitedVotes: number;
  interestedVotes: number;
  totalVotes: number;
  weightedScore: number;
  rank: number;
  previousRank?: number;
  rankChange?: number;
}
