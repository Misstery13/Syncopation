import { RhythmState, HitResult } from '../types/index.js';
import { AudioEngine } from '../systems/audio.js';
import { ChartLoader } from '../systems/chart.js';
import { Conductor } from '../systems/conductor.js';
import { InputManager } from './inputManager.js';
import { Judge } from '../systems/judge.js';
import { Spawner } from '../systems/spawner.js';
import { Renderer } from '../systems/renderer.js';
import { StateManager } from './stateManager.js';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private running = false;

  private audio = new AudioEngine();
  private conductor = new Conductor(this.audio, /*offsetMs=*/0);
  private state = new StateManager();

  private chart = ChartLoader.demoChart();
  private judge = new Judge(this.chart.notes);
  private spawner = new Spawner(this.chart.notes, 1200);
  private renderer: Renderer;

  private input: InputManager;
  private rhythm: RhythmState = { combo: 0, maxCombo: 0, score: 0,
    hits: { PERFECT:0, GREAT:0, GOOD:0, MISS:0 } };

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.renderer = new Renderer(this.ctx, 4);
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.input = new InputManager(()=>this.conductor.now());
  }

  private resizeCanvas(){ this.canvas.width = innerWidth; this.canvas.height = innerHeight; }

  public async start() {
    if (this.running) return;
    this.running = true;

    // Carga una pista libre de copyright que pongas en public/assets/audio/music/demo.ogg
    await this.audio.load('/assets/audio/music/demo.ogg');
    this.conductor.play();
    this.state.set('playing');
    this.loop();
  }

  private handleHit(res: HitResult){
    if (res.window === 'MISS'){
      this.rhythm.combo = 0;
      this.rhythm.hits.MISS++;
      return;
    }
    this.rhythm.score += res.score;
    this.rhythm.combo++;
    this.rhythm.maxCombo = Math.max(this.rhythm.maxCombo, this.rhythm.combo);
    this.rhythm.hits[res.window]++;
  }

  private loop = () => {
    if (!this.running) return;
    const now = this.conductor.now();

    // entradas
    for (const e of this.input.popEvents()){
      if (e.down){ const res = this.judge.judgePress(e.lane, e.timeMs); if (res) this.handleHit(res); }
    }

    // auto misses
    this.judge.autoMiss(now, (r)=>this.handleHit(r));

    // actualizar notas visibles y dibujar
    this.spawner.update(now);
    this.renderer.draw(now, this.spawner.active, this.rhythm.score, this.rhythm.combo);

    // fin de canción
    if (now > this.conductor.durationMs() + 1000){
      this.running = false;
      this.state.set('results');
      console.log('Resultados:', this.rhythm);
      // Aquí puedes mostrar una pantalla de resultados
      return;
    }

    requestAnimationFrame(this.loop);
  }
}
