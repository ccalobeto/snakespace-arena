import {
  User,
  LeaderboardEntry,
  ActivePlayer,
  LoginCredentials,
  SignupCredentials,
  GameMode,
  Position,
} from '@/types/game';
import { DIRECTION_VECTORS, GRID_SIZE } from './gameLogic';

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let mockUsers: User[] = [
  { id: '1', username: 'SnakeMaster', email: 'snake@example.com', createdAt: new Date('2024-01-01') },
  { id: '2', username: 'NeonGamer', email: 'neon@example.com', createdAt: new Date('2024-02-15') },
];

let currentUser: User | null = null;

const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', username: 'SnakeMaster', score: 2500, mode: 'walls', date: new Date('2024-12-01') },
  { id: '2', username: 'NeonGamer', score: 2100, mode: 'walls', date: new Date('2024-12-05') },
  { id: '3', username: 'PixelPro', score: 1850, mode: 'pass-through', date: new Date('2024-12-03') },
  { id: '4', username: 'RetroKing', score: 1720, mode: 'walls', date: new Date('2024-12-02') },
  { id: '5', username: 'ArcadeQueen', score: 1650, mode: 'pass-through', date: new Date('2024-12-04') },
  { id: '6', username: 'CyberSnake', score: 1500, mode: 'walls', date: new Date('2024-12-06') },
  { id: '7', username: 'GlowWorm', score: 1420, mode: 'pass-through', date: new Date('2024-12-01') },
  { id: '8', username: 'NightCrawler', score: 1350, mode: 'walls', date: new Date('2024-12-05') },
  { id: '9', username: 'ElectricEel', score: 1280, mode: 'pass-through', date: new Date('2024-12-03') },
  { id: '10', username: 'GridRunner', score: 1200, mode: 'walls', date: new Date('2024-12-02') },
];

// Simulated active players for watch mode
const generateSimulatedPlayer = (id: string, username: string, mode: GameMode): ActivePlayer => {
  const center = Math.floor(GRID_SIZE / 2);
  return {
    id,
    username,
    score: Math.floor(Math.random() * 500),
    mode,
    snake: [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center },
    ],
    food: { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) },
    direction: 'RIGHT',
    startedAt: new Date(Date.now() - Math.floor(Math.random() * 300000)),
  };
};

let mockActivePlayers: ActivePlayer[] = [
  generateSimulatedPlayer('active-1', 'LivePlayer1', 'walls'),
  generateSimulatedPlayer('active-2', 'StreamSnake', 'pass-through'),
  generateSimulatedPlayer('active-3', 'ProGamer99', 'walls'),
];

// Simulate AI playing for watch mode
export function simulatePlayerMove(player: ActivePlayer): ActivePlayer {
  const head = player.snake[0];
  const directions: Array<'UP' | 'DOWN' | 'LEFT' | 'RIGHT'> = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  
  // Simple AI: prefer moving towards food, avoid walls/self
  let bestDirection = player.direction;
  let minDistance = Infinity;
  
  for (const dir of directions) {
    // Skip opposite direction
    if (
      (player.direction === 'UP' && dir === 'DOWN') ||
      (player.direction === 'DOWN' && dir === 'UP') ||
      (player.direction === 'LEFT' && dir === 'RIGHT') ||
      (player.direction === 'RIGHT' && dir === 'LEFT')
    ) {
      continue;
    }
    
    const vector = DIRECTION_VECTORS[dir];
    let newX = head.x + vector.x;
    let newY = head.y + vector.y;
    
    // Handle wrapping for pass-through mode
    if (player.mode === 'pass-through') {
      newX = (newX + GRID_SIZE) % GRID_SIZE;
      newY = (newY + GRID_SIZE) % GRID_SIZE;
    } else {
      // Check wall collision for walls mode
      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
        continue;
      }
    }
    
    // Check self collision
    const selfCollision = player.snake.some(
      (seg, idx) => idx > 0 && seg.x === newX && seg.y === newY
    );
    if (selfCollision) continue;
    
    // Calculate distance to food
    const distance = Math.abs(newX - player.food.x) + Math.abs(newY - player.food.y);
    if (distance < minDistance) {
      minDistance = distance;
      bestDirection = dir;
    }
  }
  
  // Move the snake
  const vector = DIRECTION_VECTORS[bestDirection];
  let newHead: Position = {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };
  
  if (player.mode === 'pass-through') {
    newHead = {
      x: (newHead.x + GRID_SIZE) % GRID_SIZE,
      y: (newHead.y + GRID_SIZE) % GRID_SIZE,
    };
  }
  
  const ateFood = newHead.x === player.food.x && newHead.y === player.food.y;
  const newSnake = [newHead, ...player.snake];
  if (!ateFood) {
    newSnake.pop();
  }
  
  return {
    ...player,
    snake: newSnake,
    direction: bestDirection,
    score: ateFood ? player.score + 10 : player.score,
    food: ateFood
      ? { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) }
      : player.food,
  };
}

// API Interface
export const api = {
  // Auth
  async login(credentials: LoginCredentials): Promise<{ user: User } | { error: string }> {
    await delay(500);
    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user) {
      return { error: 'Invalid email or password' };
    }
    // In a real app, we'd check password here
    currentUser = user;
    return { user };
  },

  async signup(credentials: SignupCredentials): Promise<{ user: User } | { error: string }> {
    await delay(500);
    const existingUser = mockUsers.find(
      u => u.email === credentials.email || u.username === credentials.username
    );
    if (existingUser) {
      return { error: 'User already exists' };
    }
    const newUser: User = {
      id: String(mockUsers.length + 1),
      username: credentials.username,
      email: credentials.email,
      createdAt: new Date(),
    };
    mockUsers.push(newUser);
    currentUser = newUser;
    return { user: newUser };
  },

  async logout(): Promise<void> {
    await delay(200);
    currentUser = null;
  },

  async getCurrentUser(): Promise<User | null> {
    await delay(100);
    return currentUser;
  },

  // Leaderboard
  async getLeaderboard(mode?: GameMode): Promise<LeaderboardEntry[]> {
    await delay(300);
    let entries = [...mockLeaderboard];
    if (mode) {
      entries = entries.filter(e => e.mode === mode);
    }
    return entries.sort((a, b) => b.score - a.score);
  },

  async submitScore(score: number, mode: GameMode): Promise<LeaderboardEntry | { error: string }> {
    await delay(300);
    if (!currentUser) {
      return { error: 'Must be logged in to submit score' };
    }
    const entry: LeaderboardEntry = {
      id: String(mockLeaderboard.length + 1),
      username: currentUser.username,
      score,
      mode,
      date: new Date(),
    };
    mockLeaderboard.push(entry);
    return entry;
  },

  // Active Players (Watch Mode)
  async getActivePlayers(): Promise<ActivePlayer[]> {
    await delay(200);
    return mockActivePlayers;
  },

  async getActivePlayer(id: string): Promise<ActivePlayer | null> {
    await delay(100);
    return mockActivePlayers.find(p => p.id === id) || null;
  },

  // Subscribe to player updates (simulated)
  subscribeToPlayer(
    playerId: string,
    callback: (player: ActivePlayer) => void
  ): () => void {
    let player = mockActivePlayers.find(p => p.id === playerId);
    if (!player) return () => {};

    const interval = setInterval(() => {
      if (player) {
        player = simulatePlayerMove(player);
        mockActivePlayers = mockActivePlayers.map(p =>
          p.id === playerId ? player! : p
        );
        callback(player);
      }
    }, 200);

    return () => clearInterval(interval);
  },
};

export default api;
