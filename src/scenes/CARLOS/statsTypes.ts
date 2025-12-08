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
import { Score, TimeMs } from '../../types/index';

export interface PlayerStats {
    readonly totalScore: Score;
    readonly totalHits: number;
    readonly totalMisses: number;
    readonly perfectLevels: number;
    readonly totalPlayTimeMs: TimeMs;
    readonly gamesPlayed: number;
}