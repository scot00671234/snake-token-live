import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertCommentSchema, GameState } from "../shared/schema.js";
import { nanoid } from "nanoid";

const connectedClients = new Set<WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize WebSocket server
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  wss.on('connection', (ws) => {
    connectedClients.add(ws);
    console.log('WebSocket client connected');

    // Send current game state to new client
    const currentGameState = storage.getCurrentGameState();
    if (currentGameState) {
      ws.send(JSON.stringify({
        type: 'gameState',
        data: currentGameState
      }));
    }

    ws.on('close', () => {
      connectedClients.delete(ws);
      console.log('WebSocket client disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(ws);
    });

    // Handle incoming WebSocket messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'gameOver') {
          // Handle game over - restart the game
          setTimeout(() => {
            initializeNewGame();
          }, 2000); // 2 second delay before restart
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
  });

  // Broadcast to all connected clients
  function broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // Initialize a new game
  function initializeNewGame(): GameState {
    const gameState: GameState = {
      snake: [{ x: 10, y: 10 }],
      food: { x: 15, y: 15 },
      direction: 'right',
      score: 0,
      isActive: true,
      gameId: nanoid()
    };

    storage.setCurrentGameState(gameState);

    // Broadcast game start
    broadcast({
      type: 'gameStarted',
      data: gameState
    });

    console.log(`New game started: ${gameState.gameId}`);
    return gameState;
  }

  // Core API Routes
  app.post('/api/game/start', async (req, res) => {
    try {
      const gameState = initializeNewGame();
      res.json({ success: true, gameId: gameState.gameId });
    } catch (error) {
      console.error('Error starting game:', error);
      res.status(500).json({ error: 'Failed to start game' });
    }
  });

  // Comments API - core functionality for viewer commands
  app.post('/api/comments', async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(commentData);

      // If valid command and game is active, update direction
      const currentGameState = storage.getCurrentGameState();
      if (comment.isValid && currentGameState && currentGameState.isActive) {
        currentGameState.direction = comment.command as any;
        storage.setCurrentGameState(currentGameState);
        
        // Broadcast command to all connected clients
        broadcast({
          type: 'commandReceived',
          data: { command: comment.command, comment }
        });
      }

      // Broadcast new comment
      broadcast({
        type: 'newComment',
        data: comment
      });

      res.json(comment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  app.get('/api/comments', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const comments = await storage.getRecentComments(limit);
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  // Minimal game state endpoints (for frontend compatibility)
  app.get('/api/game/current', async (req, res) => {
    try {
      const currentGameState = storage.getCurrentGameState();
      res.json({
        game: currentGameState ? { 
          id: currentGameState.gameId, 
          isActive: currentGameState.isActive,
          score: currentGameState.score 
        } : null,
        gameState: currentGameState,
        connectedPlayers: connectedClients.size
      });
    } catch (error) {
      console.error('Error fetching current game:', error);
      res.status(500).json({ error: 'Failed to fetch current game' });
    }
  });

  app.get('/api/stats', async (req, res) => {
    try {
      res.json({
        totalGames: 0, // Simplified for streaming
        totalComments: 0,
        activePlayers: connectedClients.size,
        averageScore: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Auto-start the first game when server starts
  setTimeout(() => {
    initializeNewGame();
    console.log('🐍 Snake game auto-started for 24/7 streaming!');
  }, 1000);

  return httpServer;
}
