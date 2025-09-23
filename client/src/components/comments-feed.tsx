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

  // Simulate comments for demo (remove when real API is connected)
  useEffect(() => {
    if (!gameId) {
      const simulatedComments = [
        { id: '1', username: 'AlphaTrader', originalText: 'right', command: 'right', isValid: true, createdAt: new Date().toISOString() },
        { id: '2', username: 'CryptoSnake', originalText: 'up up up! 🚀', command: 'up', isValid: true, createdAt: new Date().toISOString() },
        { id: '3', username: 'GameMaster', originalText: 'down', command: 'down', isValid: true, createdAt: new Date().toISOString() },
        { id: '4', username: 'SnakeHolder', originalText: 'This is genius! 🐍 left', command: 'left', isValid: true, createdAt: new Date().toISOString() },
        { id: '5', username: 'MoonBoi', originalText: 'right! Let\'s go snake army!', command: 'right', isValid: true, createdAt: new Date().toISOString() },
      ];
      setComments(simulatedComments);
      
      const simulatedCommands = [
        { direction: 'RIGHT', user: 'AlphaTrader' },
        { direction: 'UP', user: 'CryptoSnake' },
        { direction: 'DOWN', user: 'GameMaster' },
        { direction: 'LEFT', user: 'SnakeHolder' },
        { direction: 'RIGHT', user: 'MoonBoi' },
      ];
      setLastCommands(simulatedCommands);
    }
  }, [gameId]);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - commentTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  const getUserColor = (username: string) => {
    const colors = ['primary', 'secondary', 'accent'];
    const hash = username.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <>
      {/* Live Comments Feed */}
      <div className="data-panel rounded-lg border border-border h-96 flex flex-col">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-cyber font-bold text-secondary">Live Comments</h3>
          <p className="text-sm text-muted-foreground">Control the snake with your commands!</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="comments-feed">
          {comments.map((comment) => {
            const userColor = getUserColor(comment.username);
            return (
              <div key={comment.id} className="comment-item p-3 rounded-lg animate-slide-up">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 bg-${userColor} rounded-full flex items-center justify-center`}>
                    <span className="text-xs font-bold text-primary-foreground">
                      {comment.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono text-sm text-${userColor}`}>
                        {comment.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(comment.createdAt)}
                      </span>
                      {comment.isValid && (
                        <span className="text-xs bg-primary/20 text-primary px-1 rounded">
                          VALID
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1">{comment.originalText}</p>
                  </div>
                </div>
              </div>
            );
          })}
          
          {comments.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p>No comments yet...</p>
              <p className="text-xs mt-2">Comments will appear here in real-time</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground text-center">
            💡 Comment "up", "down", "left", or "right" to control the snake!
          </div>
        </div>
      </div>

      {/* Recent Commands */}
      <div className="data-panel p-4 rounded-lg border border-border">
        <h3 className="text-lg font-cyber font-bold mb-3 text-accent">Last Commands</h3>
        <div className="space-y-2" data-testid="last-commands">
          {lastCommands.map((command, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className={`font-mono text-${getUserColor(command.user)}`}>
                {command.direction}
              </span>
              <span className="text-muted-foreground">{command.user}</span>
            </div>
          ))}
          
          {lastCommands.length === 0 && (
            <div className="text-center text-muted-foreground text-sm">
              No commands yet
            </div>
          )}
        </div>
      </div>
    </>
  );
}
