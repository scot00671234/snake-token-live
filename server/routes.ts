import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertGameSchema, insertCommentSchema, insertHighScoreSchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";

interface GameState {
  snake: { x: number; y: number }[];
  food: { x: number; y: number };
  direction: 'up' | 'down' | 'left' | 'right';
  score: number;
  level: number;
  isActive: boolean;
  gameId: string;
}

let currentGameState: GameState | null = null;
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

  // Game API Routes
  app.post('/api/game/start', async (req, res) => {
    try {
      // End any existing active game
      const existingGame = await storage.getActiveGame();
      if (existingGame) {
        await storage.endGame(existingGame.id, existingGame.score);
      }

      // Create new game
      const gameData = {
        score: 0,
        level: 1,
        duration: 0,
        moves: 0,
        gameData: {
          snake: [{ x: 10, y: 10 }],
          food: { x: 15, y: 15 },
          direction: 'right'
        }
      };

      const game = await storage.createGame(gameData);
      
      // Initialize game state
      currentGameState = {
        snake: gameData.gameData.snake,
        food: gameData.gameData.food,
        direction: gameData.gameData.direction as any,
        score: 0,
        level: 1,
        isActive: true,
        gameId: game.id
      };

      // Broadcast game start
      broadcast({
        type: 'gameStarted',
        data: currentGameState
      });

      res.json({ success: true, gameId: game.id });
    } catch (error) {
      console.error('Error starting game:', error);
      res.status(500).json({ error: 'Failed to start game' });
    }
  });

  app.post('/api/game/end', async (req, res) => {
    try {
      const { gameId, finalScore } = req.body;
      
      if (!gameId) {
        return res.status(400).json({ error: 'Game ID required' });
      }

      const game = await storage.endGame(gameId, finalScore);
      
      if (currentGameState) {
        currentGameState.isActive = false;
      }

      // Broadcast game end
      broadcast({
        type: 'gameEnded',
        data: { gameId, finalScore }
      });

      res.json({ success: true, game });
    } catch (error) {
      console.error('Error ending game:', error);
      res.status(500).json({ error: 'Failed to end game' });
    }
  });

  app.post('/api/game/move', async (req, res) => {
    try {
      const { direction } = req.body;
      
      if (!currentGameState || !currentGameState.isActive) {
        return res.status(400).json({ error: 'No active game' });
      }

      // Validate direction
      if (!['up', 'down', 'left', 'right'].includes(direction)) {
        return res.status(400).json({ error: 'Invalid direction' });
      }

      // Update game state
      currentGameState.direction = direction;

      // Update game in database
      await storage.updateGame(currentGameState.gameId, {
        moves: currentGameState.score, // Approximate moves by score
        gameData: {
          snake: currentGameState.snake,
          food: currentGameState.food,
          direction: currentGameState.direction
        }
      });

      // Broadcast move update
      broadcast({
        type: 'gameMove',
        data: { direction, gameState: currentGameState }
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error processing move:', error);
      res.status(500).json({ error: 'Failed to process move' });
    }
  });

  // Comment API Routes
  app.post('/api/comments', async (req, res) => {
    try {
      const commentData = insertCommentSchema.parse(req.body);
      
      // Parse command from comment text
      const command = parseCommand(commentData.originalText);
      const isValid = command !== null;

      const comment = await storage.createComment({
        ...commentData,
        command: command || 'invalid',
        isValid
      });

      // If valid command and game is active, process it
      if (isValid && currentGameState && currentGameState.isActive) {
        currentGameState.direction = command as any;
        
        // Broadcast command
        broadcast({
          type: 'commandReceived',
          data: { command, comment }
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

  // Alternative route with gameId in URL (for test compatibility)
  app.post('/api/comments/:gameId', async (req, res) => {
    try {
      const { gameId } = req.params;
      const commentData = {
        ...req.body,
        gameId
      };
      
      // Parse command from comment text
      const command = parseCommand(commentData.originalText);
      const isValid = command !== null;

      const comment = await storage.createComment({
        ...commentData,
        command: command || 'invalid',
        isValid
      });

      // If valid command and game is active, process it
      if (isValid && currentGameState && currentGameState.isActive) {
        currentGameState.direction = command as any;
        
        // Broadcast command
        broadcast({
          type: 'commandReceived',
          data: { command, comment }
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

  app.get('/api/comments/:gameId', async (req, res) => {
    try {
      const { gameId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const comments = await storage.getRecentComments(gameId, limit);
      res.json(comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  // High Scores API Routes
  app.post('/api/high-scores', async (req, res) => {
    try {
      const highScoreData = insertHighScoreSchema.parse(req.body);
      const highScore = await storage.createHighScore(highScoreData);
      
      // Broadcast new high score
      broadcast({
        type: 'newHighScore',
        data: highScore
      });

      res.json(highScore);
    } catch (error) {
      console.error('Error creating high score:', error);
      res.status(500).json({ error: 'Failed to create high score' });
    }
  });

  app.get('/api/high-scores', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const highScores = await storage.getTopScores(limit);
      res.json(highScores);
    } catch (error) {
      console.error('Error fetching high scores:', error);
      res.status(500).json({ error: 'Failed to fetch high scores' });
    }
  });

  // Game Stats API Routes
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getGameStats();
      res.json(stats || {
        totalGames: 0,
        totalComments: 0,
        activePlayers: connectedClients.size,
        averageScore: 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Current game state
  app.get('/api/game/current', async (req, res) => {
    try {
      const activeGame = await storage.getActiveGame();
      res.json({
        game: activeGame,
        gameState: currentGameState,
        connectedPlayers: connectedClients.size
      });
    } catch (error) {
      console.error('Error fetching current game:', error);
      res.status(500).json({ error: 'Failed to fetch current game' });
    }
  });

  // Pump.fun Integration Routes
  app.get('/api/pump-fun/comments/:mintAddress', async (req, res) => {
    try {
      const { mintAddress } = req.params;
      
      // Fetch comments from pump.fun API
      const pumpFunResponse = await axios.get(
        `https://frontend-api-v3.pump.fun/coins/${mintAddress}/replies`,
        {
          headers: {
            'Accept': 'application/json',
            'Origin': 'https://pump.fun',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 10000
        }
      );

      const pumpFunComments = pumpFunResponse.data;
      
      // Transform pump.fun comments to our format
      const transformedComments = pumpFunComments.map((comment: any) => {
        const command = parseCommand(comment.text || comment.content || '');
        return {
          id: comment.id || `pf-${Date.now()}-${Math.random()}`,
          username: comment.user?.username || comment.username || 'Anonymous',
          originalText: comment.text || comment.content || '',
          command: command || 'invalid',
          isValid: command !== null,
          createdAt: comment.created_at || comment.timestamp || new Date().toISOString(),
          source: 'pump.fun'
        };
      });

      res.json(transformedComments);
    } catch (error) {
      console.error('Error fetching pump.fun comments:', error);
      res.status(500).json({ 
        error: 'Failed to fetch pump.fun comments',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Start pump.fun comment polling for a specific mint
  app.post('/api/pump-fun/start-polling/:mintAddress', async (req, res) => {
    try {
      const { mintAddress } = req.params;
      const { gameId } = req.body;
      
      if (!gameId) {
        return res.status(400).json({ error: 'Game ID is required' });
      }

      // Store polling configuration (in production, use a proper job queue)
      console.log(`Starting pump.fun polling for mint: ${mintAddress}, game: ${gameId}`);
      
      // For MVP, we'll set up a simple interval to poll comments
      const pollInterval = setInterval(async () => {
        try {
          const response = await axios.get(
            `https://frontend-api-v3.pump.fun/coins/${mintAddress}/replies`,
            {
              headers: {
                'Accept': 'application/json',
                'Origin': 'https://pump.fun'
              },
              timeout: 5000
            }
          );
          
          const comments = response.data;
          if (comments && comments.length > 0) {
            const latestComment = comments[0];
            const command = parseCommand(latestComment.text || latestComment.content || '');
            
            if (command && currentGameState && currentGameState.isActive && currentGameState.gameId === gameId) {
              // Process the command
              currentGameState.direction = command as any;
              
              // Broadcast command
              broadcast({
                type: 'commandReceived',
                data: { 
                  command, 
                  comment: {
                    username: latestComment.user?.username || 'pump.fun user',
                    originalText: latestComment.text || latestComment.content,
                    source: 'pump.fun'
                  }
                }
              });
              
              // Store comment in our database
              await storage.createComment({
                gameId,
                username: latestComment.user?.username || 'pump.fun user',
                originalText: latestComment.text || latestComment.content || '',
                command,
                isValid: true
              });
            }
          }
        } catch (error) {
          console.error('Error in pump.fun polling:', error);
        }
      }, 5000); // Poll every 5 seconds
      
      // In production, store this interval ID in a database or cache
      // For MVP, we'll let it run indefinitely
      
      res.json({ 
        success: true, 
        message: `Started polling pump.fun for mint ${mintAddress}`,
        pollInterval: 5000
      });
    } catch (error) {
      console.error('Error starting pump.fun polling:', error);
      res.status(500).json({ error: 'Failed to start pump.fun polling' });
    }
  });

  return httpServer;
}

// Helper function to parse commands from comment text
function parseCommand(text: string): 'up' | 'down' | 'left' | 'right' | null {
  const lowerText = text.toLowerCase().trim();
  
  if (lowerText.includes('up')) return 'up';
  if (lowerText.includes('down')) return 'down';
  if (lowerText.includes('left')) return 'left';
  if (lowerText.includes('right')) return 'right';
  
  return null;
}
