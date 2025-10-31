import { Lane } from '../types/index.js';

type Press = { lane: Lane; timeMs: number; down: boolean };

export class InputManager {
  private laneByKey: Record<string, Lane> = { 'd': 0, 'f': 1, 'j': 2, 'k': 3 };
  private queue: Press[] = [];
  private now: () => number;

  constructor(now: () => number) {
    this.now = now;
    window.addEventListener('keydown', e => this.handle(e, true));
    window.addEventListener('keyup',   e => this.handle(e, false));
  }

  private handle(e: KeyboardEvent, down: boolean) {
    const key = e.key.toLowerCase();
    if (this.laneByKey[key] === undefined) return;
    e.preventDefault();
    this.queue.push({ lane: this.laneByKey[key], timeMs: this.now(), down });
  }

  popEvents(): Press[] { const out = this.queue; this.queue = []; return out; }
}
