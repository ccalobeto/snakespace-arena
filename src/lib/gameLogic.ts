import { Direction, GameMode, GameState, GameStatus, Position } from '@/types/game';

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150;

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

export const DIRECTION_VECTORS: Record<Direction, Position> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export function createInitialState(mode: GameMode = 'walls'): GameState {
  const center = Math.floor(GRID_SIZE / 2);
  return {
    snake: [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ],
    food: generateFood([{ x: center, y: center }], GRID_SIZE),
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    score: 0,
    highScore: 0,
    status: 'idle',
    mode,
    gridSize: GRID_SIZE,
    speed: INITIAL_SPEED,
  };
}

export function generateFood(snake: Position[], gridSize: number): Position {
  const occupied = new Set(snake.map(pos => `${pos.x},${pos.y}`));
  const available: Position[] = [];

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    return { x: 0, y: 0 };
  }

  return available[Math.floor(Math.random() * available.length)];
}

export function isValidDirectionChange(current: Direction, next: Direction): boolean {
  return OPPOSITE_DIRECTIONS[current] !== next;
}

export function moveSnake(state: GameState): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  const head = state.snake[0];
  const vector = DIRECTION_VECTORS[state.nextDirection];
  let newHead: Position = {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };

  // Handle wall collision based on mode
  if (state.mode === 'pass-through') {
    newHead = {
      x: (newHead.x + state.gridSize) % state.gridSize,
      y: (newHead.y + state.gridSize) % state.gridSize,
    };
  } else {
    // Walls mode - check collision
    if (
      newHead.x < 0 ||
      newHead.x >= state.gridSize ||
      newHead.y < 0 ||
      newHead.y >= state.gridSize
    ) {
      return {
        ...state,
        status: 'game-over',
        highScore: Math.max(state.score, state.highScore),
      };
    }
  }

  // Check self collision
  if (checkSelfCollision(newHead, state.snake)) {
    return {
      ...state,
      status: 'game-over',
      highScore: Math.max(state.score, state.highScore),
    };
  }

  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y;
  const newSnake = [newHead, ...state.snake];

  if (!ateFood) {
    newSnake.pop();
  }

  const newScore = ateFood ? state.score + 10 : state.score;
  const newFood = ateFood ? generateFood(newSnake, state.gridSize) : state.food;
  const newSpeed = ateFood ? Math.max(50, state.speed - 2) : state.speed;

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    direction: state.nextDirection,
    score: newScore,
    speed: newSpeed,
  };
}

export function checkSelfCollision(head: Position, snake: Position[]): boolean {
  return snake.some((segment, index) => {
    if (index === 0) return false;
    return segment.x === head.x && segment.y === head.y;
  });
}

export function setDirection(state: GameState, direction: Direction): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  if (!isValidDirectionChange(state.direction, direction)) {
    return state;
  }

  return {
    ...state,
    nextDirection: direction,
  };
}

export function startGame(state: GameState): GameState {
  if (state.status === 'playing') {
    return state;
  }

  if (state.status === 'game-over' || state.status === 'idle') {
    const newState = createInitialState(state.mode);
    return {
      ...newState,
      highScore: state.highScore,
      status: 'playing',
    };
  }

  return {
    ...state,
    status: 'playing',
  };
}

export function pauseGame(state: GameState): GameState {
  if (state.status !== 'playing') {
    return state;
  }

  return {
    ...state,
    status: 'paused',
  };
}

export function resumeGame(state: GameState): GameState {
  if (state.status !== 'paused') {
    return state;
  }

  return {
    ...state,
    status: 'playing',
  };
}

export function togglePause(state: GameState): GameState {
  if (state.status === 'playing') {
    return pauseGame(state);
  }
  if (state.status === 'paused') {
    return resumeGame(state);
  }
  return state;
}

export function setGameMode(state: GameState, mode: GameMode): GameState {
  if (state.status === 'playing') {
    return state;
  }

  return createInitialState(mode);
}

export function getScoreMultiplier(mode: GameMode): number {
  return mode === 'walls' ? 1.5 : 1;
}

export function calculateFinalScore(score: number, mode: GameMode): number {
  return Math.floor(score * getScoreMultiplier(mode));
}
