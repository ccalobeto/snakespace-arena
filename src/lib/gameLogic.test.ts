import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  generateFood,
  isValidDirectionChange,
  moveSnake,
  checkSelfCollision,
  setDirection,
  startGame,
  pauseGame,
  resumeGame,
  togglePause,
  setGameMode,
  getScoreMultiplier,
  calculateFinalScore,
  GRID_SIZE,
} from './gameLogic';
import { GameState, Position } from '@/types/game';

describe('createInitialState', () => {
  it('should create initial state with walls mode by default', () => {
    const state = createInitialState();
    expect(state.mode).toBe('walls');
    expect(state.status).toBe('idle');
    expect(state.score).toBe(0);
    expect(state.snake.length).toBe(3);
    expect(state.direction).toBe('RIGHT');
  });

  it('should create initial state with pass-through mode', () => {
    const state = createInitialState('pass-through');
    expect(state.mode).toBe('pass-through');
  });

  it('should place snake in center of grid', () => {
    const state = createInitialState();
    const center = Math.floor(GRID_SIZE / 2);
    expect(state.snake[0]).toEqual({ x: center, y: center });
  });
});

describe('generateFood', () => {
  it('should generate food not on snake', () => {
    const snake: Position[] = [{ x: 5, y: 5 }];
    const food = generateFood(snake, GRID_SIZE);
    expect(food.x !== 5 || food.y !== 5).toBe(true);
  });

  it('should generate food within grid bounds', () => {
    const snake: Position[] = [{ x: 0, y: 0 }];
    const food = generateFood(snake, GRID_SIZE);
    expect(food.x).toBeGreaterThanOrEqual(0);
    expect(food.x).toBeLessThan(GRID_SIZE);
    expect(food.y).toBeGreaterThanOrEqual(0);
    expect(food.y).toBeLessThan(GRID_SIZE);
  });
});

describe('isValidDirectionChange', () => {
  it('should allow perpendicular direction changes', () => {
    expect(isValidDirectionChange('UP', 'LEFT')).toBe(true);
    expect(isValidDirectionChange('UP', 'RIGHT')).toBe(true);
    expect(isValidDirectionChange('LEFT', 'UP')).toBe(true);
    expect(isValidDirectionChange('LEFT', 'DOWN')).toBe(true);
  });

  it('should not allow opposite direction changes', () => {
    expect(isValidDirectionChange('UP', 'DOWN')).toBe(false);
    expect(isValidDirectionChange('DOWN', 'UP')).toBe(false);
    expect(isValidDirectionChange('LEFT', 'RIGHT')).toBe(false);
    expect(isValidDirectionChange('RIGHT', 'LEFT')).toBe(false);
  });

  it('should allow same direction', () => {
    expect(isValidDirectionChange('UP', 'UP')).toBe(true);
    expect(isValidDirectionChange('DOWN', 'DOWN')).toBe(true);
  });
});

describe('moveSnake', () => {
  it('should not move if game is not playing', () => {
    const state = createInitialState();
    const newState = moveSnake(state);
    expect(newState).toEqual(state);
  });

  it('should move snake in direction', () => {
    const state: GameState = {
      ...createInitialState(),
      status: 'playing',
    };
    const head = state.snake[0];
    const newState = moveSnake(state);
    expect(newState.snake[0]).toEqual({ x: head.x + 1, y: head.y });
  });

  it('should end game on wall collision in walls mode', () => {
    const state: GameState = {
      ...createInitialState('walls'),
      status: 'playing',
      snake: [{ x: GRID_SIZE - 1, y: 5 }, { x: GRID_SIZE - 2, y: 5 }],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
    };
    const newState = moveSnake(state);
    expect(newState.status).toBe('game-over');
  });

  it('should wrap around in pass-through mode', () => {
    const state: GameState = {
      ...createInitialState('pass-through'),
      status: 'playing',
      snake: [{ x: GRID_SIZE - 1, y: 5 }, { x: GRID_SIZE - 2, y: 5 }],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
    };
    const newState = moveSnake(state);
    expect(newState.status).toBe('playing');
    expect(newState.snake[0].x).toBe(0);
  });

  it('should grow snake when eating food', () => {
    const state: GameState = {
      ...createInitialState(),
      status: 'playing',
      snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }],
      food: { x: 6, y: 5 },
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
    };
    const newState = moveSnake(state);
    expect(newState.snake.length).toBe(3);
    expect(newState.score).toBe(10);
  });

  it('should end game on self collision', () => {
    const state: GameState = {
      ...createInitialState(),
      status: 'playing',
      snake: [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 5, y: 6 },
        { x: 4, y: 6 },
        { x: 4, y: 5 },
      ],
      direction: 'LEFT',
      nextDirection: 'LEFT',
    };
    const newState = moveSnake(state);
    expect(newState.status).toBe('game-over');
  });
});

describe('checkSelfCollision', () => {
  it('should return false for no collision', () => {
    const head: Position = { x: 10, y: 10 };
    const snake: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
    expect(checkSelfCollision(head, snake)).toBe(false);
  });

  it('should return true for collision with body', () => {
    const head: Position = { x: 5, y: 5 };
    const snake: Position[] = [{ x: 6, y: 5 }, { x: 5, y: 5 }, { x: 4, y: 5 }];
    expect(checkSelfCollision(head, snake)).toBe(true);
  });

  it('should ignore head position (index 0)', () => {
    const head: Position = { x: 5, y: 5 };
    const snake: Position[] = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
    expect(checkSelfCollision(head, snake)).toBe(false);
  });
});

describe('setDirection', () => {
  it('should set valid direction when playing', () => {
    const state: GameState = {
      ...createInitialState(),
      status: 'playing',
    };
    const newState = setDirection(state, 'UP');
    expect(newState.nextDirection).toBe('UP');
  });

  it('should not set opposite direction', () => {
    const state: GameState = {
      ...createInitialState(),
      status: 'playing',
      direction: 'RIGHT',
    };
    const newState = setDirection(state, 'LEFT');
    expect(newState.nextDirection).toBe('RIGHT');
  });

  it('should not change direction when not playing', () => {
    const state = createInitialState();
    const newState = setDirection(state, 'UP');
    expect(newState.nextDirection).toBe('RIGHT');
  });
});

describe('startGame', () => {
  it('should start game from idle', () => {
    const state = createInitialState();
    const newState = startGame(state);
    expect(newState.status).toBe('playing');
  });

  it('should restart game from game-over', () => {
    const state: GameState = {
      ...createInitialState(),
      status: 'game-over',
      score: 100,
      highScore: 100,
    };
    const newState = startGame(state);
    expect(newState.status).toBe('playing');
    expect(newState.score).toBe(0);
    expect(newState.highScore).toBe(100);
  });

  it('should not change if already playing', () => {
    const state: GameState = {
      ...createInitialState(),
      status: 'playing',
    };
    const newState = startGame(state);
    expect(newState).toEqual(state);
  });
});

describe('pauseGame', () => {
  it('should pause when playing', () => {
    const state: GameState = {
      ...createInitialState(),
      status: 'playing',
    };
    const newState = pauseGame(state);
    expect(newState.status).toBe('paused');
  });

  it('should not pause when not playing', () => {
    const state = createInitialState();
    const newState = pauseGame(state);
    expect(newState.status).toBe('idle');
  });
});

describe('resumeGame', () => {
  it('should resume when paused', () => {
    const state: GameState = {
      ...createInitialState(),
      status: 'paused',
    };
    const newState = resumeGame(state);
    expect(newState.status).toBe('playing');
  });

  it('should not resume when not paused', () => {
    const state = createInitialState();
    const newState = resumeGame(state);
    expect(newState.status).toBe('idle');
  });
});

describe('togglePause', () => {
  it('should pause when playing', () => {
    const state: GameState = {
      ...createInitialState(),
      status: 'playing',
    };
    const newState = togglePause(state);
    expect(newState.status).toBe('paused');
  });

  it('should resume when paused', () => {
    const state: GameState = {
      ...createInitialState(),
      status: 'paused',
    };
    const newState = togglePause(state);
    expect(newState.status).toBe('playing');
  });

  it('should do nothing when idle', () => {
    const state = createInitialState();
    const newState = togglePause(state);
    expect(newState.status).toBe('idle');
  });
});

describe('setGameMode', () => {
  it('should set game mode when not playing', () => {
    const state = createInitialState('walls');
    const newState = setGameMode(state, 'pass-through');
    expect(newState.mode).toBe('pass-through');
  });

  it('should not change mode when playing', () => {
    const state: GameState = {
      ...createInitialState('walls'),
      status: 'playing',
    };
    const newState = setGameMode(state, 'pass-through');
    expect(newState.mode).toBe('walls');
  });
});

describe('getScoreMultiplier', () => {
  it('should return 1.5 for walls mode', () => {
    expect(getScoreMultiplier('walls')).toBe(1.5);
  });

  it('should return 1 for pass-through mode', () => {
    expect(getScoreMultiplier('pass-through')).toBe(1);
  });
});

describe('calculateFinalScore', () => {
  it('should multiply score for walls mode', () => {
    expect(calculateFinalScore(100, 'walls')).toBe(150);
  });

  it('should not multiply score for pass-through mode', () => {
    expect(calculateFinalScore(100, 'pass-through')).toBe(100);
  });
});
