console.log('gameplayController module executing...');
import { FullGameState } from './gameplayTypes';
// Importamos el tipo Tempo para usarlo en la firma de la función
import { Tempo } from '../../types/index';
import { tick, processPlayerInput, initializeFullGame, evaluateHit, setFullGameStoped } from './gameplayPureMethods';
import { SONG_TEST_LEVEL } from './gameplayTypes';
import { spawnThrowable, handleThrowableReaction, playCharacterAnimation } from '../../core/phaserBridge';
import { updateStatsFromGame, initPlayerStats } from './statsPureMethods';
import { setPlayerStats, initStatsScreen } from './statsController';

// --- CONFIGURACIÓN ---
const THROW_TRAVEL_MS = 2000;
const INPUT_SEARCH_WINDOW = 500;

// --- ESTADO MUTABLE (DEL CONTROLADOR) ---
let estadoActual: FullGameState;
let animationFrameId: number;

// Set para rastrear IDs de notas que ya lanzamos visualmente (Spawn).
// Usamos esto porque la nota sigue existiendo en 'tempos' mientras viaja,
// y no queremos lanzarla dos veces.
const spawnedTempoIds = new Set<number>();

// Optimizacion: Caché de elementos DOM
let uiCache: {
    time?: HTMLElement,
    score?: HTMLElement,
    combo?: HTMLElement,
    remaining?: HTMLElement,
    indicator?: HTMLElement,
    log?: HTMLElement
} = {};

// --- AUDIO SFX ---
let sfxHit: HTMLAudioElement | null = null;
let sfxDelay: HTMLAudioElement | null = null;
let sfxMiss: HTMLAudioElement | null = null;
let sfxSpawn: HTMLAudioElement | null = null;

function loadSfx() {
    try {
        sfxHit = new Audio('/assets/audio/acierto.mp3'); sfxHit.volume = 0.7;
        sfxDelay = new Audio('/assets/audio/delay.mp3'); sfxDelay.volume = 0.7;
        sfxMiss = new Audio('/assets/audio/miss.mp3'); sfxMiss.volume = 0.7;
        sfxSpawn = new Audio('/assets/audio/spawn.mp3'); sfxSpawn.volume = 0.5;
    } catch (e) { console.warn('Audio Error', e); }
}

function playSfx(type: 'hit' | 'delay' | 'miss' | 'spawn') {
    try {
        let sound: HTMLAudioElement | null = null;
        if (type === 'hit') sound = sfxHit;
        else if (type === 'delay') sound = sfxDelay;
        else if (type === 'miss') sound = sfxMiss;
        else if (type === 'spawn') sound = sfxSpawn;

        if (sound) {
            const clone = sound.cloneNode() as HTMLAudioElement;
            clone.volume = sound.volume;
            clone.play().catch(() => { });
        }
    } catch (e) { }
}

function renderRhythmView(state: FullGameState): HTMLElement {
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
            <div class="stat-item"><span class="label">Tiempo (ms)</span><span class="value" id="time-ms">0</span></div>
            <div class="stat-item"><span class="label">Score</span><span class="value" id="total-score">0</span></div>
            <div class="stat-item"><span class="label">Combo</span><span class="value" id="combo-count">0</span></div>
            <div class="stat-item"><span class="label">Notas</span><span class="value" id="remaining-notes">${state.game.song.tempos.length}</span></div>
        </div>
        <div class="game-area">
            <div id="phaser-root"></div>
            <div id="target-indicator" style="position:absolute;left:10px;top:10px;width:80px;height:80px;border:5px solid #00ff7f;border-radius:50%;background:transparent;display:flex;align-items:center;justify-content:center;font-size:12px;"></div>
            <div class="hit-instruction">Pulsa espacio para golpear</div>
        </div>
        <div id="feedback-log"></div>
    `;
    return container;
}

function cacheDOMElements() {
    uiCache = {
        time: document.getElementById('time-ms') || undefined,
        score: document.getElementById('total-score') || undefined,
        combo: document.getElementById('combo-count') || undefined,
        remaining: document.getElementById('remaining-notes') || undefined,
        indicator: document.getElementById('target-indicator') || undefined,
        log: document.getElementById('feedback-log') || undefined
    };
}

/**
 * Lógica de Spawning adaptada a Programación Funcional.
 * Recibe 'readonly Tempo[]' porque no lo modificamos, solo leemos.
 */
function checkSpawns(currentTimeMs: number, songTempos: readonly Tempo[]) {
    // Como tus funciones puras (tick/processInput) ELIMINAN las notas del array,
    // las notas pendientes siempre están al principio de la lista.
    // Iteramos solo las primeras notas para ver si toca lanzarlas.

    // Checkeamos las primeras 5 notas por si hay ráfagas muy rápidas
    const lookAheadCount = 5;

    for (let i = 0; i < Math.min(songTempos.length, lookAheadCount); i++) {
        const nextTempo = songTempos[i];

        // Si ya la lanzamos, pasamos a la siguiente
        if (spawnedTempoIds.has(nextTempo.id)) continue;

        const timeToImpact = nextTempo.timeMs - currentTimeMs;

        // Si estamos en rango de lanzamiento (faltan 600ms o menos)
        if (timeToImpact <= THROW_TRAVEL_MS) {
            // Evitar lanzar notas que ya pasaron hace mucho (glitch visual)
            if (timeToImpact > -100) {
                spawnThrowable(THROW_TRAVEL_MS);
                playSfx('spawn');

                // Marcamos como lanzada para no duplicar
                spawnedTempoIds.add(nextTempo.id);
            }
        } else {
            // Como están ordenadas por tiempo, si esta nota está lejos, 
            // las siguientes también. Podemos salir del bucle.
            break;
        }
    }
}

function updateVisuals(state: FullGameState) {
    if (uiCache.time) uiCache.time.textContent = state.game.currentTimeMs.toString();
    if (uiCache.score) uiCache.score.textContent = state.game.score.toString();
    if (uiCache.combo) uiCache.combo.textContent = state.rhythm.combo.toString();
    if (uiCache.remaining) uiCache.remaining.textContent = state.game.song.tempos.length.toString();

    if (uiCache.indicator && state.game.song.tempos.length > 0) {
        // Indicador visual basado en la primera nota disponible
        const activeNote = state.game.song.tempos[0];
        const diff = activeNote.timeMs - state.game.currentTimeMs;

        if (diff < 500 && diff > -200) {
            uiCache.indicator.style.backgroundColor = `rgba(0, 0, 255, ${1 - (Math.abs(diff) / 500)})`;
            uiCache.indicator.textContent = `${Math.round(diff)}`;
        } else {
            uiCache.indicator.style.backgroundColor = 'transparent';
            uiCache.indicator.textContent = '';
        }
    }
}

function gameLoop(timestamp: DOMHighResTimeStamp) {
    if (estadoActual.game.isGameStoped || estadoActual.game.isPaused) return;

    const currentSongTimeMs = Math.round(timestamp - estadoActual.gameStartTime);

    // 1. Estado Lógico (Puro)
    // 'tick' devuelve un nuevo estado donde las notas "missed" ya han sido eliminadas del array
    estadoActual = tick(estadoActual, currentSongTimeMs);

    // Detectar fin de la canción (sin notas pendientes) y manejar cierre de nivel
    if (estadoActual.game.song.tempos.length === 0 && !estadoActual.game.isGameStoped) {
        // Marcar como detenido para evitar repetir este bloque
        estadoActual = setFullGameStoped(estadoActual);

        try {
            // Cargar estadísticas actuales (si existen) o inicializar
            const raw = localStorage.getItem('playerStats');
            const currentStats = raw ? JSON.parse(raw) : initPlayerStats();

            // Calcular aciertos/fallos del nivel actual
            const successfulHits = (estadoActual.rhythm.hits['hit'] || 0) + (estadoActual.rhythm.hits['delay'] || 0);
            const missedHits = (estadoActual.rhythm.hits['miss'] || 0) || 0;

            // Calcular estadísticas actualizadas (incluye añadir hits/misses y marca perfectos)
            const finalStats = updateStatsFromGame(currentStats, estadoActual.game, successfulHits, missedHits);

            // Persistir y mostrar la pantalla de estadísticas
            setPlayerStats(finalStats);
            initStatsScreen();
        } catch (e) {
            console.warn('Error persisting/showing stats', e);
        }

        // Detener el bucle de animación
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        return;
    }

    // 2. Lógica de Spawning
    checkSpawns(currentSongTimeMs, estadoActual.game.song.tempos);

    // 3. Renderizado
    updateVisuals(estadoActual);

    animationFrameId = requestAnimationFrame(gameLoop);
}

function handleInput(event: MouseEvent | KeyboardEvent) {
    if (event instanceof KeyboardEvent) {
        if (event.code !== 'Space') return;
        event.preventDefault();
    }

    const pressTimeAbsolute = performance.now();
    const pressTimeGame = Math.round(pressTimeAbsolute - estadoActual.gameStartTime);

    // Búsqueda de nota objetivo:
    // Al ser un array que se reduce, la nota objetivo suele ser la primera (tempos[0])
    // a menos que el jugador se adelante mucho a la segunda.
    // Buscamos en las primeras 3 para cubrir "double hits" rápidos.

    let bestCandidate = undefined;
    let minDiff = Infinity;
    const searchLimit = Math.min(estadoActual.game.song.tempos.length, 3);

    for (let i = 0; i < searchLimit; i++) {
        const tempo = estadoActual.game.song.tempos[i];
        const diff = Math.abs(tempo.timeMs - pressTimeGame);

        if (diff <= INPUT_SEARCH_WINDOW && diff < minDiff) {
            minDiff = diff;
            bestCandidate = tempo;
        }
    }

    // Procesamos el input
    // 'processPlayerInput' devuelve nuevo estado con la nota golpeada ELIMINADA del array
    const nuevoEstado = processPlayerInput(estadoActual, pressTimeGame);

    if (nuevoEstado !== estadoActual) {
        // Feedback
        const targetTime = bestCandidate ? bestCandidate.timeMs : pressTimeGame;
        const result = evaluateHit(targetTime, pressTimeGame);

        playSfx(result.window);

        if (result.window === 'hit' || result.window === 'delay') {
            const anim = Math.random() > 0.5 ? 'Kimu-punch-right' : 'Kimu-punch-left';
            playCharacterAnimation(anim);
        }

        handleThrowableReaction(result.window);

        if (uiCache.log) {
            const cls = result.window === 'hit' ? 'perfect' : result.window === 'delay' ? 'ok' : 'miss';
            uiCache.log.insertAdjacentHTML('afterbegin',
                `<div class="${cls}">${result.window.toUpperCase()} (${result.deltaMs}ms)</div>`
            );
            if (uiCache.log.children.length > 5) uiCache.log.lastElementChild?.remove();
        }

        estadoActual = nuevoEstado;
        updateVisuals(estadoActual);
    }
}

export function initRhythmScreen(): void {
    const root = document.getElementById('app-root');
    if (!root) return;

    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    const dummyState = initializeFullGame(SONG_TEST_LEVEL, 0);

    root.innerHTML = '';
    root.appendChild(renderRhythmView(dummyState));
    cacheDOMElements();

    const actionButton = document.getElementById('action-button') as HTMLButtonElement | null;
    actionButton?.setAttribute('disabled', 'true');



    const startButton = document.getElementById('start-button') as HTMLButtonElement | null;
    let audioEl: HTMLAudioElement | null = null;

    function startNow() {
        loadSfx();
        const startTime = performance.now();

        // Limpiamos el set de spawns al reiniciar
        spawnedTempoIds.clear();

        estadoActual = initializeFullGame(SONG_TEST_LEVEL, startTime);

        actionButton?.removeAttribute('disabled');
        const btn = document.getElementById('action-button');
        const newBtn = btn?.cloneNode(true);
        if (btn && newBtn) {
            btn.parentNode?.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', handleInput as any);
        }
        document.removeEventListener('keydown', handleInput);
        document.addEventListener('keydown', handleInput);

        if (startButton) startButton.style.display = 'none';
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function startSequence() {
        if (startButton) startButton.disabled = true;
        const audioUrl = (SONG_TEST_LEVEL as any).audioUrl;

        if (audioUrl) {
            audioEl = new Audio(audioUrl);
            audioEl.preload = 'auto';
            audioEl.play().then(startNow).catch(() => {
                alert('Interactúa con la página para reproducir audio.');
                if (startButton) startButton.disabled = false;
                document.addEventListener('click', () => {
                    audioEl!.play().then(startNow).catch(startNow);
                }, { once: true });
            });
        } else {
            startNow();
        }
    }

    startButton?.addEventListener('click', startSequence);
}