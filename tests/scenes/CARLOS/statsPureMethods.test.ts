import { describe, it, expect } from 'vitest';
import { initPlayerStats, addTotalScore, addHits, addMisses, addPerfectLevel, addPlayTime, incrementGamesPlayed, updateStatsFromGame, computePrecision } from '../../../src/scenes/CARLOS/statsPureMethods';
import { PlayerStats } from '../../../src/scenes/CARLOS/statsTypes';
import { GameState } from '../../../src/types/index';

describe('statsPureMethods', () => {
    describe('initPlayerStats', () => {
        it('should return initial stats', () => {
            const stats = initPlayerStats();
            expect(stats).toEqual({
                totalScore: 0,
                totalHits: 0,
                totalMisses: 0,
                perfectLevels: 0,
                totalPlayTimeMs: 0,
                gamesPlayed: 0,
            });
        });
    });

    describe('addTotalScore', () => {
        it('should add score', () => {
            const stats = initPlayerStats();
            const newStats = addTotalScore(stats, 100);
            expect(newStats.totalScore).toBe(100);
        });

        it('should not go below zero', () => {
            const stats = initPlayerStats();
            const newStats = addTotalScore(stats, -100);
            expect(newStats.totalScore).toBe(0);
        });
    });

    describe('addHits', () => {
        it('should add hits', () => {
            const stats = initPlayerStats();
            const newStats = addHits(stats, 5);
            expect(newStats.totalHits).toBe(5);
        });
    });

    describe('addMisses', () => {
        it('should add misses', () => {
            const stats = initPlayerStats();
            const newStats = addMisses(stats, 3);
            expect(newStats.totalMisses).toBe(3);
        });
    });

    describe('addPerfectLevel', () => {
        it('should increment perfect levels', () => {
            const stats = initPlayerStats();
            const newStats = addPerfectLevel(stats);
            expect(newStats.perfectLevels).toBe(1);
        });
    });

    describe('addPlayTime', () => {
        it('should add play time', () => {
            const stats = initPlayerStats();
            const newStats = addPlayTime(stats, 5000);
            expect(newStats.totalPlayTimeMs).toBe(5000);
        });
    });

    describe('incrementGamesPlayed', () => {
        it('should increment games played', () => {
            const stats = initPlayerStats();
            const newStats = incrementGamesPlayed(stats);
            expect(newStats.gamesPlayed).toBe(1);
        });
    });

    describe('updateStatsFromGame', () => {
        it('should update stats from game state', () => {
            const stats = initPlayerStats();
            const game: Partial<GameState> = {
                score: 500,
                currentTimeMs: 10000,
                precision: 95
            };
            // hitsCount = 10, missesCount = 2
            const newStats = updateStatsFromGame(stats, game as GameState, 10, 2);

            expect(newStats.totalScore).toBe(500);
            expect(newStats.totalPlayTimeMs).toBe(10000);
            expect(newStats.totalHits).toBe(10);
            expect(newStats.totalMisses).toBe(2);
            expect(newStats.gamesPlayed).toBe(1);
            expect(newStats.perfectLevels).toBe(0); // precision 95 < 100
        });

        it('should mark perfect level if precision is 100', () => {
            const stats = initPlayerStats();
            const game: Partial<GameState> = {
                score: 1000,
                currentTimeMs: 5000,
                precision: 100
            };
            // hitsCount = 10, missesCount = 0 -> computed precision 100
            const newStats = updateStatsFromGame(stats, game as GameState, 10, 0);

            expect(newStats.perfectLevels).toBe(1);
        });
    });

    describe('computePrecision', () => {
        it('should calculate precision correctly', () => {
            expect(computePrecision(10, 0)).toBe(100);
            expect(computePrecision(5, 5)).toBe(50);
            expect(computePrecision(0, 10)).toBe(0);
        });

        it('should use fallback if total is 0', () => {
            expect(computePrecision(0, 0, 50)).toBe(50);
        });
    });
});
