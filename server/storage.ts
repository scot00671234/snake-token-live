import { Comment, InsertComment, GameState } from "../shared/schema.js";
import { nanoid } from "nanoid";

export interface IStorage {
  // Comment methods
  createComment(comment: InsertComment): Promise<Comment>;
  getRecentComments(limit?: number): Promise<Comment[]>;
  
  // Game state methods (in-memory only)
  getCurrentGameState(): GameState | null;
  setCurrentGameState(state: GameState | null): void;
}

export class MemoryStorage implements IStorage {
  private comments: Comment[] = [];
  private currentGameState: GameState | null = null;
  private readonly maxComments = 100; // Keep last 100 comments

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const comment: Comment = {
      id: nanoid(),
      username: insertComment.username || 'Anonymous',
      originalText: insertComment.originalText,
      command: this.parseCommand(insertComment.originalText),
      isValid: this.parseCommand(insertComment.originalText) !== 'invalid',
      createdAt: new Date().toISOString(),
    };

    this.comments.push(comment);
    
    // Keep only the most recent comments to prevent memory issues
    if (this.comments.length > this.maxComments) {
      this.comments = this.comments.slice(-this.maxComments);
    }

    return comment;
  }

  async getRecentComments(limit: number = 50): Promise<Comment[]> {
    return this.comments
      .slice(-limit)
      .reverse(); // Most recent first
  }

  getCurrentGameState(): GameState | null {
    return this.currentGameState;
  }

  setCurrentGameState(state: GameState | null): void {
    this.currentGameState = state;
  }

  private parseCommand(text: string): string {
    const lowerText = text.toLowerCase().trim();
    
    if (lowerText.includes('up')) return 'up';
    if (lowerText.includes('down')) return 'down';
    if (lowerText.includes('left')) return 'left';
    if (lowerText.includes('right')) return 'right';
    
    return 'invalid';
  }
}

export const storage = new MemoryStorage();
