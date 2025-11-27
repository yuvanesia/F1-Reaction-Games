import { LeaderboardEntry, User, GameMode } from "../types";

// Mock Data Generator
const MOCK_USERS = [
  { username: "MaxV_1", score: 198, mode: GameMode.CLASSIC },
  { username: "SmoothOperator", score: 205, mode: GameMode.CLASSIC },
  { username: "Lando_4", score: 212, mode: GameMode.CLASSIC },
  { username: "HoneyBadger", score: 225, mode: GameMode.CLASSIC },
  { username: "Kimi_Ice", score: 190, mode: GameMode.CLASSIC },
  { username: "Fernando_Alo", score: 201, mode: GameMode.SPRINT },
  { username: "Oscar_P", score: 210, mode: GameMode.SPRINT },
  { username: "George_R", score: 215, mode: GameMode.ENDURANCE },
];

const STORAGE_KEYS = {
  USER: 'f1_reflex_user',
  LEADERBOARD: 'f1_reflex_leaderboard'
};

// Initialize Fake Leaderboard if empty
const initLeaderboard = () => {
  const existing = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
  if (!existing) {
    const initialData: LeaderboardEntry[] = MOCK_USERS.map((u, i) => ({
      id: `mock-${i}`,
      username: u.username,
      mode: u.mode,
      score: u.score,
      timestamp: Date.now() - Math.random() * 10000000
    }));
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(initialData));
  }
};

export const authService = {
  login: async (username: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const id = btoa(username).substring(0, 8); // Fake ID
    const user: User = {
      id,
      username,
      bestClassic: null,
      bestSprint: null,
      bestEndurance: null
    };
    
    // Check if user exists in local storage to restore stats (Optional enhancement)
    // For now, we just return the session user
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  },
  
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
  
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  }
};

export const leaderboardService = {
  getScores: async (mode: GameMode): Promise<LeaderboardEntry[]> => {
    initLeaderboard();
    const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    // Filter by mode and sort (lower is better for reaction time)
    return data
      .filter((e: LeaderboardEntry) => e.mode === mode)
      .sort((a: LeaderboardEntry, b: LeaderboardEntry) => a.score - b.score)
      .slice(0, 100);
  },

  submitScore: async (user: User, mode: GameMode, score: number) => {
    initLeaderboard();
    const data: LeaderboardEntry[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADERBOARD) || '[]');
    
    const newEntry: LeaderboardEntry = {
      id: crypto.randomUUID(),
      username: user.username,
      mode,
      score,
      timestamp: Date.now()
    };
    
    data.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(data));
  }
};