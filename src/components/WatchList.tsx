import { useState, useEffect } from 'react';
import { ActivePlayer } from '@/types/game';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Eye, Clock, Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface WatchListProps {
  onSelectPlayer: (player: ActivePlayer) => void;
  selectedPlayerId?: string;
}

export function WatchList({ onSelectPlayer, selectedPlayerId }: WatchListProps) {
  const [players, setPlayers] = useState<ActivePlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      const data = await api.getActivePlayers();
      setPlayers(data);
      setIsLoading(false);
    };
    fetchPlayers();

    // Refresh player list periodically
    const interval = setInterval(fetchPlayers, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Eye className="w-5 h-5 text-secondary" />
        <h2 className="font-pixel text-lg text-secondary neon-text-secondary">LIVE PLAYERS</h2>
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-muted-foreground">
          Finding active players...
        </div>
      ) : players.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground bg-card rounded-lg">
          No active players right now
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player)}
              className={cn(
                "w-full p-4 bg-card rounded-lg border transition-all text-left",
                selectedPlayerId === player.id
                  ? "border-secondary neon-border-secondary"
                  : "border-border hover:border-secondary/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{player.username}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Gamepad2 className="w-3 h-3" />
                      {player.mode}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(player.startedAt, { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-pixel text-lg text-primary">{player.score}</p>
                  <div className="flex items-center gap-1 text-xs text-secondary">
                    <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                    LIVE
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
