import { games, comments, highScores, gameStats, type Game, type InsertGame, type Comment, type InsertComment, type HighScore, type InsertHighScore, type GameStats } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Game methods
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: string): Promise<Game | undefined>;
  updateGame(id: string, updates: Partial<InsertGame>): Promise<Game | undefined>;
  endGame(id: string, finalScore: number): Promise<Game | undefined>;
  getActiveGame(): Promise<Game | undefined>;
  
  // Comment methods
  createComment(comment: InsertComment): Promise<Comment>;
  getRecentComments(gameId: string, limit?: number): Promise<Comment[]>;
  getValidCommands(gameId: string, limit?: number): Promise<Comment[]>;
  
  // High score methods
  createHighScore(highScore: InsertHighScore): Promise<HighScore>;
  getTopScores(limit?: number): Promise<HighScore[]>;
  
  // Stats methods
  getGameStats(): Promise<GameStats | undefined>;
  updateGameStats(stats: Partial<GameStats>): Promise<GameStats>;
}

export class DatabaseStorage implements IStorage {
  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db
      .insert(games)
      .values(insertGame)
      .returning();
    return game;
  }

  async getGame(id: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async updateGame(id: string, updates: Partial<InsertGame>): Promise<Game | undefined> {
    const [game] = await db
      .update(games)
      .set(updates)
      .where(eq(games.id, id))
      .returning();
    return game || undefined;
  }

  async endGame(id: string, finalScore: number): Promise<Game | undefined> {
    const [game] = await db
      .update(games)
      .set({
        score: finalScore,
        isActive: false,
        endedAt: sql`NOW()`,
      })
      .where(eq(games.id, id))
      .returning();
    return game || undefined;
  }

  async getActiveGame(): Promise<Game | undefined> {
    const [game] = await db
      .select()
      .from(games)
      .where(eq(games.isActive, true))
      .orderBy(desc(games.createdAt))
      .limit(1);
    return game || undefined;
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async getRecentComments(gameId: string, limit: number = 50): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.gameId, gameId))
      .orderBy(desc(comments.createdAt))
      .limit(limit);
  }

  async getValidCommands(gameId: string, limit: number = 10): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(and(
        eq(comments.gameId, gameId),
        eq(comments.isValid, true)
      ))
      .orderBy(desc(comments.createdAt))
      .limit(limit);
  }

  async createHighScore(insertHighScore: InsertHighScore): Promise<HighScore> {
    const [highScore] = await db
      .insert(highScores)
      .values(insertHighScore)
      .returning();
    return highScore;
  }

  async getTopScores(limit: number = 10): Promise<HighScore[]> {
    return await db
      .select()
      .from(highScores)
      .orderBy(desc(highScores.score))
      .limit(limit);
  }

  async getGameStats(): Promise<GameStats | undefined> {
    const [stats] = await db
      .select()
      .from(gameStats)
      .orderBy(desc(gameStats.updatedAt))
      .limit(1);
    return stats || undefined;
  }

  async updateGameStats(updates: Partial<GameStats>): Promise<GameStats> {
    // First try to update existing stats
    const existing = await this.getGameStats();
    
    if (existing) {
      const [stats] = await db
        .update(gameStats)
        .set({ ...updates, updatedAt: sql`NOW()` })
        .where(eq(gameStats.id, existing.id))
        .returning();
      return stats;
    } else {
      // Create new stats if none exist
      const [stats] = await db
        .insert(gameStats)
        .values({
          totalGames: updates.totalGames || 0,
          totalComments: updates.totalComments || 0,
          activePlayers: updates.activePlayers || 0,
          averageScore: updates.averageScore || 0,
        })
        .returning();
      return stats;
    }
  }
}

export const storage = new DatabaseStorage();
