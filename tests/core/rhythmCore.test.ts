import { describe, it, expect } from 'vitest';
import { initializeFullGame, setFullGameStoped, tick, evaluateHit, processPlayerInput } from '../../src/core/rhythmCore';
import { SongDefinition, GameState, RhythmState, Tempo } from '../../src/types/index';
import { FullGameState, JUDGEMENT_WINDOWS } from '../../src/scenes/CARLOS/gameplayTypes';

// Mock data
const mockSong: SongDefinition = {
    idSong: 'test-song',
    difficulty: 'normal',
    tempos: [
        { id: 1, timeMs: 1000, judgementWindow: 'delay' },
        { id: 2, timeMs: 2000, judgementWindow: 'delay' },
    ]
};

describe('rhythmCore', () => {
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
            // Assuming miss window is reasonable, e.g., < 500ms. 
            // If 1000 is target, 2000 is definitely a miss.
            const newState = tick(state, 2000);

            // Tempo 1 should be removed from song.tempos
            // Tempo 2 is at 2000, so it might still be there or processed depending on logic.
            // Logic: tempo.timeMs + missWindow < newTimeMs
            // 1000 + miss < 2000 -> True (if miss < 1000)
            // 2000 + miss < 2000 -> False

            // We expect Tempo 1 to be gone.
            const tempoIds = newState.game.song.tempos.map(t => t.id);
            expect(tempoIds).not.toContain(1);
            expect(tempoIds).toContain(2);

            // Miss count should increase
            expect(newState.rhythm.hits.miss).toBe(1);
            // Combo should reset
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
            // Assuming miss window is < 1000ms
            const result = evaluateHit(1000, 3000);
            expect(result.window).toBe('miss');
            expect(result.score).toBe(0);
        });
    });

    describe('processPlayerInput', () => {
        it('should handle correct hit', () => {
            const state = initializeFullGame(mockSong, 0);
            // Hit the first note (1000ms) at 1000ms
            const newState = processPlayerInput(state, 1000, 0);

            // Tempo 1 should be removed
            const tempoIds = newState.game.song.tempos.map(t => t.id);
            expect(tempoIds).not.toContain(1);
            expect(tempoIds).toContain(2);

            // Score should increase
            expect(newState.rhythm.score).toBeGreaterThan(0);
            expect(newState.game.score).toBeGreaterThan(0);
            expect(newState.rhythm.combo).toBe(1);
            expect(newState.rhythm.hits.hit).toBe(1);
        });

        it('should ignore input if no tempo is close', () => {
            const state = initializeFullGame(mockSong, 0);
            // Input at 5000ms (far from 1000 and 2000)
            const newState = processPlayerInput(state, 5000, 0);

            // State should be referentially equal if no change, or at least content equal
            expect(newState).toBe(state);
        });
    });
});
