interface GameStatsProps {
  stats?: {
    totalGames: number;
    totalComments: number;
    activePlayers: number;
    averageScore: number;
  };
  gameData?: {
    game?: {
      score: number;
      level: number;
    };
    connectedPlayers?: number;
  };
}

export default function GameStats({ stats, gameData }: GameStatsProps) {
  const score = gameData?.game?.score || 0;
  const level = gameData?.game?.level || 1;
  const totalComments = stats?.totalComments || 0;
  const activePlayers = gameData?.connectedPlayers || stats?.activePlayers || 0;

  return (
    <div className="flex gap-6 justify-center">
      <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="text-sm text-muted-foreground">Score</div>
          <div className="text-2xl font-mono font-bold text-primary" data-testid="text-score">
            {score.toLocaleString()}
          </div>
        </div>
        <div className="w-px h-6 bg-border"></div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-secondary rounded-full"></div>
          <div className="text-sm text-muted-foreground">Level</div>
          <div className="text-2xl font-mono font-bold text-secondary" data-testid="text-level">
            {level}
          </div>
        </div>
      </div>
    </div>
  );
}
