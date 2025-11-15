import { SongDefinition, GameState, RhythmState, JudgementWindow } from '../../types/index';

// Estado Completo que combina ambos
export interface FullGameState {
    readonly game: GameState;
    readonly rhythm: RhythmState;
    readonly gameStartTime: number; // Marca de tiempo (performance.now()) del inicio real del nivel
}

// Ventanas de Juicio Reales (Datos Inmutables del Sistema)
export const JUDGEMENT_WINDOWS: Record<JudgementWindow['name'], Omit<JudgementWindow, 'name'>> = {
    // La desviación (delta) es el valor absoluto de la diferencia de tiempo |TimePress - TimeTarget|
    'hit': { ms: 50, score: 100, keepCombo: true },      // Delta <= 50ms (Perfecto)
    'delay': { ms: 120, score: 50, keepCombo: true },    // 50ms < Delta <= 120ms (Ok/Great)
    'miss': { ms: 250, score: 0, keepCombo: false }       // 120ms < Delta <= 250ms (Fallo)
    // Más de 250ms se considera un "Input Descartado"
};

export const SONG_TEST_LEVEL: SongDefinition = {
    idSong: "LuchadorTest",
    difficulty: 'easy',
    // Ruta relativa desde la página de prueba `public/rhythmGameplay-test.html`.
    // Coloca tu archivo de audio en `public/assets/audio/` y usa el nombre aquí.
    // Ejemplo: './assets/audio/test-song.mp3'
    audioUrl: './assets/audio/test-song.mp3',
    tempos: [
        { id: 1, timeMs: 9170, judgementWindow: 'hit' },
        { id: 2, timeMs: 1092, judgementWindow: 'hit' },
        { id: 3, timeMs: 1289, judgementWindow: 'hit' },
        { id: 4, timeMs: 1492, judgementWindow: 'hit' },
        { id: 5, timeMs: 1686, judgementWindow: 'hit' },
        { id: 6, timeMs: 1890, judgementWindow: 'hit' },
        { id: 7, timeMs: 2092, judgementWindow: 'hit' },
        { id: 8, timeMs: 2684, judgementWindow: 'hit' },
        { id: 9, timeMs: 2885, judgementWindow: 'hit' },
        { id: 10, timeMs: 3180, judgementWindow: 'hit' },
    ]
};