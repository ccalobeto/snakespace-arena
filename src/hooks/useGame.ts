import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Direction, GameMode } from '@/types/game';
import {
  createInitialState,
  moveSnake,
  setDirection,
  startGame,
  togglePause,
  setGameMode,
  calculateFinalScore,
} from '@/lib/gameLogic';

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const keyDirectionMap: Record<string, Direction> = {
      ArrowUp: 'UP',
      ArrowDown: 'DOWN',
      ArrowLeft: 'LEFT',
      ArrowRight: 'RIGHT',
      w: 'UP',
      W: 'UP',
      s: 'DOWN',
      S: 'DOWN',
      a: 'LEFT',
      A: 'LEFT',
      d: 'RIGHT',
      D: 'RIGHT',
    };

    if (e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      setGameState(prev => togglePause(prev));
      return;
    }

    if (e.key === 'Enter' && gameState.status !== 'playing') {
      e.preventDefault();
      setGameState(prev => startGame(prev));
      return;
    }

    const direction = keyDirectionMap[e.key];
    if (direction) {
      e.preventDefault();
      setGameState(prev => setDirection(prev, direction));
    }
  }, [gameState.status]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameState.status === 'playing') {
      intervalRef.current = setInterval(() => {
        setGameState(prev => moveSnake(prev));
      }, gameState.speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState.status, gameState.speed]);

  const start = useCallback(() => {
    setGameState(prev => startGame(prev));
  }, []);

  const pause = useCallback(() => {
    setGameState(prev => togglePause(prev));
  }, []);

  const changeDirection = useCallback((direction: Direction) => {
    setGameState(prev => setDirection(prev, direction));
  }, []);

  const changeMode = useCallback((mode: GameMode) => {
    setGameState(prev => setGameMode(prev, mode));
  }, []);

  const reset = useCallback(() => {
    setGameState(createInitialState(gameState.mode));
  }, [gameState.mode]);

  const getFinalScore = useCallback(() => {
    return calculateFinalScore(gameState.score, gameState.mode);
  }, [gameState.score, gameState.mode]);

  return {
    gameState,
    start,
    pause,
    changeDirection,
    changeMode,
    reset,
    getFinalScore,
  };
}
