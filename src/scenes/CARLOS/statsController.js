"use strict";
// Luego se creará una carpeta para controladores específicos para este archivo.
Object.defineProperty(exports, "__esModule", { value: true });
exports.initStatsScreen = initStatsScreen;
// src/CARLOS/statsController.ts
var statsPureMethods_ts_1 = require("./statsPureMethods.ts");
require("./statsScreen.css");
// Clave de almacenamiento (puede venir del estado global del juego)
var STORAGE_KEY = 'playerStats';
/**
 * Carga las estadísticas del jugador desde almacenamiento local o inicializa nuevas.
 */
function loadPlayerStats() {
    var data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : (0, statsPureMethods_ts_1.initPlayerStats)();
}
/**
 * Renderiza el contenido principal de la pantalla de estadísticas.
 */
function renderStatsView(stats) {
    var _a;
    var container = document.createElement('div');
    container.classList.add('stats-container');
    container.innerHTML = "\n    <div class=\"header\">\n      <h2>Estad\u00EDsticas del Jugador</h2>\n      <button id=\"btnBack\" class=\"back-btn\">Volver</button>\n    </div>\n\n    <div class=\"stats-grid\">\n      <div class=\"stat-item\">\n        <span>Total Score</span>\n        <strong>".concat(stats.totalScore, "</strong>\n      </div>\n      <div class=\"stat-item\">\n        <span>Total Hits</span>\n        <strong>").concat(stats.totalHits, "</strong>\n      </div>\n      <div class=\"stat-item\">\n        <span>Total Misses</span>\n        <strong>").concat(stats.totalMisses, "</strong>\n      </div>\n      <div class=\"stat-item\">\n        <span>Perfect Levels</span>\n        <strong>").concat(stats.perfectLevels, "</strong>\n      </div>\n      <div class=\"stat-item\">\n        <span>Total Play Time</span>\n        <strong>").concat((stats.totalPlayTimeMs / 1000).toFixed(1), "s</strong>\n      </div>\n      <div class=\"stat-item\">\n        <span>Games Played</span>\n        <strong>").concat(stats.gamesPlayed, "</strong>\n      </div>\n    </div>\n  ");
    // Evento para volver al menú principal
    (_a = container.querySelector('#btnBack')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', function () {
        document.dispatchEvent(new CustomEvent('navigateToMenu'));
    });
    return container;
}
/**
 * Inicializa la pantalla de estadísticas.
 */
function initStatsScreen() {
    var root = document.getElementById('app-root'); // o tu contenedor principal
    if (!root)
        return;
    var stats = loadPlayerStats();
    root.innerHTML = ''; // limpia contenido anterior
    root.appendChild(renderStatsView(stats));
}
