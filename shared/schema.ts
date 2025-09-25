import { z } from "zod";

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

// Types
export type InsertComment = z.infer<typeof insertCommentSchema>;
