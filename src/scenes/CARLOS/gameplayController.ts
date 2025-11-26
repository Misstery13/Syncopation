console.log('gameplayController module executing...');
import { FullGameState } from './gameplayTypes';
import { tick } from './gameplayPureMethods';
import { processPlayerInput } from './gameplayPureMethods';
import { initializeFullGame } from './gameplayPureMethods';
import { SONG_TEST_LEVEL } from './gameplayTypes';
import { evaluateHit } from './gameplayPureMethods';
import { playCharacterAnimation } from '../../core/phaserBridge';

let estadoActual: FullGameState;
let animationFrameId: number;

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
            <div class="stat-item">Tiempo (ms): <strong id="time-ms">${state.game.currentTimeMs}</strong></div>
            <div class="stat-item">Score Total: <strong id="total-score">${state.game.score}</strong></div>
            <div class="stat-item">Combo: <strong id="combo-count">${state.rhythm.combo}</strong></div>
            <div class="stat-item">Notas Restantes: <strong id="remaining-notes">${state.game.song.tempos.length}</strong></div>
        </div>

        <div class="game-area">
            <div id="target-indicator"></div>
            <button id="action-button" class="action-btn">GOLPEAR (Espacio)</button>
        </div>
        
        <div id="feedback-log"></div>
    `;
    return container;
}

/**
 * Actualiza los elementos del DOM con el nuevo estado.
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

    // Lógica visual simple para ver el ritmo: Cambia el color si hay un evento cerca (ej: +/- 500ms)
    const targetIndicator = document.getElementById('target-indicator');
    if (targetIndicator && state.game.song.tempos.length > 0) {
        const nextTempo = state.game.song.tempos[0];
        const diff = nextTempo.timeMs - state.game.currentTimeMs;

        if (Math.abs(diff) < 500) { // Si faltan menos de 500ms
            targetIndicator.style.backgroundColor = 'blue';
            targetIndicator.textContent = `¡${Math.round(diff)}ms!`;
        } else {
            targetIndicator.style.backgroundColor = 'transparent';
            targetIndicator.textContent = '';
        }
    }
}

/**
 * Bucle principal de juego usando requestAnimationFrame.
 */
function gameLoop(timestamp: DOMHighResTimeStamp) {
    if (estadoActual.game.isGameStoped || estadoActual.game.isPaused) {
        return; // Detener el loop
    }

    // 1. Calcular el tiempo actual de la canción
    const currentSongTimeMs = Math.round(timestamp - estadoActual.gameStartTime);

    // 2. Transición Pura de Estado: Actualizar por tiempo (tick)
    estadoActual = tick(estadoActual, currentSongTimeMs);

    // 3. Renderizar
    updateDOM(estadoActual);

    // Continuar el bucle
    animationFrameId = requestAnimationFrame(gameLoop);
}

/**
 * Manejador de la pulsación del jugador (Input).
 */
function handleInput(event: MouseEvent | KeyboardEvent) {
    if (event instanceof KeyboardEvent && event.code !== 'Space') return;

    // 1. Obtener el tiempo de la pulsación (clave para la precisión)
    const pressTimeAbsolute = performance.now();

    // Calcular el tiempo de juego al momento de la pulsación
    const pressTimeGame = Math.round(pressTimeAbsolute - estadoActual.gameStartTime);

    // 2. Determinar la nota objetivo más cercana ANTES de procesar el input
    const targetTempo = estadoActual.game.song.tempos.length > 0
        ? estadoActual.game.song.tempos.reduce((prev, curr) => {
            const diffPrev = Math.abs(prev.timeMs - pressTimeGame);
            const diffCurr = Math.abs(curr.timeMs - pressTimeGame);
            return (diffCurr < diffPrev) ? curr : prev;
        }, estadoActual.game.song.tempos[0])
        : undefined;

    // 3. Transición Pura de Estado: Procesar Input
    const nuevoEstado = processPlayerInput(estadoActual, pressTimeGame);

    // Solo si el estado cambió (ej: hubo un acierto/fallo que afectó el score/combo)
    if (nuevoEstado !== estadoActual) {
        // Aquí se puede agregar lógica de feedback visual (ej: flash en pantalla)

        // 3. Actualizar el estado mutable global
        estadoActual = nuevoEstado;
        updateDOM(estadoActual);

        // Mostrar feedback en el log
        const log = document.getElementById('feedback-log');
        if (log) {
            const targetTimeForLog = targetTempo ? targetTempo.timeMs : (estadoActual.game.song.tempos[0]?.timeMs || 0);
            const result = evaluateHit(targetTimeForLog, pressTimeGame);
            const cls = result.window === 'hit' ? 'perfect' : result.window === 'delay' ? 'ok' : 'miss';
            log.innerHTML = `<span class="${cls}">${result.window.toUpperCase()} (${result.deltaMs}ms)</span>` + log.innerHTML;

            // Limitar el log
            if (log.children.length > 5) log.removeChild(log.lastChild as Node);

            // Trigger Character Animation
            if (result.window === 'hit' || result.window === 'delay') {
                // Randomly choose left or right punch
                const anim = Math.random() > 0.5 ? 'Kimu-punch-right' : 'Kimu-punch-left';
                playCharacterAnimation(anim);
            }
        }
    }
}

/**
 * Inicializa la pantalla de Gameplay.
 */
export function initRhythmScreen(): void {
    const root = document.getElementById('app-root');
    if (!root) return;

    // Cancelar cualquier bucle anterior
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    // 1. Renderizar la vista inicial (el juego no empieza hasta que el usuario pulse "Iniciar Juego")
    root.innerHTML = '';
    // Renderizamos con un estado dummy; la vista se actualizará cuando el juego empiece
    const dummyState = {
        game: { score: 0, precision: 100, currentTimeMs: 0, currentScene: 'Gameplay', isRunning: false, isPaused: false, isGameStoped: false, level: 1, song: SONG_TEST_LEVEL } as any,
        rhythm: { combo: 0, maxCombo: 0, score: 0, hits: { delay: 0, hit: 0, miss: 0 } } as any,
        gameStartTime: 0
    } as FullGameState;
    const view = renderRhythmView(dummyState);
    root.appendChild(view);

    // Deshabilitar el botón de acción hasta que el juego empiece
    const actionButton = document.getElementById('action-button') as HTMLButtonElement | null;
    actionButton?.setAttribute('disabled', 'true');

    // Navegación (volver al menú) siempre disponible
    view.querySelector('#btnBackToMenu')?.addEventListener('click', () => {
        if (estadoActual) {
            estadoActual = { ...estadoActual, game: { ...estadoActual.game, isGameStoped: true } };
        }
        cancelAnimationFrame(animationFrameId);
        document.dispatchEvent(new CustomEvent('navigateToMenu'));
    });

    // Lógica para iniciar el juego y reproducir audio si existe
    const startButton = document.getElementById('start-button') as HTMLButtonElement | null;
    let audioEl: HTMLAudioElement | null = null;

    function startNow() {
        const startTime = performance.now();
        estadoActual = initializeFullGame(SONG_TEST_LEVEL, startTime);
        // Activar controles
        actionButton?.removeAttribute('disabled');
        // Asignar Eventos (Input)
        document.getElementById('action-button')?.addEventListener('click', handleInput);
        document.addEventListener('keydown', handleInput); // Soporte para barra espaciadora
        // Ocultar botón de inicio
        if (startButton) startButton.style.display = 'none';
        // Iniciar bucle
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function startSequence() {
        if (startButton) startButton.disabled = true;
        const audioUrl = (SONG_TEST_LEVEL as any).audioUrl as string | undefined;
        if (audioUrl) {
            audioEl = new Audio(audioUrl);
            audioEl.preload = 'auto';
            // Intentar reproducir. Algunos navegadores bloquean autoplay sin interacción.
            const playPromise = audioEl.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Reproducción iniciada, sincronizamos el inicio del juego
                    startNow();
                }).catch(() => {
                    // Autoplay bloqueado: pedir interacción del usuario
                    alert('Para reproducir audio, haz clic en la página (gesto de usuario) y luego pulsa "Iniciar Juego" otra vez.');
                    if (startButton) startButton.disabled = false;
                    const resumeHandler = () => {
                        audioEl!.play().then(() => startNow()).catch(() => startNow());
                        document.removeEventListener('click', resumeHandler);
                    };
                    document.addEventListener('click', resumeHandler, { once: true } as any);
                });
            } else {
                // No hay promesa: iniciar igualmente
                startNow();
            }
        } else {
            // No hay audio: iniciar inmediatamente
            startNow();
        }
    }

    startButton?.addEventListener('click', startSequence);
}