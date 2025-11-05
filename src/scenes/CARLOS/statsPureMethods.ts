// Estos métodos son funciones puras relacionadas con las estadísticas del jugador.



// La ubicación del archivo será modificada más adelante para ajustarse a la estructura del proyecto.



/**
 * Aquí va el codigo con las funciones puras relacionadas con la pantalla de Estadísticas.
 * A la cual se accede desde el menú principal, en la opcion "Estadísticas".
 */

import { GameState } from '../../types/index';
import { PlayerStats } from './statsTypes';




/**
 * Inicializa las estadísticas globales del jugador.
 */
export function initPlayerStats(): PlayerStats {
    return {
        totalScore: 0,
        totalHits: 0,
        totalMisses: 0,
        perfectLevels: 0,
        totalPlayTimeMs: 0,
        gamesPlayed: 0,
    };
}

/**
 * Suma puntos al total global.
 */
export function addTotalScore(stats: PlayerStats, delta: number): PlayerStats {
    return {
        ...stats,
        totalScore: Math.max(0, stats.totalScore + delta),
    };
}

/**
 * Registra aciertos.
 */
export function addHits(stats: PlayerStats, hits: number): PlayerStats {
    return {
        ...stats,
        totalHits: Math.max(0, stats.totalHits + hits),
    };
}

/**
 * Registra fallos.
 */
export function addMisses(stats: PlayerStats, misses: number): PlayerStats {
    return {
        ...stats,
        totalMisses: Math.max(0, stats.totalMisses + misses),
    };
}

/**
 * Marca un nivel como perfecto (por ejemplo, si precision === 100).
 */
export function addPerfectLevel(stats: PlayerStats): PlayerStats {
    return {
        ...stats,
        perfectLevels: stats.perfectLevels + 1,
    };
}

/**
 * Suma el tiempo total jugado (en milisegundos).
 */
export function addPlayTime(stats: PlayerStats, timeMs: number): PlayerStats {
    return {
        ...stats,
        totalPlayTimeMs: Math.max(0, stats.totalPlayTimeMs + timeMs),
    };
}

/**
 * Registra el final de una partida completa.
 */
export function incrementGamesPlayed(stats: PlayerStats): PlayerStats {
    return {
        ...stats,
        gamesPlayed: stats.gamesPlayed + 1,
    };
}

/**
 * Actualiza las estadísticas globales del jugador al final de una canción.
 * (Usa los datos del GameState actual)
 */
export function updateStatsFromGame(stats: PlayerStats, game: GameState): PlayerStats {
    let updated = addTotalScore(stats, game.score);
    updated = addPlayTime(updated, game.currentTimeMs);
    if (game.precision >= 100) updated = addPerfectLevel(updated);
    // Aquí podrías usar propiedades como game.hits, game.misses si las tienes
    return incrementGamesPlayed(updated);
}
