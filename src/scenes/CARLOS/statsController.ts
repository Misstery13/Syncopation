// Luego se creará una carpeta para controladores específicos para este archivo.

// src/CARLOS/statsController.ts
import { initPlayerStats } from './statsPureMethods';
import { PlayerStats } from './statsTypes';

// Clave de almacenamiento (puede venir del estado global del juego)
const STORAGE_KEY = 'playerStats';

/**
 * Carga las estadísticas del jugador desde almacenamiento local o inicializa nuevas.
 */
function loadPlayerStats(): PlayerStats {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initPlayerStats();
}

/**
 * Persiste las estadísticas del jugador en almacenamiento local.
 */
export function setPlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
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
<<<<<<< HEAD
export function initStatsScreen(mountRoot?: HTMLElement): void {
  const root = mountRoot ?? document.getElementById('app-root'); // o tu contenedor principal
  if (!root) return;

  const stats = loadPlayerStats();
  // Si montamos embebido no limpiamos el app-root global (solo limpiamos el contenedor objetivo)
  if (!mountRoot) root.innerHTML = '';
  root.appendChild(renderStatsView(stats));
=======
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
>>>>>>> 979540e63323bc76f850752f8dbcd2ad3efbe568
}