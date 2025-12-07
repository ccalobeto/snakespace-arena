import { Button } from '@/components/ui/button';
import { GameState, Direction, GameMode } from '@/types/game';
import { Play, Pause, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GameControlsProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onChangeDirection: (direction: Direction) => void;
  onChangeMode: (mode: GameMode) => void;
}

export function GameControls({
  gameState,
  onStart,
  onPause,
  onReset,
  onChangeDirection,
  onChangeMode,
}: GameControlsProps) {
  const isPlaying = gameState.status === 'playing';
  const isPaused = gameState.status === 'paused';
  const canChangeMode = gameState.status === 'idle' || gameState.status === 'game-over';

  return (
    <div className="flex flex-col gap-6">
      {/* Score Display */}
      <div className="flex justify-between items-center p-4 bg-card rounded-lg neon-border">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Score</p>
          <p className="font-pixel text-2xl text-primary neon-text">{gameState.score}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">High Score</p>
          <p className="font-pixel text-2xl text-secondary neon-text-secondary">{gameState.highScore}</p>
        </div>
      </div>

      {/* Mode Selection */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Game Mode</p>
        <div className="flex gap-2">
          <Button
            variant={gameState.mode === 'walls' ? 'neon' : 'outline'}
            size="sm"
            onClick={() => onChangeMode('walls')}
            disabled={!canChangeMode}
            className="flex-1"
          >
            Walls
          </Button>
          <Button
            variant={gameState.mode === 'pass-through' ? 'neonSecondary' : 'outline'}
            size="sm"
            onClick={() => onChangeMode('pass-through')}
            disabled={!canChangeMode}
            className="flex-1"
          >
            Pass-through
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {gameState.mode === 'walls' 
            ? '1.5x score multiplier • Walls are deadly' 
            : '1x score • Wrap around edges'}
        </p>
      </div>

      {/* Game Controls */}
      <div className="flex gap-2">
        {!isPlaying && !isPaused && (
          <Button variant="neon" size="lg" onClick={onStart} className="flex-1">
            <Play className="w-5 h-5" />
            Start
          </Button>
        )}
        {isPlaying && (
          <Button variant="neonSecondary" size="lg" onClick={onPause} className="flex-1">
            <Pause className="w-5 h-5" />
            Pause
          </Button>
        )}
        {isPaused && (
          <Button variant="neon" size="lg" onClick={onPause} className="flex-1">
            <Play className="w-5 h-5" />
            Resume
          </Button>
        )}
        <Button variant="outline" size="lg" onClick={onReset}>
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Direction Controls (Mobile) */}
      <div className="md:hidden">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Controls</p>
        <div className="grid grid-cols-3 gap-2 w-fit mx-auto">
          <div />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChangeDirection('UP')}
            disabled={!isPlaying}
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChangeDirection('LEFT')}
            disabled={!isPlaying}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChangeDirection('DOWN')}
            disabled={!isPlaying}
          >
            <ArrowDown className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onChangeDirection('RIGHT')}
            disabled={!isPlaying}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Keyboard hints (Desktop) */}
      <div className="hidden md:block text-xs text-muted-foreground space-y-1">
        <p>↑↓←→ or WASD to move</p>
        <p>SPACE to pause/resume</p>
        <p>ENTER to start/restart</p>
      </div>
    </div>
  );
}
