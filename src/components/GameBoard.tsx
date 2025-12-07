import { memo } from 'react';
import { GameState } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  gameState: GameState;
  className?: string;
}

export const GameBoard = memo(function GameBoard({ gameState, className }: GameBoardProps) {
  const { snake, food, gridSize } = gameState;
  const cellSize = 100 / gridSize;

  return (
    <div
      className={cn(
        "relative aspect-square w-full max-w-[500px] bg-background/50 rounded-lg overflow-hidden game-grid neon-border",
        className
      )}
    >
      {/* Food */}
      <div
        className="absolute food-cell rounded-full"
        style={{
          width: `${cellSize}%`,
          height: `${cellSize}%`,
          left: `${food.x * cellSize}%`,
          top: `${food.y * cellSize}%`,
        }}
      />

      {/* Snake */}
      {snake.map((segment, index) => (
        <div
          key={index}
          className={cn(
            "absolute rounded-sm transition-all duration-75",
            index === 0 ? "snake-cell z-10" : "snake-cell opacity-90"
          )}
          style={{
            width: `${cellSize}%`,
            height: `${cellSize}%`,
            left: `${segment.x * cellSize}%`,
            top: `${segment.y * cellSize}%`,
            opacity: 1 - (index * 0.02),
          }}
        >
          {index === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 bg-primary-foreground rounded-full" />
            </div>
          )}
        </div>
      ))}

      {/* Overlay for paused/game over states */}
      {(gameState.status === 'paused' || gameState.status === 'game-over' || gameState.status === 'idle') && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center scanlines">
          <div className="text-center animate-fade-in">
            {gameState.status === 'idle' && (
              <>
                <h2 className="font-pixel text-xl text-primary neon-text mb-4">SNAKE</h2>
                <p className="text-muted-foreground text-sm">Press ENTER or START to play</p>
              </>
            )}
            {gameState.status === 'paused' && (
              <>
                <h2 className="font-pixel text-xl text-secondary neon-text-secondary mb-4">PAUSED</h2>
                <p className="text-muted-foreground text-sm">Press SPACE to resume</p>
              </>
            )}
            {gameState.status === 'game-over' && (
              <>
                <h2 className="font-pixel text-xl text-accent neon-text-accent mb-4">GAME OVER</h2>
                <p className="text-foreground text-lg mb-2">Score: {gameState.score}</p>
                <p className="text-muted-foreground text-sm">Press ENTER to restart</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
