import { SongDefinition, Tempo, GameState, RhythmState, HitResult, JudgementWindow, TimeMs, Score, Option, Result, Some, None, Ok, Err } from '../types/index';
import { FullGameState } from '../scenes/CARLOS/gameplayTypes';
import { JUDGEMENT_WINDOWS } from '../scenes/CARLOS/gameplayTypes';
import { setCurrentTimeMs, addScore } from './domain';

/**
 * Núcleo puro de la lógica rítmica.
 * Aquí van todas las funciones puras necesarias para el gameplay rítmico.
 */

export function initializeFullGame(song: SongDefinition, startTimeMs: TimeMs): FullGameState {
    const initialRhythmState: RhythmState = {
        combo: 0,
        maxCombo: 0,
        score: 0 as Score,
        hits: { 'delay': 0, 'hit': 0, 'miss': 0 },
    };

    const initialGameState: GameState = {
        score: 0 as Score,
        precision: 100,
        currentTimeMs: 0 as TimeMs,
        currentScene: 'Gameplay',
        isRunning: true,
        isPaused: false,
        isGameStoped: false,
        level: 1,
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

export function tick(currentState: FullGameState, newTimeMs: TimeMs): FullGameState {
    const gameWithNewTime = setCurrentTimeMs(currentState.game, newTimeMs);
    let newRhythmState = currentState.rhythm;

    const missedTempos = currentState.game.song.tempos.filter(tempo =>
        tempo.timeMs + JUDGEMENT_WINDOWS['miss'].ms < newTimeMs
    );

    let temposRestantes: ReadonlyArray<Tempo> = gameWithNewTime.song.tempos.slice();

    if (missedTempos.length > 0) {
        newRhythmState = missedTempos.reduce((rhythmState, _missedTempo) => {
            const newCombo = 0;
            const newHits = { ...rhythmState.hits, 'miss': rhythmState.hits['miss'] + 1 };

            return {
                ...rhythmState,
                combo: newCombo,
                hits: newHits,
            };
        }, currentState.rhythm);

        const missedIds = missedTempos.map(t => t.id);
        temposRestantes = temposRestantes.filter(tempo => !missedIds.includes(tempo.id));
    }

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

export function evaluateHit(
    targetTimeMs: TimeMs,
    pressTimeMs: TimeMs
): Omit<HitResult, 'noteId'> {

    const deltaMs: TimeMs = Math.abs(pressTimeMs - targetTimeMs) as TimeMs;
    let windowName: JudgementWindow['name'];
    let score: Score = 0 as Score;

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
        windowName = 'miss';
        score = 0;
    }

    return {
        deltaMs: deltaMs,
        window: windowName,
        score: score,
    };
}

export function processPlayerInput(
    currentState: FullGameState,
    pressTimeMs: TimeMs,
    hitOffsetMs: TimeMs = 0 as TimeMs
): FullGameState {

    const targetTempo = currentState.game.song.tempos.reduce((prev, curr) => {
        const diffPrev = Math.abs((prev.timeMs - hitOffsetMs) - pressTimeMs);
        const diffCurr = Math.abs((curr.timeMs - hitOffsetMs) - pressTimeMs);
        return (diffCurr < diffPrev) ? curr : prev;
    }, currentState.game.song.tempos[0]);

    const MAX_INPUT_TOLERANCE: TimeMs = (JUDGEMENT_WINDOWS['miss'].ms + 0) as TimeMs;
    if (!targetTempo || Math.abs((targetTempo.timeMs - hitOffsetMs) - pressTimeMs) > MAX_INPUT_TOLERANCE) {
        return currentState;
    }

    const hitResult = evaluateHit(targetTempo.timeMs - hitOffsetMs, pressTimeMs);

    if (hitResult.deltaMs > JUDGEMENT_WINDOWS['miss'].ms) {
        return currentState;
    }

    const windowDef = JUDGEMENT_WINDOWS[hitResult.window];

    const newCombo = windowDef.keepCombo ? currentState.rhythm.combo + 1 : 0;
    const newHits = {
        ...currentState.rhythm.hits,
        [hitResult.window]: currentState.rhythm.hits[hitResult.window] + 1
    };

    const newRhythmState: RhythmState = {
        combo: newCombo,
        maxCombo: Math.max(currentState.rhythm.maxCombo, newCombo),
        score: (currentState.rhythm.score + hitResult.score) as Score,
        hits: newHits,
    };

    const gameWithNewScore = addScore(currentState.game, hitResult.score);

    const newTempos: ReadonlyArray<Tempo> = currentState.game.song.tempos.filter(t => t.id !== targetTempo.id);
    const newSong: SongDefinition = { ...gameWithNewScore.song, tempos: newTempos };

    return {
        ...currentState,
        game: {
            ...gameWithNewScore,
            song: newSong,
        },
        rhythm: newRhythmState,
    };
}

// === Variantes funcionales con Option/Result ===

export function findClosestTempo(
    tempos: ReadonlyArray<Tempo>,
    pressTimeMs: TimeMs,
    hitOffsetMs: TimeMs,
    tolerance: TimeMs
): Option<Tempo> {
    if (!tempos.length) return None;
    const candidate = tempos.reduce((prev, curr) => {
        const diffPrev = Math.abs((prev.timeMs - hitOffsetMs) - pressTimeMs);
        const diffCurr = Math.abs((curr.timeMs - hitOffsetMs) - pressTimeMs);
        return (diffCurr < diffPrev) ? curr : prev;
    });
    const diff = Math.abs((candidate.timeMs - hitOffsetMs) - pressTimeMs);
    return diff <= tolerance ? Some(candidate) : None;
}

export type InputProcessError = 'no-target' | 'out-of-tolerance' | 'after-miss-window';

export function processPlayerInputResult(
    currentState: FullGameState,
    pressTimeMs: TimeMs,
    hitOffsetMs: TimeMs = 0 as TimeMs
): Result<FullGameState, InputProcessError> {
    const tolerance = JUDGEMENT_WINDOWS['miss'].ms as TimeMs;
    const opt = findClosestTempo(currentState.game.song.tempos, pressTimeMs, hitOffsetMs, tolerance);

    if (opt.kind === 'none') {
        return currentState.game.song.tempos.length === 0 ? Err('no-target') : Err('out-of-tolerance');
    }

    const targetTempo = opt.value;
    const hitResult = evaluateHit(targetTempo.timeMs - hitOffsetMs, pressTimeMs);

    if (hitResult.deltaMs > JUDGEMENT_WINDOWS['miss'].ms) {
        return Err('after-miss-window');
    }

    const windowDef = JUDGEMENT_WINDOWS[hitResult.window];
    const newCombo = windowDef.keepCombo ? currentState.rhythm.combo + 1 : 0;
    const newHits = {
        ...currentState.rhythm.hits,
        [hitResult.window]: currentState.rhythm.hits[hitResult.window] + 1
    };

    const newRhythmState: RhythmState = {
        combo: newCombo,
        maxCombo: Math.max(currentState.rhythm.maxCombo, newCombo),
        score: (currentState.rhythm.score + hitResult.score) as Score,
        hits: newHits,
    };

    const gameWithNewScore = addScore(currentState.game, hitResult.score);
    const newTempos: ReadonlyArray<Tempo> = currentState.game.song.tempos.filter(t => t.id !== targetTempo.id);
    const newSong: SongDefinition = { ...gameWithNewScore.song, tempos: newTempos };

    return Ok({
        ...currentState,
        game: {
            ...gameWithNewScore,
            song: newSong,
        },
        rhythm: newRhythmState,
    });
}
