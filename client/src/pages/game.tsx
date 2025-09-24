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
    <div className="bg-background text-foreground font-sans min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold font-cyber">S</span>
              </div>
              <h1 className="text-xl font-cyber font-bold neon-text">TWITCH PLAYS SNAKE</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Container - Single Column Layout */}
      <main className="container mx-auto px-4 py-4 space-y-4 max-w-6xl">
        {/* Game Stats */}
        <GameStats stats={stats as any} gameData={gameData as any} />
        
        {/* Game Canvas */}
        <SnakeGame gameData={gameData} />

        {/* Game Rules - Always Visible */}
        <div className="data-panel p-4 rounded-lg border border-border">
          <h3 className="text-lg font-cyber font-bold mb-3 text-primary">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-secondary">Comment Commands:</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div><span className="font-mono bg-muted px-2 py-1 rounded">up</span> - Move snake up</div>
                <div><span className="font-mono bg-muted px-2 py-1 rounded">down</span> - Move snake down</div>
                <div><span className="font-mono bg-muted px-2 py-1 rounded">left</span> - Move snake left</div>
                <div><span className="font-mono bg-muted px-2 py-1 rounded">right</span> - Move snake right</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-accent">Game Rules:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>• Snake moves automatically every 200ms</div>
                <div>• Collect food to grow and increase score</div>
                <div>• Avoid walls and your own tail</div>
                <div>• Comments control the next move</div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Feed */}
        <CommentsFeed gameId={(gameData as any)?.game?.id} />
      </main>
    </div>
  );
}
