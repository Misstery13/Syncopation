// Tipos globales para el juego Syncopation

export interface GameConfig {
  width: number;
  height: number;
  backgroundColor: string;
  physics: {
    default: string;
    arcade: {
      gravity: { x: number; y: number };
      debug: boolean;
    };
  };
}

export interface PlayerConfig {
  x: number;
  y: number;
  speed: number;
  health: number;
  maxHealth: number;
}

export interface GameState {
  isRunning: boolean;
  currentScene: string;
  score: number;
  level: number;
  playerPosition?: { x: number; y: number };
  inventory?: any[];
  settings?: any;
}

export interface InputState {
  keys: { [key: string]: boolean };
  mouse: {
    x: number;
    y: number;
    pressed: boolean;
  };
}

export interface SaveData {
  playerName: string;
  score: number;
  level: number;
  timestamp: number;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface User {
  id?: string;
  username: string;
  email?: string;
  createdAt?: string;
  password?: string;
  isGuest?: boolean;
  progress?: GameProgress;
}

export interface GameProgress {
  level: number;
  score: number;
  playerPosition?: { x: number; y: number };
  inventory?: any[];
  settings?: any;
  lastSaved: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  type?: 'permanent' | 'temporary';
  data?: any;
}

export interface SaveResponse {
  success: boolean;
  type?: 'permanent' | 'temporary';
  message?: string;
  data?: any;
}

// Tipos para eventos del juego
export interface GameEvent {
  type: string;
  data?: any;
  timestamp: number;
}

// Tipos para el sistema de audio
export interface AudioConfig {
  volume: number;
  muted: boolean;
  musicVolume: number;
  sfxVolume: number;
}

// Tipos para el sistema de colisiones
export interface CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CollisionResult {
  collided: boolean;
  direction?: 'top' | 'bottom' | 'left' | 'right';
  overlap?: number;
}
