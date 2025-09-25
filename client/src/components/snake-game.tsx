import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "@/lib/websocket";
import { SnakeGameEngine } from "@/lib/game-engine";

interface SnakeGameProps {
  gameData?: any;
}

export default function SnakeGame({ gameData }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<SnakeGameEngine | null>(null);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const { sendMessage } = useWebSocket();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize game engine
    gameEngineRef.current = new SnakeGameEngine(canvas, ctx, {
      onScoreUpdate: (score: number) => {
        // Update score in UI
      },
      onGameOver: (finalScore: number) => {
        setIsGameRunning(false);
        // Send game end to server
        sendMessage({
          type: 'gameOver',
          data: { finalScore }
        });
        
        // Auto-restart for 24/7 streaming after 2 seconds
        setTimeout(() => {
          startGame();
        }, 2000);
      },
      onMove: (direction: string) => {
        // Send move to server
        sendMessage({
          type: 'move',
          direction
        });
      }
    });

    // Auto-start the game for 24/7 streaming
    setTimeout(() => {
      startGame();
    }, 1000);

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.stop();
      }
    };
  }, [gameData, sendMessage]);

  const startGame = async () => {
    try {
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        setIsGameRunning(true);
        if (gameEngineRef.current) {
          gameEngineRef.current.start();
        }
      }
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const stopGame = () => {
    setIsGameRunning(false);
    if (gameEngineRef.current) {
      gameEngineRef.current.stop();
    }
  };

  return (
    <div className="cyber-border rounded-lg overflow-hidden" style={{width: '720px', height: '480px'}}>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={720}
          height={480}
          className="game-canvas bg-card"
          style={{width: '720px', height: '480px'}}
          data-testid="game-canvas"
        />
        
        {!isGameRunning && (
          <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-xl font-cyber font-bold text-primary neon-text">
                SNAKE GAME
              </h2>
              <p className="text-sm text-muted-foreground">
                Comment commands control the snake!
              </p>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors cyber-border"
                data-testid="button-start-game"
              >
                START GAME
              </button>
            </div>
          </div>
        )}

        {isGameRunning && (
          <div className="absolute top-4 right-4">
            <button
              onClick={stopGame}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-bold hover:bg-destructive/90 transition-colors"
              data-testid="button-stop-game"
            >
              STOP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
