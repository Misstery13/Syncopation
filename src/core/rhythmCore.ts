import { SongDefinition, Tempo, GameState, RhythmState, HitResult, JudgementWindow } from '../types/index';
import { FullGameState } from '../scenes/CARLOS/gameplayTypes';
import { JUDGEMENT_WINDOWS } from '../scenes/CARLOS/gameplayTypes';
import { setCurrentTimeMs, addScore } from './domain';

/**
 * Núcleo puro de la lógica rítmica.
 * Aquí van todas las funciones puras necesarias para el gameplay rítmico.
 */

export function initializeFullGame(song: SongDefinition, startTimeMs: number): FullGameState {
    const initialRhythmState: RhythmState = {
        combo: 0,
        maxCombo: 0,
        score: 0,
        hits: { 'delay': 0, 'hit': 0, 'miss': 0 },
    };

    const initialGameState: GameState = {
        score: 0,
        precision: 100,
        currentTimeMs: 0,
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

export function tick(currentState: FullGameState, newTimeMs: number): FullGameState {
    const gameWithNewTime = setCurrentTimeMs(currentState.game, newTimeMs);
    let newRhythmState = currentState.rhythm;

    const missedTempos = currentState.game.song.tempos.filter(tempo =>
        tempo.timeMs + JUDGEMENT_WINDOWS['miss'].ms < newTimeMs
    );

    let temposRestantes: readonly Tempo[] = gameWithNewTime.song.tempos.slice();

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
    targetTimeMs: number,
    pressTimeMs: number
): Omit<HitResult, 'noteId'> {

    const deltaMs = Math.abs(pressTimeMs - targetTimeMs);
    let windowName: JudgementWindow['name'];
    let score = 0;

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
    pressTimeMs: number,
    hitOffsetMs: number = 0
): FullGameState {

    const targetTempo = currentState.game.song.tempos.reduce((prev, curr) => {
        const diffPrev = Math.abs((prev.timeMs - hitOffsetMs) - pressTimeMs);
        const diffCurr = Math.abs((curr.timeMs - hitOffsetMs) - pressTimeMs);
        return (diffCurr < diffPrev) ? curr : prev;
    }, currentState.game.song.tempos[0]);

    const MAX_INPUT_TOLERANCE = JUDGEMENT_WINDOWS['miss'].ms + 0;
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
        score: currentState.rhythm.score + hitResult.score,
        hits: newHits,
    };

    const gameWithNewScore = addScore(currentState.game, hitResult.score);

    const newTempos = currentState.game.song.tempos.filter(t => t.id !== targetTempo.id);
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
