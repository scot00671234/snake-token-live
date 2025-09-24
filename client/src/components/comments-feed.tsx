import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/lib/websocket";

interface Comment {
  id: string;
  username: string;
  originalText: string;
  command: string;
  isValid: boolean;
  createdAt: string;
}

interface CommentsFeedProps {
  gameId?: string;
}

export default function CommentsFeed({ gameId }: CommentsFeedProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [lastCommands, setLastCommands] = useState<Array<{ direction: string; user: string }>>([]);
  const { messages } = useWebSocket();

  // Fetch initial comments
  const { data: initialComments } = useQuery({
    queryKey: ['/api/comments', gameId],
    enabled: !!gameId,
    refetchInterval: 5000,
  });

  // Handle WebSocket messages
  useEffect(() => {
    const latestMessage = messages[messages.length - 1];
    if (!latestMessage) return;

    switch (latestMessage.type) {
      case 'newComment':
        setComments(prev => [latestMessage.data, ...prev.slice(0, 49)]);
        break;
      
      case 'commandReceived':
        const { command, comment } = latestMessage.data;
        setLastCommands(prev => [
          { direction: command.toUpperCase(), user: comment.username },
          ...prev.slice(0, 4)
        ]);
        break;
    }
  }, [messages]);

  // Initialize comments from query
  useEffect(() => {
    if (initialComments && Array.isArray(initialComments)) {
      setComments(initialComments);
    }
  }, [initialComments]);

  // Only show real data - no mock comments

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - commentTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const getUserColorClasses = (username: string) => {
    const colorClasses = [
      { bg: 'bg-primary', text: 'text-primary' },
      { bg: 'bg-secondary', text: 'text-secondary' }, 
      { bg: 'bg-accent', text: 'text-accent' }
    ];
    const hash = username.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colorClasses[hash % colorClasses.length];
  };

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Compact Live Comments Feed for Livestreaming */}
      <div className="data-panel rounded-lg border border-border flex flex-col flex-1 min-h-0">
        <div className="p-2 border-b border-border flex-shrink-0">
          <h3 className="text-sm font-cyber font-bold text-secondary">Live Comments</h3>
          <p className="text-xs text-muted-foreground">pump.fun controls snake!</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0" data-testid="comments-feed">
          {comments.map((comment) => {
            const colorClasses = getUserColorClasses(comment.username);
            return (
              <div key={comment.id} className="comment-item p-2 rounded-lg animate-slide-up">
                <div className="flex items-start space-x-2">
                  <div className={`w-6 h-6 ${colorClasses.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-bold text-primary-foreground">
                      {comment.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 mb-0.5">
                      <span className={`font-mono text-xs ${colorClasses.text} truncate`}>
                        {comment.username}
                      </span>
                      {comment.isValid && (
                        <span className="text-xs bg-primary/20 text-primary px-1 rounded flex-shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{comment.originalText}</p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {comments.length === 0 && (
            <div className="text-center text-muted-foreground py-4">
              <p className="text-xs">Waiting for pump.fun comments...</p>
            </div>
          )}
        </div>
        
        <div className="p-2 border-t border-border flex-shrink-0">
          <div className="text-xs text-muted-foreground text-center">
            💡 Comment directional commands!
          </div>
        </div>
      </div>

      {/* Enhanced Recent Commands */}
      {lastCommands.length > 0 && (
        <div className="bg-background/30 backdrop-blur-sm rounded-lg border border-border/50 p-3 flex-shrink-0">
          <h3 className="text-sm font-bold mb-3 text-accent flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            Recent Commands
          </h3>
          <div className="flex gap-2" data-testid="last-commands">
            {lastCommands.slice(0, 3).map((command, index) => {
              const colorClasses = getUserColorClasses(command.user);
              const directionSymbols = {
                'UP': '↑',
                'DOWN': '↓', 
                'LEFT': '←',
                'RIGHT': '→'
              };
              return (
                <div key={index} className="flex items-center gap-2 bg-background/50 rounded-full px-3 py-1 border border-border/30">
                  <span className="text-lg">
                    {directionSymbols[command.direction as keyof typeof directionSymbols] || command.direction}
                  </span>
                  <span className={`text-xs font-mono ${colorClasses.text} truncate max-w-16`}>
                    {command.user}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
