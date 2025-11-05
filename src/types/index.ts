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

// export interface PlayerConfig {
//   x: number;
//   y: number;
//   speed: number;
//   health: number;
//   maxHealth: number;
// }

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

/**
 * @description Es el momento exacto en que una nota debe ser golpeada
 * 
 * @property {number} id - Identificador único de la nota
 * @property {number} timeMs - El momento exacto en que la nota debe ser presionada, en milisegundos
 * @property {'delay' | 'hit' | 'miss'} state - El estado actual de la nota, puede ser 'delay' (pendiente), 'hit' (golpeada) o 'miss' (fallada)
 */

export interface Tempo {
  readonly id: number;
  // El momento exacto en que la nota debe ser presionada
  readonly timeMs: number;
  // Ya no existe 'carril: number'
  readonly judgementWindow: JudgementWindow['name']; // Ventana de juicio asociada a esta nota
}

export interface GameState {
  readonly score: number;
  readonly precision: number;
  readonly currentTimeMs: number; // El tiempo actual de la canción
  readonly currentScene: string;
  readonly isRunning: boolean;
  readonly isPaused: boolean;
  readonly isGameStoped: boolean;
  readonly level: number;
  readonly song: SongDefinition;

}


/**
 * Define la canción, su dificultad y las notas que la componen
 * 
 * @property {string} idCancion - Identificador único de la canción
 * @property {'facil' | 'normal' | 'dificil'} dificultad - Dificultad de la canción
 * @property {readonly Nota[]} notas - Array de notas que componen la canción
 */
export interface SongDefinition {

  readonly idSong: string;

  readonly difficulty: 'easy' | 'normal' | 'hard';

  readonly tempos: readonly Tempo[];

}

export interface JudgementWindow {
  name: 'delay' | 'hit' | 'miss';
  ms: number; // Tiempo en milisegundos para este juicio
  score: number; // Puntos otorgados por este juicio
  keepCombo: boolean; // Si este juicio mantiene el combo
}

export interface HitResult {
  noteId: number;
  deltaMs: number;
  window: JudgementWindow['name'];
  score: number;
}

/**
 * @description Estado del sistema rítmico del juego.
 */
export interface RhythmState {
  combo: number;
  maxCombo: number;
  score: number;
  hits: Record<JudgementWindow['name'], number>;
}

/**
 * @description Estadísticas del jugador almacenadas y gestionadas en el juego.
 * 
 * @property {number} totalScore - Puntuación total acumulada por el jugador.
 * @property {number} totalHits - Número total de notas acertadas por el jugador.
 * @property {number} totalMisses - Número total de notas falladas por el jugador.
 * @property {number} perfectLevels - Número de niveles completados con puntuación perfecta.
 * @property {number} totalPlayTimeMs - Tiempo total de juego en milisegundos.
 * @property {number} gamesPlayed - Número total de partidas jugadas por el jugador.
 */
export interface PlayerStats {
  totalScore: number;
  totalHits: number;
  totalMisses: number;
  perfectLevels: number;
  totalPlayTimeMs: number;
  gamesPlayed: number;
}

