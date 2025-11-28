import { FullGameState } from './gameplayTypes';

let uiCache: {
    time?: HTMLElement,
    score?: HTMLElement,
    combo?: HTMLElement,
    remaining?: HTMLElement,
    indicator?: HTMLElement,
    log?: HTMLElement
} = {};

export function renderRhythmView(state: FullGameState): HTMLElement {
    const container = document.createElement('div');
    container.id = 'rhythm-game-container';
    container.classList.add('rhythm-container');
    container.innerHTML = `
        <div class="header">
            <h2>Rhythm Test: ${state.game.song.idSong}</h2>
            <button id="btnBackToMenu" class="back-btn">Volver</button>
            <button id="start-button" class="start-btn">Iniciar Juego</button>
        </div>
        <div class="stats">
            <div class="stat-item"><span class="label">Tiempo</span><span class="value" id="time-ms">0</span></div>
            <div class="stat-item"><span class="label">Puntaje</span><span class="value" id="total-score">0</span></div>
            <div class="stat-item"><span class="label">Combo</span><span class="value" id="combo-count">0</span></div>
            <div class="stat-item"><span class="label">Notas</span><span class="value" id="remaining-notes">${state.game.song.tempos.length}</span></div>
        </div>
        <div class="game-area">
            <div id="phaser-root"></div>
            <div id="target-indicator" style="position:absolute;left:10px;top:10px;width:80px;height:80px;border:5px solid #00ff7f;border-radius:50%;background:transparent;display:flex;align-items:center;justify-content:center;font-size:12px;opacity:0.5;"></div>
            <div class="hit-instruction">Pulsa ESPACIO en el momento justo</div>
        </div>
        <div id="feedback-log"></div>
    `;
    return container;
}

export function cacheDOMElements() {
    uiCache = {
        time: document.getElementById('time-ms') || undefined,
        score: document.getElementById('total-score') || undefined,
        combo: document.getElementById('combo-count') || undefined,
        remaining: document.getElementById('remaining-notes') || undefined,
        indicator: document.getElementById('target-indicator') || undefined,
        log: document.getElementById('feedback-log') || undefined
    };
}

export function updateVisuals(state: FullGameState, hitOffsetMs: number = 0) {
    if (uiCache.time) uiCache.time.textContent = Math.floor(state.game.currentTimeMs / 1000).toFixed(1) + 's';
    if (uiCache.score) uiCache.score.textContent = state.game.score.toString();
    if (uiCache.combo) uiCache.combo.textContent = state.rhythm.combo.toString();
    if (uiCache.remaining) uiCache.remaining.textContent = state.game.song.tempos.length.toString();

    if (uiCache.indicator && state.game.song.tempos.length > 0) {
        const activeNote = state.game.song.tempos[0];
        const diff = (activeNote.timeMs + hitOffsetMs) - state.game.currentTimeMs;

        if (diff < 500 && diff > -200) {
            const opacity = Math.max(0, 1 - (Math.abs(diff) / 500));
            uiCache.indicator.style.borderColor = diff > 0 ? '#00ff7f' : '#ff0055';
            uiCache.indicator.style.opacity = opacity.toString();
            uiCache.indicator.textContent = `${Math.round(diff)}`;
        } else {
            uiCache.indicator.style.opacity = '0';
        }
    }
}

export function appendFeedbackLog(html: string) {
    if (!uiCache.log) return;
    uiCache.log.insertAdjacentHTML('afterbegin', html);
    if (uiCache.log.children.length > 5) uiCache.log.lastElementChild?.remove();
}

export function cleanupView() {
    try {
        const container = document.getElementById('rhythm-game-container');
        if (container && container.parentElement) container.parentElement.removeChild(container);
        uiCache = {};
    } catch (e) { console.warn('cleanupView failed', e); }
}
