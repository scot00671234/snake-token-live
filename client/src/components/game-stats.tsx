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
    <div className="grid grid-cols-4 gap-3">
      <div className="data-panel p-3 rounded-lg border border-border">
        <div className="text-xs text-muted-foreground">Score</div>
        <div className="text-lg font-mono font-bold text-primary" data-testid="text-score">
          {score.toLocaleString()}
        </div>
      </div>
      <div className="data-panel p-3 rounded-lg border border-border">
        <div className="text-xs text-muted-foreground">Level</div>
        <div className="text-lg font-mono font-bold text-secondary" data-testid="text-level">
          {level}
        </div>
      </div>
      <div className="data-panel p-3 rounded-lg border border-border">
        <div className="text-xs text-muted-foreground">Comments</div>
        <div className="text-lg font-mono font-bold text-accent" data-testid="text-comments">
          {totalComments.toLocaleString()}
        </div>
      </div>
      <div className="data-panel p-3 rounded-lg border border-border">
        <div className="text-xs text-muted-foreground">Players</div>
        <div className="text-lg font-mono font-bold text-primary" data-testid="text-players">
          {activePlayers}
        </div>
      </div>
    </div>
  );
}
