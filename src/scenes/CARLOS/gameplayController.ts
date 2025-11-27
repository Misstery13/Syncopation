console.log('gameplayController module executing...');
import { FullGameState } from './gameplayTypes';
import { Tempo } from '../../types/index';
import { tick, processPlayerInput, initializeFullGame, evaluateHit, setFullGameStoped } from './gameplayPureMethods';
import { SONG_TEST_LEVEL } from './gameplayTypes';
import { spawnThrowable, handleThrowableReaction, playCharacterAnimation } from '../../core/phaserBridge';
import { updateStatsFromGame, initPlayerStats } from './statsPureMethods';
import { setPlayerStats, initStatsScreen } from './statsController';

// --- CONFIGURACIÓN ---
const THROW_TRAVEL_MS = 1200;
const INPUT_SEARCH_WINDOW = 200;

// AJUSTE DE RANGO:
// Valor negativo = El jugador debe golpear ANTES de que llegue al cuerpo (distancia de brazo).
// -50ms suele ser una buena distancia visual. Ajusta este número según necesites.
const HIT_OFFSET_MS = -60;

// --- ESTADO MUTABLE (DEL CONTROLADOR) ---
let estadoActual: FullGameState;
let animationFrameId: number;
let isFinishing: boolean = false; // Nueva bandera para evitar el congelamiento

// Set para rastrear IDs de notas que ya lanzamos visualmente (Spawn).
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
        sfxHit = new Audio('/assets/audio/kick-yarn-ball.mp3'); sfxHit.volume = 0.7;
        sfxDelay = new Audio('/assets/audio/meow.mp3'); sfxDelay.volume = 0.7;
        sfxMiss = new Audio('/assets/audio/miss.mp3'); sfxMiss.volume = 0.5;
        sfxSpawn = new Audio('/assets/audio/boing.mp3'); sfxSpawn.volume = 0.5;
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

function checkSpawns(currentTimeMs: number, songTempos: readonly Tempo[]) {
    const lookAheadCount = 5;

    for (let i = 0; i < Math.min(songTempos.length, lookAheadCount); i++) {
        const nextTempo = songTempos[i];
        if (spawnedTempoIds.has(nextTempo.id)) continue;

        const timeToImpact = nextTempo.timeMs - currentTimeMs;

        if (timeToImpact <= THROW_TRAVEL_MS) {
            if (timeToImpact > -100) {
                spawnThrowable(THROW_TRAVEL_MS);
                playSfx('spawn');
                spawnedTempoIds.add(nextTempo.id);
            }
        } else {
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
        // Aplicamos también el offset visual para que el indicador coincida con el golpe lógico
        const activeNote = state.game.song.tempos[0];
        // Calculamos diff respecto al punto de golpeo deseado (con offset)
        const diff = (activeNote.timeMs + HIT_OFFSET_MS) - state.game.currentTimeMs;

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
    // Si el juego está pausado por menú, salimos.
    // Si isGameStoped es true, significa que YA terminamos todo el proceso (incluido el delay final).
    if (estadoActual.game.isGameStoped || estadoActual.game.isPaused) return;

    const currentSongTimeMs = Math.round(timestamp - estadoActual.gameStartTime);

    // 1. Estado Lógico (Puro)
    estadoActual = tick(estadoActual, currentSongTimeMs);

    // Detectar fin de la canción (sin notas pendientes)
    // SOLUCIÓN BLOQUEO: Usamos la bandera 'isFinishing' para entrar aquí solo una vez,
    // pero NO detenemos el requestAnimationFrame todavía.
    if (estadoActual.game.song.tempos.length === 0 && !isFinishing) {

        isFinishing = true; // Marcamos que estamos en la secuencia final

        // Esperamos 3 segundos antes de detener realmente el motor
        setTimeout(() => {
            finishGameLogic();
        }, 3000);
    }

    // 2. Lógica de Spawning
    checkSpawns(currentSongTimeMs, estadoActual.game.song.tempos);

    // 3. Renderizado
    // El renderizado sigue ocurriendo incluso si isFinishing es true,
    // permitiendo ver la animación del último golpe.
    updateVisuals(estadoActual);

    animationFrameId = requestAnimationFrame(gameLoop);
}

// Función helper para la lógica final
function finishGameLogic() {
    // Aquí sí detenemos el juego formalmente
    estadoActual = setFullGameStoped(estadoActual);

    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    try {
        const raw = localStorage.getItem('playerStats');
        const currentStats = raw ? JSON.parse(raw) : initPlayerStats();

        const successfulHits = (estadoActual.rhythm.hits['hit'] || 0) + (estadoActual.rhythm.hits['delay'] || 0);
        const missedHits = (estadoActual.rhythm.hits['miss'] || 0) || 0;

        const finalStats = updateStatsFromGame(currentStats, estadoActual.game, successfulHits, missedHits);

        setPlayerStats(finalStats);
        initStatsScreen();
    } catch (e) {
        console.warn('Error persisting/showing stats', e);
    }
}

function handleInput(event: MouseEvent | KeyboardEvent) {
    // Si estamos en la secuencia de finalización (esperando el timeout), bloqueamos input extra
    // para no golpear "al aire", aunque si quieres permitirlo, quita esta línea.
    if (isFinishing) return;

    if (event instanceof KeyboardEvent) {
        if (event.code !== 'Space') return;
        event.preventDefault();
    }

    const pressTimeAbsolute = performance.now();
    const pressTimeGame = Math.round(pressTimeAbsolute - estadoActual.gameStartTime);

    let bestCandidate = undefined;
    let minDiff = Infinity;
    const searchLimit = Math.min(estadoActual.game.song.tempos.length, 3);

    for (let i = 0; i < searchLimit; i++) {
        const tempo = estadoActual.game.song.tempos[i];

        // SOLUCIÓN RANGO: Calculamos la diferencia aplicando el OFFSET.
        // Si HIT_OFFSET_MS es -50, y la nota es a los 1000ms:
        // El "target" real se vuelve 950ms.
        // Si pulsamos en 950ms, (1000 + (-50)) - 950 = 0 diff. PERFECTO.
        const effectiveTargetTime = tempo.timeMs + HIT_OFFSET_MS;
        const diff = Math.abs(effectiveTargetTime - pressTimeGame);

        if (diff <= INPUT_SEARCH_WINDOW && diff < minDiff) {
            minDiff = diff;
            bestCandidate = tempo;
        }
    }

    // Procesamos el input. Nota: processPlayerInput elimina la nota del array.
    // Pasamos pressTimeGame normal, ya que la lógica interna solo necesita saber cuándo pulsaste para borrar.
    const nuevoEstado = processPlayerInput(estadoActual, pressTimeGame);

    if (nuevoEstado !== estadoActual) {
        // Feedback
        // Aquí ajustamos qué tiempo pasamos a evaluateHit para que el cálculo de "Perfect/Miss"
        // tenga en cuenta tu offset de "brazo estirado".

        const rawTargetTime = bestCandidate ? bestCandidate.timeMs : pressTimeGame;
        const targetTimeWithOffset = rawTargetTime + HIT_OFFSET_MS;

        const result = evaluateHit(targetTimeWithOffset, pressTimeGame);

        playSfx(result.window);

        if (result.window === 'hit' || result.window === 'delay') {
            const anim = Math.random() > 0.5 ? 'Kimu-punch-right' : 'Kimu-punch-left';
            playCharacterAnimation(anim);
        }

        handleThrowableReaction(result.window);

        if (uiCache.log) {
            const cls = result.window === 'hit' ? 'perfect' : result.window === 'delay' ? 'ok' : 'miss';
            // Mostramos el offset real para debuggear si quieres
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

    // Resetear banderas
    isFinishing = false;
    spawnedTempoIds.clear();

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

        // Limpiamos el set de spawns y bandera de finalización
        spawnedTempoIds.clear();
        isFinishing = false;

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