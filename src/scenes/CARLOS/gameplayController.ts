console.log('gameplayController module executing...');
import { FullGameState } from './gameplayTypes';
import { beatMapLevel1 } from './beatMaps';
import { SongDefinition, Tempo } from '../../types/index';
import { tick, processPlayerInput, initializeFullGame, evaluateHit, setFullGameStoped } from '../../core/rhythmCore';
import { spawnThrowable, handleThrowableReaction, playCharacterAnimation } from '../../core/phaserBridge';
import { updateStatsFromGame } from './statsPureMethods';
import { setPlayerStats, loadPlayerStats } from './statsController';
import { loadSfx, playSfx, cleanupAudio } from './rhythmAudio';
import { renderRhythmView, cacheDOMElements, updateVisuals, appendFeedbackLog, cleanupView } from './rhythmView';

const beatmap = beatMapLevel1;
// --- CONFIGURACIÓN DE SINCRONIZACIÓN ---

// 1. TIEMPO DE VIAJE (TRAVEL TIME):
// Tu primera nota es a los 1490ms.
// Si ponemos 1500ms, la bola aparecerá justo al iniciar el juego (Frame 0).
const THROW_TRAVEL_MS = 1500;

// 2. VENTANA DE INPUT:
// Tolerancia para detectar clicks cercanos a una nota.
const INPUT_SEARCH_WINDOW = 250;

// 3. OFFSET DE GOLPE (HIT OFFSET - VISUAL/LÓGICO):
// Valor negativo = El jugador debe golpear ANTES de que llegue al centro del cuerpo.
// Esto simula la extensión del brazo.
const HIT_OFFSET_MS = -60;

// 4. LATENCIA DE AUDIO (GLOBAL AUDIO LATENCY):
// Ajusta esto si sientes que la música va desfasada respecto a las bolas.
// Si las bolas llegan ANTES que el ritmo de la música, AUMENTA este número.
// Valor recomendado para empezar: 80ms.
const GLOBAL_AUDIO_LATENCY = 80;


// --- ESTADO MUTABLE ---
let estadoActual: FullGameState;
let animationFrameId: number;
let isFinishing: boolean = false;
const spawnedTempoIds = new Set<number>();

export function cleanupRhythmScreen() {
    try {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        document.removeEventListener('keydown', handleInput);
        spawnedTempoIds.clear();

        // Delegar limpieza de audio y vista a los módulos correspondientes
        try { cleanupAudio(); } catch (e) { /* ignore */ }
        try { cleanupView(); } catch (e) { /* ignore */ }

        // Detener audio del nivel si existe en window (hack global)
        const levelAudio = (window as any).currentLevelAudio as HTMLAudioElement | undefined;
        if (levelAudio) {
            levelAudio.pause();
            levelAudio.currentTime = 0;
            (window as any).currentLevelAudio = null;
        }
    } catch (e) { console.warn('cleanupRhythmScreen failed', e); }
}

function checkSpawns(currentTimeMs: number, songTempos: readonly Tempo[]) {
    // Aumentamos el lookAhead a 20 por si hay notas muy pegadas (ej: id 69-74)
    const lookAheadCount = 20;

    for (let i = 0; i < Math.min(songTempos.length, lookAheadCount); i++) {
        const nextTempo = songTempos[i];
        if (spawnedTempoIds.has(nextTempo.id)) continue;

        // Calculamos cuánto falta para que esta nota deba ser golpeada
        const timeToImpact = nextTempo.timeMs - currentTimeMs;

        // Si el tiempo que falta es menor o igual al tiempo que tarda la bola en viajar...
        if (timeToImpact <= THROW_TRAVEL_MS) {

            // Protección contra notas viejas (>150ms pasadas)
            if (timeToImpact > -150) {
                spawnThrowable(THROW_TRAVEL_MS);
                playSfx('spawn');
                spawnedTempoIds.add(nextTempo.id);
            } else {
                // Si ya pasó mucho tiempo, la marcamos como "spawned" silenciosamente
                spawnedTempoIds.add(nextTempo.id);
            }
        } else {
            // Como las notas están ordenadas por tiempo, si esta no toca, las siguientes tampoco.
            break;
        }
    }
}

// Visuales ahora delegadas a `rhythmView.updateVisuals`

function gameLoop(timestamp: DOMHighResTimeStamp) {
    if (estadoActual.game.isGameStoped || estadoActual.game.isPaused) return;

    // --- CÁLCULO DE TIEMPO SINCRONIZADO ---
    // 1. Tiempo bruto
    const rawTime = timestamp - estadoActual.gameStartTime;

    // 2. Aplicamos Latencia
    const currentSongTimeMs = rawTime - GLOBAL_AUDIO_LATENCY;

    // Esperar buffer de audio inicial (tiempos negativos)
    if (currentSongTimeMs < 0) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
    }

    // 1. Estado Lógico (Puro)
    estadoActual = tick(estadoActual, currentSongTimeMs);

    // Detectar fin
    if (estadoActual.game.song.tempos.length === 0 && !isFinishing) {
        isFinishing = true;
        console.log("Todas las notas procesadas. Finalizando en 3s...");
        setTimeout(() => { finishGameLogic(); }, 3000);
    }

    // 2. Spawning
    checkSpawns(currentSongTimeMs, estadoActual.game.song.tempos);

    // 3. Renderizado
    updateVisuals(estadoActual);

    animationFrameId = requestAnimationFrame(gameLoop);
}

function finishGameLogic() {
    estadoActual = setFullGameStoped(estadoActual);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    try {
        // Cargar stats de sesión actual (si usas sistema de usuarios, pasa el ID aquí)
        // Ejemplo: loadPlayerStats(currentUserId);
        const currentStats = loadPlayerStats();

        const successfulHits = (estadoActual.rhythm.hits['hit'] || 0) + (estadoActual.rhythm.hits['delay'] || 0);
        const missedHits = (estadoActual.rhythm.hits['miss'] || 0) || 0;

        const finalStats = updateStatsFromGame(currentStats, estadoActual.game, successfulHits, missedHits);

        // Guardar pero NO navegar automáticamente para no cortar la experiencia
        setPlayerStats(finalStats);

        console.log("Juego Terminado. Stats guardados:", finalStats);

        // Opcional: Mostrar botón de "Ver resultados" o volver automáticamente
        // document.dispatchEvent(new CustomEvent('gameEnded'));

    } catch (e) {
        console.warn('Error persisting stats', e);
    }
}

function handleInput(event: MouseEvent | KeyboardEvent) {
    if (isFinishing) return;

    if (event instanceof KeyboardEvent) {
        if (event.code !== 'Space') return;
        event.preventDefault();
    }

    const pressTimeAbsolute = performance.now();
    // Calculamos el tiempo de juego usando la misma lógica que el GameLoop (con latencia)
    const pressTimeGame = (pressTimeAbsolute - estadoActual.gameStartTime) - GLOBAL_AUDIO_LATENCY;

    let bestCandidate = undefined;
    let minDiff = Infinity;
    const searchLimit = Math.min(estadoActual.game.song.tempos.length, 3);

    for (let i = 0; i < searchLimit; i++) {
        const tempo = estadoActual.game.song.tempos[i];

        // APUNTAR AL BRAZO (OFFSET):
        // Si el offset es -60, queremos golpear 60ms ANTES del tiempo real de la nota.
        const effectiveTargetTime = tempo.timeMs + HIT_OFFSET_MS;
        const diff = Math.abs(effectiveTargetTime - pressTimeGame);

        if (diff <= INPUT_SEARCH_WINDOW && diff < minDiff) {
            minDiff = diff;
            bestCandidate = tempo;
        }
    }

    // Procesamos el input en el estado puro
    const nuevoEstado = processPlayerInput(estadoActual, pressTimeGame);

    if (nuevoEstado !== estadoActual) {
        // Feedback Visual / Auditivo
        const rawTargetTime = bestCandidate ? bestCandidate.timeMs : pressTimeGame;
        const targetTimeWithOffset = rawTargetTime + HIT_OFFSET_MS;

        const result = evaluateHit(targetTimeWithOffset, pressTimeGame);

        playSfx(result.window);

        if (result.window === 'hit' || result.window === 'delay') {
            const anim = Math.random() > 0.5 ? 'Kimu-punch-right' : 'Kimu-punch-left';
            playCharacterAnimation(anim);
        }

        handleThrowableReaction(result.window);

        {
            const cls = result.window === 'hit' ? 'perfect' : result.window === 'delay' ? 'ok' : 'miss';
            const sign = result.deltaMs > 0 ? '+' : '';
            appendFeedbackLog(`<div class="${cls}">${result.window.toUpperCase()} <small>(${sign}${Math.round(result.deltaMs)}ms)</small></div>`);
        }

        estadoActual = nuevoEstado;
        updateVisuals(estadoActual);
    }
}

// Variable por defecto por si no pasan nada
const defaultSong = beatmap;

export function initRhythmScreen(song?: SongDefinition, mountRoot?: HTMLElement | string): void {
    let root: HTMLElement | null = null;
    if (mountRoot) {
        if (typeof mountRoot === 'string') root = document.getElementById(mountRoot);
        else root = mountRoot as HTMLElement;
    }
    if (!root) root = document.getElementById('app-root');
    if (!root) return;

    // Asegurarse de limpiar cualquier instancia previa
    cleanupRhythmScreen();

    // Resetear banderas
    isFinishing = false;
    spawnedTempoIds.clear();

    const selectedSong = defaultSong ?? song;

    // Inicializar estado dummy para renderizar UI inicial (tiempo 0)
    const dummyState = initializeFullGame(selectedSong, 0);

    root.appendChild(renderRhythmView(dummyState));
    cacheDOMElements();

    const startButton = document.getElementById('start-button') as HTMLButtonElement | null;
    const backBtn = document.getElementById('btnBackToMenu');

    let audioEl: HTMLAudioElement | null = null;

    // Configurar botón Volver
    backBtn?.addEventListener('click', () => {
        cleanupRhythmScreen();
        document.dispatchEvent(new CustomEvent('navigateToMenu', { detail: { to: 'main-menu' } }));
    });

    function startNow() {
        loadSfx();
        const startTime = performance.now();

        // Detener música del menú si existe
        try {
            const g = (window as any).menuMusic as HTMLAudioElement | undefined;
            if (g && !g.paused) {
                g.pause();
                g.currentTime = 0;
            }
        } catch (e) { }

        spawnedTempoIds.clear();
        isFinishing = false;

        estadoActual = initializeFullGame(selectedSong, startTime);

        // Habilitar Input (Click / Teclado)
        document.removeEventListener('keydown', handleInput);
        document.addEventListener('keydown', handleInput);

        // Botón de acción invisible o para móviles (opcional)
        // const actionBtn = document.getElementById('action-button'); ...

        if (startButton) startButton.style.display = 'none';

        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function startSequence() {
        if (startButton) {
            startButton.disabled = true;
            startButton.innerText = "Cargando...";
        }

        const audioUrl = (selectedSong as any).audioUrl;

        if (audioUrl) {
            try {
                if (!audioEl) audioEl = new Audio(audioUrl);
                else audioEl.src = audioUrl;

                audioEl.preload = 'auto';
                audioEl.volume = 1.0;
                (window as any).currentLevelAudio = audioEl;

                const tryPlay = () => {
                    audioEl!.play().then(() => {
                        startNow();
                    }).catch((err) => {
                        console.warn("Autoplay blocked", err);
                        if (startButton) {
                            startButton.disabled = false;
                            startButton.innerText = "Click para empezar";
                        }
                        // Re-intentar al hacer click en el documento
                        const onInteraction = () => {
                            audioEl!.play().then(startNow).catch(startNow);
                        };
                        document.addEventListener('click', onInteraction, { once: true });
                    });
                };

                if (audioEl.readyState >= 4) {
                    tryPlay();
                } else {
                    const onCan = () => { tryPlay(); audioEl!.removeEventListener('canplaythrough', onCan); };
                    const onErr = () => {
                        console.error("Error cargando audio, iniciando sin música");
                        startNow();
                        audioEl!.removeEventListener('error', onErr);
                    };
                    audioEl.addEventListener('canplaythrough', onCan);
                    audioEl.addEventListener('error', onErr);
                    audioEl.load();
                }
            } catch (e) {
                console.error('Error setup audio', e);
                startNow();
            }
        } else {
            startNow();
        }
    }

    startButton?.addEventListener('click', startSequence);
}

(window as any).cleanupRhythmScreen = cleanupRhythmScreen;