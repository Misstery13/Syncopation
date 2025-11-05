"use strict";
// Estos métodos son funciones puras relacionadas con las estadísticas del jugador.
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPlayerStats = initPlayerStats;
exports.addTotalScore = addTotalScore;
exports.addHits = addHits;
exports.addMisses = addMisses;
exports.addPerfectLevel = addPerfectLevel;
exports.addPlayTime = addPlayTime;
exports.incrementGamesPlayed = incrementGamesPlayed;
exports.updateStatsFromGame = updateStatsFromGame;
/**
 * Inicializa las estadísticas globales del jugador.
 */
function initPlayerStats() {
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
function addTotalScore(stats, delta) {
    return __assign(__assign({}, stats), { totalScore: Math.max(0, stats.totalScore + delta) });
}
/**
 * Registra aciertos.
 */
function addHits(stats, hits) {
    return __assign(__assign({}, stats), { totalHits: Math.max(0, stats.totalHits + hits) });
}
/**
 * Registra fallos.
 */
function addMisses(stats, misses) {
    return __assign(__assign({}, stats), { totalMisses: Math.max(0, stats.totalMisses + misses) });
}
/**
 * Marca un nivel como perfecto (por ejemplo, si precision === 100).
 */
function addPerfectLevel(stats) {
    return __assign(__assign({}, stats), { perfectLevels: stats.perfectLevels + 1 });
}
/**
 * Suma el tiempo total jugado (en milisegundos).
 */
function addPlayTime(stats, timeMs) {
    return __assign(__assign({}, stats), { totalPlayTimeMs: Math.max(0, stats.totalPlayTimeMs + timeMs) });
}
/**
 * Registra el final de una partida completa.
 */
function incrementGamesPlayed(stats) {
    return __assign(__assign({}, stats), { gamesPlayed: stats.gamesPlayed + 1 });
}
/**
 * Actualiza las estadísticas globales del jugador al final de una canción.
 * (Usa los datos del GameState actual)
 */
function updateStatsFromGame(stats, game) {
    var updated = addTotalScore(stats, game.score);
    updated = addPlayTime(updated, game.currentTimeMs);
    if (game.precision >= 100)
        updated = addPerfectLevel(updated);
    // Aquí podrías usar propiedades como game.hits, game.misses si las tienes
    return incrementGamesPlayed(updated);
}
