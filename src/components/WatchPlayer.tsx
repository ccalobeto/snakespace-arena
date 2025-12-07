import { useState, useEffect } from 'react';
import { ActivePlayer } from '@/types/game';
import api from '@/lib/api';
import { GameBoard } from './GameBoard';
import { ArrowLeft, Clock, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface WatchPlayerProps {
  playerId: string;
  onBack: () => void;
}

export function WatchPlayer({ playerId, onBack }: WatchPlayerProps) {
  const [player, setPlayer] = useState<ActivePlayer | null>(null);

  useEffect(() => {
    // Initial fetch
    api.getActivePlayer(playerId).then(setPlayer);

    // Subscribe to updates
    const unsubscribe = api.subscribeToPlayer(playerId, (updatedPlayer) => {
      setPlayer(updatedPlayer);
    });

    return () => unsubscribe();
  }, [playerId]);

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-muted-foreground">Loading player...</p>
      </div>
    );
  }

  // Convert ActivePlayer to GameState for GameBoard
  const gameState = {
    snake: player.snake,
    food: player.food,
    direction: player.direction,
    nextDirection: player.direction,
    score: player.score,
    highScore: 0,
    status: 'playing' as const,
    mode: player.mode,
    gridSize: 20,
    speed: 150,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-pixel text-xl text-foreground">{player.username}</h2>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-secondary/20 text-secondary text-xs rounded">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Gamepad2 className="w-4 h-4" />
              {player.mode}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Started {formatDistanceToNow(player.startedAt, { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase">Score</p>
          <p className="font-pixel text-2xl text-primary neon-text">{player.score}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <GameBoard gameState={gameState} />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Watching {player.username} play in real-time
      </p>
    </div>
  );
}
