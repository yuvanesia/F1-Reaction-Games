export enum GameState {
  IDLE = 'IDLE',           // Waiting to start
  SEQUENCE = 'SEQUENCE',   // Lights turning on 1 by 1
  READY = 'READY',         // All 5 lights on, waiting for random delay
  WAITING = 'WAITING',     // Lights out, timer running
  RESULT = 'RESULT',       // User clicked, showing time
  FALSE_START = 'FALSE_START', // User clicked too early
  FINISHED = 'FINISHED'    // Mode completed (Sprint/Endurance)
}

export enum GameMode {
  CLASSIC = 'CLASSIC',
  SPRINT = 'SPRINT',       // 5 Rounds, Average Time
  ENDURANCE = 'ENDURANCE'  // 20 Rounds, Consistency
}

export interface ReactionRecord {
  id: string;
  time: number; // in ms
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
  bestClassic: number | null;
  bestSprint: number | null;
  bestEndurance: number | null;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  mode: GameMode;
  score: number; // ms
  timestamp: number;
}

export interface RaceEngineerResponse {
  comment: string;
  mood: 'happy' | 'angry' | 'neutral' | 'sarcastic';
}