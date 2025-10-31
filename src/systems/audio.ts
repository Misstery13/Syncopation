export class AudioEngine {
  private ctx: AudioContext;
  private buffer?: AudioBuffer;
  private source?: AudioBufferSourceNode;
  private startAt = 0;  // ctx.currentTime cuando empezó
  private offset = 0;   // ms acumulados (pausas, reinicios)

  constructor() { this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); }

  async load(url: string) {
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    this.buffer = await this.ctx.decodeAudioData(arr);
  }

  play(fromMs = 0) {
    if (!this.buffer) return;
    this.stop();
    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.ctx.destination);
    this.startAt = this.ctx.currentTime;
    this.offset = fromMs;
    this.source.start(0, fromMs / 1000);
  }

  stop() { try { this.source?.stop(); } catch (_) {} this.source = undefined; }

  pause() {
    const t = this.currentTimeMs();
    this.stop();
    this.offset = t;
  }

  resume() { this.play(this.offset); }

  isPlaying() { return !!this.source; }

  currentTimeMs(): number {
    if (!this.buffer) return 0;
    if (!this.source) return this.offset;
    const elapsed = (this.ctx.currentTime - this.startAt) * 1000;
    return this.offset + elapsed;
  }

  durationMs(): number { return this.buffer ? this.buffer.duration * 1000 : 0; }
}
