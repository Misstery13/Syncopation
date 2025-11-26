console.log('gameplayController module executing...');
import { FullGameState } from './gameplayTypes';
import { tick } from './gameplayPureMethods';
import { processPlayerInput } from './gameplayPureMethods';
import { initializeFullGame } from './gameplayPureMethods';
import { SONG_TEST_LEVEL } from './gameplayTypes';
import { evaluateHit } from './gameplayPureMethods';
// 1. IMPORTANTE: Añadir spawnThrowable a los imports
import { spawnThrowable, handleThrowableReaction, playCharacterAnimation } from '../../core/phaserBridge';

// Audio SFX for hits
let sfxHit: HTMLAudioElement | null = null;
let sfxDelay: HTMLAudioElement | null = null;
let sfxMiss: HTMLAudioElement | null = null;
let sfxSpawn: HTMLAudioElement | null = null;

function loadSfx() {
    try {
        sfxHit = new Audio('/assets/audio/acierto.mp3');
        sfxHit.preload = 'auto';
        sfxDelay = new Audio('/assets/audio/delay.mp3');
        sfxDelay.preload = 'auto';
        sfxMiss = new Audio('/assets/audio/miss.mp3');
        sfxMiss.preload = 'auto';
        sfxSpawn = new Audio('/assets/audio/spawn.mp3');
        sfxSpawn.preload = 'auto';

        // Default volumes (0.0 - 1.0)
        if (sfxHit) sfxHit.volume = 0.85;
        if (sfxDelay) sfxDelay.volume = 0.7;
        if (sfxMiss) sfxMiss.volume = 0.7;
        if (sfxSpawn) sfxSpawn.volume = 0.9;
    } catch (e) {
        console.warn('Could not create SFX audio elements', e);
        sfxHit = sfxDelay = sfxMiss = null;
    }
}

let estadoActual: FullGameState;
let animationFrameId: number;

const launchedTempos = new Set<number>(); // para no lanzar dos veces la misma nota
const THROW_TRAVEL_MS = 600; // Debe coincidir con la duración en phaserBridge

/**
 * Renderiza el HTML de la vista de Gameplay.
 */
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
            <div class="stat-item"><span class="label">Tiempo (ms)</span><span class="value" id="time-ms">${state.game.currentTimeMs}</span></div>
            <div class="stat-item"><span class="label">Score Total</span><span class="value" id="total-score">${state.game.score}</span></div>
            <div class="stat-item"><span class="label">Combo</span><span class="value" id="combo-count">${state.rhythm.combo}</span></div>
            <div class="stat-item"><span class="label">Notas Restantes</span><span class="value" id="remaining-notes">${state.game.song.tempos.length}</span></div>
        </div>

        <div class="game-area">
            <div id="phaser-root"></div>
            <div id="target-indicator" style="position:absolute;left:10px;top:10px;width:80px;height:80px;border:5px solid #00ff7f;border-radius:50%;background:transparent;display:flex;align-items:center;justify-content:center;font-size:12px;"> </div>
            <div class="hit-instruction">Pulsa espacio para golpear</div>
        </div>
        <div id="feedback-log"></div>
    `;
    return container;
}

/**
 * Actualiza los elementos del DOM con el nuevo estado.
 * Y gestiona el lanzamiento (SPAWN) de objetos.
 */
function updateDOM(state: FullGameState): void {
    const timeEl = document.getElementById('time-ms');
    const scoreEl = document.getElementById('total-score');
    const comboEl = document.getElementById('combo-count');
    const remainingEl = document.getElementById('remaining-notes');

    if (timeEl) timeEl.textContent = state.game.currentTimeMs.toString();
    if (scoreEl) scoreEl.textContent = state.game.score.toString();
    if (comboEl) comboEl.textContent = state.rhythm.combo.toString();
    if (remainingEl) remainingEl.textContent = state.game.song.tempos.length.toString();

    // Lógica visual simple para ver el ritmo
    const targetIndicator = document.getElementById('target-indicator');
    if (targetIndicator && state.game.song.tempos.length > 0) {
        const nextTempo = state.game.song.tempos[0];
        const diff = nextTempo.timeMs - state.game.currentTimeMs;

        if (Math.abs(diff) < 500) {
            targetIndicator.style.backgroundColor = 'blue';
            targetIndicator.textContent = `¡${Math.round(diff)}ms!`;
        } else {
            targetIndicator.style.backgroundColor = 'transparent';
            targetIndicator.textContent = '';
        }

        // 2) Lógica de LANZAMIENTO (Spawn)
        if (!launchedTempos.has(nextTempo.id)) {
            const timeToImpact = nextTempo.timeMs - state.game.currentTimeMs;

            // Si falta el tiempo correcto para el impacto...
            if (timeToImpact <= THROW_TRAVEL_MS && timeToImpact > 0) {
                launchedTempos.add(nextTempo.id);

                // 2. CORRECCIÓN: Aquí llamamos a SPAWN (aparecer y viajar), NO a REACTION.
                // Play spawn SFX if available
                try {
                    if (sfxSpawn) {
                        const p = sfxSpawn.play(); if (p && p.catch) p.catch(() => { });
                    }
                } catch (e) { /* ignore */ }

                spawnThrowable(THROW_TRAVEL_MS);
            }
        }
    }
}

/**
 * Bucle principal de juego usando requestAnimationFrame.
 */
function gameLoop(timestamp: DOMHighResTimeStamp) {
    if (estadoActual.game.isGameStoped || estadoActual.game.isPaused) {
        return;
    }

    const currentSongTimeMs = Math.round(timestamp - estadoActual.gameStartTime);
    estadoActual = tick(estadoActual, currentSongTimeMs);
    updateDOM(estadoActual);
    animationFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Manejador de la pulsación del jugador (Input).
 */
function handleInput(event: MouseEvent | KeyboardEvent) {
    if (event instanceof KeyboardEvent) {
        if (event.code !== 'Space') return;
        try { event.preventDefault(); } catch (e) { /* ignore */ }
    }

    // Debug: log that the handler received the event (helps detectar 'no se presiona')
    try { console.log('[handleInput] event:', event instanceof KeyboardEvent ? event.code : 'click', 'time:', performance.now()); } catch (e) { }

    const pressTimeAbsolute = performance.now();
    const pressTimeGame = Math.round(pressTimeAbsolute - estadoActual.gameStartTime);

    try { console.log('[handleInput] pressTimeGame:', pressTimeGame); } catch (e) { }

    const targetTempo = estadoActual.game.song.tempos.length > 0
        ? estadoActual.game.song.tempos.reduce((prev, curr) => {
            const diffPrev = Math.abs(prev.timeMs - pressTimeGame);
            const diffCurr = Math.abs(curr.timeMs - pressTimeGame);
            return (diffCurr < diffPrev) ? curr : prev;
        }, estadoActual.game.song.tempos[0])
        : undefined;

    try { console.log('[handleInput] targetTempo:', targetTempo ? { id: targetTempo.id, timeMs: targetTempo.timeMs } : null); } catch (e) { }

    const nuevoEstado = processPlayerInput(estadoActual, pressTimeGame);

    if (nuevoEstado !== estadoActual) {
        estadoActual = nuevoEstado;
        updateDOM(estadoActual);

        const log = document.getElementById('feedback-log');
        if (log) {
            const targetTimeForLog = targetTempo ? targetTempo.timeMs : (estadoActual.game.song.tempos[0]?.timeMs || 0);

            // Calculamos qué tal fue el golpe
            const result = evaluateHit(targetTimeForLog, pressTimeGame);

            const cls = result.window === 'hit' ? 'perfect' : result.window === 'delay' ? 'ok' : 'miss';
            log.innerHTML = `<span class="${cls}">${result.window.toUpperCase()} (${result.deltaMs}ms)</span>` + log.innerHTML;
            if (log.children.length > 5) log.removeChild(log.lastChild as Node);

            // Play SFX depending on the judgment
            try {
                if (result.window === 'hit' && sfxHit) {
                    const p = sfxHit.play(); if (p && p.catch) p.catch(() => { });
                } else if (result.window === 'delay' && sfxDelay) {
                    const p = sfxDelay.play(); if (p && p.catch) p.catch(() => { });
                } else if (result.window === 'miss' && sfxMiss) {
                    const p = sfxMiss.play(); if (p && p.catch) p.catch(() => { });
                }
            } catch (e) {
                // ignore audio play errors (autoplay policies etc.)
            }

            // Trigger Character Animation
            if (result.window === 'hit' || result.window === 'delay') {
                const anim = Math.random() > 0.5 ? 'Kimu-punch-right' : 'Kimu-punch-left';
                playCharacterAnimation(anim);
            }

            // 3. CORRECCIÓN: Aquí llamamos a la REACCIÓN física de la bola
            // (brincar si es delay, salir disparada si es hit, caer si es miss)
            handleThrowableReaction(result.window);
        }
    }
    else {
        // Input fue descartado: log motivo aproximado para debugging (fuera de ventana o sin nota cercana)
        try {
            const nearby = targetTempo ? Math.abs(targetTempo.timeMs - pressTimeGame) : null;
            console.log('[handleInput] input ignored — nearbyDelta:', nearby, 'temposRemaining:', estadoActual.game.song.tempos.length);
        } catch (e) { }
    }
}

/**
 * Inicializa la pantalla de Gameplay.
 */
export function initRhythmScreen(): void {
    const root = document.getElementById('app-root');
    if (!root) return;

    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    root.innerHTML = '';
    const dummyState = {
        game: { score: 0, precision: 100, currentTimeMs: 0, currentScene: 'Gameplay', isRunning: false, isPaused: false, isGameStoped: false, level: 1, song: SONG_TEST_LEVEL } as any,
        rhythm: { combo: 0, maxCombo: 0, score: 0, hits: { delay: 0, hit: 0, miss: 0 } } as any,
        gameStartTime: 0
    } as FullGameState;
    const view = renderRhythmView(dummyState);
    root.appendChild(view);

    const actionButton = document.getElementById('action-button') as HTMLButtonElement | null;
    actionButton?.setAttribute('disabled', 'true');

    view.querySelector('#btnBackToMenu')?.addEventListener('click', () => {
        if (estadoActual) {
            estadoActual = { ...estadoActual, game: { ...estadoActual.game, isGameStoped: true } };
        }
        cancelAnimationFrame(animationFrameId);
        document.dispatchEvent(new CustomEvent('navigateToMenu'));
    });

    const startButton = document.getElementById('start-button') as HTMLButtonElement | null;
    let audioEl: HTMLAudioElement | null = null;

    function startNow() {
        // Load SFX for hits/delays/miss
        try { loadSfx(); } catch (e) { /* ignore */ }
        const startTime = performance.now();
        estadoActual = initializeFullGame(SONG_TEST_LEVEL, startTime);
        actionButton?.removeAttribute('disabled');
        document.getElementById('action-button')?.addEventListener('click', handleInput);
        document.addEventListener('keydown', handleInput);
        if (startButton) startButton.style.display = 'none';
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function startSequence() {
        if (startButton) startButton.disabled = true;
        const audioUrl = (SONG_TEST_LEVEL as any).audioUrl as string | undefined;
        if (audioUrl) {
            audioEl = new Audio(audioUrl);
            audioEl.preload = 'auto';
            const playPromise = audioEl.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    startNow();
                }).catch(() => {
                    alert('Para reproducir audio, haz clic en la página y luego pulsa "Iniciar Juego" otra vez.');
                    if (startButton) startButton.disabled = false;
                    const resumeHandler = () => {
                        audioEl!.play().then(() => startNow()).catch(() => startNow());
                        document.removeEventListener('click', resumeHandler);
                    };
                    document.addEventListener('click', resumeHandler, { once: true } as any);
                });
            } else {
                startNow();
            }
        } else {
            startNow();
        }
    }

    startButton?.addEventListener('click', startSequence);
}