import { useState, useEffect } from 'react';
import { LeaderboardEntry, GameMode } from '@/types/game';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const data = await api.getLeaderboard(filter === 'all' ? undefined : filter);
      setEntries(data);
      setIsLoading(false);
    };
    fetchLeaderboard();
  }, [filter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-pixel text-2xl text-primary neon-text">LEADERBOARD</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'neon' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'walls' ? 'neon' : 'outline'}
            size="sm"
            onClick={() => setFilter('walls')}
          >
            Walls
          </Button>
          <Button
            variant={filter === 'pass-through' ? 'neonSecondary' : 'outline'}
            size="sm"
            onClick={() => setFilter('pass-through')}
          >
            Pass-through
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg neon-border overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
          <span>Rank</span>
          <span>Player</span>
          <span>Mode</span>
          <span>Score</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No scores yet. Be the first!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  "grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 items-center animate-slide-in",
                  index < 3 && "bg-muted/30"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index + 1)}
                </div>
                <div>
                  <p className="font-medium text-foreground">{entry.username}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-1 rounded",
                    entry.mode === 'walls'
                      ? "bg-primary/20 text-primary"
                      : "bg-secondary/20 text-secondary"
                  )}
                >
                  {entry.mode}
                </span>
                <span className="font-pixel text-lg text-primary neon-text">
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
