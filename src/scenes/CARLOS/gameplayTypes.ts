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
    audioUrl: './assets/audio/baterias.mp3',
    tempos: [

        { id: 1, timeMs: 1490, judgementWindow: 'hit' },  // 1.49s [cite: 1]
        { id: 2, timeMs: 2500, judgementWindow: 'hit' },  // 2.50s [cite: 1]
        { id: 3, timeMs: 3500, judgementWindow: 'hit' },  // 3.50s [cite: 1]
        { id: 4, timeMs: 4500, judgementWindow: 'hit' },  // 4.5s [cite: 1]
        { id: 5, timeMs: 4830, judgementWindow: 'hit' },  // 4.83s [cite: 1]
        { id: 6, timeMs: 5000, judgementWindow: 'hit' },  // 5.00s [cite: 1]
        { id: 7, timeMs: 5500, judgementWindow: 'hit' },  // 5.50s [cite: 1]
        { id: 8, timeMs: 6500, judgementWindow: 'hit' },  // 6.50s [cite: 1]
        { id: 9, timeMs: 7500, judgementWindow: 'hit' },  // 7.50s [cite: 1]
        { id: 10, timeMs: 8500, judgementWindow: 'hit' }, // 8.50s [cite: 1]
        { id: 11, timeMs: 9500, judgementWindow: 'hit' }, // 9.50s [cite: 1]
        { id: 12, timeMs: 10500, judgementWindow: 'hit' }, // 10.50s [cite: 1]
        { id: 13, timeMs: 10830, judgementWindow: 'hit' }, // 10.83s [cite: 1]
        { id: 14, timeMs: 11500, judgementWindow: 'hit' }, // 11.50s [cite: 1]
        { id: 15, timeMs: 12500, judgementWindow: 'hit' }, // 12.50s [cite: 1]
        { id: 16, timeMs: 13500, judgementWindow: 'hit' }, // 13.50s [cite: 1]
        { id: 17, timeMs: 14500, judgementWindow: 'hit' }, // 14.50s [cite: 1]
        { id: 18, timeMs: 15500, judgementWindow: 'hit' }, // 15.50s [cite: 1]
        { id: 19, timeMs: 16500, judgementWindow: 'hit' }, // 16.50s [cite: 1]
        { id: 20, timeMs: 17500, judgementWindow: 'hit' }, // 17.50s [cite: 1]
        { id: 21, timeMs: 18500, judgementWindow: 'hit' }, // 18.50s [cite: 1]
        { id: 22, timeMs: 19500, judgementWindow: 'hit' }, // 19.50s [cite: 1]
        { id: 23, timeMs: 20500, judgementWindow: 'hit' }, // 20.50s [cite: 1]
        { id: 24, timeMs: 21500, judgementWindow: 'hit' }, // 21.50s [cite: 1]
        { id: 25, timeMs: 22500, judgementWindow: 'hit' }, // 22.50s [cite: 1]
        { id: 26, timeMs: 23500, judgementWindow: 'hit' }, // 23.50s [cite: 1]
        { id: 27, timeMs: 24500, judgementWindow: 'hit' }, // 24.50s [cite: 1]
        { id: 28, timeMs: 25500, judgementWindow: 'hit' }, // 25.50s [cite: 1]
        { id: 29, timeMs: 26500, judgementWindow: 'hit' }, // 26.50s [cite: 1]
        { id: 30, timeMs: 27500, judgementWindow: 'hit' }, // 27.50s [cite: 1]
        { id: 31, timeMs: 28120, judgementWindow: 'hit' }, // 28.12s [cite: 2]
        { id: 32, timeMs: 28500, judgementWindow: 'hit' }, // 28.50s [cite: 2]
        { id: 33, timeMs: 30500, judgementWindow: 'hit' }, // 30.50s [cite: 2]
        { id: 34, timeMs: 31500, judgementWindow: 'hit' }, // 31.50s [cite: 2]
        { id: 35, timeMs: 32500, judgementWindow: 'hit' }, // 32.50s [cite: 2]
        { id: 36, timeMs: 33500, judgementWindow: 'hit' }, // 33.50s [cite: 2]
        { id: 37, timeMs: 34500, judgementWindow: 'hit' }, // 34.50s [cite: 2]
        { id: 38, timeMs: 35500, judgementWindow: 'hit' }, // 35.50s [cite: 2]
        { id: 39, timeMs: 36500, judgementWindow: 'hit' }, // 36.50s [cite: 2]
        { id: 40, timeMs: 37500, judgementWindow: 'hit' }, // 37.50s [cite: 2]
        { id: 41, timeMs: 38500, judgementWindow: 'hit' }, // 38.50s [cite: 2]
        { id: 42, timeMs: 39500, judgementWindow: 'hit' }, // 39.50s [cite: 2]
        { id: 43, timeMs: 40370, judgementWindow: 'hit' }, // 40.37s [cite: 3]
        { id: 44, timeMs: 41500, judgementWindow: 'hit' }, // 41.50s [cite: 3]
        { id: 45, timeMs: 42500, judgementWindow: 'hit' }, // 42.50s [cite: 3]
        { id: 46, timeMs: 42750, judgementWindow: 'hit' }, // 42.75s [cite: 3]
        { id: 47, timeMs: 43500, judgementWindow: 'hit' }, // 43.50s [cite: 3]
        { id: 48, timeMs: 44370, judgementWindow: 'hit' }, // 44.37s [cite: 3]
        { id: 49, timeMs: 44500, judgementWindow: 'hit' }, // 44.50s [cite: 3]
        { id: 50, timeMs: 45120, judgementWindow: 'hit' }, // 45.12s [cite: 3]
        { id: 51, timeMs: 45370, judgementWindow: 'hit' }, // 45.37s [cite: 3]
        { id: 52, timeMs: 45430, judgementWindow: 'hit' }, // 45.43s [cite: 3]
        { id: 53, timeMs: 45500, judgementWindow: 'hit' }, // 45.50s [cite: 3]
        { id: 54, timeMs: 46500, judgementWindow: 'hit' }, // 46.50s [cite: 3]
        { id: 55, timeMs: 47500, judgementWindow: 'hit' }, // 47.50s [cite: 3]
        { id: 56, timeMs: 48500, judgementWindow: 'hit' }, // 48.50s [cite: 3]
        { id: 57, timeMs: 49500, judgementWindow: 'hit' }, // 49.50s [cite: 3]
        { id: 58, timeMs: 50500, judgementWindow: 'hit' }, // 50.50s [cite: 3]
        { id: 59, timeMs: 51500, judgementWindow: 'hit' }, // 51.50s [cite: 3]
        { id: 60, timeMs: 52500, judgementWindow: 'hit' }, // 52.50s [cite: 3]
        { id: 61, timeMs: 53500, judgementWindow: 'hit' }, // 53.50s [cite: 3]
        { id: 62, timeMs: 54500, judgementWindow: 'hit' }, // 54.50s [cite: 3]
        { id: 63, timeMs: 55500, judgementWindow: 'hit' }, // 55.50s [cite: 3]
        { id: 64, timeMs: 56500, judgementWindow: 'hit' }, // 56.50s [cite: 3]
        { id: 65, timeMs: 57500, judgementWindow: 'hit' }, // 57.50s [cite: 3]
        { id: 66, timeMs: 58500, judgementWindow: 'hit' }, // 58.50s [cite: 3]
        { id: 67, timeMs: 59500, judgementWindow: 'hit' }, // 59.50s [cite: 3]
        { id: 68, timeMs: 60500, judgementWindow: 'hit' }, // 1,00.50s (60.5s) [cite: 3]
        { id: 69, timeMs: 61370, judgementWindow: 'hit' }, // 1,01.37s (61.37s) [cite: 3]
        { id: 70, timeMs: 61430, judgementWindow: 'hit' }, // 1,01.43s (61.43s) [cite: 3]
        { id: 71, timeMs: 61500, judgementWindow: 'hit' }, // 1,01.50s (61.5s) [cite: 3]
        { id: 72, timeMs: 61750, judgementWindow: 'hit' }, // 1,01.75s (61.75s) [cite: 3]
        { id: 73, timeMs: 61830, judgementWindow: 'hit' }, // 1,01.83s (61.83s) [cite: 3]
        { id: 74, timeMs: 61910, judgementWindow: 'hit' }, // 1,01.91s (61.91s) [cite: 3]
        { id: 75, timeMs: 63500, judgementWindow: 'hit' }, // 1,03.50s (63.5s) [cite: 3]
    ]
};