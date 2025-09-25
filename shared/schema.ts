import { z } from "zod";
import { pgTable, serial, varchar, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Core game state interface (in-memory only)
export interface GameState {
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  score: number;
  isActive: boolean;
  gameId: string;
}

// Comment interface for viewer commands (in-memory only)
export interface Comment {
  id: string;
  username?: string;
  originalText: string;
  command: string;
  isValid: boolean;
  createdAt: string;
}

// Insert schemas for validation
export const insertCommentSchema = z.object({
  username: z.string().optional(),
  originalText: z.string().min(1),
});

// Database table definitions
export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  gameId: varchar('game_id', { length: 255 }).notNull().unique(),
  score: integer('score').notNull().default(0),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'),
});

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  gameId: varchar('game_id', { length: 255 }),
  username: varchar('username', { length: 100 }),
  originalText: text('original_text').notNull(),
  command: varchar('command', { length: 20 }).notNull(),
  isValid: boolean('is_valid').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const gameStats = pgTable('game_stats', {
  id: serial('id').primaryKey(),
  totalGames: integer('total_games').notNull().default(0),
  totalComments: integer('total_comments').notNull().default(0),
  activePlayers: integer('active_players').notNull().default(0),
  averageScore: integer('average_score').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Insert schemas using drizzle-zod
export const insertGameSchema = createInsertSchema(games).omit({ id: true, createdAt: true });
export const insertGameStatsSchema = createInsertSchema(gameStats).omit({ id: true, updatedAt: true });

// Types
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type GameStats = typeof gameStats.$inferSelect;
export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
