export type Scene = 'menu' | 'playing' | 'paused' | 'results';

export class StateManager {
  scene: Scene = 'menu';
  set(s: Scene){ this.scene = s; }
  is(s: Scene){ return this.scene === s; }
}
