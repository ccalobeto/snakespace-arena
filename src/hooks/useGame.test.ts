import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGame } from './useGame';

describe('useGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.gameState.status).toBe('idle');
  });

  it('should start game', () => {
    const { result } = renderHook(() => useGame());
    act(() => {
      result.current.start();
    });
    expect(result.current.gameState.status).toBe('playing');
  });

  it('should pause and resume game', () => {
    const { result } = renderHook(() => useGame());
    act(() => {
      result.current.start();
    });
    expect(result.current.gameState.status).toBe('playing');
    
    act(() => {
      result.current.pause();
    });
    expect(result.current.gameState.status).toBe('paused');
    
    act(() => {
      result.current.pause();
    });
    expect(result.current.gameState.status).toBe('playing');
  });

  it('should change direction', () => {
    const { result } = renderHook(() => useGame());
    act(() => {
      result.current.start();
    });
    
    act(() => {
      result.current.changeDirection('UP');
    });
    expect(result.current.gameState.nextDirection).toBe('UP');
  });

  it('should not allow opposite direction', () => {
    const { result } = renderHook(() => useGame());
    act(() => {
      result.current.start();
    });
    
    // Initial direction is RIGHT
    act(() => {
      result.current.changeDirection('LEFT');
    });
    expect(result.current.gameState.nextDirection).toBe('RIGHT');
  });

  it('should change game mode when not playing', () => {
    const { result } = renderHook(() => useGame());
    expect(result.current.gameState.mode).toBe('walls');
    
    act(() => {
      result.current.changeMode('pass-through');
    });
    expect(result.current.gameState.mode).toBe('pass-through');
  });

  it('should not change mode when playing', () => {
    const { result } = renderHook(() => useGame());
    act(() => {
      result.current.start();
    });
    
    act(() => {
      result.current.changeMode('pass-through');
    });
    expect(result.current.gameState.mode).toBe('walls');
  });

  it('should reset game', () => {
    const { result } = renderHook(() => useGame());
    act(() => {
      result.current.start();
    });
    
    // Move snake a few times
    act(() => {
      vi.advanceTimersByTime(500);
    });
    
    act(() => {
      result.current.reset();
    });
    expect(result.current.gameState.status).toBe('idle');
    expect(result.current.gameState.score).toBe(0);
  });

  it('should calculate final score with multiplier', () => {
    const { result } = renderHook(() => useGame());
    
    // Walls mode has 1.5x multiplier
    expect(result.current.gameState.mode).toBe('walls');
    
    // Score is 0 initially
    expect(result.current.getFinalScore()).toBe(0);
  });

  it('should move snake when playing', () => {
    const { result } = renderHook(() => useGame());
    const initialHead = { ...result.current.gameState.snake[0] };
    
    act(() => {
      result.current.start();
    });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current.gameState.snake[0]).not.toEqual(initialHead);
  });
});
