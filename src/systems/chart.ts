import { NoteEvent, Lane } from '../types/index.js';

export interface ChartData { bpm: number; notes: NoteEvent[]; }

export class ChartLoader {
  static demoChart(): ChartData {
    // 4 compases a 120 BPM, negras en DFJK
    const bpm = 120;
    const beatMs = 60000 / bpm;
    const lanes: Lane[] = [0,1,2,3]; // D F J K
    const notes: NoteEvent[] = [];
    let id = 1;
    for (let i = 0; i < 16; i++) {
      const lane = lanes[i % lanes.length];
      notes.push({ id: id++, lane, timeMs: 2000 + i * beatMs }); // inicia al 2.0s
    }
    return { bpm, notes };
  }
}
