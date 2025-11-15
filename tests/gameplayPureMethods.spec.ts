import { describe, it, expect } from 'vitest';
import { evaluateHit } from '../src/scenes/CARLOS/gameplayPureMethods';
import { JUDGEMENT_WINDOWS } from '../src/scenes/CARLOS/gameplayTypes';
import * as fc from 'fast-check';

describe('evaluateHit (gameplayPureMethods)', () => {
    it('returns hit/delay/miss and correct score for typical cases', () => {
        // Perfect hit (delta 30ms)
        const r1 = evaluateHit(1000, 1030);
        expect(r1.deltaMs).toBe(30);
        expect(r1.window).toBe('hit');
        expect(r1.score).toBe(JUDGEMENT_WINDOWS['hit'].score);

        // Edge: exactly hit window boundary (50ms)
        const r2 = evaluateHit(2000, 2050);
        expect(r2.window).toBe('hit');
        expect(r2.score).toBe(JUDGEMENT_WINDOWS['hit'].score);

        // Delay
        const r3 = evaluateHit(3000, 3100); // delta 100ms
        expect(r3.window).toBe('delay');
        expect(r3.score).toBe(JUDGEMENT_WINDOWS['delay'].score);

        // Miss inside miss-window
        const r4 = evaluateHit(4000, 4180); // delta 180ms -> miss
        expect(r4.window).toBe('miss');
        expect(r4.score).toBe(JUDGEMENT_WINDOWS['miss'].score);

        // Outside all windows (very late) -> treated as miss with score 0
        const r5 = evaluateHit(5000, 5400);
        expect(r5.window).toBe('miss');
        expect(r5.score).toBe(0);
    });

    it('property: deltaMs equals absolute difference and window is valid', () => {
        fc.assert(
            fc.property(fc.integer(), fc.integer(), (a, b) => {
                const r = evaluateHit(a, b);
                return (
                    r.deltaMs === Math.abs(a - b) &&
                    (r.window === 'hit' || r.window === 'delay' || r.window === 'miss')
                );
            })
        );
    });

    it('covers additional edge cases: exact boundaries, symmetry and invalid inputs', () => {
        // Exact on-time (delta 0)
        const exact = evaluateHit(1000, 1000);
        expect(exact.deltaMs).toBe(0);
        expect(exact.window).toBe('hit');
        expect(exact.score).toBe(JUDGEMENT_WINDOWS['hit'].score);

        // Boundary between hit and delay: 50ms -> hit (already covered earlier but explicit here)
        const b1 = evaluateHit(2000, 2050);
        expect(b1.deltaMs).toBe(50);
        expect(b1.window).toBe('hit');

        // Boundary between delay and miss: 120ms -> delay
        const b2 = evaluateHit(3000, 3120);
        expect(b2.deltaMs).toBe(120);
        expect(b2.window).toBe('delay');
        expect(b2.score).toBe(JUDGEMENT_WINDOWS['delay'].score);

        // Just past the delay window -> should be miss
        const b3 = evaluateHit(4000, 4121); // delta 121
        expect(b3.deltaMs).toBe(121);
        expect(b3.window).toBe('miss');
        expect(b3.score).toBe(JUDGEMENT_WINDOWS['miss'].score);

        // Symmetry: early vs late with same absolute delta
        const early = evaluateHit(5000, 4950); // -50 -> abs 50
        const late = evaluateHit(5000, 5050);  // +50 -> abs 50
        expect(early.deltaMs).toBe(late.deltaMs);
        expect(early.window).toBe(late.window);
        expect(early.score).toBe(late.score);

        // Invalid input (NaN) -> deltaMs becomes NaN, treated as outside windows -> miss + score 0
        // (current implementation returns window 'miss' and score 0 when delta is NaN)
        const nanCase = evaluateHit(6000, NaN as unknown as number);
        expect(Number.isNaN(nanCase.deltaMs)).toBe(true);
        expect(nanCase.window).toBe('miss');
        expect(nanCase.score).toBe(0);
    });
});
