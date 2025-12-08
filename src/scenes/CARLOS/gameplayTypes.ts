import { GameState, RhythmState, JudgementWindow, TimeMs, Score } from '../../types/index';

// Estado Completo que combina ambos
export interface FullGameState {
    readonly game: GameState;
    readonly rhythm: RhythmState;
    readonly gameStartTime: TimeMs; // Marca de tiempo (performance.now()) del inicio real del nivel
}

// Ventanas de Juicio Reales (Datos Inmutables del Sistema)
export const JUDGEMENT_WINDOWS: Readonly<Record<JudgementWindow['name'], Omit<JudgementWindow, 'name'>>> = {
    // La desviación (delta) es el valor absoluto de la diferencia de tiempo |TimePress - TimeTarget|
    'hit': { ms: 50 as TimeMs, score: 100 as Score, keepCombo: true },      // Delta <= 50ms (Perfecto)
    'delay': { ms: 120 as TimeMs, score: 50 as Score, keepCombo: true },    // 50ms < Delta <= 120ms (Ok/Great)
    'miss': { ms: 250 as TimeMs, score: 0 as Score, keepCombo: false }       // 120ms < Delta <= 250ms (Fallo)
    // Más de 250ms se considera un "Input Descartado"
} as const;

