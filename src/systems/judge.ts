import { NoteEvent, HitResult, JudgementWindow } from '../types/index.js';

const WINDOWS: JudgementWindow[] = [
  { name: 'PERFECT', ms: 35,  score: 1000, keepCombo: true  },
  { name: 'GREAT',   ms: 70,  score:  600, keepCombo: true  },
  { name: 'GOOD',    ms: 110, score:  300, keepCombo: true  },
  { name: 'MISS',    ms: 999, score:    0, keepCombo: false },
];

export class Judge {
  private idx = 0; // puntero a la próxima nota por juzgar (ordenadas por tiempo)

  constructor(private notes: NoteEvent[]) {}

  judgePress(lane: number, tMs: number): HitResult | null {
    // busca la mejor nota en ese carril cercana a tMs que no esté juzgada
    let best: { note: NoteEvent; delta: number } | null = null;
    for (let i = this.idx; i < this.notes.length; i++) {
      const n = this.notes[i];
      if (n.judged || n.lane !== lane) continue;
      const delta = Math.abs(n.timeMs - tMs);
      if (!best || delta < best.delta) best = { note: n, delta };
      if (n.timeMs > tMs + WINDOWS[WINDOWS.length-1].ms) break; // más allá de MISS window
    }
    if (!best) return null;

    // determina ventana
    const win = WINDOWS.find(w => best!.delta <= w.ms)!;
    const note = best.note;
    note.judged = true; note.hit = win.name !== 'MISS';

    // avanza puntero si procede
    while (this.idx < this.notes.length && this.notes[this.idx].judged) this.idx++;

    return { noteId: note.id, deltaMs: tMs - note.timeMs, window: win.name, score: win.score };
  }

  // auto-MISS para notas que ya pasaron sin presionar
  autoMiss(nowMs: number, onMiss: (r: HitResult)=>void) {
    while (this.idx < this.notes.length) {
      const n = this.notes[this.idx];
      if (n.judged) { this.idx++; continue; }
      const late = nowMs - n.timeMs;
      if (late > WINDOWS[WINDOWS.length-1].ms) {
        n.judged = true; n.hit = false;
        onMiss({ noteId: n.id, deltaMs: late, window: 'MISS', score: 0 });
        this.idx++;
      } else break;
    }
  }
}
