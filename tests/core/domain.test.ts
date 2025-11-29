import { describe, it, expect } from 'vitest';
import { setGamePaused, setGameStoped, setGameStart, setLevelUp, addPoint, setScore, addScore, setPrecision, setCurrentTimeMs, setCurrentScene, setSong, resumeGame } from '../../src/core/domain';
import { GameState, SongDefinition } from '../../src/types/index';

const mockSong: SongDefinition = {
    idSong: 'test-song',
    difficulty: 'normal',
    tempos: []
};

const initialState: GameState = {
    score: 0,
    precision: 100,
    currentTimeMs: 0,
    currentScene: 'Menu',
    isRunning: false,
    isPaused: false,
    isGameStoped: false,
    level: 1,
    song: mockSong
};

describe('domain', () => {
    describe('setGamePaused', () => {
        it('should set isPaused to true', () => {
            const newState = setGamePaused(initialState);
            expect(newState.isPaused).toBe(true);
        });
    });

    describe('setGameStoped', () => {
        it('should set isGameStoped to true', () => {
            const newState = setGameStoped(initialState);
            expect(newState.isGameStoped).toBe(true);
        });
    });

    describe('setGameStart', () => {
        it('should set isRunning to true and isPaused to false', () => {
            const pausedState = { ...initialState, isPaused: true };
            const newState = setGameStart(pausedState);
            expect(newState.isRunning).toBe(true);
            expect(newState.isPaused).toBe(false);
        });
    });

    describe('setLevelUp', () => {
        it('should increment level', () => {
            const newState = setLevelUp(initialState);
            expect(newState.level).toBe(initialState.level + 1);
        });
    });

    describe('addPoint', () => {
        it('should increment score by 1', () => {
            const newState = addPoint(initialState);
            expect(newState.score).toBe(initialState.score + 1);
        });
    });

    describe('setScore', () => {
        it('should set score', () => {
            const newState = setScore(initialState, 100);
            expect(newState.score).toBe(100);
        });

        it('should ignore invalid score', () => {
            const newState = setScore(initialState, NaN);
            expect(newState.score).toBe(initialState.score);
        });
    });

    describe('addScore', () => {
        it('should add to score', () => {
            const newState = addScore(initialState, 50);
            expect(newState.score).toBe(initialState.score + 50);
        });
    });

    describe('setPrecision', () => {
        it('should set precision', () => {
            const newState = setPrecision(initialState, 90);
            expect(newState.precision).toBe(90);
        });

        it('should clamp precision', () => {
            expect(setPrecision(initialState, 150).precision).toBe(100);
            expect(setPrecision(initialState, -10).precision).toBe(0);
        });
    });

    describe('setCurrentTimeMs', () => {
        it('should set time', () => {
            const newState = setCurrentTimeMs(initialState, 5000);
            expect(newState.currentTimeMs).toBe(5000);
        });
    });

    describe('setCurrentScene', () => {
        it('should set scene', () => {
            const newState = setCurrentScene(initialState, 'Gameplay');
            expect(newState.currentScene).toBe('Gameplay');
        });
    });

    describe('setSong', () => {
        it('should set song', () => {
            const newSong = { ...mockSong, idSong: 'new-song' };
            const newState = setSong(initialState, newSong);
            expect(newState.song).toBe(newSong);
        });
    });

    describe('resumeGame', () => {
        it('should resume game', () => {
            const pausedState = { ...initialState, isPaused: true, isRunning: false };
            const newState = resumeGame(pausedState);
            expect(newState.isPaused).toBe(false);
            expect(newState.isRunning).toBe(true);
        });
    });
});
