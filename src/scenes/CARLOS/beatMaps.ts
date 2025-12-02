import rawLevel1 from '../../../public/assets/levels/level1.json';
import { SongDefinition, Tempo } from '../../types/index';

export const beatMapLevel1: SongDefinition = {
    ...rawLevel1,
    difficulty: rawLevel1.difficulty as "easy" | "normal" | "hard",
    tempos: rawLevel1.tempos.map(t => ({ ...t })) as readonly Tempo[]
} as const;