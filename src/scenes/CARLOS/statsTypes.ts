// Este bloque debería ir en src/types/index.ts

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