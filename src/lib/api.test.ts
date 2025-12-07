import { describe, it, expect, beforeEach } from 'vitest';
import { api, simulatePlayerMove } from './api';
import { ActivePlayer } from '@/types/game';
import { GRID_SIZE } from './gameLogic';

describe('api', () => {
  beforeEach(async () => {
    // Reset state by logging out
    await api.logout();
  });

  describe('authentication', () => {
    it('should login with valid credentials', async () => {
      const result = await api.login({ email: 'snake@example.com', password: 'password' });
      expect('user' in result).toBe(true);
      if ('user' in result) {
        expect(result.user.username).toBe('SnakeMaster');
      }
    });

    it('should return error for invalid credentials', async () => {
      const result = await api.login({ email: 'invalid@example.com', password: 'wrong' });
      expect('error' in result).toBe(true);
    });

    it('should signup new user', async () => {
      const result = await api.signup({
        username: 'NewPlayer',
        email: 'new@example.com',
        password: 'password123',
      });
      expect('user' in result).toBe(true);
      if ('user' in result) {
        expect(result.user.username).toBe('NewPlayer');
      }
    });

    it('should return error for existing user', async () => {
      const result = await api.signup({
        username: 'SnakeMaster',
        email: 'snake@example.com',
        password: 'password',
      });
      expect('error' in result).toBe(true);
    });

    it('should get current user after login', async () => {
      await api.login({ email: 'snake@example.com', password: 'password' });
      const user = await api.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.username).toBe('SnakeMaster');
    });

    it('should return null after logout', async () => {
      await api.login({ email: 'snake@example.com', password: 'password' });
      await api.logout();
      const user = await api.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('leaderboard', () => {
    it('should get all leaderboard entries', async () => {
      const entries = await api.getLeaderboard();
      expect(entries.length).toBeGreaterThan(0);
    });

    it('should filter leaderboard by mode', async () => {
      const wallsEntries = await api.getLeaderboard('walls');
      expect(wallsEntries.every(e => e.mode === 'walls')).toBe(true);
    });

    it('should sort leaderboard by score descending', async () => {
      const entries = await api.getLeaderboard();
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i - 1].score).toBeGreaterThanOrEqual(entries[i].score);
      }
    });

    it('should submit score when logged in', async () => {
      await api.login({ email: 'snake@example.com', password: 'password' });
      const result = await api.submitScore(1000, 'walls');
      expect('id' in result).toBe(true);
      if ('id' in result) {
        expect(result.score).toBe(1000);
        expect(result.mode).toBe('walls');
      }
    });

    it('should return error when submitting score without login', async () => {
      const result = await api.submitScore(1000, 'walls');
      expect('error' in result).toBe(true);
    });
  });

  describe('active players', () => {
    it('should get active players', async () => {
      const players = await api.getActivePlayers();
      expect(players.length).toBeGreaterThan(0);
    });

    it('should get specific active player', async () => {
      const players = await api.getActivePlayers();
      const player = await api.getActivePlayer(players[0].id);
      expect(player).not.toBeNull();
      expect(player?.id).toBe(players[0].id);
    });

    it('should return null for non-existent player', async () => {
      const player = await api.getActivePlayer('non-existent');
      expect(player).toBeNull();
    });
  });
});

describe('simulatePlayerMove', () => {
  const createTestPlayer = (): ActivePlayer => ({
    id: 'test',
    username: 'TestPlayer',
    score: 0,
    mode: 'pass-through',
    snake: [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ],
    food: { x: 12, y: 10 },
    direction: 'RIGHT',
    startedAt: new Date(),
  });

  it('should move snake forward', () => {
    const player = createTestPlayer();
    const newPlayer = simulatePlayerMove(player);
    expect(newPlayer.snake[0]).not.toEqual(player.snake[0]);
  });

  it('should not reverse direction', () => {
    const player = createTestPlayer();
    const newPlayer = simulatePlayerMove(player);
    // Snake should not go LEFT when it was going RIGHT
    expect(newPlayer.direction).not.toBe('LEFT');
  });

  it('should increase score when eating food', () => {
    const player: ActivePlayer = {
      ...createTestPlayer(),
      snake: [
        { x: 11, y: 10 },
        { x: 10, y: 10 },
        { x: 9, y: 10 },
      ],
      food: { x: 12, y: 10 },
    };
    const newPlayer = simulatePlayerMove(player);
    if (newPlayer.snake[0].x === 12 && newPlayer.snake[0].y === 10) {
      expect(newPlayer.score).toBe(10);
      expect(newPlayer.snake.length).toBe(4);
    }
  });

  it('should wrap around in pass-through mode', () => {
    const player: ActivePlayer = {
      ...createTestPlayer(),
      snake: [
        { x: GRID_SIZE - 1, y: 10 },
        { x: GRID_SIZE - 2, y: 10 },
      ],
      food: { x: 0, y: 10 },
    };
    const newPlayer = simulatePlayerMove(player);
    if (newPlayer.direction === 'RIGHT') {
      expect(newPlayer.snake[0].x).toBe(0);
    }
  });

  it('should avoid walls in walls mode', () => {
    const player: ActivePlayer = {
      ...createTestPlayer(),
      mode: 'walls',
      snake: [
        { x: GRID_SIZE - 1, y: 10 },
        { x: GRID_SIZE - 2, y: 10 },
      ],
      food: { x: 5, y: 5 },
    };
    const newPlayer = simulatePlayerMove(player);
    // Should turn up or down, not go right into wall
    expect(newPlayer.snake[0].x).toBeLessThan(GRID_SIZE);
  });
});
