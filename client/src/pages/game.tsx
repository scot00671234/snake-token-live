import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import SnakeGame from "@/components/snake-game";
import CommentsFeed from "@/components/comments-feed";
import GameStats from "@/components/game-stats";

export default function Game() {
  // Fetch current game state
  const { data: gameData } = useQuery({
    queryKey: ['/api/game/current'],
    refetchInterval: 1000,
  });

  // Fetch game stats
  const { data: stats } = useQuery({
    queryKey: ['/api/stats'],
    refetchInterval: 5000,
  });


  return (
    <div className="bg-background text-foreground font-sans h-screen flex flex-col overflow-hidden">
      {/* Compact Header for Livestreaming */}
      <header className="border-b border-border bg-card/50 flex-shrink-0">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold font-cyber text-sm">S</span>
              </div>
              <h1 className="text-lg font-cyber font-bold neon-text">pump.fun PLAYS SNAKE</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Perfect Fit Layout for 1920x1080 - Zero Scrolling */}
      <main className="flex-1 flex flex-col px-4 py-2 min-h-0 overflow-hidden">
        {/* Compact Stats Row */}
        <div className="flex-shrink-0 mb-1">
          <GameStats stats={stats as any} gameData={gameData as any} />
        </div>
        
        {/* Main Content Area - Game + Rules + Comments */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Left Side - Game Canvas (Fixed Size for Perfect Fit) */}
          <div className="flex flex-col items-center justify-center" style={{width: '760px'}}>
            <SnakeGame gameData={gameData} />
          </div>
          
          {/* Right Side - Rules + Comments */}
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            {/* Compact Rules - Always Visible */}
            <div className="data-panel p-3 rounded-lg border border-border flex-shrink-0">
              <h3 className="text-sm font-cyber font-bold mb-2 text-primary">How to Play</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <h4 className="font-semibold text-secondary mb-1">Commands:</h4>
                  <div className="flex flex-wrap gap-1">
                    <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">up</span>
                    <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">down</span>
                    <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">left</span>
                    <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">right</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-accent mb-1">Rules:</h4>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>• Snake moves automatically</div>
                    <div>• Eat food to grow and score</div>
                    <div>• Avoid walls and tail</div>
                    <div>• Comments control direction</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Compact Comments Feed */}
            <div className="flex-1 min-h-0">
              <CommentsFeed gameId={(gameData as any)?.game?.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
