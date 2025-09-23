import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SnakeGame from "@/components/snake-game";
import CommentsFeed from "@/components/comments-feed";
import GameStats from "@/components/game-stats";
import { ExternalLink, Zap } from "lucide-react";

export default function Game() {
  const [tokenPrice, setTokenPrice] = useState(0.00234);
  const [marketCap, setMarketCap] = useState("1.2M");
  const [volume24h, setVolume24h] = useState("456K");

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

  // Simulate token price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setTokenPrice(prev => {
        const change = (Math.random() - 0.5) * 0.0001;
        return Math.max(0, prev + change);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Matrix rain effect
  useEffect(() => {
    const createMatrixRain = () => {
      const matrixBg = document.getElementById('matrixBg');
      if (!matrixBg) return;

      matrixBg.innerHTML = '';
      const chars = '01';
      
      for (let i = 0; i < 50; i++) {
        const char = document.createElement('div');
        char.className = 'matrix-char';
        char.textContent = chars[Math.floor(Math.random() * chars.length)];
        char.style.left = Math.random() * 100 + 'vw';
        char.style.animationDelay = Math.random() * 20 + 's';
        char.style.animationDuration = (Math.random() * 10 + 10) + 's';
        matrixBg.appendChild(char);
      }
    };

    createMatrixRain();
  }, []);

  const priceChange = "+15.67%";
  const bondingProgress = 67;

  return (
    <div className="bg-background text-foreground font-sans min-h-screen overflow-x-hidden">
      {/* Matrix Rain Background */}
      <div className="matrix-bg" id="matrixBg"></div>

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold font-cyber">S</span>
                </div>
                <h1 className="text-2xl font-cyber font-bold neon-text">SNAKE TOKEN</h1>
              </div>
              <div className="pulse-dot w-2 h-2"></div>
              <span className="text-sm text-muted-foreground">LIVE STREAMING</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Current Price</div>
                <div className="text-lg font-mono font-bold text-primary">
                  ${tokenPrice.toFixed(5)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="text-lg font-mono font-bold text-secondary">${marketCap}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">24h Volume</div>
                <div className="text-lg font-mono font-bold text-accent">${volume24h}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Container */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-screen max-h-[calc(100vh-120px)]">
          
          {/* Game Canvas Section */}
          <div className="lg:col-span-8 space-y-4">
            <GameStats stats={stats as any} gameData={gameData as any} />
            <SnakeGame gameData={gameData} />

            {/* Game Controls Info */}
            <div className="data-panel p-6 rounded-lg border border-border">
              <h3 className="text-lg font-cyber font-bold mb-4 text-primary">How to Play</h3>
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
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Token Performance */}
            <div className="data-panel p-4 rounded-lg border border-border">
              <h3 className="text-lg font-cyber font-bold mb-4 text-primary">SNAKE Token Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price Change (24h)</span>
                  <span className="text-primary font-mono">{priceChange}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Holders</span>
                  <span className="font-mono">1,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Supply</span>
                  <span className="font-mono">1B SNAKE</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" 
                    style={{ width: `${bondingProgress}%` }}
                  ></div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Bonding Curve Progress: {bondingProgress}%
                </div>
              </div>
            </div>

            {/* Pump.fun Integration Panel */}
            <div className="data-panel p-4 rounded-lg border border-border">
              <h3 className="text-lg font-cyber font-bold mb-4 text-primary flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Pump.fun Integration
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  Connect to real pump.fun token comments
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Token mint address..."
                    className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm"
                    data-testid="input-mint-address"
                  />
                  <button 
                    className="px-3 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/80"
                    data-testid="button-test-pump-fun"
                    onClick={async () => {
                      try {
                        const mintAddress = "2ZwUG529hiMr11T7d1zSHzGb1wz5oLA2g22LsfMepump";
                        const response = await fetch(`/api/pump-fun/comments/${mintAddress}`);
                        const data = await response.json();
                        console.log("Pump.fun response:", data);
                        alert(response.ok ? "Integration working! Check console for details" : `Error: ${data.error}`);
                      } catch (error) {
                        console.error("Error testing pump.fun:", error);
                        alert("Error testing pump.fun integration");
                      }
                    }}
                  >
                    Test
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Status: <span className="text-primary">Ready</span> | 
                  Endpoint: <span className="font-mono">/api/pump-fun/comments</span>
                </div>
                <a 
                  href="https://pump.fun/2ZwUG529hiMr11T7d1zSHzGb1wz5oLA2g22LsfMepump" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                  data-testid="link-pump-fun"
                >
                  <ExternalLink className="w-3 h-3" />
                  View on pump.fun
                </a>
              </div>
            </div>

            <CommentsFeed gameId={(gameData as any)?.game?.id} />
          </div>
        </div>
      </main>

      {/* Technical Status Bar */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-8">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="pulse-dot w-2 h-2"></div>
                <span className="text-muted-foreground">WebSocket Connected</span>
              </div>
              <div className="text-muted-foreground">
                Game Engine: <span className="font-mono text-primary">TypeScript</span>
              </div>
              <div className="text-muted-foreground">
                Database: <span className="font-mono text-secondary">PostgreSQL</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-muted-foreground">Contract:</span>
              <span className="font-mono text-xs text-primary">2ZwUG529hiMr11T7d1zSHzGb1wz5oLA2g22LsfMepump</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">Hosted on VPS via DoKploy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
