import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  score: integer("score").notNull().default(0),
  level: integer("level").notNull().default(1),
  duration: integer("duration").notNull().default(0), // in seconds
  moves: integer("moves").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  gameData: jsonb("game_data"), // store snake position, food position, etc.
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
  endedAt: timestamp("ended_at"),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").references(() => games.id),
  username: text("username").notNull(),
  command: text("command").notNull(), // up, down, left, right
  originalText: text("original_text").notNull(),
  isValid: boolean("is_valid").notNull().default(false),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
});

export const highScores = pgTable("high_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").references(() => games.id).notNull(),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  level: integer("level").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`NOW()`),
});

export const gameStats = pgTable("game_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  totalGames: integer("total_games").notNull().default(0),
  totalComments: integer("total_comments").notNull().default(0),
  activePlayers: integer("active_players").notNull().default(0),
  averageScore: integer("average_score").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().default(sql`NOW()`),
});

// Insert schemas
export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  endedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertHighScoreSchema = createInsertSchema(highScores).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertHighScore = z.infer<typeof insertHighScoreSchema>;
export type HighScore = typeof highScores.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameStats = typeof gameStats.$inferSelect;
