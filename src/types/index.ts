// Tipos globales para el juego Syncopation

// Aliases para evitar "primitive obsession"
export type TimeMs = number;
export type Score = number;
export type LevelId = number;
export type UserId = string;
export type Url = string;

export interface GameConfig {
  readonly width: number;
  readonly height: number;
  readonly backgroundColor: string;
  readonly physics: {
    readonly default: string;
    readonly arcade: {
      readonly gravity: { readonly x: number; readonly y: number };
      readonly debug: boolean;
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
  readonly keys: Readonly<Record<string, boolean>>;
  readonly mouse: {
    readonly x: number;
    readonly y: number;
    readonly pressed: boolean;
  };
}

export interface SaveData {
  readonly playerName: string;
  readonly score: Score;
  readonly level: LevelId;
  readonly timestamp: TimeMs;
}

export interface LoginData {
  readonly username: string;
  readonly password: string;
}

export interface User {
  readonly id?: UserId;
  readonly username: string;
  readonly email?: string;
  readonly createdAt?: string;
  readonly password?: string;
  readonly isGuest?: boolean;
  readonly progress?: GameProgress;
}

export interface GameProgress {
  readonly level: LevelId;
  readonly score: Score;
  readonly playerPosition?: { readonly x: number; readonly y: number };
  readonly inventory?: ReadonlyArray<unknown>;
  readonly settings?: Readonly<Record<string, unknown>>;
  readonly lastSaved: string;
}

// Respuesta de autenticación como unión discriminada
export type AuthResponse =
  | {
    readonly success: true;
    readonly type: 'permanent' | 'temporary';
    readonly user: User;
    readonly message?: string;
    readonly data?: unknown;
  }
  | {
    readonly success: false;
    readonly message: string;
    readonly type?: 'permanent' | 'temporary';
    readonly data?: unknown;
  };

export type SaveResponse =
  | {
    readonly success: true;
    readonly type?: 'permanent' | 'temporary';
    readonly message?: string;
    readonly data?: unknown;
  }
  | {
    readonly success: false;
    readonly type?: 'permanent' | 'temporary';
    readonly message: string;
    readonly data?: unknown;
  };

// Tipos para eventos del juego
// Eventos del juego como ADT
export type GameEvent =
  | { readonly type: 'note-spawned'; readonly timestamp: TimeMs; readonly noteId: number }
  | { readonly type: 'note-hit'; readonly timestamp: TimeMs; readonly noteId: number; readonly window: JudgementWindow['name']; readonly deltaMs: TimeMs }
  | { readonly type: 'note-miss'; readonly timestamp: TimeMs; readonly noteId: number; readonly deltaMs: TimeMs }
  | { readonly type: 'scene-change'; readonly timestamp: TimeMs; readonly scene: string }
  | { readonly type: 'audio-start'; readonly timestamp: TimeMs }
  | { readonly type: 'audio-stop'; readonly timestamp: TimeMs };

// Tipos para el sistema de audio
export interface AudioConfig {
  readonly volume: number;
  readonly muted: boolean;
  readonly musicVolume: number;
  readonly sfxVolume: number;
}

// Tipos para el sistema de colisiones
export interface CollisionBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type CollisionResult =
  | { readonly collided: false }
  | { readonly collided: true; readonly direction: 'top' | 'bottom' | 'left' | 'right'; readonly overlap: number };

/**
 * @description Es el momento exacto en que una nota debe ser golpeada
 * 
 * @property {number} id - Identificador único de la nota
 * @property {number} timeMs - El momento exacto en que la nota debe ser presionada, en milisegundos
 * @property {'delay' | 'hit' | 'miss'} state - El estado actual de la nota, puede ser 'delay' (pendiente), 'hit' (golpeada) o 'miss' (fallada)
 */

export interface Tempo {
  readonly id: number;
  readonly timeMs: TimeMs;
  readonly judgementWindow: JudgementWindow['name'];
}

/**
 * @description Estado global del juego.
 */
export interface GameState {
  readonly score: Score;
  readonly precision: number;
  readonly currentTimeMs: TimeMs; // El tiempo actual de la canción
  readonly currentScene: string;
  readonly isRunning: boolean;
  readonly isPaused: boolean;
  readonly isGameStoped: boolean;
  readonly level: LevelId;
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
  readonly tempos: ReadonlyArray<Tempo>;
  readonly audioUrl?: Url;
}

export interface JudgementWindow {
  readonly name: 'delay' | 'hit' | 'miss';
  readonly ms: TimeMs; // Tiempo en milisegundos para este juicio
  readonly score: Score; // Puntos otorgados por este juicio
  readonly keepCombo: boolean; // Si este juicio mantiene el combo
}

export interface HitResult {
  readonly noteId: number;
  readonly deltaMs: TimeMs;
  readonly window: JudgementWindow['name'];
  readonly score: Score;
}

/**
 * @description Estado del sistema rítmico del juego.
 */
export interface RhythmState {
  readonly combo: number;
  readonly maxCombo: number;
  readonly score: Score;
  readonly hits: Readonly<Record<JudgementWindow['name'], number>>;
}