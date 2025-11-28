// src/CARLOS/statsController.ts
import { initPlayerStats } from './statsPureMethods';
import { PlayerStats } from './statsTypes';

/**
 * Obtiene la clave de almacenamiento dinámica basada en el usuario actual.
 */
function getStorageKey(): string {
  const username = sessionStorage.getItem('currentUser') || 'guest';
  return `playerStats_${username}`;
}

/**
 * Carga las estadísticas del jugador desde almacenamiento local o inicializa nuevas.
 */
export function loadPlayerStats(): PlayerStats {
  const key = getStorageKey();
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initPlayerStats();
}

/**
 * Persiste las estadísticas del jugador en almacenamiento local.
 */
export function setPlayerStats(stats: PlayerStats): void {
  try {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(stats));
  } catch (e) { console.warn('Could not persist player stats', e); }
}

/**
 * Renderiza el contenido principal de la pantalla de estadísticas.
 */
function renderStatsView(stats: PlayerStats): HTMLElement {
  const container = document.createElement('div');
  container.classList.add('stats-container');

  container.innerHTML = `
    <div class="header">
      <h2>Estadísticas del Jugador</h2>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <span>Total Score</span>
        <strong>${stats.totalScore}</strong>
      </div>
      <div class="stat-item">
        <span>Total Hits</span>
        <strong>${stats.totalHits}</strong>
      </div>
      <div class="stat-item">
        <span>Total Misses</span>
        <strong>${stats.totalMisses}</strong>
      </div>
      <div class="stat-item">
        <span>Perfect Levels</span>
        <strong>${stats.perfectLevels}</strong>
      </div>
      <div class="stat-item">
        <span>Total Play Time</span>
        <strong>${(stats.totalPlayTimeMs / 1000).toFixed(1)}s</strong>
      </div>
      <div class="stat-item">
        <span>Games Played</span>
        <strong>${stats.gamesPlayed}</strong>
      </div>
    </div>
    <button id="btnBack" class="back-btn">Volver</button>
  `;

  // Evento para volver al menú principal
  container.querySelector('#btnBack')?.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('navigateToMenu'));
  });

  return container;
}

/**
 * Inicializa la pantalla de estadísticas.
 */
export function initStatsScreen(): void {
  const root = document.getElementById('app-root'); // o tu contenedor principal
  if (!root) {
    console.error('[statsController] app-root not found');
    return;
  }

  try {
    console.debug('[statsController] Loading player stats');
    const stats = loadPlayerStats();
    root.innerHTML = ''; // limpia contenido anterior
    root.appendChild(renderStatsView(stats));
    console.debug('[statsController] Stats screen rendered');
  } catch (err) {
    console.error('[statsController] Error rendering stats screen', err);
  }
}