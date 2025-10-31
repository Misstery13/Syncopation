import { GameState, GameConfig } from '../types/index.js';

// Clase principal del juego
export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private isRunning: boolean;
    private gameState: GameState;
    private config: GameConfig;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.isRunning = false;
        
        // Configuración inicial del juego
        this.config = {
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: '#000000',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: false
                }
            }
        };

        // Estado inicial del juego
        this.gameState = {
            isRunning: false,
            currentScene: 'menu',
            score: 0,
            level: 1
        };
        
        // Ajustar tamaño del canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.config.width = window.innerWidth;
            this.config.height = window.innerHeight;
            this.resizeCanvas();
        });
    }

    private resizeCanvas(): void {
        this.canvas.width = this.config.width;
        this.canvas.height = this.config.height;
    }

    public start(): void {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.gameState.isRunning = true;
        console.log('🎮 Juego iniciado');
        
        // Aquí puedes agregar tu lógica del juego
        this.gameLoop();
    }

    private gameLoop(): void {
        if (!this.isRunning) return;

        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Tu lógica de juego aquí

        // Continuar el loop
        requestAnimationFrame(() => this.gameLoop());
    }

    public stop(): void {
        this.isRunning = false;
        this.gameState.isRunning = false;
        console.log('⏸ Juego detenido');
    }

    public getState(): GameState {
        return { ...this.gameState };
    }

    public updateScore(points: number): void {
        this.gameState.score += points;
    }

    public nextLevel(): void {
        this.gameState.level++;
    }
}
