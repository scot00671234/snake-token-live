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
        fetch('/api/game/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: gameData?.game?.id,
            finalScore
          })
        });
      },
      onMove: (direction: string) => {
        // Send move to server
        sendMessage({
          type: 'move',
          direction
        });
      }
    });

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
    <div className="cyber-border rounded-lg overflow-hidden">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="game-canvas w-full bg-card"
          data-testid="game-canvas"
        />
        
        {!isGameRunning && (
          <div className="absolute inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-cyber font-bold text-primary neon-text">
                SNAKE GAME
              </h2>
              <p className="text-muted-foreground">
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
