import { SongDefinition, Tempo, GameState, RhythmState, HitResult, JudgementWindow } from '../../types/index';
import { FullGameState } from './gameplayTypes';
import { JUDGEMENT_WINDOWS } from './gameplayTypes';
import { setCurrentTimeMs, addScore } from '../../core/domain';

/**
 * Crea el estado inicial inmutable del juego (GameState + RhythmState).
 * @param song La definición de la canción a jugar.
 * @param startTimeMs El performance.now() real en el que se inicia el juego.
 * @returns {FullGameState} El estado inicial.
 */
export function initializeFullGame(song: SongDefinition, startTimeMs: number): FullGameState {
    // 1. Inicializar RhythmState
    const initialRhythmState: RhythmState = {
        combo: 0,
        maxCombo: 0,
        score: 0,
        hits: { 'delay': 0, 'hit': 0, 'miss': 0 },
    };

    // 2. Inicializar GameState (usando los setters puros si es necesario, pero aquí directo)
    const initialGameState: GameState = {
        score: 0,
        precision: 100, // Se asume 100% hasta el primer error
        currentTimeMs: 0,
        currentScene: 'Gameplay',
        isRunning: true,
        isPaused: false,
        isGameStoped: false,
        level: 1, // o el que sea
        song: song,
    };

    return {
        game: initialGameState,
        rhythm: initialRhythmState,
        gameStartTime: startTimeMs,
    };
}

export function setFullGameStoped(pGlobalState: FullGameState): FullGameState {
    return {
        ...pGlobalState,
        game: {
            ...pGlobalState.game,
            isGameStoped: true
        }
    };
}

/**
 * Función Pura: Simula un frame del juego y actualiza el estado.
 * Esta función es llamada por el bucle principal (requestAnimationFrame/setTimeout).
 * @param currentState Estado completo actual inmutable.
 * @param newTimeMs El tiempo real transcurrido en la canción (currentTimeMs)
 * @returns {FullGameState} El nuevo estado después del tick.
 */
export function tick(currentState: FullGameState, newTimeMs: number): FullGameState {

    // 1. Actualizar el tiempo actual del juego (pura)
    const gameWithNewTime = setCurrentTimeMs(currentState.game, newTimeMs);
    let newRhythmState = currentState.rhythm;

    // 2. Identificar y procesar notas 'missed' (falladas por tiempo)
    const missedTempos = currentState.game.song.tempos.filter(tempo =>
        // Comprobar si la nota ya pasó su ventana de juicio sin ser golpeada
        tempo.timeMs + JUDGEMENT_WINDOWS['miss'].ms < newTimeMs
    );

    let temposRestantes: readonly Tempo[] = gameWithNewTime.song.tempos.slice();

    // 3. Crear el nuevo estado de ritmo y eliminar las notas falladas (pura)
    if (missedTempos.length > 0) {

        // Calcular el nuevo estado rítmico por cada nota fallada
        newRhythmState = missedTempos.reduce((rhythmState, _missedTempo) => {
            // Un 'miss' resetea el combo
            const newCombo = 0;

            // Incrementar contador de 'miss'
            const newHits = { ...rhythmState.hits, 'miss': rhythmState.hits['miss'] + 1 };

            return {
                ...rhythmState,
                combo: newCombo,
                hits: newHits,
            };
        }, currentState.rhythm);

        // Remover las notas falladas de la partitura
        const missedIds = missedTempos.map(t => t.id);
        temposRestantes = temposRestantes.filter(tempo => !missedIds.includes(tempo.id));
    }

    // 4. Devolver el nuevo estado completo inmutable
    const newSong: SongDefinition = {
        ...gameWithNewTime.song,
        tempos: temposRestantes,
    };

    return {
        ...currentState,
        game: {
            ...gameWithNewTime,
            song: newSong,
        },
        rhythm: newRhythmState,
    };
}

/**
 * Función Pura: Determina el JudgementWindow ('hit', 'delay', 'miss') y deltaMs de un input.
 * @param targetTimeMs Tiempo objetivo de la nota (Tempo.timeMs).
 * @param pressTimeMs Tiempo en que el jugador presionó la tecla.
 * @returns {HitResult} El resultado del golpe (pura).
 */
export function evaluateHit(
    targetTimeMs: number,
    pressTimeMs: number
): Omit<HitResult, 'noteId'> {

    const deltaMs = Math.abs(pressTimeMs - targetTimeMs);
    let windowName: JudgementWindow['name'];
    let score = 0;

    // Buscar el juicio más estricto que se cumpla
    if (deltaMs <= JUDGEMENT_WINDOWS['hit'].ms) {
        windowName = 'hit';
        score = JUDGEMENT_WINDOWS['hit'].score;
    } else if (deltaMs <= JUDGEMENT_WINDOWS['delay'].ms) {
        windowName = 'delay';
        score = JUDGEMENT_WINDOWS['delay'].score;
    } else if (deltaMs <= JUDGEMENT_WINDOWS['miss'].ms) {
        windowName = 'miss';
        score = JUDGEMENT_WINDOWS['miss'].score;
    } else {
        // Fuera de todas las ventanas (Input Descartado)
        windowName = 'miss'; // Se maneja como miss para el cálculo, pero se ignora si es demasiado lejos.
        score = 0;
    }

    return {
        deltaMs: deltaMs,
        window: windowName,
        score: score,
    };
}

/**
 * Función Pura (Reducer): Procesa la pulsación del jugador y devuelve el NUEVO estado completo.
 * @param currentState Estado completo actual inmutable.
 * @param pressTimeMs El tiempo absoluto (currentTimeMs) de la pulsación.
 * @returns {FullGameState} El nuevo estado inmutable.
 */
export function processPlayerInput(
    currentState: FullGameState,
    pressTimeMs: number
): FullGameState {

    // 1. Encontrar la nota objetivo más cercana
    const targetTempo = currentState.game.song.tempos.reduce((prev, curr) => {
        const diffPrev = Math.abs(prev.timeMs - pressTimeMs);
        const diffCurr = Math.abs(curr.timeMs - pressTimeMs);
        return (diffCurr < diffPrev) ? curr : prev;
    }, currentState.game.song.tempos[0]);

    // Si no hay notas restantes o el input está muy lejos, descartar el input (devolver el estado sin cambios)
    const MAX_INPUT_TOLERANCE = JUDGEMENT_WINDOWS['miss'].ms + 0; // Tolerancia extra
    if (!targetTempo || Math.abs(targetTempo.timeMs - pressTimeMs) > MAX_INPUT_TOLERANCE) {
        return currentState;
    }

    // 2. Evaluar el acierto (función pura)
    const hitResult = evaluateHit(targetTempo.timeMs, pressTimeMs);

    // Si la precisión es demasiado baja (más allá del límite 'miss'), descartar el input.
    if (hitResult.deltaMs > JUDGEMENT_WINDOWS['miss'].ms) {
        return currentState;
    }

    // 3. Aplicar los cambios de estado (creando los nuevos estados inmutables)
    const windowDef = JUDGEMENT_WINDOWS[hitResult.window];

    // A. Nuevo Rhythm State
    const newCombo = windowDef.keepCombo ? currentState.rhythm.combo + 1 : 0;
    const newHits = {
        ...currentState.rhythm.hits,
        [hitResult.window]: currentState.rhythm.hits[hitResult.window] + 1
    };

    const newRhythmState: RhythmState = {
        combo: newCombo,
        maxCombo: Math.max(currentState.rhythm.maxCombo, newCombo),
        score: currentState.rhythm.score + hitResult.score,
        hits: newHits,
    };

    // B. Nuevo Game State (Actualizar Score, remover la nota)
    const gameWithNewScore = addScore(currentState.game, hitResult.score);

    // Remover la nota golpeada (inmutable)
    const newTempos = currentState.game.song.tempos.filter(t => t.id !== targetTempo.id);
    const newSong: SongDefinition = { ...gameWithNewScore.song, tempos: newTempos };

    // C. Devolver el NUEVO FullGameState
    return {
        ...currentState,
        game: {
            ...gameWithNewScore,
            song: newSong,
        },
        rhythm: newRhythmState,
    };
}


