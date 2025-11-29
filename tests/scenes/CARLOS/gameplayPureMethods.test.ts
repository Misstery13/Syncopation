import { describe, it, expect } from 'vitest';
import { initializeFullGame, setFullGameStoped, tick, evaluateHit, processPlayerInput } from '../../../src/scenes/CARLOS/gameplayPureMethods';
import { SongDefinition } from '../../../src/types/index';
import { JUDGEMENT_WINDOWS } from '../../../src/scenes/CARLOS/gameplayTypes';

// Mock data
const mockSong: SongDefinition = {
    idSong: 'test-song',
    difficulty: 'normal',
    tempos: [
        { id: 1, timeMs: 1000, judgementWindow: 'delay' },
        { id: 2, timeMs: 2000, judgementWindow: 'delay' },
    ]
};

describe('gameplayPureMethods', () => {
    describe('initializeFullGame', () => {
        it('should initialize game state correctly', () => {
            const startTime = 100;
            const state = initializeFullGame(mockSong, startTime);

            expect(state.gameStartTime).toBe(startTime);
            expect(state.game.song).toBe(mockSong);
            expect(state.game.score).toBe(0);
            expect(state.rhythm.combo).toBe(0);
            expect(state.rhythm.score).toBe(0);
            expect(state.game.isRunning).toBe(true);
            expect(state.rhythm.hits).toEqual({ delay: 0, hit: 0, miss: 0 });
        });
    });

    describe('setFullGameStoped', () => {
        it('should set isGameStoped to true', () => {
            const state = initializeFullGame(mockSong, 0);
            const stoppedState = setFullGameStoped(state);
            expect(stoppedState.game.isGameStoped).toBe(true);
        });
    });

    describe('tick', () => {
        it('should update current time', () => {
            const state = initializeFullGame(mockSong, 0);
            const newState = tick(state, 500);
            expect(newState.game.currentTimeMs).toBe(500);
        });

        it('should handle missed tempos', () => {
            const state = initializeFullGame(mockSong, 0);
            // Move time past the first tempo + miss window
            const newState = tick(state, 2000);

            const tempoIds = newState.game.song.tempos.map(t => t.id);
            expect(tempoIds).not.toContain(1);
            expect(tempoIds).toContain(2);

            expect(newState.rhythm.hits.miss).toBe(1);
            expect(newState.rhythm.combo).toBe(0);
        });
    });

    describe('evaluateHit', () => {
        it('should return hit for perfect timing', () => {
            const result = evaluateHit(1000, 1000);
            expect(result.window).toBe('hit');
            expect(result.score).toBe(JUDGEMENT_WINDOWS['hit'].score);
        });

        it('should return miss for late timing', () => {
            const result = evaluateHit(1000, 3000);
            expect(result.window).toBe('miss');
            expect(result.score).toBe(0);
        });
    });

    describe('processPlayerInput', () => {
        it('should handle correct hit', () => {
            const state = initializeFullGame(mockSong, 0);
            const newState = processPlayerInput(state, 1000, 0);

            const tempoIds = newState.game.song.tempos.map(t => t.id);
            expect(tempoIds).not.toContain(1);
            expect(tempoIds).toContain(2);

            expect(newState.rhythm.score).toBeGreaterThan(0);
            expect(newState.game.score).toBeGreaterThan(0);
            expect(newState.rhythm.combo).toBe(1);
            expect(newState.rhythm.hits.hit).toBe(1);
        });

        it('should ignore input if no tempo is close', () => {
            const state = initializeFullGame(mockSong, 0);
            const newState = processPlayerInput(state, 5000, 0);
            expect(newState).toBe(state);
        });
    });
});
