import { AudioEngine } from './audio.js';

export class Conductor {
  constructor(private audio: AudioEngine, public offsetMs = 0) {}

  now(): number { return this.audio.currentTimeMs() + this.offsetMs; }

  play() { this.audio.play(0); }
  pause() { this.audio.pause(); }
  resume() { this.audio.resume(); }
  isPlaying() { return this.audio.isPlaying(); }
  durationMs() { return this.audio.durationMs(); }
}
