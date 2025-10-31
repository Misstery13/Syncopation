import { NoteEvent } from '../types/index.js';

export class Spawner {
  public active: NoteEvent[] = []; // notas visibles para el renderer

  constructor(private notes: NoteEvent[], private approachMs = 1200) {}

  update(nowMs: number) {
    this.active = this.notes.filter(n => !n.judged && (n.timeMs - nowMs) <= this.approachMs);
  }
}
